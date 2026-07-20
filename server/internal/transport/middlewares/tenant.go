package middlewares

import (
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

const (
	defaultTenantParam  = "team_id"
	defaultTenantHeader = "X-Team-ID"
)

type TenantConfig struct {
	Memberships tenant.MembershipStore
	ParamName   string
	HeaderName  string
	Required    tenant.Permission
}

func Tenant(config TenantConfig) echo.MiddlewareFunc {
	paramName := config.ParamName
	if paramName == "" {
		paramName = defaultTenantParam
	}
	headerName := config.HeaderName
	if headerName == "" {
		headerName = defaultTenantHeader
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if config.Memberships == nil {
				return httputil.Error(
					c,
					apperrors.NewInternal("Tenant membership store is not configured", nil),
				)
			}

			principal, ok := authnz.PrincipalFromContext(c.Request().Context())
			if !ok {
				return httputil.Error(c, apperrors.NewUnauthorized("Authentication is required"))
			}

			teamID, err := teamIDFromRequest(c, paramName, headerName)
			if err != nil {
				return httputil.Error(c, err)
			}

			membership, err := config.Memberships.GetTenantMembership(
				c.Request().Context(),
				teamID,
				principal.UserID,
			)
			if err != nil || !membership.Active() {
				return httputil.Error(
					c,
					apperrors.NewForbidden("Active team membership is required"),
				)
			}
			if config.Required != "" && !tenant.Can(membership.Role, config.Required) {
				return httputil.Error(c, apperrors.NewForbidden("Team permission is required"))
			}

			tenantContext := tenant.Context{
				TeamID:    membership.TeamID,
				ActorType: tenant.ActorTypeUser,
				UserID:    membership.UserID,
				Role:      membership.Role,
				Status:    membership.Status,
			}
			ctx := tenant.ContextWithTenant(c.Request().Context(), tenantContext)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}

func teamIDFromRequest(c *echo.Context, paramName string, headerName string) (uuid.UUID, error) {
	teamID := strings.TrimSpace(c.Param(paramName))
	if teamID == "" {
		teamID = strings.TrimSpace(c.Request().Header.Get(headerName))
	}
	if teamID == "" {
		return uuid.Nil, apperrors.NewBadRequest("Team id is required")
	}
	parsedTeamID, err := uuid.Parse(teamID)
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("Team id must be a valid UUID")
	}
	return parsedTeamID, nil
}
