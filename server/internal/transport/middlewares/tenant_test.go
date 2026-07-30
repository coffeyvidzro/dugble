package middlewares

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type tenantMembershipStoreFunc func(context.Context, uuid.UUID, uuid.UUID) (tenant.Membership, error)
type tenantIdentityPolicyStoreFunc func(context.Context, uuid.UUID) (tenant.IdentityPolicy, error)

func (f tenantMembershipStoreFunc) GetTenantMembership(ctx context.Context, teamID uuid.UUID, userID uuid.UUID) (tenant.Membership, error) {
	return f(ctx, teamID, userID)
}

func (f tenantIdentityPolicyStoreFunc) GetTenantIdentityPolicy(ctx context.Context, teamID uuid.UUID) (tenant.IdentityPolicy, error) {
	return f(ctx, teamID)
}

func TestTenantEnforcesIdentityPolicy(t *testing.T) {
	t.Parallel()
	teamID, userID := uuid.New(), uuid.New()
	tests := []struct {
		name       string
		principal  authnz.Principal
		policy     tenant.IdentityPolicy
		wantStatus int
	}{
		{name: "MFA required", principal: authnz.Principal{AssuranceLevel: authnz.AssuranceLevelOne, AuthenticatedAt: time.Now()}, policy: tenant.IdentityPolicy{RequireMFA: true, SessionMaxAge: time.Hour}, wantStatus: http.StatusForbidden},
		{name: "session too old", principal: authnz.Principal{AssuranceLevel: authnz.AssuranceLevelTwo, AuthenticatedAt: time.Now().Add(-2 * time.Hour)}, policy: tenant.IdentityPolicy{RequireMFA: true, SessionMaxAge: time.Hour}, wantStatus: http.StatusForbidden},
		{name: "policy satisfied", principal: authnz.Principal{AssuranceLevel: authnz.AssuranceLevelTwo, AuthenticatedAt: time.Now()}, policy: tenant.IdentityPolicy{RequireMFA: true, SessionMaxAge: time.Hour}, wantStatus: http.StatusNoContent},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, "/messages", nil)
			request.Header.Set(defaultTenantHeader, teamID.String())
			principal := test.principal
			principal.UserID = userID
			request = request.WithContext(authnz.ContextWithPrincipal(request.Context(), principal))
			response := httptest.NewRecorder()
			ctx := echo.New().NewContext(request, response)
			handler := Tenant(TenantConfig{
				Memberships: tenantMembershipStoreFunc(func(context.Context, uuid.UUID, uuid.UUID) (tenant.Membership, error) {
					return tenant.Membership{TeamID: teamID, UserID: userID, Role: tenant.RoleOwner, Status: tenant.StatusActive, TeamStatus: tenant.StatusActive}, nil
				}),
				Policies: tenantIdentityPolicyStoreFunc(func(context.Context, uuid.UUID) (tenant.IdentityPolicy, error) { return test.policy, nil }),
				Required: tenant.PermissionSMSRead,
			})(func(c *echo.Context) error { return c.NoContent(http.StatusNoContent) })
			if err := handler(ctx); err != nil {
				t.Fatal(err)
			}
			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, test.wantStatus)
			}
		})
	}
}

<<<<<<< HEAD
func TestTenantAccessSessionEnforcesIdentityPolicy(t *testing.T) {
	t.Parallel()

	teamID := uuid.New()
	userID := uuid.New()
	request := httptest.NewRequest(http.MethodGet, "/messages", nil)
	request.Header.Set(defaultTenantHeader, teamID.String())
	request.AddCookie(&http.Cookie{Name: authnz.SessionCookieName, Value: "secret"})
	response := httptest.NewRecorder()
	ctx := echo.New().NewContext(request, response)
	handler := TenantAccess(TenantAccessConfig{
		Sessions: sessionStoreStub{record: session.Record{ID: "session-id", UserID: userID, ExpiresAt: time.Now().Add(time.Hour), Authentication: session.Authentication{Assurance: authnz.AssuranceLevelOne, AuthenticatedAt: time.Now(), CredentialVersion: 1}}},
		Users:    principalRepositoryStub{principal: authnz.Principal{UserID: userID, CredentialVersion: 1}},
		Memberships: tenantMembershipStoreFunc(func(context.Context, uuid.UUID, uuid.UUID) (tenant.Membership, error) {
			return tenant.Membership{TeamID: teamID, UserID: userID, Role: tenant.RoleOwner, Status: tenant.StatusActive, TeamStatus: tenant.StatusActive}, nil
		}),
		Policies: tenantIdentityPolicyStoreFunc(func(context.Context, uuid.UUID) (tenant.IdentityPolicy, error) {
			return tenant.IdentityPolicy{RequireMFA: true, SessionMaxAge: time.Hour}, nil
		}),
		Required: tenant.PermissionSMSRead,
	})(func(c *echo.Context) error {
		t.Fatal("next handler must not run when tenant policy requires MFA")
		return nil
	})

	if err := handler(ctx); err != nil {
		t.Fatal(err)
	}
	if response.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusForbidden)
	}
}

