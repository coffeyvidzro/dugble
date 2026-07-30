package mfa

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const recoveryCodeCount = 10
const loginChallengeTTL = 5 * time.Minute
const loginChallengePrefix = "dgb_mfa_"

type store interface {
	PutUnverified(context.Context, uuid.UUID, []byte) error
	GetCredential(context.Context, uuid.UUID) (Credential, error)
	Confirm(context.Context, uuid.UUID, string, int64, []string) error
	Verify(context.Context, uuid.UUID, string, int64) error
	UseRecoveryCode(context.Context, uuid.UUID, string, string) error
	Disable(context.Context, uuid.UUID, string) error
	Enabled(context.Context, uuid.UUID) (bool, error)
	CreateLoginChallenge(context.Context, string, uuid.UUID, int64, time.Time) error
	GetLoginChallenge(context.Context, string) (uuid.UUID, Credential, error)
	ConsumeLoginTOTP(context.Context, string, uuid.UUID, int64) error
	ConsumeLoginRecoveryCode(context.Context, string, uuid.UUID, string) error
}

type Service struct {
	repository store
	cipher     *authnz.SecretCipher
	issuer     string
	now        func() time.Time
}

func NewService(repository store, cipher *authnz.SecretCipher, issuer string) *Service {
	return &Service{repository: repository, cipher: cipher, issuer: issuer, now: time.Now}
}

func (s *Service) Enroll(ctx context.Context) (EnrollResponse, error) {
	principal, err := principalFromContext(ctx)
	if err != nil {
		return EnrollResponse{}, err
	}
	secret, err := authnz.NewTOTPSecret()
	if err != nil {
		return EnrollResponse{}, apperrors.NewInternal("Unable to generate MFA secret", err)
	}
	ciphertext, err := s.cipher.Encrypt([]byte(secret))
	if err != nil {
		return EnrollResponse{}, apperrors.NewInternal("Unable to protect MFA secret", err)
	}
	if err := s.repository.PutUnverified(ctx, principal.UserID, ciphertext); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return EnrollResponse{}, apperrors.NewConflict("MFA is already enabled")
		}
		return EnrollResponse{}, apperrors.NewInternal("Unable to begin MFA enrollment", err)
	}
	return EnrollResponse{Secret: secret, URI: authnz.TOTPURI(s.issuer, principal.Email, secret)}, nil
}

func (s *Service) Confirm(ctx context.Context, code string) (ConfirmResponse, error) {
	principal, err := principalFromContext(ctx)
	if err != nil {
		return ConfirmResponse{}, err
	}
	credential, err := s.repository.GetCredential(ctx, principal.UserID)
	if err != nil || credential.VerifiedAt != nil {
		return ConfirmResponse{}, apperrors.NewBadRequest("MFA enrollment is not pending")
	}
	step, ok := s.validateCredential(credential, code)
	if !ok {
		return ConfirmResponse{}, apperrors.NewUnauthorized("Invalid authentication code")
	}
	codes, hashes, err := newRecoveryCodes()
	if err != nil {
		return ConfirmResponse{}, apperrors.NewInternal("Unable to create recovery codes", err)
	}
	if err := s.repository.Confirm(ctx, principal.UserID, principal.SessionID, step, hashes); err != nil {
		return ConfirmResponse{}, apperrors.NewInternal("Unable to confirm MFA enrollment", err)
	}
	audit.RecordIdentity(ctx, principal.UserID, audit.Event{Action: "identity.mfa_enabled", ResourceType: "user", ResourceID: principal.UserID.String()})
	return ConfirmResponse{RecoveryCodes: codes}, nil
}

func (s *Service) Verify(ctx context.Context, code string) error {
	principal, err := principalFromContext(ctx)
	if err != nil {
		return err
	}
	credential, err := s.repository.GetCredential(ctx, principal.UserID)
	if err != nil || credential.VerifiedAt == nil {
		return apperrors.NewBadRequest("MFA is not enabled")
	}
	step, ok := s.validateCredential(credential, code)
	if !ok {
		return apperrors.NewUnauthorized("Invalid authentication code")
	}
	if credential.LastUsedStep != nil && step <= *credential.LastUsedStep {
		return apperrors.NewUnauthorized("Authentication code was already used")
	}
	if err := s.repository.Verify(ctx, principal.UserID, principal.SessionID, step); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return apperrors.NewUnauthorized("Authentication code was already used")
		}
		return apperrors.NewInternal("Unable to verify authentication code", err)
	}
	audit.RecordIdentity(ctx, principal.UserID, audit.Event{Action: "identity.mfa_verified", ResourceType: "session", ResourceID: principal.SessionID})
	return nil
}

