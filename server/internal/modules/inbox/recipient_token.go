package inbox

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

const recipientTokenAudience = "dugble-inbox-recipient"

type RecipientAccess struct {
	TeamID      uuid.UUID
	RecipientID string
	ExpiresAt   time.Time
}

type recipientTokenClaims struct {
	Version     int    `json:"v"`
	Audience    string `json:"aud"`
	TeamID      string `json:"team_id"`
	RecipientID string `json:"recipient_id"`
	IssuedAt    int64  `json:"iat"`
	ExpiresAt   int64  `json:"exp"`
	Nonce       string `json:"nonce"`
}

type RecipientTokenManager struct {
	secret []byte
	now    func() time.Time
}

func NewRecipientTokenManager(secret string) (*RecipientTokenManager, error) {
	secret = strings.TrimSpace(secret)
	if len(secret) < 32 {
		return nil, errors.New("Inbox HMAC secret must contain at least 32 bytes")
	}
	return &RecipientTokenManager{secret: []byte(secret), now: time.Now}, nil
}

func (manager *RecipientTokenManager) Mint(teamID uuid.UUID, recipientID string, ttl time.Duration) (string, time.Time, error) {
	if manager == nil || len(manager.secret) == 0 {
		return "", time.Time{}, errors.New("recipient token manager is not configured")
	}
	if teamID == uuid.Nil {
		return "", time.Time{}, errors.New("recipient token team is required")
	}
	if ttl <= 0 || ttl > time.Hour {
		return "", time.Time{}, errors.New("recipient token TTL must be between zero and one hour")
	}
	nonceBytes := make([]byte, 16)
	if _, err := rand.Read(nonceBytes); err != nil {
		return "", time.Time{}, fmt.Errorf("generate recipient token nonce: %w", err)
	}
	now := manager.now().UTC()
	expiresAt := now.Add(ttl)
	claims := recipientTokenClaims{
		Version:     1,
		Audience:    recipientTokenAudience,
		TeamID:      teamID.String(),
		RecipientID: recipientID,
		IssuedAt:    now.Unix(),
		ExpiresAt:   expiresAt.Unix(),
		Nonce:       base64.RawURLEncoding.EncodeToString(nonceBytes),
	}
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", time.Time{}, fmt.Errorf("encode recipient token: %w", err)
	}
	encodedPayload := base64.RawURLEncoding.EncodeToString(payload)
	signature := manager.sign(encodedPayload)
	return encodedPayload + "." + base64.RawURLEncoding.EncodeToString(signature), expiresAt, nil
}

func (manager *RecipientTokenManager) Parse(token string) (RecipientAccess, error) {
	if manager == nil || len(manager.secret) == 0 {
		return RecipientAccess{}, errors.New("recipient token manager is not configured")
	}
	parts := strings.Split(token, ".")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return RecipientAccess{}, errors.New("invalid recipient token")
	}
	provided, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || !hmac.Equal(provided, manager.sign(parts[0])) {
		return RecipientAccess{}, errors.New("invalid recipient token signature")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return RecipientAccess{}, errors.New("invalid recipient token payload")
	}
	var claims recipientTokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return RecipientAccess{}, errors.New("invalid recipient token claims")
	}
	if claims.Version != 1 || claims.Audience != recipientTokenAudience || claims.RecipientID == "" || claims.Nonce == "" {
		return RecipientAccess{}, errors.New("invalid recipient token claims")
	}
	teamID, err := uuid.Parse(claims.TeamID)
	if err != nil || teamID == uuid.Nil {
		return RecipientAccess{}, errors.New("invalid recipient token team")
	}
	now := manager.now().UTC()
	issuedAt := time.Unix(claims.IssuedAt, 0).UTC()
	expiresAt := time.Unix(claims.ExpiresAt, 0).UTC()
	if issuedAt.After(now.Add(time.Minute)) || !expiresAt.After(now) || expiresAt.Sub(issuedAt) > time.Hour {
		return RecipientAccess{}, errors.New("recipient token expired or invalid")
	}
	return RecipientAccess{TeamID: teamID, RecipientID: claims.RecipientID, ExpiresAt: expiresAt}, nil
}

func (manager *RecipientTokenManager) sign(payload string) []byte {
	mac := hmac.New(sha256.New, manager.secret)
	_, _ = mac.Write([]byte(payload))
	return mac.Sum(nil)
}
