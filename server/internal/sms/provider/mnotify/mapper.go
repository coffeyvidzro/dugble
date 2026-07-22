package mnotify

import (
	"encoding/json"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/sms/provider"
)

func toSendResult(providerName string, body []byte, res sendResponse) provider.SendResult {
	messageID := strings.TrimSpace(res.MessageID)
	if messageID == "" {
		messageID = strings.TrimSpace(res.ID)
	}
	return provider.SendResult{Provider: providerName, ProviderMessageID: messageID, Status: mapStatus(res), RawResponse: json.RawMessage(body)}
}

func mapStatus(res sendResponse) provider.Status {
	status := strings.ToLower(strings.TrimSpace(res.Status))
	code := strings.ToLower(strings.TrimSpace(res.Code))
	message := strings.ToLower(strings.TrimSpace(res.Message))
	if code == "1000" || code == "1002" || status == "success" || strings.Contains(message, "sent") || strings.Contains(message, "success") {
		return provider.StatusAccepted
	}
	if status == "sent" {
		return provider.StatusSent
	}
	if status == "failed" || status == "error" || strings.HasPrefix(code, "4") {
		return provider.StatusFailed
	}
	return provider.StatusUnknown
}
