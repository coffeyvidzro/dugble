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
		if errors.Is(err, smsmodule.ErrMessageNotFound) {
			return nil
		}
		return err
	}

	response, err := w.sender.Send(ctx, smsapi.SendRequest{To: message.To, From: message.From, Message: message.Body})
	if err != nil {
		// Keep the message retryable until the compensating refund succeeds.
		// If we mark it failed first and the refund fails, the next River retry will
		// skip the job because failed messages are no longer claimable for delivery.
		if _, refundErr := w.wallet.RefundSMSCharge(ctx, job.Args.TeamID, message.CostMicros, job.Args.MessageID, message.Metadata); refundErr != nil {
			return errors.Join(err, refundErr)
		}
		_, updateErr := w.repository.MarkFailed(ctx, job.Args.MessageID, job.Args.TeamID, err.Error())
		return updateErr
	}

	_, err = w.repository.MarkSubmitted(ctx, job.Args.MessageID, job.Args.TeamID, response.ProviderID, response.ProviderMsgID, smsmodule.MapProviderStatus(response.Status))
	return err
}
