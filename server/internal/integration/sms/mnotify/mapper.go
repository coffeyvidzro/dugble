package mnotify

import (
	"encoding/json"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func toSendResult(provider string, body []byte, res sendResponse) sms.SendResult {
	messageID := strings.TrimSpace(res.MessageID)
	if messageID == "" {
		messageID = strings.TrimSpace(res.ID)
	}
	return sms.SendResult{Provider: provider, ProviderMessageID: messageID, Status: mapStatus(res), RawResponse: json.RawMessage(body)}
}

func mapStatus(res sendResponse) sms.Status {
	status := strings.ToLower(strings.TrimSpace(res.Status))
	code := strings.ToLower(strings.TrimSpace(res.Code))
	message := strings.ToLower(strings.TrimSpace(res.Message))
	if code == "1000" || code == "1002" || status == "success" || strings.Contains(message, "sent") || strings.Contains(message, "success") {
		return sms.StatusAccepted
	}
	if status == "sent" {
		return sms.StatusSent
	}
	if status == "failed" || status == "error" || strings.HasPrefix(code, "4") {
		return sms.StatusFailed
	}
	return sms.StatusUnknown
}
