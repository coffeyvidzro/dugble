package sms

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf16"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxBodyCharacters = 1600
	maxBatchMessages  = 100
)

var e164Pattern = regexp.MustCompile(`^\+[1-9]\d{7,14}$`)
var tagPattern = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

var (
	gsm7BasicRunes    = runeSet("@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà")
	gsm7ExtendedRunes = runeSet("\f^{}\\[~]|€")
)

type Sender interface {
	Send(ctx context.Context, req smsapi.SendRequest) (*smsapi.SendResponse, error)
	CheckStatus(ctx context.Context, providerID string, providerMessageID string) (*smsapi.StatusResponse, error)
}

type WalletLedger interface {
	DebitSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (wallet.Transaction, error)
	DebitSMSChargeTx(ctx context.Context, tx pgx.Tx, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (wallet.Transaction, error)
	RefundSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (wallet.Transaction, error)
}

// DeliveryQueue enqueues durable SMS delivery work.
//
// Implementations should persist jobs durably before returning.
type DeliveryQueue interface {
	EnqueueSMSDelivery(ctx context.Context, messageID uuid.UUID, teamID uuid.UUID) error
	EnqueueSMSDeliveryTx(ctx context.Context, tx pgx.Tx, messageID uuid.UUID, teamID uuid.UUID) error
}

type Service struct {
	repository *Repository
	sender     Sender
	wallet     WalletLedger
	delivery   DeliveryQueue
}

func NewService(repository *Repository, sender Sender, wallet WalletLedger, delivery DeliveryQueue) *Service {
	return &Service{repository: repository, sender: sender, wallet: wallet, delivery: delivery}
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
	if s.wallet == nil {
		return Message{}, apperrors.NewInternal("SMS wallet ledger is not configured", nil)
	}
	if s.delivery == nil {
		return Message{}, apperrors.NewInternal("SMS delivery queue is not configured", nil)
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
	tx, err := s.repository.BeginTx(ctx)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to begin SMS send transaction", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	txRepository := s.repository.WithTx(tx)
	quote, err := txRepository.QuoteSMS(ctx, tenantContext.TeamID, normalized.DestinationCountry, segments)
	if err != nil {
		switch {
		case errors.Is(err, ErrSMSPricingNotConfigured):
			return Message{}, apperrors.NewBadRequest("SMS pricing is not configured for the destination country")
		default:
			return Message{}, apperrors.NewInternal("Unable to calculate SMS price", err)
		}
	}

	created, err := txRepository.Create(ctx, createMessageParams{
		TeamID: tenantContext.TeamID, SenderID: senderID, To: normalized.To, From: normalized.From,
		Body: normalized.Body, Status: StatusQueued, Segments: segments,
		CostMicros: quote.TotalCostMicros, Metadata: normalized.Metadata,
		Tags:               normalized.Tags,
		DestinationCountry: quote.DestinationCountry, PricingRuleID: quote.PricingRuleID,
		UnitCostMicros: quote.UnitCostMicros,
	})
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to create SMS message", err)
	}
	if created.ProviderMessageID != nil || created.Status != StatusQueued {
		if err := tx.Commit(ctx); err != nil {
			return Message{}, apperrors.NewInternal("Unable to commit SMS send transaction", err)
		}
		return created, nil
	}

	messageID := uuid.MustParse(created.ID)
	if _, err := s.wallet.DebitSMSChargeTx(ctx, tx, tenantContext.TeamID, created.CostMicros, messageID, normalized.Metadata); err != nil {
		if errors.Is(err, wallet.ErrInsufficientBalance) {
			failed, updateErr := txRepository.MarkFailed(ctx, messageID, tenantContext.TeamID, "insufficient wallet balance")
			if updateErr != nil {
				return Message{}, apperrors.NewInternal("Unable to record SMS wallet failure", updateErr)
			}
			if err := tx.Commit(ctx); err != nil {
				return Message{}, apperrors.NewInternal("Unable to commit SMS wallet failure", err)
			}
			return failed, apperrors.NewBadRequest("Insufficient wallet balance")
		}
		return Message{}, apperrors.NewInternal("Unable to debit wallet for SMS", err)
	}

	if err := s.delivery.EnqueueSMSDeliveryTx(ctx, tx, messageID, tenantContext.TeamID); err != nil {
		return Message{}, apperrors.NewInternal("Unable to enqueue SMS delivery", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Message{}, apperrors.NewInternal("Unable to commit SMS send transaction", err)
	}

	return created, nil
}

func (s *Service) BatchSend(ctx context.Context, req BatchSendRequest) (BatchSendResponse, error) {
	if err := validateBatchSend(req); err != nil {
		return BatchSendResponse{}, err
	}
	if _, err := requireTenant(ctx, tenant.PermissionSMSSend); err != nil {
		return BatchSendResponse{}, err
	}
	if s.wallet == nil {
		return BatchSendResponse{}, apperrors.NewInternal("SMS wallet ledger is not configured", nil)
	}
	if s.delivery == nil {
		return BatchSendResponse{}, apperrors.NewInternal("SMS delivery queue is not configured", nil)
	}

	response := BatchSendResponse{
		Results: make([]BatchSendResult, 0, len(req.Messages)),
		Summary: BatchSendSummary{Requested: len(req.Messages)},
	}

	for index, message := range req.Messages {
		created, err := s.Send(ctx, message)
		result := BatchSendResult{Index: index}
		if created.ID != "" {
			publicMessage := created.Response()
			result.Message = &publicMessage
		}
		if err != nil {
			publicError := newBatchSendError(err)
			result.Error = &publicError
			response.Summary.Failed++
		} else {
			result.Success = true
			response.Summary.Succeeded++
		}
		response.Results = append(response.Results, result)
	}

	return response, nil
}

func newBatchSendError(err error) BatchSendError {
	result := BatchSendError{
		Code:    "INTERNAL_ERROR",
		Message: "An unexpected error occurred",
	}
	var appErr *apperrors.AppError
	if errors.As(err, &appErr) {
		result.Code = appErr.Code
		result.Message = appErr.Message
	}
	return result
}

func validateBatchSend(req BatchSendRequest) error {
	if len(req.Messages) == 0 {
		return apperrors.NewBadRequest("At least one SMS message is required")
	}
	if len(req.Messages) > maxBatchMessages {
		return apperrors.NewBadRequest(fmt.Sprintf("Batch SMS requests can include at most %d messages", maxBatchMessages))
	}
	return nil
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
	nextStatus := resolveProviderStatus(message.Status, status.Status)
	if nextStatus == message.Status {
		return message, nil
	}
	updated, err := s.repository.UpdateStatus(ctx, parsedID, tenantContext.TeamID, nextStatus)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to update SMS status", err)
	}
	return updated, nil
}

func resolveProviderStatus(current string, providerStatus string) string {
	current = strings.ToLower(strings.TrimSpace(current))
	next := MapProviderStatus(providerStatus)
	if next == StatusUnknown || isTerminalStatus(current) {
		return current
	}

	currentRank, currentIsProgress := statusProgressRank(current)
	nextRank, nextIsProgress := statusProgressRank(next)
	if currentIsProgress && nextIsProgress && nextRank < currentRank {
		return current
	}
	return next
}

func isTerminalStatus(status string) bool {
	switch status {
	case StatusRefundPending, StatusDelivered, StatusUndelivered, StatusRejected, StatusFailed, StatusExpired:
		return true
	default:
		return false
	}
}

func statusProgressRank(status string) (int, bool) {
	switch status {
	case StatusQueued:
		return 0, true
	case StatusProcessing:
		return 1, true
	case StatusSubmitted:
		return 2, true
	case StatusSent:
		return 3, true
	default:
		return 0, false
	}
}

func validateSend(req SendRequest) (SendRequest, error) {
	req.To = strings.TrimSpace(req.To)
	req.From = strings.TrimSpace(req.From)
	if req.To == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient is required")
	}
	if !e164Pattern.MatchString(req.To) {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient must be a valid E.164 phone number")
	}
	destinationCountry, err := smsapi.ResolveDestinationCountry(req.To)
	if err != nil {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient country is not supported")
	}
	req.DestinationCountry = destinationCountry
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
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}
	if !json.Valid(req.Metadata) {
		return SendRequest{}, apperrors.NewBadRequest("Metadata must be valid JSON")
	}
	tags, err := normalizeSMSTags(req.Tags)
	if err != nil {
		return SendRequest{}, err
	}
	req.Tags = tags
	return req, nil
}

