package email

import (
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/labstack/echo/v5"
)

type TenantMiddleware func(tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, tenantAccess TenantMiddleware) {
	emails := router.Group("/emails")
	emails.GET("", handler.List, tenantAccess(tenant.PermissionEmailRead))
	emails.POST("", handler.Send, tenantAccess(tenant.PermissionEmailSend))
	emails.POST("/batch", handler.BatchSend, tenantAccess(tenant.PermissionEmailSend))
	emails.GET("/:message_id", handler.Get, tenantAccess(tenant.PermissionEmailRead))
}
