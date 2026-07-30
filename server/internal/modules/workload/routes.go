package workload

import (
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/labstack/echo/v5"
)

type TenantMiddleware func(tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, authMiddleware, csrfMiddleware echo.MiddlewareFunc, tenantMiddleware TenantMiddleware) {
	router.POST("/auth/workload/token", handler.Exchange)
	group := router.Group("/teams/:team_id/workloads")
	group.Use(authMiddleware, csrfMiddleware)
	group.GET("", handler.List, tenantMiddleware(tenant.PermissionWorkloadsRead))
	group.POST("", handler.Create, tenantMiddleware(tenant.PermissionWorkloadsWrite))
	group.PUT("/:workload_id", handler.Update, tenantMiddleware(tenant.PermissionWorkloadsWrite))
	group.DELETE("/:workload_id", handler.Disable, tenantMiddleware(tenant.PermissionWorkloadsWrite))
	group.POST("/:workload_id/credentials", handler.CreateCredential, tenantMiddleware(tenant.PermissionWorkloadsWrite))
	group.DELETE("/:workload_id/credentials/:credential_id", handler.RevokeCredential, tenantMiddleware(tenant.PermissionWorkloadsWrite))
}
