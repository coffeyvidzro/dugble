package middlewares

import (
	"strings"

	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

// TenantAccess authenticates a tenant-scoped request from a dashboard session,
// team API token, or short-lived workload token, then stores tenant.AccessContext
// for downstream handlers and services.
type TenantAccessConfig struct {
	Sessions     SessionStore
	Users        PrincipalRepository
	Memberships  tenant.MembershipStore
	Tokens       TeamTokenStore
	Workloads    WorkloadTokenStore
	CSRF         CSRFConfig
	TenantParam  string
	TenantHeader string
	Required     tenant.Permission
}

func TenantAccess(config TenantAccessConfig) echo.MiddlewareFunc {
	sessionAccess := sessionTenantAccess(config)
	teamTokenAccess := teamTokenTenantAccess(config)
	workloadAccess := Workload(config)

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			authorization := strings.TrimSpace(c.Request().Header.Get(echo.HeaderAuthorization))
			if authorization == "" {
				return sessionAccess(next)(c)
			}
			if _, ok := parseBearerToken(authorization); !ok {
				return httputil.Error(c, apperrors.NewUnauthorized("Authorization header is invalid"))
			}
			if secret, _ := parseBearerToken(authorization); strings.HasPrefix(secret, "dgb_wa_") {
				return workloadAccess(next)(c)
			}
			return teamTokenAccess(next)(c)
		}
	}
}

func sessionTenantAccess(config TenantAccessConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return SessionAuth(SessionAuthConfig{
			Sessions: config.Sessions,
			Users:    config.Users,
		})(CSRF(config.CSRF)(Tenant(TenantConfig{
			Memberships: config.Memberships,
			ParamName:   config.TenantParam,
			HeaderName:  config.TenantHeader,
			Required:    config.Required,
		})(next)))
	}
}

func teamTokenTenantAccess(config TenantAccessConfig) echo.MiddlewareFunc {
	return TeamToken(TeamTokenConfig{
		Tokens:   config.Tokens,
		Required: config.Required,
	})
}
