package arkesel

type sendRequest struct {
	Sender     string   `json:"sender"`
	Message    string   `json:"message"`
	Recipients []string `json:"recipients"`
}

type sendResponse struct {
	Status    string `json:"status"`
	Code      string `json:"code"`
	Message   string `json:"message"`
	BatchID   string `json:"batch_id"`
	MessageID string `json:"message_id"`
}
