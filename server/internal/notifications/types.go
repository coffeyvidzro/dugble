package notifications

import platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"

type Recipient struct {
	Name  string
	Email string
}

type SendEmailVerificationInput struct {
	ToEmail string
	Name    string
	Token   string
}

type SendPasswordResetInput struct {
	ToEmail string
	Name    string
	Token   string
}

type SendPasswordChangedInput struct {
	ToEmail string
	Name    string
}

type SendTeamInvitationInput struct {
	ToEmail     string
	Name        string
	TeamName    string
	InviterName string
	Role        string
	Token       string
}

type EmailSender = platformemail.Sender
