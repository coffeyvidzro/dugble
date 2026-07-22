package arkesel

import (
	"encoding/json"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func toSendRequest(req sms.SendRequest) sendRequest {
	return sendRequest{Sender: req.From, Message: req.Body, Recipients: []string{req.To}}
}

func toSendResult(provider string, body []byte, res sendResponse) sms.SendResult {
	messageID := strings.TrimSpace(res.MessageID)
	if messageID == "" {
		messageID = strings.TrimSpace(res.BatchID)
	}
	return sms.SendResult{
		Provider:          provider,
		ProviderMessageID: messageID,
		Status:            mapStatus(res),
		RawResponse:       json.RawMessage(body),
	}
}

func mapStatus(res sendResponse) sms.Status {
	status := strings.ToLower(strings.TrimSpace(res.Status))
	code := strings.ToLower(strings.TrimSpace(res.Code))
	message := strings.ToLower(strings.TrimSpace(res.Message))
	if status == "success" || status == "ok" || code == "ok" || strings.Contains(message, "success") {
		return sms.StatusAccepted
	}
	if status == "sent" || strings.Contains(message, "sent") {
		return sms.StatusSent
	}
	if status == "failed" || status == "error" {
		return sms.StatusFailed
	}
	return sms.StatusUnknown
}
