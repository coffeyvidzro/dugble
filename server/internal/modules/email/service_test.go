package email

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type configuredDeliveryQueue struct{}

var testServiceConfig = ServiceConfig{
	DefaultFromEmail: platformemail.CustomerOnboardingIdentity,
	DefaultProvider:  "aws_ses",
	DefaultRegion:    "us-east-1",
}

func (configuredDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID, string) error {
	return nil
}

type immediateOnlyDeliveryQueue struct{ calls int }

type stubSenderDomainResolver struct {
	route      SenderDomainRoute
	err        error
	teamID     uuid.UUID
	domainName string
}

func (r *stubSenderDomainResolver) ResolveSenderDomain(_ context.Context, teamID uuid.UUID, domainName string) (SenderDomainRoute, error) {
	r.teamID, r.domainName = teamID, domainName
	return r.route, r.err
}

type stubCustomerRouteResolver struct {
	routes map[uuid.UUID]platformemail.DeliveryRoute
	teamID uuid.UUID
}

func (r *stubCustomerRouteResolver) ResolveActiveCustomerRouteTx(_ context.Context, _ pgx.Tx, teamID uuid.UUID, _, _, _ string) (platformemail.DeliveryRoute, error) {
	r.teamID = teamID
	route, ok := r.routes[teamID]
	if !ok {
		return platformemail.DeliveryRoute{}, ErrActiveEmailTenantNotFound
	}
	return route, nil
}

func (q *immediateOnlyDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID, string) error {
	q.calls++
	return nil
}

func TestEnqueueDeliveryDoesNotSilentlyIgnoreSchedule(t *testing.T) {
	queue := &immediateOnlyDeliveryQueue{}
	scheduledAt := time.Now().UTC().Add(time.Hour)
	err := enqueueDelivery(context.Background(), queue, nil, uuid.New(), uuid.New(), "us-east-1", &scheduledAt)
	if err == nil {
		t.Fatal("expected a queue without scheduling support to return an error")
	}
	if queue.calls != 0 {
		t.Fatalf("immediate enqueue calls = %d, want 0", queue.calls)
	}
}

func TestBatchSendValidatesEntireBatchBeforeStartingTransaction(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, testServiceConfig)
	ctx := tenant.ContextWithAccess(context.Background(), tenant.AccessContext{
		Actor: tenant.Actor{Type: tenant.ActorTypeTeamToken, TokenID: uuid.New()},
		Scope: tenant.Scope{TeamID: uuid.New(), Status: tenant.StatusActive, Permissions: []tenant.Permission{tenant.PermissionEmailSend}},
	})

	_, err := service.BatchSend(ctx, BatchSendRequest{Messages: []SendRequest{
		{To: EmailAddressList{{Email: "first@example.com"}}, Subject: "First", Text: "valid"},
		{To: EmailAddressList{{Email: "not-an-email"}}, Subject: "Second", Text: "invalid"},
	}})
	if err == nil {
		t.Fatal("expected the invalid second message to reject the batch")
	}
}

func TestBatchSendRejectsMoreThanOneHundredEmails(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, testServiceConfig)
	messages := make([]SendRequest, 101)
	_, err := service.BatchSend(context.Background(), BatchSendRequest{Messages: messages})
	if err == nil {
		t.Fatal("expected oversized batch to be rejected")
	}
}

func TestBatchSendRejectsAttachmentsBeforeStartingTransaction(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, testServiceConfig)
	ctx := tenant.ContextWithAccess(context.Background(), tenant.AccessContext{
		Actor: tenant.Actor{Type: tenant.ActorTypeTeamToken, TokenID: uuid.New()},
		Scope: tenant.Scope{TeamID: uuid.New(), Status: tenant.StatusActive, Permissions: []tenant.Permission{tenant.PermissionEmailSend}},
	})
	_, err := service.BatchSend(ctx, BatchSendRequest{Messages: []SendRequest{{
		To: EmailAddressList{{Email: "recipient@example.com"}}, Subject: "Attachment", Text: "body",
		Attachments: []Attachment{{Filename: "file.txt", Content: "ZmlsZQ=="}},
	}}})
	if err == nil {
		t.Fatal("expected batch attachment to be rejected")
	}
}

