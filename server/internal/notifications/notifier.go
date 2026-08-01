package notifications

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/url"
	"strings"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

const (
	verifyEmailTemplate     = "verify_email.html"
	forgotPasswordTemplate  = "forgot_password.html"
	passwordChangedTemplate = "password_changed.html"
	securityEventTemplate   = "security_event.html"
	accountDeletedTemplate  = "account_deleted.html"
	administrativeTemplate  = "administrative_event.html"
	teamInvitationTemplate  = "team_invitation.html"
)

type EmailService struct {
	sender      EmailSender
	renderer    *Renderer
	frontendURL string
	fromEmail   string
}

func NewEmailService(sender EmailSender, renderer *Renderer, frontendURL, fromEmail string) *EmailService {
	return &EmailService{
		sender:      sender,
		renderer:    renderer,
		frontendURL: strings.TrimRight(strings.TrimSpace(frontendURL), "/"),
		fromEmail:   strings.TrimSpace(fromEmail),
	}
}

type SendTemplateEmailInput struct {
	To           string
	Subject      string
	TemplateName string
	Data         any
}

func (s *EmailService) SendTemplateEmail(ctx context.Context, input SendTemplateEmailInput) error {
	if s == nil {
		return errors.New("email service is not configured")
	}
	if s.renderer == nil {
		return errors.New("email renderer is not configured")
	}
	if s.sender == nil {
		return errors.New("email sender is not configured")
	}
	body, err := s.renderer.Render(input.TemplateName, input.Data)
	if err != nil {
		return err
	}
	_, err = s.sender.Send(ctx, platformemail.Message{
		From:    platformemail.Address{Email: s.fromEmail, Name: "Dugble"},
		To:      []platformemail.Address{{Email: input.To}},
		Subject: input.Subject,
		HTML:    body,
	})
	if err != nil {
		slog.Warn("failed to send email", "error", err, "to", input.To, "template", input.TemplateName)
		return fmt.Errorf("send email %s to %s: %w", input.TemplateName, input.To, err)
	}
	return nil
}

func (s *EmailService) SendEmailVerification(ctx context.Context, input SendEmailVerificationInput) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: input.ToEmail, Subject: "Verify your Dugble email address", TemplateName: verifyEmailTemplate, Data: map[string]string{"Name": displayName(input.Name), "PreviewText": "Verify your dugble email address.", "VerificationURL": s.verificationURL(input.ToEmail, input.Token)}})
}

func (s *EmailService) SendPasswordReset(ctx context.Context, input SendPasswordResetInput) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: input.ToEmail, Subject: "Reset your Dugble password", TemplateName: forgotPasswordTemplate, Data: map[string]string{"Name": displayName(input.Name), "PreviewText": "Reset your dugble password.", "ResetURL": s.passwordResetURL(input.ToEmail, input.Token)}})
}

func (s *EmailService) SendPasswordChanged(ctx context.Context, input SendPasswordChangedInput) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: input.ToEmail, Subject: "Your Dugble password was changed", TemplateName: passwordChangedTemplate, Data: map[string]string{"Name": displayName(input.Name), "PreviewText": "Your dugble password was changed."}})
}

func (s *EmailService) SendEmailChanged(ctx context.Context, input SendEmailChangedInput) error {
	return s.sendSecurityEvent(ctx, input.ToEmail, input.Name, "Your Dugble email address was changed", "Your Dugble email address was changed.", "Your account email address was changed to "+input.Email+".")
}

func (s *EmailService) SendMFAEnabled(ctx context.Context, input SendSecurityEventInput) error {
	return s.sendSecurityEvent(ctx, input.ToEmail, input.Name, "Authenticator MFA was enabled", "Authenticator MFA was enabled on your Dugble account.", "Authenticator-app multi-factor authentication was enabled on your account.")
}

func (s *EmailService) SendMFADisabled(ctx context.Context, input SendSecurityEventInput) error {
	return s.sendSecurityEvent(ctx, input.ToEmail, input.Name, "Authenticator MFA was disabled", "Authenticator MFA was disabled on your Dugble account.", "Authenticator-app multi-factor authentication was disabled on your account.")
}

