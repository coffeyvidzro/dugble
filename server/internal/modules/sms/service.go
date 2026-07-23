package sms

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/google/uuid"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxBodyCharacters  = 1600
	maxReferenceLength = 120
)

var e164Pattern = regexp.MustCompile(`^\+[1-9]\d{7,14}$`)

type Sender interface {
	Send(ctx context.Context, req smsapi.SendRequest) (*smsapi.SendResponse, error)
	CheckStatus(ctx context.Context, providerID string, providerMessageID string) (*smsapi.StatusResponse, error)
}

type WalletLedger interface {
	DebitSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (wallet.Transaction, error)
	RefundSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (wallet.Transaction, error)
}

type Service struct {
	repository *Repository
	sender     Sender
	wallet     WalletLedger
}

func NewService(repository *Repository, sender Sender, wallet WalletLedger) *Service {
	return &Service{repository: repository, sender: sender, wallet: wallet}
}

func (s *Service) List(ctx context.Context, req ListRequest) ([]Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionSMSRead)
	if err != nil {
		return nil, err
	}
	limit := req.Limit
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if req.Offset < 0 {
		req.Offset = 0
	}
	messages, err := s.repository.List(ctx, tenantContext.TeamID, limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list SMS messages", err)
	}
	return messages, nil
}

func (s *Service) Get(ctx context.Context, messageID string) (Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionSMSRead)
	if err != nil {
		return Message{}, err
	}
	parsedID, err := uuid.Parse(strings.TrimSpace(messageID))
	if err != nil {
		return Message{}, apperrors.NewBadRequest("SMS message id must be a valid UUID")
	}
	message, err := s.repository.Get(ctx, parsedID, tenantContext.TeamID)
	if err != nil {
		if errors.Is(err, ErrMessageNotFound) {
			return Message{}, apperrors.NewNotFound("SMS message not found")
		}
		return Message{}, apperrors.NewInternal("Unable to get SMS message", err)
	}
	return message, nil
}

func (s *Service) Send(ctx context.Context, req SendRequest) (Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionSMSSend)
	if err != nil {
		return Message{}, err
	}
	if s.sender == nil {
		return Message{}, apperrors.NewInternal("SMS sender is not configured", nil)
	}
	if s.wallet == nil {
		return Message{}, apperrors.NewInternal("SMS wallet ledger is not configured", nil)
	}

	normalized, err := validateSend(req)
	if err != nil {
		return Message{}, err
	}
	senderID, err := s.repository.FindApprovedSender(ctx, tenantContext.TeamID, normalized.From)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to validate SMS sender ID", err)
	}
	if senderID == nil {
		return Message{}, apperrors.NewBadRequest("SMS sender ID must be approved before use")
	}

	segments := countSegments(normalized.Body)
	costMicros := int64(segments) * defaultCostMicrosPerSegment
	created, err := s.repository.Create(ctx, createMessageParams{
		TeamID: tenantContext.TeamID, SenderID: senderID, To: normalized.To, From: normalized.From,
		Body: normalized.Body, Status: StatusQueued, Segments: segments,
		CostMicros:      costMicros,
		ClientReference: normalized.ClientReference, Metadata: normalized.Metadata,
	})
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to create SMS message", err)
	}
	if created.ProviderMessageID != nil || created.Status != StatusQueued {
		return created, nil
	}

	messageID := uuid.MustParse(created.ID)
	if _, err := s.wallet.DebitSMSCharge(ctx, tenantContext.TeamID, created.CostMicros, messageID, normalized.Metadata); err != nil {
		if errors.Is(err, wallet.ErrInsufficientBalance) {
			failed, updateErr := s.repository.MarkFailed(ctx, messageID, tenantContext.TeamID, "insufficient wallet balance")
			if updateErr != nil {
				return Message{}, apperrors.NewInternal("Unable to record SMS wallet failure", updateErr)
			}
			return failed, apperrors.NewBadRequest("Insufficient wallet balance")
		}
		return Message{}, apperrors.NewInternal("Unable to debit wallet for SMS", err)
	}

	response, err := s.sender.Send(ctx, smsapi.SendRequest{To: normalized.To, From: normalized.From, Message: normalized.Body})
	if err != nil {
		failed, updateErr := s.repository.MarkFailed(ctx, messageID, tenantContext.TeamID, err.Error())
		if updateErr != nil {
			return Message{}, apperrors.NewInternal("Unable to record SMS send failure", updateErr)
		}
		if _, refundErr := s.wallet.RefundSMSCharge(ctx, tenantContext.TeamID, created.CostMicros, messageID, normalized.Metadata); refundErr != nil {
			return Message{}, apperrors.NewInternal("Unable to refund failed SMS charge", refundErr)
		}
		return failed, apperrors.NewInternal("Unable to send SMS", err)
	}

	submitted, err := s.repository.MarkSubmitted(ctx, messageID, tenantContext.TeamID, response.ProviderID, response.ProviderMsgID, mapProviderStatus(response.Status))
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to record SMS submission", err)
	}
	return submitted, nil
}

