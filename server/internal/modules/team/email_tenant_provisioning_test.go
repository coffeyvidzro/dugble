package team

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/modules/emailtenant"
)

type recordingEmailTenantProvisioner struct {
	calls  int
	teamID uuid.UUID
	region string
	err    error
}

func (p *recordingEmailTenantProvisioner) RequestProvisioning(
	_ context.Context,
	teamID uuid.UUID,
	region string,
) (emailtenant.Tenant, error) {
	p.calls++
	p.teamID = teamID
	p.region = region
	return emailtenant.Tenant{}, p.err
}

func TestRequestEmailTenantProvisioningUsesCreatedTeam(t *testing.T) {
	teamID := uuid.New()
	provisioner := &recordingEmailTenantProvisioner{}

	requestEmailTenantProvisioning(
		context.Background(),
		provisioner,
		"eu-north-1",
		Team{ID: teamID.String()},
	)

	if provisioner.calls != 1 {
		t.Fatalf("provisioning calls = %d, want 1", provisioner.calls)
	}
	if provisioner.teamID != teamID {
		t.Fatalf("team id = %s, want %s", provisioner.teamID, teamID)
	}
	if provisioner.region != "eu-north-1" {
		t.Fatalf("region = %q, want %q", provisioner.region, "eu-north-1")
	}
}

func TestRequestEmailTenantProvisioningIsBestEffort(t *testing.T) {
	provisioner := &recordingEmailTenantProvisioner{err: errors.New("database unavailable")}

	requestEmailTenantProvisioning(
		context.Background(),
		provisioner,
		"eu-north-1",
		Team{ID: uuid.NewString()},
	)

	if provisioner.calls != 1 {
		t.Fatalf("provisioning calls = %d, want 1", provisioner.calls)
	}
}

func TestRequestEmailTenantProvisioningSkipsInvalidConfiguration(t *testing.T) {
	tests := []struct {
		name   string
		region string
		teamID string
	}{
		{name: "missing region", teamID: uuid.NewString()},
		{name: "invalid team id", region: "eu-north-1", teamID: "not-a-uuid"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			provisioner := &recordingEmailTenantProvisioner{}
			requestEmailTenantProvisioning(
				context.Background(),
				provisioner,
				test.region,
				Team{ID: test.teamID},
			)
			if provisioner.calls != 0 {
				t.Fatalf("provisioning calls = %d, want 0", provisioner.calls)
			}
		})
	}
}
