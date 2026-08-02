package domain

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

func TestRegisterRoutesRequiresExpectedPermissions(t *testing.T) {
	t.Parallel()
	tests := []struct {
		method     string
		path       string
		permission tenant.Permission
	}{
		{method: http.MethodGet, path: "/domains", permission: tenant.PermissionSenderDomainsRead},
		{method: http.MethodPost, path: "/domains", permission: tenant.PermissionSenderDomainsCreate},
		{method: http.MethodGet, path: "/domains/domain-id", permission: tenant.PermissionSenderDomainsRead},
		{method: http.MethodPost, path: "/domains/domain-id/verify", permission: tenant.PermissionSenderDomainsCreate},
		{method: http.MethodDelete, path: "/domains/domain-id", permission: tenant.PermissionSenderDomainsDelete},
	}

	for _, test := range tests {
		router := echo.New()
		RegisterRoutes(router, &Handler{}, domainPermissionProbe)
		request := httptest.NewRequest(test.method, test.path, nil)
		response := httptest.NewRecorder()
		router.ServeHTTP(response, request)
		if response.Code != http.StatusNoContent {
			t.Fatalf("%s %s status = %d, want %d", test.method, test.path, response.Code, http.StatusNoContent)
		}
		if got := response.Header().Get("X-Required-Permission"); got != string(test.permission) {
			t.Fatalf("%s %s permission = %q, want %q", test.method, test.path, got, test.permission)
		}
	}
}

func domainPermissionProbe(permission tenant.Permission) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			c.Response().Header().Set("X-Required-Permission", string(permission))
			return c.NoContent(http.StatusNoContent)
		}
	}
}
