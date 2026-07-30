package workload

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const accessTokenTTL = 10 * time.Minute
const defaultCredentialTTL = 30 * 24 * time.Hour
const maxCredentialTTL = 90 * 24 * time.Hour

var allowedPermissions = map[tenant.Permission]struct{}{
	tenant.PermissionSenderIDsRead: {}, tenant.PermissionSenderDomainsRead: {},
	tenant.PermissionSMSRead: {}, tenant.PermissionSMSSend: {},
	tenant.PermissionEmailRead: {}, tenant.PermissionEmailSend: {},
	tenant.PermissionWebhooksRead: {}, tenant.PermissionWebhooksWrite: {},
}

type Service struct {
	repository *Repository
	now        func() time.Time
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository, now: time.Now}
}

func (s *Service) List(ctx context.Context) ([]Identity, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsRead)
	if err != nil {
		return nil, err
	}
	rows, err := s.repository.List(ctx, access.Scope.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list workload identities", err)
	}
	return rows, nil
}
func (s *Service) Create(ctx context.Context, request MutationRequest) (Identity, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return Identity{}, err
	}
	name, description, permissions, err := validateMutation(request)
	if err != nil {
		return Identity{}, err
	}
	row, err := s.repository.Create(ctx, access.Scope.TeamID, name, description, permissions, access.Actor.UserID)
	if err != nil {
		return Identity{}, apperrors.NewInternal("Unable to create workload identity", err)
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.created", ResourceType: "workload_identity", ResourceID: row.ID})
	return row, nil
}
func (s *Service) Update(ctx context.Context, value string, request MutationRequest) (Identity, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return Identity{}, err
	}
	id, err := parseID(value)
	if err != nil {
		return Identity{}, err
	}
	name, description, permissions, err := validateMutation(request)
	if err != nil {
		return Identity{}, err
	}
	row, err := s.repository.Update(ctx, id, access.Scope.TeamID, name, description, permissions)
	if err != nil {
		return Identity{}, apperrors.NewNotFound("Workload identity not found")
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.updated", ResourceType: "workload_identity", ResourceID: row.ID})
	return row, nil
}
func (s *Service) Disable(ctx context.Context, value string) (Identity, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return Identity{}, err
	}
	id, err := parseID(value)
	if err != nil {
		return Identity{}, err
	}
	row, err := s.repository.Disable(ctx, id, access.Scope.TeamID)
	if err != nil {
		return Identity{}, apperrors.NewNotFound("Workload identity not found")
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.disabled", ResourceType: "workload_identity", ResourceID: row.ID})
	return row, nil
}

func (s *Service) CreateCredential(ctx context.Context, value string, request CredentialRequest) (CreatedCredential, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return CreatedCredential{}, err
	}
	workloadID, err := parseID(value)
	if err != nil {
		return CreatedCredential{}, err
	}
	expires, err := s.credentialExpiry(request.ExpiresAt)
	if err != nil {
		return CreatedCredential{}, err
	}
	secret, err := newSecret(CredentialPrefix)
	if err != nil {
		return CreatedCredential{}, apperrors.NewInternal("Unable to generate workload credential", err)
	}
	row, err := s.repository.CreateCredential(ctx, workloadID, access.Scope.TeamID, authnz.HashSessionToken(secret), displayPrefix(secret), expires)
	if err != nil {
		return CreatedCredential{}, apperrors.NewNotFound("Active workload identity not found")
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.credential_created", ResourceType: "workload_credential", ResourceID: row.ID.String(), Metadata: map[string]any{"workload_id": workloadID.String()}})
	return CreatedCredential{ID: row.ID.String(), WorkloadID: row.WorkloadID.String(), SecretPrefix: row.SecretPrefix, Secret: secret, ExpiresAt: row.ExpiresAt.Time}, nil
}
func (s *Service) RevokeCredential(ctx context.Context, workloadValue, value string) error {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return err
	}
	id, err := parseID(value)
	if err != nil {
		return err
	}
	workloadID, err := parseID(workloadValue)
	if err != nil {
		return err
	}
	if err := s.repository.RevokeCredential(ctx, id, workloadID, access.Scope.TeamID); err != nil {
		return apperrors.NewNotFound("Workload credential not found")
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.credential_revoked", ResourceType: "workload_credential", ResourceID: id.String()})
	return nil
}

