package notifications

import "context"

type EmailMessage struct {
	MessageID string
	To        string
	Subject   string
	Body      string
}

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

type EmailSender interface {
	Send(ctx context.Context, msg EmailMessage) error
}