func normalizeSMSTags(tags []Tag) ([]Tag, error) {
	for index := range tags {
		tags[index].Name = strings.TrimSpace(tags[index].Name)
		tags[index].Value = strings.TrimSpace(tags[index].Value)
		if len(tags[index].Name) == 0 || len(tags[index].Value) == 0 || len(tags[index].Name) > 256 || len(tags[index].Value) > 256 ||
			!tagPattern.MatchString(tags[index].Name) || !tagPattern.MatchString(tags[index].Value) {
			return nil, apperrors.NewBadRequest("SMS tag names and values must use letters, numbers, underscores, or dashes and be at most 256 characters")
		}
	}
	return tags, nil
}

func countSegments(body string) int32 {
	unitCount, singleSegmentLimit, multiSegmentLimit := smsEncodingUnits(body)
	if unitCount <= singleSegmentLimit {
		return 1
	}
	return int32((unitCount + multiSegmentLimit - 1) / multiSegmentLimit)
}

func smsEncodingUnits(body string) (int, int, int) {
	septets := 0
	for _, value := range body {
		if gsm7BasicRunes[value] {
			septets++
			continue
		}
		if gsm7ExtendedRunes[value] {
			septets += 2
			continue
		}
		return len(utf16.Encode([]rune(body))), 70, 67
	}
	return septets, 160, 153
}

func runeSet(values string) map[rune]bool {
	set := make(map[rune]bool, utf8.RuneCountInString(values))
	for _, value := range values {
		set[value] = true
	}
	return set
}

func MapProviderStatus(status string) string {
	status = strings.ToLower(strings.TrimSpace(status))
	switch status {
	case StatusQueued, StatusProcessing, StatusRefundPending, StatusSubmitted, StatusSent, StatusDelivered, StatusUndelivered, StatusRejected, StatusFailed, StatusExpired, StatusUnknown:
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
