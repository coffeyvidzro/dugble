package sso

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"net/mail"
	"net/url"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/oauth2"

	db "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	app "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const stateTTL = 10 * time.Minute
const loginTTL = 30 * 24 * time.Hour

type Service struct {
	repo     *Repository
	sessions *session.Repository
	cipher   *authnz.SecretCipher
	callback string
}

func NewService(repo *Repository, sessions *session.Repository, cipher *authnz.SecretCipher, backend string) *Service {
	return &Service{repo: repo, sessions: sessions, cipher: cipher, callback: strings.TrimRight(backend, "/") + "/auth/sso/callback"}
}
func (s *Service) Upsert(ctx context.Context, in UpsertRequest) (Connection, error) {
	access, d := tenant.ResolveAccess(ctx, tenant.PermissionSSOManage)
	if !d.Allowed || !access.Actor.IsUser() {
		return Connection{}, app.NewForbidden(d.Reason)
	}
	in.Name = strings.TrimSpace(in.Name)
	in.ClientID = strings.TrimSpace(in.ClientID)
	in.IssuerURL = strings.TrimRight(strings.TrimSpace(in.IssuerURL), "/")
	u, e := url.Parse(in.IssuerURL)
	if e != nil || u.Scheme != "https" || u.Host == "" || in.Name == "" || in.ClientID == "" || strings.TrimSpace(in.ClientSecret) == "" {
		return Connection{}, app.NewBadRequest("Name, HTTPS issuer URL, client ID, and client secret are required")
	}
	domains := make([]string, 0, len(in.AllowedDomains))
	for _, d := range in.AllowedDomains {
		d = strings.ToLower(strings.TrimSpace(d))
		if d != "" {
			domains = append(domains, d)
		}
	}
	in.AllowedDomains = domains
	if len(domains) == 0 {
		return Connection{}, app.NewBadRequest("At least one allowed email domain is required")
	}
	if _, e = oidc.NewProvider(ctx, in.IssuerURL); e != nil {
		return Connection{}, app.NewBadRequest("OIDC issuer discovery failed")
	}
	encrypted, e := s.cipher.Encrypt([]byte(in.ClientSecret))
	if e != nil {
		return Connection{}, app.NewInternal("Unable to encrypt OIDC client secret", e)
	}
	row, e := s.repo.Upsert(ctx, access.Scope.TeamID, access.Actor.UserID, in, encrypted)
	if e != nil {
		return Connection{}, app.NewInternal("Unable to save OIDC connection", e)
	}
	audit.Record(ctx, access, audit.Event{Action: "identity.oidc_connection_updated", ResourceType: "oidc_connection", ResourceID: row.ID.String()})
	return fromRow(row), nil
}
func (s *Service) Get(ctx context.Context) (Connection, error) {
	access, d := tenant.ResolveAccess(ctx, tenant.PermissionSSOManage)
	if !d.Allowed {
		return Connection{}, app.NewForbidden(d.Reason)
	}
	r, e := s.repo.GetByTeam(ctx, access.Scope.TeamID)
	if e != nil {
		return Connection{}, app.NewInternal("Unable to get OIDC connection", e)
	}
	return fromRow(r), nil
}
func (s *Service) Delete(ctx context.Context) error {
	access, d := tenant.ResolveAccess(ctx, tenant.PermissionSSOManage)
	if !d.Allowed {
		return app.NewForbidden(d.Reason)
	}
	if e := s.repo.Delete(ctx, access.Scope.TeamID); e != nil {
		return app.NewInternal("Unable to delete OIDC connection", e)
	}
	audit.Record(ctx, access, audit.Event{Action: "identity.oidc_connection_deleted", ResourceType: "team", ResourceID: access.Scope.TeamID.String()})
	return nil
}
func (s *Service) Begin(ctx context.Context, teamID uuid.UUID) (string, error) {
	r, e := s.repo.GetByTeam(ctx, teamID)
	if e != nil || !r.Enabled {
		return "", app.NewNotFound("SSO connection not found")
	}
	provider, e := oidc.NewProvider(ctx, r.IssuerUrl)
	if e != nil {
		return "", app.NewInternal("Unable to discover OIDC provider", e)
	}
	secret, e := s.decryptConnectionSecret(ctx, r)
	if e != nil {
		return "", app.NewInternal("Unable to decrypt OIDC client secret", e)
	}
	state, e := authnz.NewSessionToken()
	if e != nil {
		return "", app.NewInternal("Unable to create SSO state", e)
	}
	nonce, e := authnz.NewSessionToken()
	if e != nil {
		return "", app.NewInternal("Unable to create SSO nonce", e)
	}
	verifier := oauth2.GenerateVerifier()
	encrypted, e := s.cipher.Encrypt([]byte(verifier))
	if e != nil {
		return "", app.NewInternal("Unable to protect PKCE verifier", e)
	}
	if e = s.repo.CreateState(ctx, hash(state), r.ID, encrypted, nonce, pgtype.Timestamptz{Time: time.Now().Add(stateTTL), Valid: true}); e != nil {
		return "", app.NewInternal("Unable to begin SSO login", e)
	}
	cfg := oauth2.Config{ClientID: r.ClientID, ClientSecret: string(secret), Endpoint: provider.Endpoint(), RedirectURL: s.callback, Scopes: []string{oidc.ScopeOpenID, "profile", "email"}}
	return cfg.AuthCodeURL(state, oidc.Nonce(nonce), oauth2.S256ChallengeOption(verifier)), nil
}