=======
>>>>>>> 9496bd1 (Add SCIM user provisioning)
func TestTenantRejectsDisabledTeam(t *testing.T) {
	t.Parallel()

	teamID := uuid.New()
	userID := uuid.New()
	request := httptest.NewRequest(http.MethodPost, "/sms/messages", nil)
	request.Header.Set(defaultTenantHeader, teamID.String())
	request = request.WithContext(authnz.ContextWithPrincipal(request.Context(), authnz.Principal{UserID: userID}))
	response := httptest.NewRecorder()
	ctx := echo.New().NewContext(request, response)

	handler := Tenant(TenantConfig{
		Memberships: tenantMembershipStoreFunc(func(_ context.Context, gotTeamID uuid.UUID, gotUserID uuid.UUID) (tenant.Membership, error) {
			if gotTeamID != teamID || gotUserID != userID {
				t.Fatalf("GetTenantMembership called with team=%s user=%s", gotTeamID, gotUserID)
			}
			return tenant.Membership{TeamID: teamID, UserID: userID, Role: tenant.RoleOwner, Status: tenant.StatusActive, TeamStatus: tenant.StatusDisabled}, nil
		}),
		Required: tenant.PermissionSMSSend,
	})(func(c *echo.Context) error {
		t.Fatalf("next handler must not run for disabled team")
		return nil
	})

	if err := handler(ctx); err != nil {
		t.Fatalf("Tenant middleware returned error: %v", err)
	}
	if response.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusForbidden)
	}
}

func TestTeamIDFromRequest(t *testing.T) {
	t.Parallel()

	teamID := uuid.New()
	otherTeamID := uuid.New()
	tests := []struct {
		name    string
		path    string
		header  string
		want    uuid.UUID
		wantErr bool
	}{
		{name: "path only", path: teamID.String(), want: teamID},
		{name: "header only", header: teamID.String(), want: teamID},
		{name: "matching path and header", path: teamID.String(), header: teamID.String(), want: teamID},
		{name: "conflicting path and header", path: teamID.String(), header: otherTeamID.String(), wantErr: true},
		{name: "invalid path", path: "not-a-uuid", wantErr: true},
		{name: "invalid header", header: "not-a-uuid", wantErr: true},
		{name: "missing", wantErr: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			request := httptest.NewRequest(http.MethodGet, "/teams/"+test.path, nil)
			request.Header.Set(defaultTenantHeader, test.header)
			ctx := echo.New().NewContext(request, httptest.NewRecorder())
			ctx.SetPathValues(echo.PathValues{{Name: defaultTenantParam, Value: test.path}})

			got, err := teamIDFromRequest(ctx, defaultTenantParam, defaultTenantHeader)
			if test.wantErr {
				if err == nil {
					t.Fatalf("teamIDFromRequest() error = nil, want error")
				}
				return
			}
			if err != nil || got != test.want {
				t.Fatalf("teamIDFromRequest() = %s, %v; want %s, nil", got, err, test.want)
			}
		})
	}
}

func TestTenantAuthorizationMatrix(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		membership tenant.Membership
		storeErr   error
		required   tenant.Permission
		wantStatus int
		wantNext   bool
	}{
		{name: "owner may send", membership: tenant.Membership{Role: tenant.RoleOwner, Status: tenant.StatusActive, TeamStatus: tenant.StatusActive}, required: tenant.PermissionSMSSend, wantStatus: http.StatusNoContent, wantNext: true},
		{name: "member may read", membership: tenant.Membership{Role: tenant.RoleMember, Status: tenant.StatusActive, TeamStatus: tenant.StatusActive}, required: tenant.PermissionSMSRead, wantStatus: http.StatusNoContent, wantNext: true},
		{name: "member may not send", membership: tenant.Membership{Role: tenant.RoleMember, Status: tenant.StatusActive, TeamStatus: tenant.StatusActive}, required: tenant.PermissionSMSSend, wantStatus: http.StatusForbidden},
		{name: "invited member denied", membership: tenant.Membership{Role: tenant.RoleMember, Status: tenant.StatusInvited, TeamStatus: tenant.StatusActive}, required: tenant.PermissionSMSRead, wantStatus: http.StatusForbidden},
		{name: "missing membership denied", storeErr: errors.New("not found"), required: tenant.PermissionSMSRead, wantStatus: http.StatusForbidden},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			teamID := uuid.New()
			userID := uuid.New()
			request := httptest.NewRequest(http.MethodGet, "/messages", nil)
			request.Header.Set(defaultTenantHeader, teamID.String())
			request = request.WithContext(authnz.ContextWithPrincipal(request.Context(), authnz.Principal{UserID: userID}))
			response := httptest.NewRecorder()
			ctx := echo.New().NewContext(request, response)
			nextCalled := false
			handler := Tenant(TenantConfig{
				Memberships: tenantMembershipStoreFunc(func(context.Context, uuid.UUID, uuid.UUID) (tenant.Membership, error) {
					membership := test.membership
					membership.TeamID = teamID
					membership.UserID = userID
					return membership, test.storeErr
				}),
				Required: test.required,
			})(func(c *echo.Context) error {
				nextCalled = true
				return c.NoContent(http.StatusNoContent)
			})

			if err := handler(ctx); err != nil {
				t.Fatalf("Tenant() error = %v", err)
			}
			if response.Code != test.wantStatus || nextCalled != test.wantNext {
				t.Fatalf("status = %d, next = %t; want %d, %t", response.Code, nextCalled, test.wantStatus, test.wantNext)
			}
		})
	}
}
