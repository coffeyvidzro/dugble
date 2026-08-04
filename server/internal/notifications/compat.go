// Package notifications preserves the previous import path while callers migrate to platform/systemmail.
// Deprecated: import github.com/coffeyvidzro/dugble/server/internal/platform/systemmail instead.
package notifications

import systemmail "github.com/coffeyvidzro/dugble/server/internal/platform/systemmail"

type (
	Recipient                    = systemmail.Recipient
	SendEmailVerificationInput   = systemmail.SendEmailVerificationInput
	SendPasswordResetInput       = systemmail.SendPasswordResetInput
	SendPasswordChangedInput     = systemmail.SendPasswordChangedInput
	SendEmailChangedInput        = systemmail.SendEmailChangedInput
	SendSecurityEventInput       = systemmail.SendSecurityEventInput
	SendNewLoginInput            = systemmail.SendNewLoginInput
	SendTeamMemberChangedInput   = systemmail.SendTeamMemberChangedInput
	SendTeamTokenChangedInput    = systemmail.SendTeamTokenChangedInput
	SendTeamInvitationInput      = systemmail.SendTeamInvitationInput
	EmailSender                  = systemmail.EmailSender
	EmailService                 = systemmail.EmailService
	SendTemplateEmailInput       = systemmail.SendTemplateEmailInput
	Renderer                     = systemmail.Renderer
)

var (
	NewEmailService = systemmail.NewEmailService
	NewRenderer     = systemmail.NewRenderer
)
