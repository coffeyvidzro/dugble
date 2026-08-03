package email

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type sandboxAuthorizerStub struct {
	err    error
	called bool
	to     []EmailAddress
	cc     []EmailAddress
	bcc    []EmailAddress
}

func (s *sandboxAuthorizerStub) AuthorizeSandboxRecipients(
	_ context.Context,
	_ uuid.UUID,
	to, cc, bcc []EmailAddress,
) error {
	s.called = true
	s.to, s.cc, s.bcc = to, cc, bcc
	return s.err
}

func TestAuthorizeSenderRoutesOnboardingIdentityThroughSandbox(t *testing.T) {
	authorizer := &sandboxAuthorizerStub{}
	service := &Service{
		config:            ServiceConfig{DefaultProvider: "aws_ses", DefaultRegion: "eu-north-1"},
		sandboxRecipients: authorizer,
	}
	message := validatedSend{
		MessageType: MessageTypeTransactional,
		FromEmail:   platformemail.CustomerOnboardingIdentity,
		To:          []EmailAddress{{Email: "owner@example.com"}},
	}

	if err := service.authorizeSender(context.Background(), uuid.New(), &message); err != nil {
		t.Fatalf("authorize sender: %v", err)
	}
	if !authorizer.called {
		t.Fatal("sandbox recipient authorizer was not called")
	}
	if message.DeliveryRoute != platformemail.CustomerSandboxDeliveryRoute() {
		t.Fatalf("delivery route = %#v, want sandbox route", message.DeliveryRoute)
	}
	if message.Provider != "aws_ses" || message.ProviderRegion != "eu-north-1" {
		t.Fatalf("provider route = %q/%q", message.Provider, message.ProviderRegion)
	}
	if message.SenderDomainID != nil {
		t.Fatal("sandbox message must not reference a customer sender domain")
	}
}

func TestAuthorizeSenderRejectsUnverifiedSandboxTeamEmail(t *testing.T) {
	service := &Service{
		config:            ServiceConfig{DefaultProvider: "aws_ses", DefaultRegion: "eu-north-1"},
		sandboxRecipients: &sandboxAuthorizerStub{err: ErrSandboxTeamEmailNotVerified},
	}
	message := validatedSend{
		MessageType: MessageTypeTransactional,
		FromEmail:   platformemail.CustomerOnboardingIdentity,
		To:          []EmailAddress{{Email: "owner@example.com"}},
	}

	if err := service.authorizeSender(context.Background(), uuid.New(), &message); err == nil {
		t.Fatal("expected unverified team email to be rejected")
	}
}

func TestAuthorizeSenderRejectsRestrictedSandboxRecipient(t *testing.T) {
	service := &Service{
		config:            ServiceConfig{DefaultProvider: "aws_ses", DefaultRegion: "eu-north-1"},
		sandboxRecipients: &sandboxAuthorizerStub{err: ErrSandboxRecipientRestricted},
	}
	message := validatedSend{
		MessageType: MessageTypeTransactional,
		FromEmail:   platformemail.CustomerOnboardingIdentity,
		To:          []EmailAddress{{Email: "other@example.com"}},
	}

	if err := service.authorizeSender(context.Background(), uuid.New(), &message); err == nil {
		t.Fatal("expected restricted sandbox recipient to be rejected")
	}
}

func TestSandboxSentinelErrorsRemainComparable(t *testing.T) {
	if !errors.Is(ErrSandboxTeamEmailNotVerified, ErrSandboxTeamEmailNotVerified) {
		t.Fatal("unverified team email sentinel is not comparable")
	}
	if !errors.Is(ErrSandboxRecipientRestricted, ErrSandboxRecipientRestricted) {
		t.Fatal("restricted recipient sentinel is not comparable")
	}
}
