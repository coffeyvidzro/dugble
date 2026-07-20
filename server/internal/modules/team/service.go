package team

import (
	"context"
	"errors"
	"log/slog"
	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/notifications"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type Service struct {
	repository *Repository
	notifier   InvitationNotifier
}

type InvitationNotifier interface {
	SendTeamInvitation(ctx context.Context, input notifications.SendTeamInvitationInput) error
}

func NewService(repository *Repository, notifiers ...InvitationNotifier) *Service {
	service := &Service{repository: repository}
	if len(notifiers) > 0 {
		service.notifier = notifiers[0]
	}
	return service
}

const teamInvitationTTL = 7 * 24 * time.Hour

func (s *Service) List(ctx context.Context) ([]Team, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return nil, apperrors.NewUnauthorized("Authentication is required")
	}
	teams, err := s.repository.ListForUser(ctx, principal.UserID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list teams", err)
	}
	return teams, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (Team, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return Team{}, apperrors.NewUnauthorized("Authentication is required")
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return Team{}, apperrors.NewBadRequest("Team name is required")
	}
	team, err := s.repository.Create(ctx, name, principal.UserID)
	if err != nil {
		return Team{}, apperrors.NewInternal("Unable to create team", err)
	}
	createdTeamID, err := uuid.Parse(team.ID)
	if err != nil {
		return Team{}, apperrors.NewInternal("Unable to parse created team id", err)
	}
	if _, err := s.repository.CreateMember(
		ctx,
		createdTeamID,
		principal.UserID,
		RoleOwner,
		"active",
	); err != nil {
		return Team{}, apperrors.NewInternal("Unable to create team owner", err)
	}
	return team, nil
}

func (s *Service) Get(ctx context.Context, teamID string) (Team, error) {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamRead)
	if err != nil {
		return Team{}, err
	}
	team, err := s.repository.Get(ctx, tenantContext.TeamID)
	if err != nil {
		return Team{}, apperrors.NewNotFound("Team not found")
	}
	return team, nil
}

func (s *Service) Update(ctx context.Context, teamID string, req UpdateRequest) (Team, error) {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamUpdate)
	if err != nil {
		return Team{}, err
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		return Team{}, apperrors.NewBadRequest("Team name is required")
	}
	team, err := s.repository.Update(ctx, tenantContext.TeamID, name)
	if err != nil {
		return Team{}, apperrors.NewInternal("Unable to update team", err)
	}
	return team, nil
}

func (s *Service) Delete(ctx context.Context, teamID string) (Team, error) {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamDelete)
	if err != nil {
		return Team{}, err
	}
	team, err := s.repository.Disable(ctx, tenantContext.TeamID)
	if err != nil {
		return Team{}, apperrors.NewInternal("Unable to disable team", err)
	}
	return team, nil
}

func (s *Service) ListMembers(ctx context.Context, teamID string) ([]Member, error) {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamMembersRead)
	if err != nil {
		return nil, err
	}
	members, err := s.repository.ListMembers(ctx, tenantContext.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list team members", err)
	}
	return members, nil
}

func (s *Service) Leave(ctx context.Context, teamID string) error {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamMemberLeave)
	if err != nil {
		return err
	}
	if tenantContext.Role == RoleOwner {
		return apperrors.NewBadRequest("Team owner cannot leave the team")
	}
	if err := s.repository.RemoveMember(
		ctx,
		tenantContext.TeamID,
		tenantContext.UserID,
	); err != nil {
		return apperrors.NewInternal("Unable to leave team", err)
	}
	return nil
}

func (s *Service) RemoveMember(ctx context.Context, teamID string, userID string) error {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamMemberRemove)
	if err != nil {
		return err
	}
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return apperrors.NewBadRequest("User id must be a valid UUID")
	}
	member, err := s.repository.GetMember(ctx, tenantContext.TeamID, parsedUserID)
	if err != nil {
		return apperrors.NewNotFound("Team member not found")
	}
	if member.Role == RoleOwner {
		return apperrors.NewBadRequest("Team owner cannot be removed")
	}
	if err := s.repository.RemoveMember(ctx, tenantContext.TeamID, parsedUserID); err != nil {
		return apperrors.NewInternal("Unable to remove team member", err)
	}
	return nil
}

