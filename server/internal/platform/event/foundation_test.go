package event

import (
	"context"
	"encoding/json"
	"reflect"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

func TestSubscribableTypesPreservesExistingWebhookCatalog(t *testing.T) {
	want := []string{"sms.submitted", "sms.sent", "sms.delivered", "sms.undelivered", "sms.failed", "email.submitted", "email.delivered", "email.delayed", "email.bounced", "email.complained", "email.rejected", "email.failed", "email.opened", "email.clicked", "email.subscription_changed"}
	if got := SubscribableTypes(); !reflect.DeepEqual(got, want) {
		t.Fatalf("SubscribableTypes() = %v, want %v", got, want)
	}
}

func TestVerificationEventsAreKnownButNotYetSubscribable(t *testing.T) {
	definition, ok := Lookup(TypeVerificationCreated)
	if !ok || definition.ObjectType != "verification" || !definition.ObjectIDRequired {
		t.Fatalf("verification definition = %+v, found = %t", definition, ok)
	}
	if IsSubscribable(TypeVerificationCreated) {
		t.Fatal("verification.created should not be subscribable before Verify delivery is activated")
	}
}

func TestEnvelopeNormalizeAppliesDefaults(t *testing.T) {
	teamID := uuid.New()
	objectID := uuid.New()
	now := time.Date(2026, time.August, 4, 12, 30, 0, 0, time.FixedZone("test", 2*60*60))
	normalized, err := (Envelope{Type: Type(" sms.sent "), TeamID: teamID, ObjectType: " sms ", ObjectID: &objectID, Data: json.RawMessage(`{"status":"sent"}`)}).Normalize(func() time.Time { return now })
	if err != nil {
		t.Fatalf("Normalize() error = %v", err)
	}
	if normalized.ID == uuid.Nil || normalized.Version != CurrentVersion || normalized.Type != TypeSMSSent || normalized.ObjectType != "sms" {
		t.Fatalf("Normalize() = %+v", normalized)
	}
	if !normalized.OccurredAt.Equal(now.UTC()) || normalized.OccurredAt.Location() != time.UTC {
		t.Fatalf("Normalize().OccurredAt = %v, want %v", normalized.OccurredAt, now.UTC())
	}
}

func TestEnvelopeValidateRejectsInvalidShape(t *testing.T) {
	objectID := uuid.New()
	envelope := Envelope{ID: uuid.New(), Type: TypeEmailDelivered, Version: CurrentVersion, TeamID: uuid.New(), ObjectType: "sms", ObjectID: &objectID, Data: json.RawMessage(`{}`), OccurredAt: time.Now().UTC()}
	if err := envelope.Validate(); err == nil {
		t.Fatal("Validate() accepted a mismatched object type")
	}
	envelope.ObjectType = "email"
	envelope.Data = json.RawMessage(`[]`)
	if err := envelope.Validate(); err == nil {
		t.Fatal("Validate() accepted non-object data")
	}
}

type testSink struct{}
func (testSink) EmitTx(context.Context, pgx.Tx, Envelope) (Result, error) { return Result{}, nil }

func TestEmitterRequiresConfigurationAndTransaction(t *testing.T) {
	var emitter *Emitter
	if _, err := emitter.EmitTx(context.Background(), nil, Envelope{}); err == nil {
		t.Fatal("EmitTx() accepted a nil emitter")
	}
	if _, err := NewEmitter(testSink{}).EmitTx(context.Background(), nil, Envelope{}); err == nil {
		t.Fatal("EmitTx() accepted a nil transaction")
	}
}
