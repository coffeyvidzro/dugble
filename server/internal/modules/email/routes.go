package email

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type TenantMiddleware func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, authMiddleware echo.MiddlewareFunc, csrfMiddleware echo.MiddlewareFunc, tenantMiddleware TenantMiddleware) {
	messages := router.Group("/emails")
	messages.Use(authMiddleware, csrfMiddleware)
	messages.GET("", handler.List, tenantMiddleware(tenant.PermissionEmailRead))
	messages.POST("", handler.Send, tenantMiddleware(tenant.PermissionEmailSend))
	messages.GET("/:message_id", handler.Get, tenantMiddleware(tenant.PermissionEmailRead))
}
