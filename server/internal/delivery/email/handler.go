package emaildelivery

import (
	"context"
	"errors"
	"fmt"
)

type deliveryRepository interface {
	Claim(context.Context, [16]byte, [16]byte) (DeliveryMessage, error)
	MarkSubmitted(context.Context, [16]byte, [16]byte, ProviderResult) error
	MarkRetryable(context.Context, [16]byte, [16]byte, error) error
	MarkFailed(context.Context, [16]byte, [16]byte, string, error) error
}

type Handler struct {
	repository *Repository
	provider   Provider
}

func NewHandler(repository *Repository, provider Provider) *Handler {
	return &Handler{repository: repository, provider: provider}
}

func (h *Handler) Handle(ctx context.Context, command DeliverCommand) error {
	if h == nil || h.repository == nil {
		return errors.New("email delivery repository is not configured")
	}
	if h.provider == nil {
		return errors.New("email delivery provider is not configured")
	}

	message, err := h.repository.Claim(ctx, command.MessageID, command.TeamID)
	if errors.Is(err, ErrMessageNotDeliverable) {
		return nil
	}
	if err != nil {
		return err
	}

	result, err := h.provider.Send(ctx, ProviderMessage{
		From:        Address{Email: message.FromEmail, Name: message.FromName},
		ReplyTo:     message.ReplyTo,
		To:          message.To,
		CC:          message.CC,
		BCC:         message.BCC,
		Subject:     message.Subject,
		HTML:        message.HTML,
		Text:        message.Text,
		Headers:     message.Headers,
		Attachments: message.Attachments,
	})
	if err != nil {
		if IsRetryable(err) {
			if recordErr := h.repository.MarkRetryable(ctx, command.MessageID, command.TeamID, err); recordErr != nil {
				return errors.Join(err, recordErr)
			}
			return fmt.Errorf("send email through provider: %w", err)
		}
		if recordErr := h.repository.MarkFailed(ctx, command.MessageID, command.TeamID, FailureCode(err), err); recordErr != nil {
			return errors.Join(err, recordErr)
		}
		return nil
	}

	if err := h.repository.MarkSubmitted(ctx, command.MessageID, command.TeamID, result); err != nil {
		return err
	}
	return nil
}

func (h *Handler) HandleExhausted(ctx context.Context, command DeliverCommand, cause error) error {
	if h == nil || h.repository == nil {
		return errors.New("email delivery repository is not configured")
	}
	return h.repository.MarkFailed(ctx, command.MessageID, command.TeamID, "retry_exhausted", cause)
}
