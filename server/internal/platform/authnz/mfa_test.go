package authnz

import (
	"crypto/rand"
	"encoding/base64"
	"testing"
	"time"
)

func TestTOTPValidation(t *testing.T) {
	secret, err := NewTOTPSecret()
	if err != nil {
		t.Fatal(err)
	}
	now := time.Unix(1_700_000_000, 0)
	step := now.Unix() / 30
	got, ok := ValidateTOTP(secret, totpCode(secret, step), now)
	if !ok || got != step {
		t.Fatalf("ValidateTOTP() = %d, %t", got, ok)
	}
}

func TestTOTPValidationRejectsMalformedInput(t *testing.T) {
	tests := []struct{ secret, code string }{
		{"not-base32!", ""},
		{"not-base32!", "000000"},
		{"JBSWY3DPEHPK3PXP", "12345"},
		{"JBSWY3DPEHPK3PXP", "12345x"},
	}
	for _, test := range tests {
		if _, ok := ValidateTOTP(test.secret, test.code, time.Now()); ok {
			t.Fatalf("accepted malformed secret %q or code %q", test.secret, test.code)
		}
	}
}

func TestSecretCipher(t *testing.T) {
	key := make([]byte, 32)
	_, _ = rand.Read(key)
	c, err := NewSecretCipher(base64.StdEncoding.EncodeToString(key))
	if err != nil {
		t.Fatal(err)
	}
	sealed, err := c.Encrypt([]byte("secret"))
	if err != nil {
		t.Fatal(err)
	}
	opened, err := c.Decrypt(sealed)
	if err != nil || string(opened) != "secret" {
		t.Fatalf("Decrypt() = %q, %v", opened, err)
	}
}

func TestRecoveryCodeHashNormalization(t *testing.T) {
	code, err := NewRecoveryCode()
	if err != nil {
		t.Fatal(err)
	}
	if HashRecoveryCode(code) != HashRecoveryCode(code[:8]+code[9:]) {
		t.Fatal("format changed recovery-code hash")
	}
}
