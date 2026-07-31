package scim

import (
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/labstack/echo/v5"
)

type TenantMiddleware func(tenant.Permission) echo.MiddlewareFunc

func RegisterRoutes(r *echo.Echo, h *Handler, auth, csrf echo.MiddlewareFunc, t TenantMiddleware) {
	admin := r.Group("/teams/:team_id/scim/tokens")
	admin.Use(auth, csrf)
	admin.GET("", h.ListTokens, t(tenant.PermissionSCIMManage))
	admin.POST("", h.CreateToken, t(tenant.PermissionSCIMManage))
	admin.DELETE("/:token_id", h.RevokeToken, t(tenant.PermissionSCIMManage))
	g := r.Group("/scim/v2")
	g.Use(h.Authenticate)
	g.GET("/ServiceProviderConfig", h.ServiceProviderConfig)
	g.GET("/Schemas", h.Schemas)
	g.GET("/ResourceTypes", h.ResourceTypes)
	g.GET("/Users", h.ListUsers)
	g.POST("/Users", h.CreateUser)
	g.GET("/Users/:id", h.GetUser)
	g.PUT("/Users/:id", h.ReplaceUser)
	g.PATCH("/Users/:id", h.PatchUser)
	g.DELETE("/Users/:id", h.DeleteUser)
}
