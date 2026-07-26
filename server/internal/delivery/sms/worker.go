package smsdelivery

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
)

const defaultStaleProcessingAfter = 15 * time.Minute

type messageRepository interface {
	MarkProcessing(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (smsmodule.Message, error)
	Get(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (smsmodule.Message, error)
	MarkRefundPending(ctx context.Context, id uuid.UUID, teamID uuid.UUID, message string) (smsmodule.Message, error)
	MarkFailed(ctx context.Context, id uuid.UUID, teamID uuid.UUID, message string) (smsmodule.Message, error)
	MarkSubmitted(ctx context.Context, id uuid.UUID, teamID uuid.UUID, providerID string, providerMessageID string, status string) (smsmodule.Message, error)
}

type refundLedger interface {
	RefundSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (wallet.Transaction, error)
}

type Handler struct {
	repository           messageRepository
	sender               smsmodule.Sender
	wallet               refundLedger
	staleProcessingAfter time.Duration
}

func NewHandler(repository *smsmodule.Repository, sender smsmodule.Sender, wallet smsmodule.WalletLedger) *Handler {
	return &Handler{repository: repository, sender: sender, wallet: wallet, staleProcessingAfter: defaultStaleProcessingAfter}
}

func (h *Handler) Handle(ctx context.Context, command DeliverCommand) error {
	if command.MessageID == uuid.Nil || command.TeamID == uuid.Nil {
		return errors.New("SMS delivery command requires message and team IDs")
	}

	message, err := h.repository.MarkProcessing(ctx, command.MessageID, command.TeamID)
	if err != nil {
		if !errors.Is(err, smsmodule.ErrMessageNotFound) {
			return err
		}
		return h.handleAlreadyClaimed(ctx, command)
	}

	response, err := h.sender.Send(ctx, smsapi.SendRequest{
		To:                 message.To,
		From:               message.From,
		Message:            message.Body,
		DestinationCountry: message.DestinationCountry,
	})
	if err != nil {
		if !shouldRefundAfterSendError(err) {
			// Ambiguous failures may have happened after the provider accepted the
			// SMS. Keep the message in processing so retries do not re-submit it;
			// stale-processing recovery will eventually close it out operationally.
			return err
		}
		pending, updateErr := h.repository.MarkRefundPending(ctx, command.MessageID, command.TeamID, err.Error())
		if updateErr != nil {
			return updateErr
		}
		return h.refundAndFail(ctx, command, pending, err)
	}

	_, err = h.repository.MarkSubmitted(ctx, command.MessageID, command.TeamID, response.ProviderID, response.ProviderMsgID, smsmodule.MapProviderStatus(response.Status))
	return err
}

func (h *Handler) handleAlreadyClaimed(ctx context.Context, command DeliverCommand) error {
	message, err := h.repository.Get(ctx, command.MessageID, command.TeamID)
	if err != nil {
		if errors.Is(err, smsmodule.ErrMessageNotFound) {
			return nil
		}
		return err
	}
	switch message.Status {
	case smsmodule.StatusRefundPending:
		reason := "SMS delivery failed before refund completed"
		if message.ErrorMessage != nil && *message.ErrorMessage != "" {
			reason = *message.ErrorMessage
		}
		return h.refundAndFail(ctx, command, message, errors.New(reason))
	case smsmodule.StatusProcessing:
		if !h.processingIsStale(message) {
			return fmt.Errorf("sms message %s is already processing", message.ID)
		}
		const reason = "SMS delivery outcome unknown after processing timeout"
		pending, updateErr := h.repository.MarkRefundPending(ctx, command.MessageID, command.TeamID, reason)
		if updateErr != nil {
			return updateErr
		}
		return h.refundAndFail(ctx, command, pending, errors.New(reason))
	default:
		// Provider requests are not guaranteed idempotent across upstreams. A
		// non-queued message was already claimed or completed, so do not submit it
		// again from a duplicate or redelivered JetStream command.
		return nil
	}
}

func (h *Handler) processingIsStale(message smsmodule.Message) bool {
	threshold := h.staleProcessingAfter
	if threshold <= 0 {
		threshold = defaultStaleProcessingAfter
	}
	return time.Since(message.UpdatedAt) >= threshold
}

func (h *Handler) refundAndFail(ctx context.Context, command DeliverCommand, message smsmodule.Message, cause error) error {
	if _, refundErr := h.wallet.RefundSMSCharge(ctx, command.TeamID, message.CostMicros, command.MessageID, message.Metadata); refundErr != nil {
		return errors.Join(cause, refundErr)
	}
	_, updateErr := h.repository.MarkFailed(ctx, command.MessageID, command.TeamID, cause.Error())
	return updateErr
}

type safeFallbackError interface {
	error
	SafeToFallback() bool
}

func shouldRefundAfterSendError(err error) bool {
	if err == nil {
		return false
	}
	var validationErr *smsapi.ValidationError
	if errors.As(err, &validationErr) {
		return true
	}
	if errors.Is(err, smsapi.ErrNoProviderAvailable) || errors.Is(err, smsapi.ErrProviderNotFound) {
		return true
	}

	var sendErr *smsapi.SendError
	if errors.As(err, &sendErr) {
		if len(sendErr.Attempts) == 0 {
			return false
		}
		for _, attempt := range sendErr.Attempts {
			if !safeProviderRejection(attempt.Err) {
				return false
			}
		}
		return true
	}

	return safeProviderRejection(err)
}

func safeProviderRejection(err error) bool {
	if err == nil {
		return false
	}
	var fallbackErr safeFallbackError
	return errors.As(err, &fallbackErr) && fallbackErr.SafeToFallback()
}
