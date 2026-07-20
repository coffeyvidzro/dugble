package user

import (
	"context"
	"net/mail"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) GetMe(ctx context.Context) (User, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return User{}, apperrors.NewUnauthorized("Authentication is required")
	}
	return s.GetByID(ctx, principal.UserID.String())
}

func (s *Service) GetByID(ctx context.Context, id string) (User, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return User{}, apperrors.NewBadRequest("User id is required")
	}

	user, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return User{}, apperrors.NewNotFound("User not found")
	}

	return user, nil
}

func (s *Service) UpdateProfile(ctx context.Context, req UpdateProfileRequest) (User, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return User{}, apperrors.NewUnauthorized("Authentication is required")
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return User{}, apperrors.NewBadRequest("Name is required")
	}

	updated, err := s.repository.UpdateProfile(ctx, principal.UserID.String(), name)
	if err != nil {
		return User{}, apperrors.NewInternal("Unable to update profile", err)
	}

	return updated, nil
}

func (s *Service) UpdateEmail(ctx context.Context, req UpdateEmailRequest) (User, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return User{}, apperrors.NewUnauthorized("Authentication is required")
	}

	email := normalizeEmail(req.Email)
	if _, err := mail.ParseAddress(email); err != nil {
		return User{}, apperrors.NewBadRequest("A valid email is required")
	}

	updated, err := s.repository.UpdateEmail(ctx, principal.UserID.String(), email)
	if err != nil {
		return User{}, apperrors.NewInternal("Unable to update email", err)
	}

	return updated, nil
}

func normalizeEmail(email string) string {
	value := strings.TrimSpace(strings.ToLower(email))
	address, err := mail.ParseAddress(value)
	if err != nil {
		return value
	}

	return strings.TrimSpace(strings.ToLower(address.Address))
}

func (s *Service) UpdatePassword(ctx context.Context, req UpdatePasswordRequest) (User, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return User{}, apperrors.NewUnauthorized("Authentication is required")
	}

	password := strings.TrimSpace(req.Password)
	if len(password) < 12 {
		return User{}, apperrors.NewBadRequest("Password must be at least 12 characters")
	}

	hash, err := authnz.HashPassword(password)
	if err != nil {
		return User{}, apperrors.NewInternal("Unable to hash password", err)
	}

	updated, err := s.repository.UpdatePassword(ctx, principal.UserID.String(), hash)
	if err != nil {
		return User{}, apperrors.NewInternal("Unable to update password", err)
	}

	return updated, nil
}

func (s *Service) DeleteMe(ctx context.Context) error {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return apperrors.NewUnauthorized("Authentication is required")
	}

	if err := s.repository.Delete(ctx, principal.UserID.String()); err != nil {
		return apperrors.NewInternal("Unable to delete user", err)
	}

	return nil
}