func (s *Service) UpdateMemberRole(
	ctx context.Context,
	teamID string,
	userID string,
	req UpdateMemberRoleRequest,
) (Member, error) {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamMemberRole)
	if err != nil {
		return Member{}, err
	}
	parsedUserID, err := uuid.Parse(strings.TrimSpace(userID))
	if err != nil {
		return Member{}, apperrors.NewBadRequest("User id must be a valid UUID")
	}
	role := strings.TrimSpace(req.Role)
	if role != RoleAdmin && role != RoleMember {
		return Member{}, apperrors.NewBadRequest("Role must be admin or member")
	}
	existing, err := s.repository.GetMember(ctx, tenantContext.TeamID, parsedUserID)
	if err != nil {
		return Member{}, apperrors.NewNotFound("Team member not found")
	}
	if existing.Role == RoleOwner {
		return Member{}, apperrors.NewBadRequest("Team owner role cannot be changed")
	}
	member, err := s.repository.UpdateMemberRole(ctx, tenantContext.TeamID, parsedUserID, role)
	if err != nil {
		return Member{}, apperrors.NewInternal("Unable to update team member role", err)
	}
	return member, nil
}

func (s *Service) InviteMember(
	ctx context.Context,
	teamID string,
	req InviteMemberRequest,
) (Invitation, error) {
	tenantContext, err := requireTenantPermission(ctx, teamID, tenant.PermissionTeamMemberInvite)
	if err != nil {
		return Invitation{}, err
	}
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return Invitation{}, apperrors.NewUnauthorized("Authentication is required")
	}
	email, err := normalizeInvitationEmail(req.Email)
	if err != nil {
		return Invitation{}, err
	}
	role := strings.TrimSpace(req.Role)
	if role == "" {
		role = RoleMember
	}
	if role != RoleAdmin && role != RoleMember {
		return Invitation{}, apperrors.NewBadRequest("Role must be admin or member")
	}
	token, err := authnz.NewSessionToken()
	if err != nil {
		return Invitation{}, apperrors.NewInternal("Unable to generate invitation token", err)
	}
	expiresAt := time.Now().UTC().Add(teamInvitationTTL)
	invitation, err := s.repository.CreateInvitation(
		ctx,
		tenantContext.TeamID,
		email,
		role,
		authnz.HashSessionToken(token),
		tenantContext.UserID,
		expiresAt,
	)
	if err != nil {
		return Invitation{}, apperrors.NewInternal("Unable to create team invitation", err)
	}
	invitation.Token = token
	team, err := s.repository.Get(ctx, tenantContext.TeamID)
	if err != nil {
		return Invitation{}, apperrors.NewInternal("Unable to load invited team", err)
	}
	if err := s.sendTeamInvitation(ctx, invitation, team, inviterDisplayName(principal)); err != nil {
		return Invitation{}, err
	}
	slog.Info(
		"team invitation created",
		"team_id",
		invitation.TeamID,
		"email",
		invitation.Email,
		"role",
		invitation.Role,
		"expires_at",
		invitation.ExpiresAt,
	)
	return invitation, nil
}

func (s *Service) sendTeamInvitation(
	ctx context.Context,
	invitation Invitation,
	team Team,
	inviterName string,
) error {
	if s.notifier == nil {
		return nil
	}
	if err := s.notifier.SendTeamInvitation(ctx, notifications.SendTeamInvitationInput{
		ToEmail:     invitation.Email,
		TeamName:    team.Name,
		InviterName: inviterName,
		Role:        invitation.Role,
		Token:       invitation.Token,
	}); err != nil {
		return apperrors.NewInternal("Unable to deliver team invitation", err)
	}
	return nil
}

func inviterDisplayName(principal authnz.Principal) string {
	name := strings.TrimSpace(principal.Name)
	if name != "" {
		return name
	}

	return strings.TrimSpace(principal.Email)
}

