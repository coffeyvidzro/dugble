package smsdelivery

import (
	"context"
	"errors"

	"github.com/riverqueue/river"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
)

type Worker struct {
	river.WorkerDefaults[DeliverArgs]

	repository *smsmodule.Repository
	sender     smsmodule.Sender
	wallet     smsmodule.WalletLedger
}

func NewWorker(repository *smsmodule.Repository, sender smsmodule.Sender, wallet smsmodule.WalletLedger) *Worker {
	return &Worker{repository: repository, sender: sender, wallet: wallet}
}

func (w *Worker) Work(ctx context.Context, job *river.Job[DeliverArgs]) error {
	message, err := w.repository.MarkProcessing(ctx, job.Args.MessageID, job.Args.TeamID)
	if err != nil {
		if !errors.Is(err, smsmodule.ErrMessageNotFound) {
			return err
		}
		return w.handleAlreadyClaimed(ctx, job.Args)
	}

	response, err := w.sender.Send(ctx, smsapi.SendRequest{To: message.To, From: message.From, Message: message.Body})
	if err != nil {
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
	if message.Status != smsmodule.StatusRefundPending {
		// Provider requests are not guaranteed idempotent across upstreams. A
		// non-queued message was already claimed or completed, so do not submit it
		// again from a duplicate or retried River job.
		return nil
	}

	reason := "SMS delivery failed before refund completed"
	if message.ErrorMessage != nil && *message.ErrorMessage != "" {
		reason = *message.ErrorMessage
	}
	return w.refundAndFail(ctx, args, message, errors.New(reason))
}

func (w *Worker) refundAndFail(ctx context.Context, args DeliverArgs, message smsmodule.Message, cause error) error {
	if _, refundErr := w.wallet.RefundSMSCharge(ctx, args.TeamID, message.CostMicros, args.MessageID, message.Metadata); refundErr != nil {
		return errors.Join(cause, refundErr)
	}
	_, updateErr := w.repository.MarkFailed(ctx, args.MessageID, args.TeamID, cause.Error())
	return updateErr
}
