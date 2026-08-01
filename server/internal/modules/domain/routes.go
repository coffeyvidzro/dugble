package domain

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type TenantMiddleware func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(
	router *echo.Echo,
	handler *Handler,
	authMiddleware echo.MiddlewareFunc,
	csrfMiddleware echo.MiddlewareFunc,
	tenantMiddleware TenantMiddleware,
) {
	domains := router.Group("/domains")
	domains.Use(authMiddleware, csrfMiddleware)
	domains.GET("", handler.List, tenantMiddleware(tenant.PermissionSenderDomainsRead))
	domains.POST("", handler.Create, tenantMiddleware(tenant.PermissionSenderDomainsCreate))
	domains.GET("/provisioning/:region", handler.ProvisioningStatus, tenantMiddleware(tenant.PermissionSenderDomainsRead))
	domains.GET("/:domain_id", handler.Get, tenantMiddleware(tenant.PermissionSenderDomainsRead))
	domains.POST("/:domain_id/verify", handler.Verify, tenantMiddleware(tenant.PermissionSenderDomainsCreate))
	domains.DELETE("/:domain_id", handler.Delete, tenantMiddleware(tenant.PermissionSenderDomainsDelete))
}
