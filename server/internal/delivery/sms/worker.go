package smsdelivery

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/riverqueue/river"

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

type Worker struct {
	river.WorkerDefaults[DeliverArgs]

	repository           messageRepository
	sender               smsmodule.Sender
	wallet               refundLedger
	staleProcessingAfter time.Duration
}

func NewWorker(repository *smsmodule.Repository, sender smsmodule.Sender, wallet smsmodule.WalletLedger) *Worker {
	return &Worker{repository: repository, sender: sender, wallet: wallet, staleProcessingAfter: defaultStaleProcessingAfter}
}

func (w *Worker) Work(ctx context.Context, job *river.Job[DeliverArgs]) error {
	message, err := w.repository.MarkProcessing(ctx, job.Args.MessageID, job.Args.TeamID)
	if err != nil {
		if !errors.Is(err, smsmodule.ErrMessageNotFound) {
			return err
		}
		return w.handleAlreadyClaimed(ctx, job.Args)
	}

	response, err := w.sender.Send(ctx, smsapi.SendRequest{
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
		pending, updateErr := w.repository.MarkRefundPending(ctx, job.Args.MessageID, job.Args.TeamID, err.Error())
		if updateErr != nil {
			return updateErr
		}
		return w.refundAndFail(ctx, job.Args, pending, err)
	}

	_, err = w.repository.MarkSubmitted(ctx, job.Args.MessageID, job.Args.TeamID, response.ProviderID, response.ProviderMsgID, smsmodule.MapProviderStatus(response.Status))
	return err
}

func (w *Worker) handleAlreadyClaimed(ctx context.Context, args DeliverArgs) error {
	message, err := w.repository.Get(ctx, args.MessageID, args.TeamID)
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
		return w.refundAndFail(ctx, args, message, errors.New(reason))
	case smsmodule.StatusProcessing:
		if !w.processingIsStale(message) {
			return fmt.Errorf("sms message %s is already processing", message.ID)
		}
		const reason = "SMS delivery outcome unknown after processing timeout"
		pending, updateErr := w.repository.MarkRefundPending(ctx, args.MessageID, args.TeamID, reason)
		if updateErr != nil {
			return updateErr
		}
		return w.refundAndFail(ctx, args, pending, errors.New(reason))
	default:
		// Provider requests are not guaranteed idempotent across upstreams. A
		// non-queued message was already claimed or completed, so do not submit it
		// again from a duplicate or retried River job.
		return nil
	}
}

func (w *Worker) processingIsStale(message smsmodule.Message) bool {
	threshold := w.staleProcessingAfter
	if threshold <= 0 {
		threshold = defaultStaleProcessingAfter
	}
	return time.Since(message.UpdatedAt) >= threshold
}

func (w *Worker) refundAndFail(ctx context.Context, args DeliverArgs, message smsmodule.Message, cause error) error {
	if _, refundErr := w.wallet.RefundSMSCharge(ctx, args.TeamID, message.CostMicros, args.MessageID, message.Metadata); refundErr != nil {
		return errors.Join(cause, refundErr)
	}
	_, updateErr := w.repository.MarkFailed(ctx, args.MessageID, args.TeamID, cause.Error())
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
