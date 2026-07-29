package email

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type configuredDeliveryQueue struct{}

var testServiceConfig = ServiceConfig{
	DefaultFromEmail: "sender@example.com",
	DefaultProvider:  "aws_ses",
	DefaultRegion:    "us-east-1",
}

func (configuredDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
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

func (q *immediateOnlyDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	q.calls++
	return nil
}

func TestEnqueueDeliveryDoesNotSilentlyIgnoreSchedule(t *testing.T) {
	queue := &immediateOnlyDeliveryQueue{}
	scheduledAt := time.Now().UTC().Add(time.Hour)
	err := enqueueDelivery(context.Background(), queue, nil, uuid.New(), uuid.New(), &scheduledAt)
	if err == nil {
		t.Fatal("expected a queue without scheduling support to return an error")
	}
	if queue.calls != 0 {
		t.Fatalf("immediate enqueue calls = %d, want 0", queue.calls)
	}
}

func TestBatchSendValidatesEntireBatchBeforeStartingTransaction(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, testServiceConfig)
	ctx := tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID:      uuid.New(),
		Permissions: []tenant.Permission{tenant.PermissionEmailSend},
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
	ctx := tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID: uuid.New(), Permissions: []tenant.Permission{tenant.PermissionEmailSend},
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
	message := validatedSend{FromEmail: "Billing@Example.COM"}

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
	err := service.authorizeSender(context.Background(), uuid.New(), &validatedSend{FromEmail: "sender@other.example"})
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
			if err := service.authorizeSender(context.Background(), uuid.New(), &validatedSend{FromEmail: "sender@example.com.invalid"}); err == nil {
				t.Fatal("expected unusable sender domain to be rejected")
			}
		})
	}
}

func TestAuthorizeSenderKeepsDefaultPlatformRoute(t *testing.T) {
	service := NewService(nil, nil, testServiceConfig)
	message := validatedSend{FromEmail: "SENDER@example.com"}
	if err := service.authorizeSender(context.Background(), uuid.New(), &message); err != nil {
		t.Fatalf("authorize default sender: %v", err)
	}
	if message.SenderDomainID != nil || message.Provider != "aws_ses" || message.ProviderRegion != "us-east-1" {
		t.Fatalf("unexpected default route: %+v", message)
	}
}
