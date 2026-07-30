package middlewares

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/modules/workload"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type workloadStoreStub struct{ principal workload.TokenPrincipal }

func (s workloadStoreStub) GetAccessToken(context.Context, string) (workload.TokenPrincipal, error) {
	return s.principal, nil
}
func (s workloadStoreStub) TouchAccessToken(context.Context, uuid.UUID) error { return nil }

func TestWorkloadBuildsAccessContext(t *testing.T) {
	workloadID, credentialID, tokenID, teamID := uuid.New(), uuid.New(), uuid.New(), uuid.New()
	request := httptest.NewRequest(http.MethodPost, "/email/messages", nil)
	request.Header.Set(echo.HeaderAuthorization, "Bearer "+workload.AccessTokenPrefix+"secret")
	response := httptest.NewRecorder()
	ctx := echo.New().NewContext(request, response)
	handler := Workload(TenantAccessConfig{Workloads: workloadStoreStub{principal: workload.TokenPrincipal{TokenID: tokenID.String(), CredentialID: credentialID.String(), WorkloadID: workloadID.String(), TeamID: teamID.String(), Permissions: []string{string(tenant.PermissionEmailSend)}}}, Required: tenant.PermissionEmailSend})(func(c *echo.Context) error {
		access, ok := tenant.AccessFromContext(c.Request().Context())
		if !ok || !access.Actor.IsWorkload() || access.Actor.WorkloadID != workloadID {
			t.Fatal("workload access context missing")
		}
		return c.NoContent(http.StatusNoContent)
	})
	if err := handler(ctx); err != nil {
		t.Fatal(err)
	}
	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d", response.Code)
	}
}
