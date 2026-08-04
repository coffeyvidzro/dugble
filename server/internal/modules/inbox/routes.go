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

	router.POST("/inbox/recipient-tokens", handler.CreateRecipientToken, access(tenant.PermissionInboxWrite))
	router.GET("/inbox/feed", handler.RecipientFeed)
	router.GET("/inbox/unread-count", handler.RecipientUnreadCount)
	router.POST("/inbox/messages/:message_id/seen", handler.MarkRecipientSeen)
	router.POST("/inbox/messages/:message_id/read", handler.MarkRecipientRead)
	router.POST("/inbox/messages/:message_id/archive", handler.ArchiveRecipientMessage)
	router.POST("/inbox/messages/:message_id/unarchive", handler.UnarchiveRecipientMessage)
}
