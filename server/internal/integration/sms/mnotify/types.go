package mnotify

type sendResponse struct {
	Code      string `json:"code"`
	Status    string `json:"status"`
	Message   string `json:"message"`
	MessageID string `json:"message_id"`
	ID        string `json:"id"`
}
