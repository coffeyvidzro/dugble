package webhooks

import (
	"crypto/rand"
	"encoding/base64"
	"net/url"
	"slices"
	"strings"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

var supportedEvents = map[string]struct{}{
	EventSMSSubmitted:   {},
	EventSMSSent:        {},
	EventSMSDelivered:   {},
	EventSMSUndelivered: {},
	EventSMSFailed:      {},
}

type validatedEndpoint struct {
	URL              string
	Description      *string
	Enabled          bool
	SubscribedEvents []string
	APIVersion       string
}

func validateCreateEndpoint(req CreateEndpointRequest) (validatedEndpoint, error) {
	apiVersion := strings.TrimSpace(req.APIVersion)
	if apiVersion == "" {
		apiVersion = DefaultAPIVersion
	}
	return validateEndpoint(req.URL, req.Description, true, req.SubscribedEvents, apiVersion)
}

func validateUpdateEndpoint(current Endpoint, req UpdateEndpointRequest) (validatedEndpoint, error) {
	value := validatedEndpoint{
		URL:              current.URL,
		Description:      current.Description,
		Enabled:          current.Enabled,
		SubscribedEvents: current.SubscribedEvents,
		APIVersion:       current.APIVersion,
	}
	if req.URL != nil {
		value.URL = *req.URL
	}
	if req.Description != nil {
		value.Description = req.Description
	}
	if req.Enabled != nil {
		value.Enabled = *req.Enabled
	}
	if req.SubscribedEvents != nil {
		value.SubscribedEvents = *req.SubscribedEvents
	}
	if req.APIVersion != nil {
		value.APIVersion = *req.APIVersion
	}
	return validateEndpoint(value.URL, value.Description, value.Enabled, value.SubscribedEvents, value.APIVersion)
}

func validateEndpoint(rawURL string, description *string, enabled bool, events []string, apiVersion string) (validatedEndpoint, error) {
	rawURL = strings.TrimSpace(rawURL)
	parsed, err := url.ParseRequestURI(rawURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "https" && parsed.Scheme != "http") {
		return validatedEndpoint{}, apperrors.NewBadRequest("Webhook URL must be an absolute HTTP or HTTPS URL")
	}
	apiVersion = strings.TrimSpace(apiVersion)
	if apiVersion == "" {
		return validatedEndpoint{}, apperrors.NewBadRequest("Webhook API version is required")
	}

	normalizedEvents := make([]string, 0, len(events))
	for _, event := range events {
		event = strings.TrimSpace(event)
		if event == "" || slices.Contains(normalizedEvents, event) {
			continue
		}
		if _, ok := supportedEvents[event]; !ok {
			return validatedEndpoint{}, apperrors.NewBadRequest("Unsupported webhook event: " + event)
		}
		normalizedEvents = append(normalizedEvents, event)
	}
	if len(normalizedEvents) == 0 {
		return validatedEndpoint{}, apperrors.NewBadRequest("At least one subscribed event is required")
	}

	if description != nil {
		trimmed := strings.TrimSpace(*description)
		description = &trimmed
	}
	return validatedEndpoint{
		URL:              rawURL,
		Description:      description,
		Enabled:          enabled,
		SubscribedEvents: normalizedEvents,
		APIVersion:       apiVersion,
	}, nil
}

func newSigningSecret() (string, error) {
	value := make([]byte, 32)
	if _, err := rand.Read(value); err != nil {
		return "", err
	}
	return "whsec_" + base64.RawURLEncoding.EncodeToString(value), nil
}