func (s *EmailService) SendRecoveryCodeUsed(ctx context.Context, input SendSecurityEventInput) error {
	return s.sendSecurityEvent(ctx, input.ToEmail, input.Name, "A recovery code was used", "A recovery code was used on your Dugble account.", "A recovery code was used to verify access to your account.")
}

func (s *EmailService) SendAccountDeleted(ctx context.Context, input SendSecurityEventInput) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: input.ToEmail, Subject: "Your Dugble account was deleted", TemplateName: accountDeletedTemplate, Data: map[string]string{"Name": displayName(input.Name), "PreviewText": "Your Dugble account was deleted."}})
}

func (s *EmailService) sendSecurityEvent(ctx context.Context, toEmail, name, subject, preview, message string) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: toEmail, Subject: subject, TemplateName: securityEventTemplate, Data: map[string]string{"Name": displayName(name), "PreviewText": preview, "Message": message}})
}

func (s *EmailService) SendTeamMemberRemoved(ctx context.Context, input SendTeamMemberChangedInput) error {
	return s.sendAdministrativeEvent(ctx, input.ToEmail, input.Name, "You were removed from a Dugble team", "Your Dugble team membership changed.", "You were removed from the "+input.Team+" team.")
}

func (s *EmailService) SendTeamMemberRoleChanged(ctx context.Context, input SendTeamMemberChangedInput) error {
	return s.sendAdministrativeEvent(ctx, input.ToEmail, input.Name, "Your Dugble team role changed", "Your Dugble team role changed.", "Your role on the "+input.Team+" team was changed to "+displayRole(input.Role)+".")
}

func (s *EmailService) SendTeamTokenCreated(ctx context.Context, input SendTeamTokenChangedInput) error {
	return s.sendAdministrativeEvent(ctx, input.ToEmail, input.Name, "A Dugble team token was created", "A team API token was created.", "The "+input.TokenName+" API token ("+input.TokenPrefix+") was created for team "+input.TeamID+".")
}

func (s *EmailService) SendTeamTokenRevoked(ctx context.Context, input SendTeamTokenChangedInput) error {
	return s.sendAdministrativeEvent(ctx, input.ToEmail, input.Name, "A Dugble team token was revoked", "A team API token was revoked.", "The "+input.TokenName+" API token ("+input.TokenPrefix+") was revoked for team "+input.TeamID+".")
}

func (s *EmailService) sendAdministrativeEvent(ctx context.Context, toEmail, name, subject, preview, message string) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: toEmail, Subject: subject, TemplateName: administrativeTemplate, Data: map[string]string{"Name": displayName(name), "PreviewText": preview, "Message": message}})
}

func (s *EmailService) SendTeamInvitation(ctx context.Context, input SendTeamInvitationInput) error {
	return s.SendTemplateEmail(ctx, SendTemplateEmailInput{To: input.ToEmail, Subject: "You were invited to join a dugble team", TemplateName: teamInvitationTemplate, Data: map[string]string{"Name": displayName(input.Name), "PreviewText": "You were invited to join a dugble team.", "TeamName": displayName(input.TeamName), "InviterName": displayName(input.InviterName), "Role": displayRole(input.Role), "InvitationURL": s.teamInvitationURL(input.Token)}})
}

func (s *EmailService) verificationURL(email, token string) string {
	query := url.Values{}
	query.Set("email", email)
	query.Set("token", token)
	return s.frontendURL + "/verify-email?" + query.Encode()
}

func (s *EmailService) passwordResetURL(email, token string) string {
	query := url.Values{}
	query.Set("email", email)
	query.Set("token", token)
	return s.frontendURL + "/reset-password?" + query.Encode()
}

func (s *EmailService) teamInvitationURL(token string) string {
	query := url.Values{}
	query.Set("token", token)
	return s.frontendURL + "/team-invitations?" + query.Encode()
}

func displayName(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return "there"
	}
	return name
}

func displayRole(role string) string {
	role = strings.TrimSpace(role)
	if role == "" {
		return "member"
	}
	return role
}
