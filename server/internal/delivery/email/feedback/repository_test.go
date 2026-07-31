package feedback

import (
	"testing"
	"time"
)

func TestEmailStatusTransition(t *testing.T) {
	occurredAt := time.Date(2026, time.July, 31, 12, 0, 0, 0, time.UTC)
	tests := []struct {
		name       string
		current    string
		eventType  string
		wantStatus string
		wantApply  bool
		wantError  bool
	}{
		{name: "delivery after submitted", current: "submitted", eventType: "delivery", wantStatus: "delivered", wantApply: true},
		{name: "delivery cannot revive bounce", current: "bounced", eventType: "delivery", wantApply: false},
		{name: "bounce overrides delivery", current: "delivered", eventType: "bounce", wantStatus: "bounced", wantApply: true},
		{name: "complaint overrides bounce", current: "bounced", eventType: "complaint", wantStatus: "complained", wantApply: true},
		{name: "delay cannot downgrade delivery", current: "delivered", eventType: "delivery_delay", wantApply: false},
		{name: "reject becomes rejected", current: "submitted", eventType: "reject", wantStatus: "rejected", wantApply: true},
		{name: "rendering failure becomes failed", current: "submitted", eventType: "rendering_failure", wantStatus: "failed", wantApply: true},
		{name: "unknown event", current: "submitted", eventType: "unknown", wantError: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			transition, apply, err := emailStatusTransition(tt.current, tt.eventType, occurredAt)
			if (err != nil) != tt.wantError {
				t.Fatalf("emailStatusTransition() error = %v, wantError %v", err, tt.wantError)
			}
			if apply != tt.wantApply {
				t.Fatalf("emailStatusTransition() apply = %v, want %v", apply, tt.wantApply)
			}
			if transition.status != tt.wantStatus {
				t.Fatalf("emailStatusTransition() status = %q, want %q", transition.status, tt.wantStatus)
			}
		})
	}
}
