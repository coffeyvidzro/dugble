package email

import (
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/labstack/echo/v5"
)

type TenantMiddleware func(tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, auth, csrf echo.MiddlewareFunc, tenantMiddleware TenantMiddleware) {
	emails := router.Group("/emails")
	emails.Use(auth, csrf)
	emails.GET("", handler.List, tenantMiddleware(tenant.PermissionEmailRead))
	emails.POST("", handler.Send, tenantMiddleware(tenant.PermissionEmailSend))
	emails.POST("/batch", handler.BatchSend, tenantMiddleware(tenant.PermissionEmailSend))
	emails.POST("/:message_id/cancel", handler.Cancel, tenantMiddleware(tenant.PermissionEmailSend))
	emails.GET("/:message_id", handler.Get, tenantMiddleware(tenant.PermissionEmailRead))
}
