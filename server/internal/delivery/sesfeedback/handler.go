package sesfeedback

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	snsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sns"
	jetstreammessaging "github.com/coffeyvidzro/dugble/server/internal/messaging/jetstream"
)

const maxRequestSize = 256 << 10

var eventNamespace = uuid.MustParse("54e3cc79-82fb-4c2c-a095-56c6ec77c981")

type verifier interface {
	Verify(context.Context, []byte) (snsintegration.Message, error)
}

type publisher interface {
	Publish(context.Context, string, []byte, map[string]string, string) error
}

type confirmer interface {
	Confirm(context.Context, string) error
}

type Handler struct {
	verifier  verifier
	publisher publisher
	confirmer confirmer
}

type Event struct {
	EventID                uuid.UUID       `json:"event_id"`
	SchemaVersion          int             `json:"schema_version"`
	Provider               string          `json:"provider"`
	Transport              string          `json:"transport"`
	TopicARN               string          `json:"topic_arn"`
	ProviderNotificationID string          `json:"provider_notification_id"`
	ReceivedAt             time.Time       `json:"received_at"`
	Payload                json.RawMessage `json:"payload"`
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
		if h.confirmer == nil {
			return c.JSON(http.StatusServiceUnavailable, errorBody("sns_confirmation_unavailable", "SNS subscription confirmation is unavailable."))
		}
		if err := h.confirmer.Confirm(c.Request().Context(), message.SubscribeURL); err != nil {
			return c.JSON(http.StatusServiceUnavailable, errorBody("sns_confirmation_failed", "SNS subscription confirmation failed."))
		}
		return c.NoContent(http.StatusNoContent)
	}
	if message.Type != "Notification" {
		return c.JSON(http.StatusBadRequest, errorBody("unsupported_sns_message", "SNS message type is not supported."))
	}
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

type HTTPConfirmer struct{ client *http.Client }

func NewHTTPConfirmer(client *http.Client) *HTTPConfirmer {
	if client == nil {
		client = &http.Client{Timeout: 5 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if err := validateSubscribeURL(req.URL); err != nil {
				return err
			}
			if len(via) >= 3 {
				return errors.New("too many SNS confirmation redirects")
			}
			return nil
		}}
	}
	return &HTTPConfirmer{client: client}
}

func (c *HTTPConfirmer) Confirm(ctx context.Context, rawURL string) error {
	parsed, err := urlParse(rawURL)
	if err != nil {
		return err
	}
	if err := validateSubscribeURL(parsed); err != nil {
		return err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, parsed.String(), nil)
	if err != nil {
		return err
	}
	response, err := c.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 4<<10))
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("SNS confirmation returned HTTP %d", response.StatusCode)
	}
	return nil
}

var urlParse = func(raw string) (*url.URL, error) { return url.Parse(raw) }

func validateSubscribeURL(parsed *url.URL) error {
	if parsed == nil || parsed.Scheme != "https" || parsed.User != nil || parsed.Port() != "" {
		return errors.New("invalid SNS subscription URL")
	}
	host := strings.ToLower(parsed.Hostname())
	if !(strings.HasPrefix(host, "sns.") && (strings.HasSuffix(host, ".amazonaws.com") || strings.HasSuffix(host, ".amazonaws.com.cn"))) {
		return errors.New("untrusted SNS subscription host")
	}
	return nil
}