func (s *Service) GetInvitation(ctx context.Context, token string) (Invitation, error) {
	principal, invitation, err := s.invitationForPrincipal(ctx, token)
	if err != nil {
		return Invitation{}, err
	}
	if !strings.EqualFold(invitation.Email, principal.Email) {
		return Invitation{}, apperrors.NewForbidden(
			"Invitation does not belong to authenticated user",
		)
	}
	return invitation, nil
}

func (s *Service) AcceptInvitation(ctx context.Context, token string) (Invitation, error) {
	principal, invitation, err := s.invitationForPrincipal(ctx, token)
	if err != nil {
		return Invitation{}, err
	}
	if !strings.EqualFold(invitation.Email, principal.Email) {
		return Invitation{}, apperrors.NewForbidden(
			"Invitation does not belong to authenticated user",
		)
	}
	teamID, err := uuid.Parse(invitation.TeamID)
	if err != nil {
		return Invitation{}, apperrors.NewInternal("Unable to parse invitation team id", err)
	}
	if _, err := s.repository.GetMember(ctx, teamID, principal.UserID); err == nil {
		return Invitation{}, apperrors.NewBadRequest("User is already a team member")
	}
	accepted, err := s.repository.AcceptInvitationAndCreateMember(
		ctx,
		authnz.HashSessionToken(strings.TrimSpace(token)),
		teamID,
		principal.UserID,
		invitation.Role,
		"active",
	)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvitationNotAccepted):
			return Invitation{}, apperrors.NewBadRequest("Invitation token is invalid or expired")
		case errors.Is(err, ErrTeamMemberAlreadyExists):
			return Invitation{}, apperrors.NewBadRequest("User is already a team member")
		default:
			return Invitation{}, apperrors.NewInternal("Unable to accept invitation", err)
		}
	}
	return accepted, nil
}

func (s *Service) DeclineInvitation(ctx context.Context, token string) (Invitation, error) {
	principal, invitation, err := s.invitationForPrincipal(ctx, token)
	if err != nil {
		return Invitation{}, err
	}
	if !strings.EqualFold(invitation.Email, principal.Email) {
		return Invitation{}, apperrors.NewForbidden(
			"Invitation does not belong to authenticated user",
		)
	}
	declined, err := s.repository.DeclineInvitation(
		ctx,
		authnz.HashSessionToken(strings.TrimSpace(token)),
	)
	if err != nil {
		return Invitation{}, apperrors.NewBadRequest("Invitation token is invalid or expired")
	}
	return declined, nil
}

func (s *Service) invitationForPrincipal(
	ctx context.Context,
	token string,
) (authnz.Principal, Invitation, error) {
	principal, ok := authnz.PrincipalFromContext(ctx)
	if !ok {
		return authnz.Principal{}, Invitation{}, apperrors.NewUnauthorized(
			"Authentication is required",
		)
	}
	token = strings.TrimSpace(token)
	if token == "" {
		return authnz.Principal{}, Invitation{}, apperrors.NewBadRequest(
			"Invitation token is required",
		)
	}
	invitation, err := s.repository.GetInvitationByTokenHash(ctx, authnz.HashSessionToken(token))
	if err != nil {
		return authnz.Principal{}, Invitation{}, apperrors.NewBadRequest(
			"Invitation token is invalid or expired",
		)
	}
	return principal, invitation, nil
}

func normalizeInvitationEmail(value string) (string, error) {
	email := strings.ToLower(strings.TrimSpace(value))
	if _, err := mail.ParseAddress(email); err != nil {
		return "", apperrors.NewBadRequest("A valid invitee email is required")
	}
	return email, nil
}

func requireTenantPermission(
	ctx context.Context,
	teamID string,
	permission tenant.Permission,
) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewForbidden("Team context is required")
	}
	parsedTeamID, err := uuid.Parse(strings.TrimSpace(teamID))
	if err != nil {
		return tenant.Context{}, apperrors.NewBadRequest("Team id must be a valid UUID")
	}
	if tenantContext.TeamID != parsedTeamID {
		return tenant.Context{}, apperrors.NewForbidden("Team context does not match route")
	}
	if !tenant.Can(tenantContext.Role, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Team permission is required")
	}
	return tenantContext, nil
}