func TestAuthorizeSenderUsesVerifiedTeamDomainRoute(t *testing.T) {
	teamID, domainID := uuid.New(), uuid.New()
	resolver := &stubSenderDomainResolver{route: SenderDomainRoute{
		ID: domainID, Provider: "aws_ses", Region: "eu-west-1", Status: "verified", HealthStatus: "healthy",
	}}
	service := NewService(nil, nil, testServiceConfig, resolver)
	message := validatedSend{FromEmail: "Billing@Example.COM", MessageType: MessageTypeTransactional}

	if err := service.authorizeSender(context.Background(), teamID, &message); err != nil {
		t.Fatalf("authorize sender: %v", err)
	}
	if resolver.teamID != teamID || resolver.domainName != "example.com" {
		t.Fatalf("unexpected sender lookup: team=%s domain=%q", resolver.teamID, resolver.domainName)
	}
	if message.SenderDomainID == nil || *message.SenderDomainID != domainID || message.ProviderRegion != "eu-west-1" {
		t.Fatalf("unexpected resolved route: %+v", message)
	}
}

func TestAuthorizeSenderRejectsUnauthorizedDomain(t *testing.T) {
	resolver := &stubSenderDomainResolver{err: ErrSenderDomainNotFound}
	service := NewService(nil, nil, testServiceConfig, resolver)
	err := service.authorizeSender(context.Background(), uuid.New(), &validatedSend{FromEmail: "sender@other.example", MessageType: MessageTypeTransactional})
	if err == nil || !strings.Contains(err.Error(), "not authorized") {
		t.Fatalf("expected unauthorized sender error, got %v", err)
	}
}

func TestAuthorizeSenderRejectsUnverifiedDisabledOrDegradedDomain(t *testing.T) {
	for name, route := range map[string]SenderDomainRoute{
		"pending":  {Provider: "aws_ses", Region: "us-east-1", Status: "pending"},
		"disabled": {Provider: "aws_ses", Region: "us-east-1", Status: "verified", Disabled: true},
		"degraded": {Provider: "aws_ses", Region: "us-east-1", Status: "degraded", HealthStatus: "degraded"},
	} {
		t.Run(name, func(t *testing.T) {
			service := NewService(nil, nil, testServiceConfig, &stubSenderDomainResolver{route: route})
			if err := service.authorizeSender(context.Background(), uuid.New(), &validatedSend{FromEmail: "sender@example.com.invalid", MessageType: MessageTypeTransactional}); err == nil {
				t.Fatal("expected unusable sender domain to be rejected")
			}
		})
	}
}

func TestAuthorizeSenderUsesOnboardingIdentityWithoutSystemFallback(t *testing.T) {
	service := NewService(nil, nil, testServiceConfig)
	message := validatedSend{FromEmail: platformemail.CustomerOnboardingIdentity, MessageType: MessageTypeTransactional}
	if err := service.authorizeSender(context.Background(), uuid.New(), &message); err != nil {
		t.Fatalf("authorize onboarding sender: %v", err)
	}
	if message.SenderDomainID != nil || message.Provider != "aws_ses" || message.ProviderRegion != "us-east-1" {
		t.Fatalf("unexpected onboarding sender route: %+v", message)
	}
	if message.DeliveryRoute.SESTenantName == platformemail.SystemSESTenantName {
		t.Fatal("onboarding sender fell back to dugble-system")
	}
}

func TestAuthorizeSenderRejectsOnboardingMarketing(t *testing.T) {
	service := NewService(nil, nil, testServiceConfig)
	err := service.authorizeSender(context.Background(), uuid.New(), &validatedSend{
		FromEmail:   platformemail.CustomerOnboardingIdentity,
		MessageType: MessageTypeMarketing,
	})
	if err == nil {
		t.Fatal("expected onboarding identity marketing send to be rejected")
	}
}

func TestTeamScopedRouteResolverCannotReturnTeamBTenantForTeamA(t *testing.T) {
	teamA, teamB := uuid.New(), uuid.New()
	routeA, err := platformemail.CustomerDeliveryRoute("transactional", "dugble-t-team-a")
	if err != nil {
		t.Fatalf("team A route: %v", err)
	}
	routeB, err := platformemail.CustomerDeliveryRoute("transactional", "dugble-t-team-b")
	if err != nil {
		t.Fatalf("team B route: %v", err)
	}
	resolver := &stubCustomerRouteResolver{routes: map[uuid.UUID]platformemail.DeliveryRoute{teamA: routeA, teamB: routeB}}

	resolved, err := resolver.ResolveActiveCustomerRouteTx(context.Background(), nil, teamA, "aws_ses", "us-east-1", "transactional")
	if err != nil {
		t.Fatalf("resolve team A route: %v", err)
	}
	if resolver.teamID != teamA || resolved.SESTenantName != "dugble-t-team-a" {
		t.Fatalf("team A resolved foreign route: %+v", resolved)
	}
	if resolved.SESTenantName == routeB.SESTenantName {
		t.Fatal("team A resolved team B SES tenant")
	}
}
