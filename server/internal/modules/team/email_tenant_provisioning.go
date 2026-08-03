package team

import (
	"context"
	"log/slog"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/modules/emailtenant"
)

type EmailTenantProvisioner interface {
	RequestProvisioning(context.Context, uuid.UUID, string) (emailtenant.Tenant, error)
}

type EmailTenantProvisioningConfig struct {
	Provisioner EmailTenantProvisioner
	Region      string
}

func requestEmailTenantProvisioning(
	ctx context.Context,
	provisioner EmailTenantProvisioner,
	region string,
	team Team,
) {
	if provisioner == nil {
		return
	}
	teamID, err := uuid.Parse(strings.TrimSpace(team.ID))
	if err != nil {
		slog.Error("failed to parse team id for email tenant provisioning", "team_id", team.ID, "error", err)
		return
	}
	region = strings.TrimSpace(region)
	if region == "" {
		slog.Error("email tenant provisioning region is not configured", "team_id", teamID)
		return
	}
	if _, err := provisioner.RequestProvisioning(ctx, teamID, region); err != nil {
		slog.Error("failed to request email tenant provisioning", "team_id", teamID, "region", region, "error", err)
	}
}
