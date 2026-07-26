package email

import (
	"encoding/json"
	"fmt"
	"net/mail"
	"strings"
	"unicode/utf8"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxEmailNameCharacters = 128
	maxSubjectCharacters   = 255
	maxBodyBytes           = 1 << 20
	maxMetadataBytes       = 16 << 10
)

type validatedSend struct {
	MessageType  string
	FromEmail    string
	FromName     *string
	ReplyToEmail *string
	ToEmail      string
	ToName       *string
	Subject      string
	HTMLBody     *string
	TextBody     *string
	Metadata     json.RawMessage
}

func validateSend(req SendRequest, config ServiceConfig) (validatedSend, error) {
	defaultFrom, err := normalizeEmail(config.DefaultFromEmail, "Configured email sender")
	if err != nil {
		return validatedSend{}, apperrors.NewInternal("Email sender is not configured", err)
	}

	toEmail, err := normalizeEmail(req.To.Email, "Email recipient")
	if err != nil {
		return validatedSend{}, apperrors.NewBadRequest(err.Error())
	}
	toName, err := normalizeName(req.To.Name, "Email recipient name")
	if err != nil {
		return validatedSend{}, err
	}

	fromEmail := defaultFrom
	fromNameValue := strings.TrimSpace(config.DefaultFromName)
	if req.From != nil {
		if strings.TrimSpace(req.From.Email) != "" {
			requestedFrom, fromErr := normalizeEmail(req.From.Email, "Email sender")
			if fromErr != nil {
				return validatedSend{}, apperrors.NewBadRequest(fromErr.Error())
			}
			if !strings.EqualFold(requestedFrom, defaultFrom) {
				return validatedSend{}, apperrors.NewBadRequest("Email sender must use the configured Dugble address")
			}
			fromEmail = requestedFrom
		}
		if strings.TrimSpace(req.From.Name) != "" {
			fromNameValue = strings.TrimSpace(req.From.Name)
		}
	}
	fromName, err := normalizeName(fromNameValue, "Email sender name")
	if err != nil {
		return validatedSend{}, err
	}

	var replyTo *string
	if strings.TrimSpace(req.ReplyTo) != "" {
		normalizedReplyTo, replyErr := normalizeEmail(req.ReplyTo, "Reply-to email")
		if replyErr != nil {
			return validatedSend{}, apperrors.NewBadRequest(replyErr.Error())
		}
		replyTo = &normalizedReplyTo
	}

	subject := strings.TrimSpace(req.Subject)
	if subject == "" {
		return validatedSend{}, apperrors.NewBadRequest("Email subject is required")
	}
	if utf8.RuneCountInString(subject) > maxSubjectCharacters {
		return validatedSend{}, apperrors.NewBadRequest(fmt.Sprintf("Email subject must be at most %d characters", maxSubjectCharacters))
	}

	htmlBody := optionalBody(req.HTML)
	textBody := optionalBody(req.Text)
	if htmlBody == nil && textBody == nil {
		return validatedSend{}, apperrors.NewBadRequest("Email HTML or text body is required")
	}
	if htmlBody != nil && len(*htmlBody) > maxBodyBytes {
		return validatedSend{}, apperrors.NewBadRequest("Email HTML body is too large")
	}
	if textBody != nil && len(*textBody) > maxBodyBytes {
		return validatedSend{}, apperrors.NewBadRequest("Email text body is too large")
	}

	metadata, err := normalizeMetadata(req.Metadata)
	if err != nil {
		return validatedSend{}, err
	}

	return validatedSend{
		MessageType: MessageTypeTransactional, FromEmail: fromEmail, FromName: fromName,
		ReplyToEmail: replyTo, ToEmail: toEmail, ToName: toName, Subject: subject,
		HTMLBody: htmlBody, TextBody: textBody, Metadata: metadata,
	}, nil
}

func normalizeEmail(value string, label string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", fmt.Errorf("%s is required", label)
	}
	parsed, err := mail.ParseAddress(value)
	if err != nil || !strings.EqualFold(parsed.Address, value) {
		return "", fmt.Errorf("%s must be a valid email address", label)
	}
	return strings.ToLower(parsed.Address), nil
}

func normalizeName(value string, label string) (*string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	if utf8.RuneCountInString(value) > maxEmailNameCharacters {
		return nil, apperrors.NewBadRequest(fmt.Sprintf("%s must be at most %d characters", label, maxEmailNameCharacters))
	}
	return &value, nil
}

func optionalBody(value string) *string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return &value
}

func normalizeMetadata(metadata json.RawMessage) (json.RawMessage, error) {
	if len(metadata) == 0 {
		return json.RawMessage(`{}`), nil
	}
	if len(metadata) > maxMetadataBytes {
		return nil, apperrors.NewBadRequest("Email metadata is too large")
	}
	var object map[string]any
	if err := json.Unmarshal(metadata, &object); err != nil || object == nil {
		return nil, apperrors.NewBadRequest("Email metadata must be a JSON object")
	}
	canonical, err := json.Marshal(object)
	if err != nil {
		return nil, apperrors.NewBadRequest("Email metadata must be valid JSON")
	}
	if len(canonical) > maxMetadataBytes {
		return nil, apperrors.NewBadRequest("Email metadata is too large")
	}
	return canonical, nil
}
