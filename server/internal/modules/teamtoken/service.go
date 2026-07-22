package teamtoken

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	defaultTokenTTL = 90 * 24 * time.Hour
	maxTokenTTL     = 365 * 24 * time.Hour
	maxNameLength   = 120
)

var allowedPermissions = map[tenant.Permission]struct{}{
	tenant.PermissionTeamRead:          {},
	tenant.PermissionTeamUpdate:        {},
	tenant.PermissionTeamMembersRead:   {},
	tenant.PermissionTeamMemberInvite:  {},
	tenant.PermissionSenderIDsRead:     {},
	tenant.PermissionSenderDomainsRead: {},
}

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service { return &Service{repository: repository} }

func (s *Service) List(ctx context.Context) ([]Token, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionTeamTokensRead)
	if err != nil {
		return nil, err
	}
	tokens, err := s.repository.List(ctx, tenantContext.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list team tokens", err)
	}
	return tokens, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (CreatedToken, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionTeamTokensCreate)
	if err != nil {
		return CreatedToken{}, err
	}
	if err := requireOwner(tenantContext); err != nil {
		return CreatedToken{}, err
	}
	name, permissions, expiresAt, err := validateMutation(req.Name, req.Permissions, req.ExpiresAt)
	if err != nil {
		return CreatedToken{}, err
	}
	secret, err := newTeamTokenSecret()
	if err != nil {
		return CreatedToken{}, apperrors.NewInternal("Unable to generate team token", err)
	}
	token, err := s.repository.Create(
		ctx,
		tenantContext.TeamID,
		name,
		authnz.HashSessionToken(secret),
		tokenDisplayPrefix(secret),
		permissions,
		tenantContext.UserID,
		expiresAt,
	)
	if err != nil {
		return CreatedToken{}, apperrors.NewInternal("Unable to create team token", err)
	}
	slog.Info(
		"team token created",
		"team_id",
		token.TeamID,
		"token_id",
		token.ID,
		"token_prefix",
		token.TokenPrefix,
		"actor_user_id",
		tenantContext.UserID.String(),
	)
	return CreatedToken{Token: token, Secret: secret}, nil
}

func (s *Service) Update(ctx context.Context, tokenID string, req UpdateRequest) (Token, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionTeamTokensUpdate)
	if err != nil {
		return Token{}, err
	}
	if err := requireOwner(tenantContext); err != nil {
		return Token{}, err
	}
	parsedTokenID, err := uuid.Parse(strings.TrimSpace(tokenID))
	if err != nil {
		return Token{}, apperrors.NewBadRequest("Token id must be a valid UUID")
	}
	name, permissions, expiresAt, err := validateMutation(req.Name, req.Permissions, req.ExpiresAt)
	if err != nil {
		return Token{}, err
	}
	token, err := s.repository.Update(
		ctx,
		parsedTokenID,
		tenantContext.TeamID,
		name,
		permissions,
		expiresAt,
	)
	if err != nil {
		return Token{}, apperrors.NewNotFound("Team token not found")
	}
	slog.Info(
		"team token updated",
		"team_id",
		token.TeamID,
		"token_id",
		token.ID,
		"token_prefix",
		token.TokenPrefix,
		"actor_user_id",
		tenantContext.UserID.String(),
	)
	return token, nil
}

func (s *Service) Revoke(ctx context.Context, tokenID string) (Token, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionTeamTokensRevoke)
	if err != nil {
		return Token{}, err
	}
	if err := requireOwner(tenantContext); err != nil {
		return Token{}, err
	}
	parsedTokenID, err := uuid.Parse(strings.TrimSpace(tokenID))
	if err != nil {
		return Token{}, apperrors.NewBadRequest("Token id must be a valid UUID")
	}
	token, err := s.repository.Revoke(ctx, parsedTokenID, tenantContext.TeamID)
	if err != nil {
		return Token{}, apperrors.NewNotFound("Team token not found")
	}
	slog.Info(
		"team token revoked",
		"team_id",
		token.TeamID,
		"token_id",
		token.ID,
		"token_prefix",
		token.TokenPrefix,
		"actor_user_id",
		tenantContext.UserID.String(),
	)
	return token, nil
}

func requireTenantPermission(
	ctx context.Context,
	permission tenant.Permission,
) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewForbidden("Team context is required")
	}
	if !tenant.ContextCan(tenantContext, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Team permission is required")
	}
	return tenantContext, nil
}

func requireOwner(tenantContext tenant.Context) error {
	if tenantContext.Role != tenant.RoleOwner {
		return apperrors.NewForbidden("Team owner role is required")
	}
	return nil
}

func validateMutation(
	name string,
	permissions []string,
	expiresAt *time.Time,
) (string, []string, *time.Time, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return "", nil, nil, apperrors.NewBadRequest("Token name is required")
	}
	if len(name) > maxNameLength {
		return "", nil, nil, apperrors.NewBadRequest("Token name is too long")
	}
	expiresAt, err := normalizeExpiresAt(expiresAt)
	if err != nil {
		return "", nil, nil, err
	}
	validated, err := validatePermissions(permissions)
	if err != nil {
		return "", nil, nil, err
	}
	return name, validated, expiresAt, nil
}

func normalizeExpiresAt(expiresAt *time.Time) (*time.Time, error) {
	now := time.Now().UTC()
	if expiresAt == nil {
		value := now.Add(defaultTokenTTL)
		return &value, nil
	}
	value := expiresAt.UTC()
	if !value.After(now) {
		return nil, apperrors.NewBadRequest("Token expiration must be in the future")
	}
	if value.After(now.Add(maxTokenTTL)) {
		return nil, apperrors.NewBadRequest(
			"Token expiration cannot be more than 365 days in the future",
		)
	}
	return &value, nil
}

func validatePermissions(values []string) ([]string, error) {
	seen := map[string]struct{}{}
	permissions := make([]string, 0, len(values))
	for _, value := range values {
		permission := tenant.Permission(strings.TrimSpace(value))
		if permission == "" {
			continue
		}
		if !allowedTokenPermission(permission) {
			return nil, apperrors.NewBadRequest("Unsupported token permission")
		}
		key := string(permission)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		permissions = append(permissions, key)
	}
	if len(permissions) == 0 {
		return nil, apperrors.NewBadRequest("At least one token permission is required")
	}
	return permissions, nil
}

func allowedTokenPermission(permission tenant.Permission) bool {
	_, ok := allowedPermissions[permission]
	return ok
}

func newTeamTokenSecret() (string, error) {
	token, err := authnz.NewSessionToken()
	if err != nil {
		return "", err
	}
	return TokenPrefix + token, nil
}

func tokenDisplayPrefix(secret string) string {
	if len(secret) <= 18 {
		return secret
	}
	return secret[:18]
}
