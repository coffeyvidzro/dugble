package identityverification

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type TenantAccess func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, tenantAccess TenantAccess) {
	identity := router.Group("/identity-verifications")
	identity.POST("/document-analysis", handler.AnalyzeDocument, tenantAccess(tenant.PermissionIdentityVerificationsCreate))
	identity.POST("/face-comparison", handler.CompareFaces, tenantAccess(tenant.PermissionIdentityVerificationsCreate))
	identity.POST("/liveness", handler.CheckLiveness, tenantAccess(tenant.PermissionIdentityVerificationsCreate))
}
