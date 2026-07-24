package middlewares

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type tenantMembershipStoreFunc func(context.Context, uuid.UUID, uuid.UUID) (tenant.Membership, error)

func (f tenantMembershipStoreFunc) GetTenantMembership(ctx context.Context, teamID uuid.UUID, userID uuid.UUID) (tenant.Membership, error) {
	return f(ctx, teamID, userID)
}

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
