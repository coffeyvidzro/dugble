package smspricing

import (
	"errors"
	"testing"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func TestParseUSDToMicros(t *testing.T) {
	tests := []struct {
		value string
		want  int64
	}{
		{value: "0.009", want: 9_000},
		{value: "$0.00125", want: 1_250},
		{value: "1", want: 1_000_000},
		{value: ".5", want: 500_000},
	}

	for _, test := range tests {
		t.Run(test.value, func(t *testing.T) {
			got, err := parseUSDToMicros(test.value)
			if err != nil {
				t.Fatalf("parseUSDToMicros(%q) returned error: %v", test.value, err)
			}
			if got != test.want {
				t.Fatalf("parseUSDToMicros(%q) = %d, want %d", test.value, got, test.want)
			}
		})
	}
}

func TestParseUSDToMicrosRejectsInvalidValues(t *testing.T) {
	for _, value := range []string{"", "0", "-0.01", "1.0000001", "abc", "1.2.3"} {
		t.Run(value, func(t *testing.T) {
			if _, err := parseUSDToMicros(value); err == nil {
				t.Fatalf("parseUSDToMicros(%q) returned nil error", value)
			}
		})
	}
}

func TestNormalizeTeamRequestRequiresEnabledDefault(t *testing.T) {
	_, err := normalizeTeamRequest(UpdateTeamRequest{
		PricingPlanID:       "9f6cb7f6-1a21-4a79-9aa8-9782c867a001",
		DefaultTrafficClass: smsapi.TrafficClassLocal,
		LocalEnabled:        false,
		A2PEnabled:          true,
	})
	if !errors.Is(err, ErrInvalidRequest) {
		t.Fatalf("normalizeTeamRequest error = %v, want ErrInvalidRequest", err)
	}
}

func TestNormalizeTeamRequestAcceptsIndependentEntitlements(t *testing.T) {
	req, err := normalizeTeamRequest(UpdateTeamRequest{
		PricingPlanID:       "9f6cb7f6-1a21-4a79-9aa8-9782c867a001",
		DefaultTrafficClass: " A2P ",
		LocalEnabled:        true,
		A2PEnabled:          true,
	})
	if err != nil {
		t.Fatalf("normalizeTeamRequest returned error: %v", err)
	}
	if req.DefaultTrafficClass != smsapi.TrafficClassA2P {
		t.Fatalf("DefaultTrafficClass = %q, want %q", req.DefaultTrafficClass, smsapi.TrafficClassA2P)
	}
}
