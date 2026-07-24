package mnotify

type SendRequest struct {
	Recipient    []string `json:"recipient"`
	Sender       string   `json:"sender"`
	Message      string   `json:"message"`
	IsSchedule   bool     `json:"is_schedule"`
	ScheduleDate string   `json:"schedule_date"`
}

type SendResponse struct {
	Status  string `json:"status"`
	Code    string `json:"code"`
	Message string `json:"message"`
	Summary struct {
		ID            string   `json:"_id"`
		Type          string   `json:"type"`
		TotalSent     int      `json:"total_sent"`
		Contacts      int      `json:"contacts"`
		TotalRejected int      `json:"total_rejected"`
		NumbersSent   []string `json:"numbers_sent"`
		CreditUsed    int      `json:"credit_used"`
		CreditLeft    int      `json:"credit_left"`
	} `json:"summary"`
}

// CampaignStatusResponse is returned by GET /api/campaign/{campaignID}.
// The report field is an array because a campaign may contain multiple recipients.
type CampaignStatusResponse struct {
	Status string         `json:"status"`
	Report []StatusReport `json:"report"`
}

type StatusReport struct {
	ID         int64  `json:"_id"`
	Recipient  string `json:"recipient"`
	Message    string `json:"message"`
	Sender     string `json:"sender"`
	Status     string `json:"status"`
	DateSent   string `json:"date_sent"`
	CampaignID string `json:"campaign_id"`
	Retries    int    `json:"retries"`
}
