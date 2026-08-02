package wallet

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
	wallet := router.Group("/teams/:team_id/wallet")
	wallet.Use(authMiddleware, csrfMiddleware)
	wallet.GET("", handler.Get, tenantMiddleware(tenant.PermissionWalletRead))
	wallet.GET("/ledger", handler.ListLedger, tenantMiddleware(tenant.PermissionWalletLedgerRead))
}
