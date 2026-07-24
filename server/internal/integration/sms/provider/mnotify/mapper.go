package mnotify

import (
	"fmt"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

const providerID = "mnotify"

func FromInternal(req sms.SendRequest) *SendRequest {
	return &SendRequest{
		Recipient:    []string{strings.TrimSpace(req.To)},
		Sender:       strings.TrimSpace(req.From),
		Message:      req.Message,
		IsSchedule:   false,
		ScheduleDate: "",
	}
}

func ToInternal(resp *SendResponse) (*sms.SendResponse, error) {
	if resp == nil {
		return nil, fmt.Errorf("mnotify send response is nil")
	}

	if !success(resp.Status) || strings.TrimSpace(resp.Code) != "2000" {
		return nil, fmt.Errorf(
			"mnotify send response failed: status %q code %q message %q",
			resp.Status,
			resp.Code,
			resp.Message,
		)
	}

	campaignID := strings.TrimSpace(resp.Summary.ID)
	if campaignID == "" {
		return nil, fmt.Errorf("mnotify send response contains empty campaign id")
	}
	if resp.Summary.TotalSent <= 0 {
		return nil, fmt.Errorf(
			"mnotify accepted no recipients: contacts %d rejected %d",
			resp.Summary.Contacts,
			resp.Summary.TotalRejected,
		)
	}

	return &sms.SendResponse{
		ProviderID:    providerID,
		ProviderMsgID: campaignID,
		Status:        "submitted",
	}, nil
}

func CampaignStatusToInternal(
	campaignID string,
	resp *CampaignStatusResponse,
) (*sms.StatusResponse, error) {
	if resp == nil {
		return nil, fmt.Errorf("mnotify campaign status response is nil")
	}
	if !success(resp.Status) {
		return nil, fmt.Errorf("mnotify campaign status response failed: status %q", resp.Status)
	}

	campaignID = strings.TrimSpace(campaignID)
	if campaignID == "" {
		return nil, fmt.Errorf("mnotify campaign id is required")
	}
	if len(resp.Report) == 0 {
		return &sms.StatusResponse{
			ProviderID:    providerID,
			ProviderMsgID: campaignID,
			Status:        "unknown",
		}, nil
	}

	// Dugble currently sends one recipient per provider request. If batching is
	// introduced, the internal response model should represent recipient-level
	// statuses instead of collapsing a whole campaign to one value.
	report := resp.Report[0]
	if report.CampaignID != "" && !strings.EqualFold(strings.TrimSpace(report.CampaignID), campaignID) {
		return nil, fmt.Errorf(
			"mnotify campaign status response has campaign id %q, expected %q",
			report.CampaignID,
			campaignID,
		)
	}

	return &sms.StatusResponse{
		ProviderID:    providerID,
		ProviderMsgID: campaignID,
		Status:        NormalizeStatus(report.Status),
	}, nil
}

func NormalizeStatus(status string) string {
	switch strings.ToUpper(strings.TrimSpace(status)) {
	case "SUCCESS", "2000", "QUEUED", "PENDING", "SUBMITTED":
		return "submitted"
	case "SENT":
		return "sent"
	case "DELIVERED", "DELIVRD":
		return "delivered"
	case "UNDELIVERED", "UNDELIV":
		return "undelivered"
	case "REJECTED", "REJECTD":
		return "rejected"
	case "FAILED", "FAILURE", "ERROR":
		return "failed"
	case "EXPIRED":
		return "expired"
	default:
		return "unknown"
	}
}

func success(status string) bool {
	return strings.EqualFold(strings.TrimSpace(status), "success")
}
