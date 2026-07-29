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
		return c.JSON(http.StatusServiceUnavailable, errorBody("sns_ingestion_unavailable", "SNS ingestion is unavailable."))
	}
	body, err := io.ReadAll(io.LimitReader(c.Request().Body, maxRequestSize+1))
	if err != nil {
		return c.JSON(http.StatusBadRequest, errorBody("invalid_sns_request", "Unable to read SNS request."))
	}
	if len(body) > maxRequestSize {
		return c.JSON(http.StatusRequestEntityTooLarge, errorBody("sns_request_too_large", "SNS request is too large."))
	}
	message, err := h.verifier.Verify(c.Request().Context(), body)
	if err != nil {
		if errors.Is(err, snsintegration.ErrVerificationUnavailable) {
			return c.JSON(http.StatusServiceUnavailable, errorBody("sns_verification_unavailable", "SNS request verification is temporarily unavailable."))
		}
		return c.JSON(http.StatusUnauthorized, errorBody("invalid_sns_signature", "SNS request verification failed."))
	}
	if message.Type == "SubscriptionConfirmation" {
		return h.confirmSubscription(c, message)
	}
	if message.Type != "Notification" {
		return c.JSON(http.StatusBadRequest, errorBody("unsupported_sns_message", "SNS message type is not supported."))
	}
	return h.publishNotification(c, message)
}

func (h *Handler) confirmSubscription(c *echo.Context, message snsintegration.Message) error {
	if h.confirmer == nil {
		return c.JSON(http.StatusServiceUnavailable, errorBody("sns_confirmation_unavailable", "SNS subscription confirmation is unavailable."))
	}
	if err := h.confirmer.Confirm(c.Request().Context(), message.SubscribeURL); err != nil {
		return c.JSON(http.StatusServiceUnavailable, errorBody("sns_confirmation_failed", "SNS subscription confirmation failed."))
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) publishNotification(c *echo.Context, message snsintegration.Message) error {
	payload := json.RawMessage(message.Message)
	if !json.Valid(payload) {
		return c.JSON(http.StatusBadRequest, errorBody("invalid_ses_event", "SNS notification does not contain a valid SES event."))
	}
	eventID := uuid.NewSHA1(eventNamespace, []byte(message.TopicARN+":"+message.MessageID))
	event := Event{EventID: eventID, SchemaVersion: 1, Provider: "aws_ses", Transport: "aws_sns", TopicARN: message.TopicARN, ProviderNotificationID: message.MessageID, ReceivedAt: time.Now().UTC(), Payload: payload}
	encoded, err := json.Marshal(event)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, errorBody("sns_event_encoding_failed", "Unable to encode SNS event."))
	}
	headers := map[string]string{"Dugble-Event-Id": eventID.String(), "Dugble-Schema-Version": "1", "Dugble-Provider": "aws_ses", "Dugble-Transport": "aws_sns", "AWS-SNS-Message-Id": message.MessageID, "AWS-SNS-Topic-Arn": message.TopicARN}
	if err := h.publisher.Publish(c.Request().Context(), jetstreammessaging.SESProviderEventSubject, encoded, headers, eventID.String()); err != nil {
		return c.JSON(http.StatusServiceUnavailable, errorBody("sns_event_publish_failed", "Unable to accept SNS event."))
	}
	return c.NoContent(http.StatusNoContent)
}

func errorBody(code, message string) map[string]any {
	return map[string]any{"error": map[string]string{"code": code, "message": message}}
}
