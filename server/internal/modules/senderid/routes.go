package senderid

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
	senderIDs := router.Group("/sender-ids")
	senderIDs.Use(authMiddleware, csrfMiddleware)
	senderIDs.GET("", handler.List, tenantMiddleware(tenant.PermissionSenderIDsRead))
	senderIDs.POST("", handler.Create, tenantMiddleware(tenant.PermissionSenderIDsCreate))
	senderIDs.POST("/bulk", handler.CreateBulk, tenantMiddleware(tenant.PermissionSenderIDsCreate))
	senderIDs.GET("/:sender_id", handler.Get, tenantMiddleware(tenant.PermissionSenderIDsRead))
	senderIDs.DELETE("/:sender_id", handler.Delete, tenantMiddleware(tenant.PermissionSenderIDsDelete))
}
