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
