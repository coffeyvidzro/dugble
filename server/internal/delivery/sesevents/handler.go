package sesevents

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	snsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sns"
	jetstreammessaging "github.com/coffeyvidzro/dugble/server/internal/messaging/jetstream"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type verifier interface {
	Verify(context.Context, []byte) (snsintegration.Message, error)
}

type Handler struct {
	verifier  verifier
	publisher publisher
	confirmer confirmer
}

func NewHandler(verifier verifier, publisher publisher, confirmer confirmer) *Handler {
	return &Handler{verifier: verifier, publisher: publisher, confirmer: confirmer}
}

func (h *Handler) Receive(c *echo.Context) error {
	if h == nil || h.verifier == nil || h.publisher == nil {
		return httputil.Error(c, apperrors.NewServiceUnavailable("SNS ingestion is unavailable", nil))
	}
	body, err := io.ReadAll(io.LimitReader(c.Request().Body, maxRequestSize+1))
	if err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Unable to read SNS request"))
	}
	if len(body) > maxRequestSize {
		return httputil.Error(c, apperrors.NewPayloadTooLarge("SNS request is too large"))
	}
	message, err := h.verifier.Verify(c.Request().Context(), body)
	if err != nil {
		if errors.Is(err, snsintegration.ErrVerificationUnavailable) {
			return httputil.Error(c, apperrors.NewServiceUnavailable("SNS request verification is temporarily unavailable", err))
		}
		return httputil.Error(c, apperrors.NewUnauthorized("SNS request verification failed"))
	}
	if message.Type == "SubscriptionConfirmation" {
		return h.confirmSubscription(c, message)
	}
	if message.Type != "Notification" {
		return httputil.Error(c, apperrors.NewBadRequest("SNS message type is not supported"))
	}
	return h.publishNotification(c, message)
}

func (h *Handler) confirmSubscription(c *echo.Context, message snsintegration.Message) error {
	if h.confirmer == nil {
		return httputil.Error(c, apperrors.NewServiceUnavailable("SNS subscription confirmation is unavailable", nil))
	}
	if err := h.confirmer.Confirm(c.Request().Context(), message.SubscribeURL); err != nil {
		return httputil.Error(c, apperrors.NewServiceUnavailable("SNS subscription confirmation failed", err))
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) publishNotification(c *echo.Context, message snsintegration.Message) error {
	payload := json.RawMessage(message.Message)
	if !json.Valid(payload) {
		return httputil.Error(c, apperrors.NewBadRequest("SNS notification does not contain a valid SES event"))
	}
	eventID := uuid.NewSHA1(eventNamespace, []byte(message.TopicARN+":"+message.MessageID))
	event := Event{EventID: eventID, SchemaVersion: 1, Provider: "aws_ses", Transport: "aws_sns", TopicARN: message.TopicARN, ProviderNotificationID: message.MessageID, ReceivedAt: time.Now().UTC(), Payload: payload}
	encoded, err := json.Marshal(event)
	if err != nil {
		return httputil.Error(c, apperrors.NewInternal("Unable to encode SNS event", err))
	}
	headers := map[string]string{"Dugble-Event-Id": eventID.String(), "Dugble-Schema-Version": "1", "Dugble-Provider": "aws_ses", "Dugble-Transport": "aws_sns", "AWS-SNS-Message-Id": message.MessageID, "AWS-SNS-Topic-Arn": message.TopicARN}
	if err := h.publisher.Publish(c.Request().Context(), jetstreammessaging.SESProviderEventSubject, encoded, headers, eventID.String()); err != nil {
		return httputil.Error(c, apperrors.NewServiceUnavailable("Unable to accept SNS event", err))
	}
	return c.NoContent(http.StatusNoContent)
}
