package webhook

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

const SigningSecretPrefix = "whsec_"

func NewSigningSecret() (string, error) {
	value := make([]byte, 32)
	if _, err := rand.Read(value); err != nil {
		return "", fmt.Errorf("generate webhook signing secret: %w", err)
	}
	return SigningSecretPrefix + base64.RawURLEncoding.EncodeToString(value), nil
}
