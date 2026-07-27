package identityverification

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

const PermissionCreate tenant.Permission = "identity_verifications:create"

type TenantAccess func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, tenantAccess TenantAccess) {
	identity := router.Group("/identity-verifications")
	identity.POST("/document-analysis", handler.AnalyzeDocument, tenantAccess(PermissionCreate))
	identity.POST("/face-comparison", handler.CompareFaces, tenantAccess(PermissionCreate))
	identity.POST("/liveness", handler.CheckLiveness, tenantAccess(PermissionCreate))
}