func (s *Service) SyncStatus(ctx context.Context, messageID string) (Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionSMSSend)
	if err != nil {
		return Message{}, err
	}
	parsedID, err := uuid.Parse(strings.TrimSpace(messageID))
	if err != nil {
		return Message{}, apperrors.NewBadRequest("SMS message id must be a valid UUID")
	}
	message, err := s.repository.Get(ctx, parsedID, tenantContext.TeamID)
	if err != nil {
		if errors.Is(err, ErrMessageNotFound) {
			return Message{}, apperrors.NewNotFound("SMS message not found")
		}
		return Message{}, apperrors.NewInternal("Unable to get SMS message", err)
	}
	if message.ProviderID == nil || message.ProviderMessageID == nil {
		return Message{}, apperrors.NewBadRequest("SMS message has not been submitted to a provider")
	}
	if s.sender == nil {
		return Message{}, apperrors.NewInternal("SMS sender is not configured", nil)
	}
	status, err := s.sender.CheckStatus(ctx, *message.ProviderID, *message.ProviderMessageID)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to sync SMS status", err)
	}
	updated, err := s.repository.UpdateStatus(ctx, parsedID, tenantContext.TeamID, mapProviderStatus(status.Status))
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to update SMS status", err)
	}
	return updated, nil
}

func validateSend(req SendRequest) (SendRequest, error) {
	req.To = strings.TrimSpace(req.To)
	req.From = strings.TrimSpace(req.From)
	if req.ClientReference != nil {
		ref := strings.TrimSpace(*req.ClientReference)
		if ref == "" {
			req.ClientReference = nil
		} else {
			req.ClientReference = &ref
		}
	}
	if req.To == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient is required")
	}
	if !e164Pattern.MatchString(req.To) {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient must be a valid E.164 phone number")
	}
	if req.From == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS sender ID is required")
	}
	if utf8.RuneCountInString(req.From) > smsapi.MaxSenderIDCharacters {
		return SendRequest{}, apperrors.NewBadRequest("SMS sender ID must be at most 11 characters")
	}
	if strings.TrimSpace(req.Body) == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS body is required")
	}
	if utf8.RuneCountInString(req.Body) > maxBodyCharacters {
		return SendRequest{}, apperrors.NewBadRequest(fmt.Sprintf("SMS body must be at most %d characters", maxBodyCharacters))
	}
	if req.ClientReference != nil && len(*req.ClientReference) > maxReferenceLength {
		return SendRequest{}, apperrors.NewBadRequest("Client reference must be at most 120 characters")
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}
	if !json.Valid(req.Metadata) {
		return SendRequest{}, apperrors.NewBadRequest("Metadata must be valid JSON")
	}
	return req, nil
}

func countSegments(body string) int32 {
	count := utf8.RuneCountInString(body)
	if count <= 160 {
		return 1
	}
	return int32((count + 152) / 153)
}

func mapProviderStatus(status string) string {
	status = strings.ToLower(strings.TrimSpace(status))
	switch status {
	case StatusQueued, StatusSubmitted, StatusSent, StatusDelivered, StatusUndelivered, StatusRejected, StatusFailed, StatusExpired, StatusUnknown:
		return status
	default:
		return StatusUnknown
	}
}

func requireTenant(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Team context is required")
	}
	if !tenant.ContextCan(tenantContext, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Insufficient permissions")
	}
	return tenantContext, nil
}
