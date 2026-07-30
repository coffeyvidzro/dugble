package workload

import (
	"context"
	"encoding/json"
	"net/url"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/google/uuid"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
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

func (s *Service) CreateOIDCFederation(ctx context.Context, workloadValue string, request OIDCFederationRequest) (OIDCFederation, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return OIDCFederation{}, err
	}
	workloadID, err := parseID(workloadValue)
	if err != nil {
		return OIDCFederation{}, err
	}
	request.Name = strings.TrimSpace(request.Name)
	request.IssuerURL = strings.TrimRight(strings.TrimSpace(request.IssuerURL), "/")
	request.Subject = strings.TrimSpace(request.Subject)
	u, parseErr := url.Parse(request.IssuerURL)
	if parseErr != nil || u.Scheme != "https" || u.Host == "" || request.Name == "" || request.Subject == "" {
		return OIDCFederation{}, apperrors.NewBadRequest("Name, HTTPS issuer URL, and subject are required")
	}
	request.Audiences = normalizedStrings(request.Audiences)
	if len(request.Audiences) == 0 {
		return OIDCFederation{}, apperrors.NewBadRequest("At least one audience is required")
	}
	for key, value := range request.RequiredClaims {
		if strings.TrimSpace(key) == "" || strings.TrimSpace(value) == "" {
			return OIDCFederation{}, apperrors.NewBadRequest("Required claims must contain non-empty string values")
		}
	}
	if _, err = oidc.NewProvider(ctx, request.IssuerURL); err != nil {
		return OIDCFederation{}, apperrors.NewBadRequest("OIDC issuer discovery failed")
	}
	claims, err := json.Marshal(request.RequiredClaims)
	if err != nil {
		return OIDCFederation{}, apperrors.NewBadRequest("Required claims are invalid")
	}
	row, err := s.repository.CreateOIDCFederation(ctx, workloadID, access.Scope.TeamID, access.Actor.UserID, request, claims)
	if err != nil {
		return OIDCFederation{}, apperrors.NewNotFound("Active workload identity not found")
	}
	result, err := federationFromRow(row)
	if err != nil {
		return OIDCFederation{}, apperrors.NewInternal("Unable to decode workload federation", err)
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.oidc_federation_created", ResourceType: "workload_oidc_federation", ResourceID: row.ID.String(), Metadata: map[string]any{"workload_id": workloadID.String()}})
	return result, nil
}
func (s *Service) ListOIDCFederations(ctx context.Context, workloadValue string) ([]OIDCFederation, error) {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsRead)
	if err != nil {
		return nil, err
	}
	workloadID, err := parseID(workloadValue)
	if err != nil {
		return nil, err
	}
	rows, err := s.repository.ListOIDCFederations(ctx, workloadID, access.Scope.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list workload federations", err)
	}
	out := make([]OIDCFederation, 0, len(rows))
	for _, row := range rows {
		v, e := federationFromRow(row)
		if e != nil {
			return nil, apperrors.NewInternal("Unable to decode workload federation", e)
		}
		out = append(out, v)
	}
	return out, nil
}
func (s *Service) DeleteOIDCFederation(ctx context.Context, workloadValue, federationValue string) error {
	access, err := requireAccess(ctx, tenant.PermissionWorkloadsWrite)
	if err != nil {
		return err
	}
	workloadID, err := parseID(workloadValue)
	if err != nil {
		return err
	}
	id, err := parseID(federationValue)
	if err != nil {
		return err
	}
	if err = s.repository.DeleteOIDCFederation(ctx, id, workloadID, access.Scope.TeamID); err != nil {
		return apperrors.NewInternal("Unable to delete workload federation", err)
	}
	audit.Record(ctx, access, audit.Event{Action: "workload.oidc_federation_deleted", ResourceType: "workload_oidc_federation", ResourceID: id.String()})
	return nil
}
func (s *Service) ExchangeOIDC(ctx context.Context, request OIDCExchangeRequest) (AccessToken, error) {
	id, err := parseID(request.ProviderID)
	if err != nil {
		return AccessToken{}, apperrors.NewUnauthorized("Workload federation is invalid")
	}
	raw := strings.TrimSpace(request.SubjectToken)
	if raw == "" || len(raw) > 65536 {
		return AccessToken{}, apperrors.NewUnauthorized("OIDC subject token is invalid")
	}
	f, err := s.repository.GetOIDCFederation(ctx, id)
	if err != nil {
		return AccessToken{}, apperrors.NewUnauthorized("Workload federation is invalid")
	}
	provider, err := oidc.NewProvider(ctx, f.IssuerUrl)
	if err != nil {
		return AccessToken{}, apperrors.NewInternal("Unable to discover workload OIDC provider", err)
	}
	token, err := provider.Verifier(&oidc.Config{SkipClientIDCheck: true}).Verify(ctx, raw)
	if err != nil {
		return AccessToken{}, apperrors.NewUnauthorized("OIDC subject token is invalid or expired")
	}
	var claims map[string]any
	if err = token.Claims(&claims); err != nil || token.Subject != f.Subject || !audienceAllowed(token.Audience, f.Audiences) {
		return AccessToken{}, apperrors.NewUnauthorized("OIDC workload claims are not allowed")
	}
	var required map[string]string
	if err = json.Unmarshal(f.RequiredClaims, &required); err != nil || !claimsMatch(claims, required) {
		return AccessToken{}, apperrors.NewUnauthorized("OIDC workload claims are not allowed")
	}
	secret, err := newSecret(AccessTokenPrefix)
	if err != nil {
		return AccessToken{}, apperrors.NewInternal("Unable to issue workload access token", err)
	}
	expires := s.now().UTC().Add(accessTokenTTL)
	if err = s.repository.CreateFederatedAccessToken(ctx, f.WorkloadID, f.ID, authnz.HashSessionToken(secret), expires); err != nil {
		return AccessToken{}, apperrors.NewInternal("Unable to issue workload access token", err)
	}
	audit.Record(ctx, tenant.AccessContext{Actor: tenant.Actor{Type: tenant.ActorTypeWorkload, WorkloadID: f.WorkloadID}, Scope: tenant.Scope{TeamID: f.TeamID, Permissions: permissionValues(f.Permissions)}}, audit.Event{Action: "workload.oidc_token_exchanged", ResourceType: "workload_oidc_federation", ResourceID: f.ID.String(), Metadata: map[string]any{"subject": token.Subject}})
	return AccessToken{AccessToken: secret, TokenType: "Bearer", ExpiresIn: int64(accessTokenTTL / time.Second), ExpiresAt: expires}, nil
}
func normalizedStrings(values []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(values))
	for _, v := range values {
		v = strings.TrimSpace(v)
		if v == "" {
			continue
		}
		if _, ok := seen[v]; ok {
			continue
		}
		seen[v] = struct{}{}
		out = append(out, v)
	}
	return out
}
func audienceAllowed(actual, allowed []string) bool {
	for _, a := range actual {
		for _, v := range allowed {
			if a == v {
				return true
			}
		}
	}
	return false
}
func claimsMatch(actual map[string]any, required map[string]string) bool {
	for key, want := range required {
		got, ok := actual[key].(string)
		if !ok || got != want {
			return false
		}
	}
	return true
}
func federationFromRow(row dbsqlc.WorkloadOidcFederation) (OIDCFederation, error) {
	var claims map[string]string
	if err := json.Unmarshal(row.RequiredClaims, &claims); err != nil {
		return OIDCFederation{}, err
	}
	return OIDCFederation{ID: row.ID.String(), WorkloadID: row.WorkloadID.String(), Name: row.Name, IssuerURL: row.IssuerUrl, Audiences: row.Audiences, Subject: row.Subject, RequiredClaims: claims, Enabled: row.Enabled, CreatedAt: row.CreatedAt.Time, UpdatedAt: row.UpdatedAt.Time}, nil
}
