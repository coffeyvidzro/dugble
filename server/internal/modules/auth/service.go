package auth

import (
	"context"
	"errors"
	"net/mail"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/notifications"
	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	sessionTTL                = 30 * 24 * time.Hour
	emailVerificationTokenTTL = 24 * time.Hour
	passwordResetTokenTTL     = 30 * time.Minute
)

type Service struct {
	repository *Repository
	sessions   *session.Repository
	notifier   IdentityNotifier
}

type IdentityNotifier interface {
	SendEmailVerification(ctx context.Context, input notifications.SendEmailVerificationInput) error
	SendPasswordReset(ctx context.Context, input notifications.SendPasswordResetInput) error
}

func NewService(
	repository *Repository,
	sessions *session.Repository,
	notifier IdentityNotifier,
) *Service {
	return &Service{repository: repository, sessions: sessions, notifier: notifier}
}

func (s *Service) GetUser(ctx context.Context) (AuthResponse, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return AuthResponse{}, apperrors.NewUnauthorized("Authentication is required")
	}
	user, err := s.repository.GetUserByID(ctx, principal.UserID)
	if err != nil {
		return AuthResponse{}, apperrors.NewNotFound("User not found")
	}
	return AuthResponse{User: authenticatedUserFromRecord(user)}, nil
}

func (s *Service) Register(
	ctx context.Context,
	req RegisterRequest,
) (AuthResponse, error) {
	email, name, password, err := validateCredentials(req.Email, req.Name, req.Password)
	if err != nil {
		return AuthResponse{}, err
	}

	passwordHash, err := authnz.HashPassword(password)
	if err != nil {
		return AuthResponse{}, apperrors.NewInternal(
			"Unable to hash password",
			err,
		)
	}

	created, err := s.repository.CreateUser(ctx, name, email, passwordHash)
	if err != nil {
		return AuthResponse{}, apperrors.NewInternal(
			"Unable to register user",
			err,
		)
	}

	if err := s.issueEmailVerificationToken(ctx, created.Email, created.Name); err != nil {
		return AuthResponse{}, err
	}

	return AuthResponse{User: authenticatedUserFromRecord(created)}, nil
}

func (s *Service) Login(
	ctx context.Context,
	req LoginRequest,
	userAgent *string,
	ipAddress *string,
) (AuthResponse, string, time.Time, error) {
	email := normalizeEmail(req.Email)
	password := strings.TrimSpace(req.Password)
	if email == "" || password == "" {
		return AuthResponse{}, "", time.Time{}, apperrors.NewBadRequest(
			"Email and password are required",
		)
	}

	user, err := s.repository.GetUserByEmail(ctx, email)
	if err != nil || user.PasswordHash == nil ||
		!authnz.CheckPassword(*user.PasswordHash, password) {
		return AuthResponse{}, "", time.Time{}, apperrors.NewUnauthorized(
			"Invalid email or password",
		)
	}
	if !user.EmailVerified {
		return AuthResponse{}, "", time.Time{}, apperrors.NewForbidden(
			"Email verification is required",
		)
	}

	return s.createSession(ctx, user, userAgent, ipAddress)
}

func (s *Service) VerifyEmail(ctx context.Context, req VerifyEmailRequest) error {
	email := normalizeEmail(req.Email)
	token := strings.TrimSpace(req.Token)
	if email == "" || token == "" {
		return apperrors.NewBadRequest("Email and token are required")
	}

	identifier := emailVerificationIdentifier(email)
	tokenHash := authnz.HashSessionToken(token)
	user, err := s.repository.VerifyEmailWithToken(ctx, email, identifier, tokenHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return apperrors.NewBadRequest("Email verification token is invalid or expired")
		}
		return apperrors.NewInternal("Unable to verify email", err)
	}
	audit.RecordIdentity(ctx, user.ID, audit.Event{Action: "identity.email_verified", ResourceType: "user", ResourceID: user.ID.String()})
	return nil
}

func (s *Service) ResendEmail(ctx context.Context, req ResendEmailRequest) error {
	email := normalizeEmail(req.Email)
	if _, err := mail.ParseAddress(email); err != nil {
		return apperrors.NewBadRequest("A valid email is required")
	}
	user, err := s.repository.GetUserByEmail(ctx, email)
	if err != nil {
		return nil
	}
	return s.issueEmailVerificationToken(ctx, user.Email, user.Name)
}

func (s *Service) ForgotPassword(ctx context.Context, req ForgotPasswordRequest) error {
	email := normalizeEmail(req.Email)
	if _, err := mail.ParseAddress(email); err != nil {
		return apperrors.NewBadRequest("A valid email is required")
	}
	user, err := s.repository.GetUserByEmail(ctx, email)
	if err != nil {
		return nil
	}
	return s.issuePasswordResetToken(ctx, user.Email, user.Name)
}

