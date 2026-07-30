package authnz

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/base32"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"time"
)

type SecretCipher struct{ aead cipher.AEAD }

func NewSecretCipher(encodedKey string) (*SecretCipher, error) {
	key, err := base64.StdEncoding.DecodeString(strings.TrimSpace(encodedKey))
	if err != nil || len(key) != 32 {
		return nil, errors.New("MFA encryption key must be base64-encoded 32 bytes")
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return &SecretCipher{aead: aead}, nil
}

func (c *SecretCipher) Encrypt(value []byte) ([]byte, error) {
	nonce := make([]byte, c.aead.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}
	return c.aead.Seal(nonce, nonce, value, nil), nil
}

func (c *SecretCipher) Decrypt(value []byte) ([]byte, error) {
	n := c.aead.NonceSize()
	if len(value) < n {
		return nil, errors.New("invalid encrypted secret")
	}
	return c.aead.Open(nil, value[:n], value[n:], nil)
}

func NewTOTPSecret() (string, error) {
	b := make([]byte, 20)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b), nil
}

func TOTPURI(issuer, account, secret string) string {
	v := url.Values{"secret": {secret}, "issuer": {issuer}, "period": {"30"}, "digits": {"6"}}
	return "otpauth://totp/" + url.PathEscape(issuer+":"+account) + "?" + v.Encode()
}

func ValidateTOTP(secret, code string, now time.Time) (int64, bool) {
	step := now.Unix() / 30
	for offset := int64(-1); offset <= 1; offset++ {
		if hmac.Equal([]byte(totpCode(secret, step+offset)), []byte(strings.TrimSpace(code))) {
			return step + offset, true
		}
	}
	return 0, false
}

func totpCode(secret string, step int64) string {
	key, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(strings.ToUpper(secret))
	if err != nil {
		return ""
	}
	var counter [8]byte
	binary.BigEndian.PutUint64(counter[:], uint64(step))
	mac := hmac.New(sha1.New, key)
	_, _ = mac.Write(counter[:])
	sum := mac.Sum(nil)
	offset := sum[len(sum)-1] & 15
	value := (uint32(sum[offset])&127)<<24 | uint32(sum[offset+1])<<16 | uint32(sum[offset+2])<<8 | uint32(sum[offset+3])
	return fmt.Sprintf("%06d", value%1_000_000)
}

func NewRecoveryCode() (string, error) {
	b := make([]byte, 10)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	v := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b)
	return v[:8] + "-" + v[8:], nil
}

func HashRecoveryCode(code string) string {
	value := strings.ReplaceAll(strings.ToUpper(strings.TrimSpace(code)), "-", "")
	sum := sha256.Sum256([]byte(value))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}
