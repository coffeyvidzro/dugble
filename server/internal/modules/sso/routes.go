package sso

import (
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/labstack/echo/v5"
)

type TenantMiddleware func(tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(r *echo.Echo, h *Handler, auth, csrf echo.MiddlewareFunc, t TenantMiddleware) {
	r.GET("/auth/sso/:team_id/start", h.Begin)
	r.GET("/auth/sso/callback", h.Callback)
	g := r.Group("/teams/:team_id/sso")
	g.Use(auth, csrf)
	g.GET("", h.Get, t(tenant.PermissionSSOManage))
	g.PUT("", h.Upsert, t(tenant.PermissionSSOManage))
	g.DELETE("", h.Delete, t(tenant.PermissionSSOManage))
}
