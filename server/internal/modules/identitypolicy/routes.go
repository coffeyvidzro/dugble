package identitypolicy

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type TenantMiddleware func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, authMiddleware, csrfMiddleware echo.MiddlewareFunc, tenantMiddleware TenantMiddleware) {
	group := router.Group("/teams/:team_id/identity-policy")
	group.Use(authMiddleware, csrfMiddleware)
	group.GET("", handler.Get, tenantMiddleware(tenant.PermissionTeamRead))
	group.PUT("", handler.Update, tenantMiddleware(tenant.PermissionTeamUpdate))
}
