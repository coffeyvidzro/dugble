package sms

import (
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type AccessMiddleware func(permission tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(router *echo.Echo, handler *Handler, accessMiddleware AccessMiddleware) {
	messages := router.Group("/sms")
	messages.GET("", handler.List, accessMiddleware(tenant.PermissionSMSRead))
	messages.POST("", handler.Send, accessMiddleware(tenant.PermissionSMSSend))
	messages.POST("/batch", handler.BatchSend, accessMiddleware(tenant.PermissionSMSSend))
	messages.GET("/:message_id", handler.Get, accessMiddleware(tenant.PermissionSMSRead))
	messages.POST("/:message_id/sync-status", handler.SyncStatus, accessMiddleware(tenant.PermissionSMSSend))
}