type claims struct {
	Subject       string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Nonce         string `json:"nonce"`
}

func (s *Service) Complete(ctx context.Context, state, code string, userAgent, ip *string) (LoginResult, error) {
	st, e := s.repo.ConsumeState(ctx, hash(state))
	if e != nil {
		return LoginResult{}, app.NewUnauthorized("SSO state is invalid or expired")
	}
	r, e := s.repo.Get(ctx, st.ConnectionID)
	if e != nil {
		return LoginResult{}, app.NewUnauthorized("SSO connection is unavailable")
	}
	provider, e := oidc.NewProvider(ctx, r.IssuerUrl)
	if e != nil {
		return LoginResult{}, app.NewInternal("Unable to discover OIDC provider", e)
	}
	secret, e := s.decryptConnectionSecret(ctx, r)
	if e != nil {
		return LoginResult{}, app.NewInternal("Unable to decrypt OIDC client secret", e)
	}
	verifier, e := s.cipher.Decrypt(st.CodeVerifierCiphertext)
	if e != nil {
		return LoginResult{}, app.NewUnauthorized("SSO state is invalid")
	}
	cfg := oauth2.Config{ClientID: r.ClientID, ClientSecret: string(secret), Endpoint: provider.Endpoint(), RedirectURL: s.callback, Scopes: []string{oidc.ScopeOpenID, "profile", "email"}}
	token, e := cfg.Exchange(ctx, code, oauth2.VerifierOption(string(verifier)))
	if e != nil {
		return LoginResult{}, app.NewUnauthorized("OIDC authorization code is invalid")
	}
	raw, ok := token.Extra("id_token").(string)
	if !ok {
		return LoginResult{}, app.NewUnauthorized("OIDC provider did not return an ID token")
	}
	idToken, e := provider.Verifier(&oidc.Config{ClientID: r.ClientID}).Verify(ctx, raw)
	if e != nil {
		return LoginResult{}, app.NewUnauthorized("OIDC ID token is invalid")
	}
	var c claims
	if e = idToken.Claims(&c); e != nil || c.Subject == "" || c.Nonce != st.Nonce || !c.EmailVerified {
		return LoginResult{}, app.NewUnauthorized("OIDC identity claims are invalid")
	}
	if _, e = mail.ParseAddress(c.Email); e != nil || !domainAllowed(c.Email, r.AllowedDomains) {
		return LoginResult{}, app.NewForbidden("OIDC email domain is not allowed")
	}
	if strings.TrimSpace(c.Name) == "" {
		c.Name = c.Email
	}
	user, e := s.repo.Resolve(ctx, r.ID, r.TeamID, c.Subject, strings.ToLower(c.Email), c.Name)
	if e != nil {
		return LoginResult{}, app.NewInternal("Unable to link OIDC identity", e)
	}
	sessionToken, e := authnz.NewSessionToken()
	if e != nil {
		return LoginResult{}, app.NewInternal("Unable to create session", e)
	}
	now := time.Now().UTC()
	expires := now.Add(loginTTL)
	_, e = s.sessions.Create(ctx, user.ID, authnz.HashSessionToken(sessionToken), userAgent, ip, expires, session.Authentication{CredentialVersion: user.CredentialVersion, Method: authnz.AuthenticationMethodOIDC, Assurance: authnz.AssuranceLevelOne, AuthenticatedAt: now})
	if e != nil {
		return LoginResult{}, app.NewInternal("Unable to create session", e)
	}
	audit.RecordIdentity(ctx, user.ID, audit.Event{Action: "identity.oidc_login_completed", ResourceType: "oidc_connection", ResourceID: r.ID.String(), Metadata: map[string]any{"team_id": r.TeamID.String()}})
	return LoginResult{Token: sessionToken, ExpiresAt: expires, UserID: user.ID.String()}, nil
}
func hash(v string) string {
	x := sha256.Sum256([]byte(v))
	return base64.RawURLEncoding.EncodeToString(x[:])
}
func domainAllowed(email string, allowed []string) bool {
	if len(allowed) == 0 {
		return true
	}
	i := strings.LastIndex(email, "@")
	if i < 0 {
		return false
	}
	d := strings.ToLower(email[i+1:])
	for _, a := range allowed {
		if d == a {
			return true
		}
	}
	return false
}
func fromRow(r db.OidcConnection) Connection {
	return Connection{ID: r.ID.String(), TeamID: r.TeamID.String(), Name: r.Name, IssuerURL: r.IssuerUrl, ClientID: r.ClientID, AllowedDomains: r.AllowedDomains, Enabled: r.Enabled, CreatedAt: r.CreatedAt.Time, UpdatedAt: r.UpdatedAt.Time}
}

func (s *Service) decryptConnectionSecret(ctx context.Context, connection db.OidcConnection) ([]byte, error) {
	plain, replacement, rotated, err := s.cipher.DecryptAndRotate(connection.ClientSecretCiphertext)
	if err != nil {
		return nil, err
	}
	if rotated {
		_ = s.repo.RotateSecretCiphertext(ctx, connection.ID, connection.ClientSecretCiphertext, replacement)
	}
	return plain, nil
}
