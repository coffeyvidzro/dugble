package emaildelivery

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type deliveryRepository interface {
	Claim(context.Context, uuid.UUID, uuid.UUID) (DeliveryMessage, error)
	MarkSubmitted(context.Context, uuid.UUID, uuid.UUID, platformemail.Result) error
	MarkRetryable(context.Context, uuid.UUID, uuid.UUID, error) error
	MarkFailed(context.Context, uuid.UUID, uuid.UUID, string, error) error
}

type Handler struct {
	repository deliveryRepository
	sender     platformemail.Sender
}

func NewHandler(repository deliveryRepository, sender platformemail.Sender) *Handler {
	return &Handler{repository: repository, sender: sender}
}

func (h *Handler) Handle(ctx context.Context, command DeliverCommand) error {
	if h == nil || h.repository == nil {
		return errors.New("email delivery repository is not configured")
	}
	if h.sender == nil {
		return errors.New("email sender is not configured")
	}
	message, err := h.repository.Claim(ctx, command.MessageID, command.TeamID)
	if errors.Is(err, ErrMessageNotDeliverable) || errors.Is(err, ErrSenderDomainUnavailable) {
		return nil
	}
	if err != nil {
		return err
	}
	result, err := h.sender.Send(ctx, platformemail.Message{
		Provider:    message.Provider,
		Region:      message.Region,
		From:        platformemail.Address{Email: message.FromEmail, Name: message.FromName},
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
		if platformemail.IsRetryable(err) {
			if recordErr := h.repository.MarkRetryable(ctx, command.MessageID, command.TeamID, err); recordErr != nil {
				return errors.Join(err, recordErr)
			}
			return fmt.Errorf("send email: %w", err)
		}
		if recordErr := h.repository.MarkFailed(ctx, command.MessageID, command.TeamID, platformemail.FailureCode(err), err); recordErr != nil {
			return errors.Join(err, recordErr)
		}
		return nil
	}
	return h.repository.MarkSubmitted(ctx, command.MessageID, command.TeamID, result)
}

func (h *Handler) HandleExhausted(ctx context.Context, command DeliverCommand, cause error) error {
	if h == nil || h.repository == nil {
		return errors.New("email delivery repository is not configured")
	}
	return h.repository.MarkFailed(ctx, command.MessageID, command.TeamID, "retry_exhausted", cause)
}
