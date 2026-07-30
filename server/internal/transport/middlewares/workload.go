package middlewares

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/modules/workload"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type WorkloadTokenStore interface {
	GetAccessToken(context.Context, string) (workload.TokenPrincipal, error)
	TouchAccessToken(context.Context, uuid.UUID) error
}

func Workload(config TenantAccessConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if config.Workloads == nil {
				return httputil.Error(c, apperrors.NewInternal("Workload token store is not configured", nil))
			}
			secret, ok := parseBearerToken(c.Request().Header.Get(echo.HeaderAuthorization))
			if !ok || !strings.HasPrefix(secret, workload.AccessTokenPrefix) {
				return httputil.Error(c, apperrors.NewUnauthorized("Workload access token is invalid"))
			}
			principal, err := config.Workloads.GetAccessToken(c.Request().Context(), authnz.HashSessionToken(secret))
			if err != nil {
				return httputil.Error(c, apperrors.NewUnauthorized("Workload access token is invalid or expired"))
			}
			tokenID, err1 := uuid.Parse(principal.TokenID)
			credentialID, err2 := uuid.Parse(principal.CredentialID)
			workloadID, err3 := uuid.Parse(principal.WorkloadID)
			teamID, err4 := uuid.Parse(principal.TeamID)
			if err1 != nil || err2 != nil || err3 != nil || err4 != nil {
				return httputil.Error(c, apperrors.NewUnauthorized("Workload access token is invalid"))
			}
			permissions := make([]tenant.Permission, 0, len(principal.Permissions))
			for _, value := range principal.Permissions {
				permission := tenant.Permission(strings.TrimSpace(value))
				if _, allowed := workloadPermission(permission); !allowed {
					return httputil.Error(c, apperrors.NewUnauthorized("Workload access token is invalid"))
				}
				permissions = append(permissions, permission)
			}
			access := tenant.AccessContext{Actor: tenant.Actor{Type: tenant.ActorTypeWorkload, WorkloadID: workloadID, CredentialID: credentialID, TokenID: tokenID}, Scope: tenant.Scope{TeamID: teamID, Status: tenant.StatusActive, Permissions: permissions}}
			if decision := tenant.Authorize(access, config.Required); !decision.Allowed {
				return httputil.Error(c, apperrors.NewForbidden(decision.Reason))
			}
			_ = config.Workloads.TouchAccessToken(c.Request().Context(), tokenID)
			c.SetRequest(c.Request().WithContext(tenant.ContextWithAccess(c.Request().Context(), access)))
			return next(c)
		}
	}
}

func workloadPermission(permission tenant.Permission) (tenant.Permission, bool) {
	switch permission {
	case tenant.PermissionSenderIDsRead, tenant.PermissionSenderDomainsRead, tenant.PermissionSMSRead, tenant.PermissionSMSSend, tenant.PermissionEmailRead, tenant.PermissionEmailSend, tenant.PermissionWebhooksRead, tenant.PermissionWebhooksWrite:
		return permission, true
	default:
		return "", false
	}
}
