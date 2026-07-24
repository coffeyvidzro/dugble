package wallets

import "testing"

func TestParseUSDMicros(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value string
		want  int64
	}{
		{name: "whole dollars", value: "10", want: 10_000_000},
		{name: "cents", value: "10.25", want: 10_250_000},
		{name: "micros", value: "0.000001", want: 1},
		{name: "dollar prefix", value: "$1.50", want: 1_500_000},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := ParseUSDMicros(tt.value)
			if err != nil {
				t.Fatalf("ParseUSDMicros(%q) returned error: %v", tt.value, err)
			}
			if got != tt.want {
				t.Fatalf("ParseUSDMicros(%q) = %d, want %d", tt.value, got, tt.want)
			}
		})
	}
}

func TestParseUSDMicrosRejectsInvalidAmounts(t *testing.T) {
	t.Parallel()

	for _, value := range []string{"", "0", "-1", "abc", "1.0000001"} {
		value := value
		t.Run(value, func(t *testing.T) {
			t.Parallel()

			if _, err := ParseUSDMicros(value); err == nil {
				t.Fatalf("ParseUSDMicros(%q) returned nil error", value)
			}
		})
	}
}