func (s *Service) Exchange(ctx context.Context, credential string) (AccessToken, error) {
	credential = strings.TrimSpace(credential)
	if !strings.HasPrefix(credential, CredentialPrefix) {
		return AccessToken{}, apperrors.NewUnauthorized("Workload credential is invalid")
	}
	principal, err := s.repository.GetCredential(ctx, authnz.HashSessionToken(credential))
	if err != nil {
		return AccessToken{}, apperrors.NewUnauthorized("Workload credential is invalid or expired")
	}
	credentialID, _ := uuid.Parse(principal.CredentialID)
	workloadID, _ := uuid.Parse(principal.WorkloadID)
	secret, err := newSecret(AccessTokenPrefix)
	if err != nil {
		return AccessToken{}, apperrors.NewInternal("Unable to issue workload access token", err)
	}
	expires := s.now().UTC().Add(accessTokenTTL)
	if err := s.repository.CreateAccessToken(ctx, workloadID, credentialID, authnz.HashSessionToken(secret), expires); err != nil {
		return AccessToken{}, apperrors.NewInternal("Unable to issue workload access token", err)
	}
	_ = s.repository.TouchCredential(ctx, credentialID)
	teamID, _ := uuid.Parse(principal.TeamID)
	audit.Record(ctx, tenant.AccessContext{Actor: tenant.Actor{Type: tenant.ActorTypeWorkload, WorkloadID: workloadID, CredentialID: credentialID}, Scope: tenant.Scope{TeamID: teamID, Permissions: permissionValues(principal.Permissions)}}, audit.Event{Action: "workload.token_exchanged", ResourceType: "workload_identity", ResourceID: principal.WorkloadID})
	return AccessToken{AccessToken: secret, TokenType: "Bearer", ExpiresIn: int64(accessTokenTTL / time.Second), ExpiresAt: expires}, nil
}

func validateMutation(request MutationRequest) (string, string, []string, error) {
	name := strings.TrimSpace(request.Name)
	description := strings.TrimSpace(request.Description)
	if name == "" || len(name) > 120 {
		return "", "", nil, apperrors.NewBadRequest("Workload name is required and must not exceed 120 characters")
	}
	seen := map[string]struct{}{}
	values := make([]string, 0, len(request.Permissions))
	for _, raw := range request.Permissions {
		p := tenant.Permission(strings.TrimSpace(raw))
		if _, ok := allowedPermissions[p]; !ok {
			return "", "", nil, apperrors.NewBadRequest("Unsupported workload permission")
		}
		if _, ok := seen[string(p)]; ok {
			continue
		}
		seen[string(p)] = struct{}{}
		values = append(values, string(p))
	}
	if len(values) == 0 {
		return "", "", nil, apperrors.NewBadRequest("At least one workload permission is required")
	}
	return name, description, values, nil
}
func (s *Service) credentialExpiry(value *time.Time) (time.Time, error) {
	now := s.now().UTC()
	if value == nil {
		return now.Add(defaultCredentialTTL), nil
	}
	expires := value.UTC()
	if !expires.After(now) || expires.After(now.Add(maxCredentialTTL)) {
		return time.Time{}, apperrors.NewBadRequest("Credential expiration must be in the future and within 90 days")
	}
	return expires, nil
}
func requireAccess(ctx context.Context, p tenant.Permission) (tenant.AccessContext, error) {
	access, decision := tenant.ResolveAccess(ctx, p)
	if !decision.Allowed {
		return tenant.AccessContext{}, apperrors.NewForbidden(decision.Reason)
	}
	if !access.Actor.IsUser() {
		return tenant.AccessContext{}, apperrors.NewForbidden("User team access is required")
	}
	return access, nil
}
func parseID(value string) (uuid.UUID, error) {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("ID must be a valid UUID")
	}
	return id, nil
}
func newSecret(prefix string) (string, error) {
	value, err := authnz.NewSessionToken()
	if err != nil {
		return "", err
	}
	return prefix + value, nil
}
func displayPrefix(value string) string {
	if len(value) <= 18 {
		return value
	}
	return value[:18]
}
func permissionValues(values []string) []tenant.Permission {
	out := make([]tenant.Permission, 0, len(values))
	for _, v := range values {
		out = append(out, tenant.Permission(v))
	}
	return out
}
