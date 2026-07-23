package sms

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type TenantMiddleware func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, authMiddleware echo.MiddlewareFunc, csrfMiddleware echo.MiddlewareFunc, tenantMiddleware TenantMiddleware) {
	messages := router.Group("/sms")
	messages.Use(authMiddleware, csrfMiddleware)
	messages.GET("", handler.List, tenantMiddleware(tenant.PermissionSMSRead))
	messages.POST("", handler.Send, tenantMiddleware(tenant.PermissionSMSSend))
	messages.GET("/:message_id", handler.Get, tenantMiddleware(tenant.PermissionSMSRead))
	messages.POST("/:message_id/sync-status", handler.SyncStatus, tenantMiddleware(tenant.PermissionSMSSend))
}
