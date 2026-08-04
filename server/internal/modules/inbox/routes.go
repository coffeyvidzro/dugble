package inbox

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type AccessMiddleware func(tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, access AccessMiddleware) {
	messages := router.Group("/inbox/messages")
	messages.POST("", handler.CreateMessage, access(tenant.PermissionInboxWrite))
	messages.GET("", handler.ListMessages, access(tenant.PermissionInboxRead))
	messages.GET("/:message_id", handler.GetMessage, access(tenant.PermissionInboxRead))
}
