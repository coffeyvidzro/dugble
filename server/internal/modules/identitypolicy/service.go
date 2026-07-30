package identitypolicy

import (
	"context"

	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type Service struct{ repository *Repository }

func NewService(repository *Repository) *Service { return &Service{repository: repository} }

func (s *Service) Get(ctx context.Context) (Policy, error) {
	access, ok := tenant.AccessFromContext(ctx)
	if !ok {
		return Policy{}, apperrors.NewForbidden("Team access is required")
	}
	policy, err := s.repository.Get(ctx, access.Scope.TeamID)
	if err != nil {
		return Policy{}, apperrors.NewInternal("Unable to get identity policy", err)
	}
	return policy, nil
}

func (s *Service) Update(ctx context.Context, request UpdateRequest) (Policy, error) {
	access, ok := tenant.AccessFromContext(ctx)
	if !ok || !access.Actor.IsUser() {
		return Policy{}, apperrors.NewForbidden("User team access is required")
	}
	if request.SessionMaxAgeMinutes < 15 || request.SessionMaxAgeMinutes > 43200 {
		return Policy{}, apperrors.NewBadRequest("Session max age must be between 15 and 43200 minutes")
	}
	policy, err := s.repository.Update(ctx, access.Scope.TeamID, access.Actor.UserID, request)
	if err != nil {
		return Policy{}, apperrors.NewInternal("Unable to update identity policy", err)
	}
	audit.Record(ctx, access, audit.Event{Action: "identity.policy_updated", ResourceType: "team_identity_policy", ResourceID: access.Scope.TeamID.String(), Metadata: map[string]any{"require_mfa": policy.RequireMFA, "session_max_age_minutes": policy.SessionMaxAgeMinutes}})
	return policy, nil
}
