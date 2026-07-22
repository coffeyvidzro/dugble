package arkesel

import (
	"encoding/json"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/sms/provider"
)

func toSendRequest(req provider.SendRequest) sendRequest {
	return sendRequest{Sender: req.From, Message: req.Body, Recipients: []string{req.To}}
}

func toSendResult(providerName string, body []byte, res sendResponse) provider.SendResult {
	messageID := strings.TrimSpace(res.MessageID)
	if messageID == "" {
		messageID = strings.TrimSpace(res.BatchID)
	}
	return provider.SendResult{
		Provider:          providerName,
		ProviderMessageID: messageID,
		Status:            mapStatus(res),
		RawResponse:       json.RawMessage(body),
	}
}

func mapStatus(res sendResponse) provider.Status {
	status := strings.ToLower(strings.TrimSpace(res.Status))
	code := strings.ToLower(strings.TrimSpace(res.Code))
	message := strings.ToLower(strings.TrimSpace(res.Message))
	if status == "success" || status == "ok" || code == "ok" || strings.Contains(message, "success") {
		return provider.StatusAccepted
	}
	if status == "sent" || strings.Contains(message, "sent") {
		return provider.StatusSent
	}
	if status == "failed" || status == "error" {
		return provider.StatusFailed
	}
	return provider.StatusUnknown
}
