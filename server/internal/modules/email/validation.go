package email

import (
	"encoding/json"
	"net/mail"
	"strings"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

func validate(req SendRequest) (SendRequest, error) {
	req.FromEmail = strings.TrimSpace(req.FromEmail)
	req.ToEmail = strings.TrimSpace(req.ToEmail)
	req.Subject = strings.TrimSpace(req.Subject)
	if req.MessageType == "" {
		req.MessageType = "transactional"
	}
	if req.MessageType != "transactional" {
		return req, apperrors.NewBadRequest("message_type must be transactional")
	}
	if _, err := mail.ParseAddress(req.FromEmail); err != nil {
		return req, apperrors.NewBadRequest("from_email must be a valid email address")
	}
	if _, err := mail.ParseAddress(req.ToEmail); err != nil {
		return req, apperrors.NewBadRequest("to_email must be a valid email address")
	}
	if req.ReplyToEmail != nil {
		v := strings.TrimSpace(*req.ReplyToEmail)
		if _, err := mail.ParseAddress(v); err != nil {
			return req, apperrors.NewBadRequest("reply_to_email must be a valid email address")
		}
		req.ReplyToEmail = &v
	}
	if req.Subject == "" {
		return req, apperrors.NewBadRequest("subject is required")
	}
	if (req.HTMLBody == nil || strings.TrimSpace(*req.HTMLBody) == "") && (req.TextBody == nil || strings.TrimSpace(*req.TextBody) == "") {
		return req, apperrors.NewBadRequest("html_body or text_body is required")
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}
	var object map[string]any
	if !json.Valid(req.Metadata) || json.Unmarshal(req.Metadata, &object) != nil || object == nil {
		return req, apperrors.NewBadRequest("metadata must be a JSON object")
	}
	return req, nil
}
