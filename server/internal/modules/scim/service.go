package scim

import (
	"context"
	db "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	app "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"net/mail"
	"strings"
	"time"
)

type Service struct{ repo *Repository }

func NewService(r *Repository) *Service { return &Service{r} }
func (s *Service) CreateToken(ctx context.Context, in TokenRequest) (Token, error) {
	a, d := tenant.ResolveAccess(ctx, tenant.PermissionSCIMManage)
	if !d.Allowed || !a.Actor.IsUser() {
		return Token{}, app.NewForbidden(d.Reason)
	}
	in.Name = strings.TrimSpace(in.Name)
	if in.Name == "" {
		return Token{}, app.NewBadRequest("Token name is required")
	}
	if in.ExpiresAt != nil && !in.ExpiresAt.After(time.Now()) {
		return Token{}, app.NewBadRequest("Token expiry must be in the future")
	}
	raw, e := authnz.NewSessionToken()
	if e != nil {
		return Token{}, app.NewInternal("Unable to create SCIM token", e)
	}
	secret := "scim_" + raw
	r, e := s.repo.CreateToken(ctx, a.Scope.TeamID, a.Actor.UserID, in.Name, authnz.HashSessionToken(secret), in.ExpiresAt)
	if e != nil {
		return Token{}, app.NewInternal("Unable to create SCIM token", e)
	}
	audit.Record(ctx, a, audit.Event{Action: "identity.scim_token_created", ResourceType: "scim_token", ResourceID: r.ID.String()})
	v := tokenFromRow(r)
	v.Secret = secret
	return v, nil
}
func (s *Service) ListTokens(ctx context.Context) ([]Token, error) {
	a, d := tenant.ResolveAccess(ctx, tenant.PermissionSCIMManage)
	if !d.Allowed {
		return nil, app.NewForbidden(d.Reason)
	}
	rows, e := s.repo.ListTokens(ctx, a.Scope.TeamID)
	if e != nil {
		return nil, app.NewInternal("Unable to list SCIM tokens", e)
	}
	out := make([]Token, 0, len(rows))
	for _, r := range rows {
		out = append(out, tokenFromRow(r))
	}
	return out, nil
}
func (s *Service) RevokeToken(ctx context.Context, id uuid.UUID) error {
	a, d := tenant.ResolveAccess(ctx, tenant.PermissionSCIMManage)
	if !d.Allowed {
		return app.NewForbidden(d.Reason)
	}
	if e := s.repo.RevokeToken(ctx, a.Scope.TeamID, id); e != nil {
		return app.NewInternal("Unable to revoke SCIM token", e)
	}
	audit.Record(ctx, a, audit.Event{Action: "identity.scim_token_revoked", ResourceType: "scim_token", ResourceID: id.String()})
	return nil
}
func (s *Service) Authenticate(ctx context.Context, secret string) (context.Context, error) {
	secret = strings.TrimSpace(secret)
	if !strings.HasPrefix(secret, "scim_") {
		return ctx, app.NewUnauthorized("Invalid SCIM bearer token")
	}
	r, e := s.repo.Authenticate(ctx, authnz.HashSessionToken(secret))
	if e != nil {
		return ctx, app.NewUnauthorized("Invalid SCIM bearer token")
	}
	a := tenant.AccessContext{Actor: tenant.Actor{Type: tenant.ActorTypeSCIMToken, TokenID: r.ID}, Scope: tenant.Scope{TeamID: r.TeamID, Status: "active"}}
	return tenant.ContextWithAccess(ctx, a), nil
}
func (s *Service) ListUsers(ctx context.Context, email *string, start, count int32) (ListResponse, error) {
	a, ok := tenant.AccessFromContext(ctx)
	if !ok {
		return ListResponse{}, app.NewUnauthorized("SCIM authentication is required")
	}
	if start < 1 {
		start = 1
	}
	if count < 1 {
		count = 100
	}
	if count > 100 {
		count = 100
	}
	rows, total, e := s.repo.ListUsers(ctx, a.Scope.TeamID, email, start, count)
	if e != nil {
		return ListResponse{}, app.NewInternal("Unable to list SCIM users", e)
	}
	out := make([]User, 0, len(rows))
	for _, r := range rows {
		out = append(out, userFromList(r))
	}
	return ListResponse{Schemas: []string{"urn:ietf:params:scim:api:messages:2.0:ListResponse"}, TotalResults: total, StartIndex: start, ItemsPerPage: int32(len(out)), Resources: out}, nil
}
func (s *Service) GetUser(ctx context.Context, id uuid.UUID) (User, error) {
	a, ok := tenant.AccessFromContext(ctx)
	if !ok {
		return User{}, app.NewUnauthorized("SCIM authentication is required")
	}
	r, e := s.repo.GetUser(ctx, a.Scope.TeamID, id)
	if e != nil {
		return User{}, app.NewNotFound("SCIM user not found")
	}
	return userFromGet(r), nil
}
func (s *Service) CreateUser(ctx context.Context, in User) (User, error) {
	a, ok := tenant.AccessFromContext(ctx)
	if !ok {
		return User{}, app.NewUnauthorized("SCIM authentication is required")
	}
	email := strings.ToLower(strings.TrimSpace(in.UserName))
	if _, e := mail.ParseAddress(email); e != nil {
		return User{}, app.NewBadRequest("userName must be a valid email")
	}
	name := strings.TrimSpace(in.DisplayName)
	if name == "" {
		name = strings.TrimSpace(in.Name.Formatted)
	}
	if name == "" {
		name = email
	}
	external := strings.TrimSpace(in.ExternalID)
	if external == "" {
		external = uuid.NewString()
	}
	r, e := s.repo.Provision(ctx, a.Scope.TeamID, email, name, external)
	if e != nil {
		return User{}, app.NewConflict("Unable to provision SCIM user")
	}
	audit.Record(ctx, a, audit.Event{Action: "identity.scim_user_provisioned", ResourceType: "user", ResourceID: r.ID.String()})
	return s.GetUser(ctx, r.ID)
}
func (s *Service) ReplaceUser(ctx context.Context, id uuid.UUID, in User) (User, error) {
	name := strings.TrimSpace(in.DisplayName)
	if name == "" {
		name = strings.TrimSpace(in.Name.Formatted)
	}
	if name == "" {
		return User{}, app.NewBadRequest("displayName is required")
	}
	status := "suspended"
	if in.Active {
		status = "active"
	}
	a, ok := tenant.AccessFromContext(ctx)
	if !ok {
		return User{}, app.NewUnauthorized("SCIM authentication is required")
	}
	if e := s.repo.Update(ctx, a.Scope.TeamID, id, name, status); e != nil {
		return User{}, app.NewInternal("Unable to update SCIM user", e)
	}
	audit.Record(ctx, a, audit.Event{Action: "identity.scim_user_updated", ResourceType: "user", ResourceID: id.String()})
	return s.GetUser(ctx, id)
}
func (s *Service) PatchUser(ctx context.Context, id uuid.UUID, in PatchRequest) (User, error) {
	current, e := s.GetUser(ctx, id)
	if e != nil {
		return User{}, e
	}
	for _, op := range in.Operations {
		if !strings.EqualFold(op.Op, "replace") {
			return User{}, app.NewBadRequest("Only replace SCIM operations are supported")
		}
		switch strings.ToLower(op.Path) {
		case "active":
			v, ok := op.Value.(bool)
			if !ok {
				return User{}, app.NewBadRequest("active must be boolean")
			}
			current.Active = v
		case "displayname", "name.formatted":
			v, ok := op.Value.(string)
			if !ok {
				return User{}, app.NewBadRequest("name must be a string")
			}
			current.DisplayName = v
		default:
			return User{}, app.NewBadRequest("Unsupported SCIM patch path")
		}
	}
	return s.ReplaceUser(ctx, id, current)
}
func (s *Service) DeleteUser(ctx context.Context, id uuid.UUID) error {
	a, ok := tenant.AccessFromContext(ctx)
	if !ok {
		return app.NewUnauthorized("SCIM authentication is required")
	}
	if e := s.repo.Deprovision(ctx, a.Scope.TeamID, id); e != nil {
		return app.NewInternal("Unable to deprovision SCIM user", e)
	}
	audit.Record(ctx, a, audit.Event{Action: "identity.scim_user_deprovisioned", ResourceType: "user", ResourceID: id.String()})
	return nil
}
func tokenFromRow(r db.ScimToken) Token {
	return Token{ID: r.ID.String(), Name: r.Name, LastUsedAt: validTime(r.LastUsedAt), ExpiresAt: validTime(r.ExpiresAt), RevokedAt: validTime(r.RevokedAt), CreatedAt: r.CreatedAt.Time}
}
func validTime(v pgtype.Timestamptz) *time.Time {
	if !v.Valid {
		return nil
	}
	t := v.Time
	return &t
}
func rowUser(id uuid.UUID, email, name, status string, external *string, created, updated time.Time) User {
	x := ""
	if external != nil {
		x = *external
	}
	return User{Schemas: []string{userSchema}, ID: id.String(), ExternalID: x, UserName: email, DisplayName: name, Name: Name{Formatted: name}, Emails: []Email{{Value: email, Primary: true, Type: "work"}}, Active: status == "active", Meta: Meta{ResourceType: "User", Created: created, LastModified: updated}}
}
func userFromList(r db.ListSCIMUsersRow) User {
	return rowUser(r.ID, r.Email, r.ScimName, r.MembershipStatus, r.ExternalID, r.CreatedAt.Time, r.UpdatedAt.Time)
}
func userFromGet(r db.GetSCIMUserRow) User {
	return rowUser(r.ID, r.Email, r.ScimName, r.MembershipStatus, r.ExternalID, r.CreatedAt.Time, r.UpdatedAt.Time)
}