func (s *Service) ResetPassword(ctx context.Context, req ResetPasswordRequest) error {
	email := normalizeEmail(req.Email)
	token := strings.TrimSpace(req.Token)
	password := strings.TrimSpace(req.Password)
	if email == "" || token == "" {
		return apperrors.NewBadRequest("Email and token are required")
	}
	if len(password) < 12 {
		return apperrors.NewBadRequest("Password must be at least 12 characters")
	}

	identifier := passwordResetIdentifier(email)
	tokenHash := authnz.HashSessionToken(token)
	passwordHash, err := authnz.HashPassword(password)
	if err != nil {
		return apperrors.NewInternal("Unable to hash password", err)
	}
	user, err := s.repository.ResetPasswordWithToken(ctx, email, identifier, tokenHash, passwordHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return apperrors.NewBadRequest("Password reset token is invalid or expired")
		}
		return apperrors.NewInternal("Unable to reset password", err)
	}
	audit.RecordIdentity(ctx, user.ID, audit.Event{Action: "identity.password_reset", ResourceType: "user", ResourceID: user.ID.String()})
	return nil
}

func (s *Service) Logout(ctx context.Context) error {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return apperrors.NewUnauthorized("Authentication is required")
	}
	if err := s.sessions.Revoke(ctx, principal.UserID, principal.SessionID); err != nil {
		return apperrors.NewInternal("Unable to revoke session", err)
	}
	return nil
}

func validateCredentials(
	emailValue string,
	nameValue string,
	passwordValue string,
) (string, string, string, error) {
	email := normalizeEmail(emailValue)
	name := strings.TrimSpace(nameValue)
	password := strings.TrimSpace(passwordValue)
	if _, err := mail.ParseAddress(email); err != nil {
		return "", "", "", apperrors.NewBadRequest("A valid email is required")
	}
	if name == "" {
		return "", "", "", apperrors.NewBadRequest("Name is required")
	}
	if len(password) < 12 {
		return "", "", "", apperrors.NewBadRequest("Password must be at least 12 characters")
	}
	return email, name, password, nil
}

func (s *Service) createSession(
	ctx context.Context,
	user UserRecord,
	userAgent *string,
	ipAddress *string,
) (AuthResponse, string, time.Time, error) {
	token, err := authnz.NewSessionToken()
	if err != nil {
		return AuthResponse{}, "", time.Time{}, apperrors.NewInternal(
			"Unable to create session token",
			err,
		)
	}
	authenticatedAt := time.Now().UTC()
	expiresAt := authenticatedAt.Add(sessionTTL)
	if _, err := s.sessions.Create(
		ctx,
		user.ID,
		authnz.HashSessionToken(token),
		userAgent,
		ipAddress,
		expiresAt,
		session.Authentication{
			CredentialVersion: user.CredentialVersion,
			Method:            authnz.AuthenticationMethodPassword,
			Assurance:         authnz.AssuranceLevelOne,
			AuthenticatedAt:   authenticatedAt,
		},
	); err != nil {
		return AuthResponse{}, "", time.Time{}, apperrors.NewInternal(
			"Unable to create session",
			err,
		)
	}
	return AuthResponse{User: authenticatedUserFromRecord(user)}, token, expiresAt, nil
}

func (s *Service) issueEmailVerificationToken(ctx context.Context, email string, name string) error {
	return s.issueVerificationToken(
		ctx,
		emailVerificationIdentifier(email),
		emailVerificationTokenTTL,
		func(token string, expiresAt time.Time) error {
			return s.notifier.SendEmailVerification(ctx, notifications.SendEmailVerificationInput{
				ToEmail: email,
				Name:    name,
				Token:   token,
			})
		},
	)
}

func (s *Service) issuePasswordResetToken(ctx context.Context, email string, name string) error {
	return s.issueVerificationToken(
		ctx,
		passwordResetIdentifier(email),
		passwordResetTokenTTL,
		func(token string, expiresAt time.Time) error {
			return s.notifier.SendPasswordReset(ctx, notifications.SendPasswordResetInput{
				ToEmail: email,
				Name:    name,
				Token:   token,
			})
		},
	)
}

func (s *Service) issueVerificationToken(
	ctx context.Context,
	identifier string,
	ttl time.Duration,
	send func(token string, expiresAt time.Time) error,
) error {
	token, err := authnz.NewSessionToken()
	if err != nil {
		return apperrors.NewInternal("Unable to create verification token", err)
	}
	expiresAt := time.Now().UTC().Add(ttl)
	if err := s.repository.CreateVerificationToken(
		ctx,
		identifier,
		authnz.HashSessionToken(token),
		expiresAt,
	); err != nil {
		return apperrors.NewInternal("Unable to store verification token", err)
	}
	if s.notifier != nil {
		if err := send(token, expiresAt); err != nil {
			return apperrors.NewInternal("Unable to deliver verification token", err)
		}
	}
	return nil
}

func normalizeEmail(email string) string {
	value := strings.TrimSpace(strings.ToLower(email))
	address, err := mail.ParseAddress(value)
	if err != nil {
		return value
	}

	return strings.TrimSpace(strings.ToLower(address.Address))
}

func emailVerificationIdentifier(email string) string {
	return "email.verify:" + normalizeEmail(email)
}

func passwordResetIdentifier(email string) string {
	return "password.reset:" + normalizeEmail(email)
}

func authenticatedUserFromRecord(user UserRecord) AuthenticatedUser {
	return AuthenticatedUser{
		ID:            user.ID.String(),
		Email:         user.Email,
		EmailVerified: user.EmailVerified,
		Name:          user.Name,
		CreatedAt:     user.CreatedAt,
		UpdatedAt:     user.UpdatedAt,
	}
}