func (s *Service) Recover(ctx context.Context, code string) error {
	principal, err := principalFromContext(ctx)
	if err != nil {
		return err
	}
	hash := authnz.HashRecoveryCode(code)
	if strings.TrimSpace(code) == "" {
		return apperrors.NewBadRequest("Recovery code is required")
	}
	if err := s.repository.UseRecoveryCode(ctx, principal.UserID, principal.SessionID, hash); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return apperrors.NewUnauthorized("Invalid or used recovery code")
		}
		return apperrors.NewInternal("Unable to use recovery code", err)
	}
	audit.RecordIdentity(ctx, principal.UserID, audit.Event{Action: "identity.recovery_code_used", ResourceType: "session", ResourceID: principal.SessionID})
	return nil
}

func (s *Service) Disable(ctx context.Context) error {
	principal, err := principalFromContext(ctx)
	if err != nil {
		return err
	}
	if err := s.repository.Disable(ctx, principal.UserID, principal.SessionID); err != nil {
		return apperrors.NewInternal("Unable to disable MFA", err)
	}
	audit.RecordIdentity(ctx, principal.UserID, audit.Event{Action: "identity.mfa_disabled", ResourceType: "user", ResourceID: principal.UserID.String()})
	return nil
}

func (s *Service) Status(ctx context.Context) (StatusResponse, error) {
	principal, err := principalFromContext(ctx)
	if err != nil {
		return StatusResponse{}, err
	}
	enabled, err := s.repository.Enabled(ctx, principal.UserID)
	if err != nil {
		return StatusResponse{}, apperrors.NewInternal("Unable to get MFA status", err)
	}
	return StatusResponse{Enabled: enabled}, nil
}

func (s *Service) validateCredential(credential Credential, code string) (int64, bool) {
	secret, err := s.cipher.Decrypt(credential.SecretCiphertext)
	if err != nil {
		return 0, false
	}
	return authnz.ValidateTOTP(string(secret), strings.TrimSpace(code), s.now().UTC())
}

func principalFromContext(ctx context.Context) (authnz.Principal, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return authnz.Principal{}, apperrors.NewUnauthorized("Authentication is required")
	}
	return principal, nil
}

func newRecoveryCodes() ([]string, []string, error) {
	codes := make([]string, 0, recoveryCodeCount)
	hashes := make([]string, 0, recoveryCodeCount)
	for range recoveryCodeCount {
		code, err := authnz.NewRecoveryCode()
		if err != nil {
			return nil, nil, err
		}
		codes = append(codes, code)
		hashes = append(hashes, authnz.HashRecoveryCode(code))
	}
	return codes, hashes, nil
}

func (s *Service) LoginEnabled(ctx context.Context, userID uuid.UUID) (bool, error) {
	return s.repository.Enabled(ctx, userID)
}

func (s *Service) BeginLogin(ctx context.Context, userID uuid.UUID, credentialVersion int64) (string, error) {
	value, err := authnz.NewSessionToken()
	if err != nil {
		return "", err
	}
	token := loginChallengePrefix + value
	if err := s.repository.CreateLoginChallenge(ctx, authnz.HashSessionToken(token), userID, credentialVersion, s.now().UTC().Add(loginChallengeTTL)); err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) CompleteLoginTOTP(ctx context.Context, challengeToken, code string) (uuid.UUID, error) {
	tokenHash, err := loginChallengeHash(challengeToken)
	if err != nil {
		return uuid.Nil, err
	}
	userID, credential, err := s.repository.GetLoginChallenge(ctx, tokenHash)
	if err != nil {
		return uuid.Nil, pgx.ErrNoRows
	}
	step, ok := s.validateCredential(credential, code)
	if !ok || (credential.LastUsedStep != nil && step <= *credential.LastUsedStep) {
		return uuid.Nil, pgx.ErrNoRows
	}
	if err := s.repository.ConsumeLoginTOTP(ctx, tokenHash, userID, step); err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}

func (s *Service) CompleteLoginRecovery(ctx context.Context, challengeToken, code string) (uuid.UUID, error) {
	tokenHash, err := loginChallengeHash(challengeToken)
	if err != nil || strings.TrimSpace(code) == "" {
		return uuid.Nil, pgx.ErrNoRows
	}
	userID, _, err := s.repository.GetLoginChallenge(ctx, tokenHash)
	if err != nil {
		return uuid.Nil, pgx.ErrNoRows
	}
	if err := s.repository.ConsumeLoginRecoveryCode(ctx, tokenHash, userID, authnz.HashRecoveryCode(code)); err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}

func loginChallengeHash(token string) (string, error) {
	token = strings.TrimSpace(token)
	if !strings.HasPrefix(token, loginChallengePrefix) {
		return "", pgx.ErrNoRows
	}
	return authnz.HashSessionToken(token), nil
}
