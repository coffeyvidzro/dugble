package email

import (
	"context"
	"errors"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	emaildelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/email"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const emailTestDatabaseEnv = "TEST_DATABASE_URL"

func openEmailTestDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	databaseURL := os.Getenv(emailTestDatabaseEnv)
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set; skipping PostgreSQL integration test")
	}
	pool, err := pgxpool.New(t.Context(), databaseURL)
	if err != nil {
		t.Fatalf("open PostgreSQL test database: %v", err)
	}
	if err := pool.Ping(t.Context()); err != nil {
		pool.Close()
		t.Fatalf("ping PostgreSQL test database: %v", err)
	}
	t.Cleanup(pool.Close)
	return pool
}

func createEmailTestTeam(t *testing.T, pool *pgxpool.Pool) uuid.UUID {
	t.Helper()
	teamID := uuid.New()
	if _, err := pool.Exec(t.Context(), `INSERT INTO teams (id, name) VALUES ($1, $2)`, teamID, "email-integration-"+teamID.String()); err != nil {
		t.Fatalf("create test team (has the test database been migrated?): %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), `DELETE FROM outbox_events WHERE aggregate_type = 'email_message' AND payload->>'team_id' = $1`, teamID.String())
		_, _ = pool.Exec(context.Background(), `DELETE FROM teams WHERE id = $1`, teamID)
	})
	return teamID
}

func emailTestContext(teamID uuid.UUID) context.Context {
	return tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID: teamID, Permissions: []tenant.Permission{tenant.PermissionEmailRead, tenant.PermissionEmailSend},
	})
}

func emailTestRequest(recipient string) SendRequest {
	return SendRequest{To: EmailAddressList{{Email: recipient}}, Subject: "Integration test", Text: "queued only"}
}

func TestSendPersistsMessageAndMatchingOutboxEventAtomically(t *testing.T) {
	pool := openEmailTestDatabase(t)
	teamID := createEmailTestTeam(t, pool)
	queue := emaildelivery.NewQueue(outbox.NewRepository(pool))
	service := NewService(NewRepository(pool), queue, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	message, err := service.Send(emailTestContext(teamID), emailTestRequest("recipient@example.com"))
	if err != nil {
		t.Fatalf("send email: %v", err)
	}

	messageID := uuid.MustParse(message.ID)
	var messageCount, eventCount int
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM email_messages WHERE id = $1 AND team_id = $2 AND status = 'queued'`, messageID, teamID).Scan(&messageCount); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM outbox_events WHERE aggregate_type = 'email_message' AND aggregate_id = $1 AND subject = $2`, messageID, emaildelivery.DeliverSubject).Scan(&eventCount); err != nil {
		t.Fatal(err)
	}
	if messageCount != 1 || eventCount != 1 {
		t.Fatalf("message rows = %d, outbox rows = %d; want 1 and 1", messageCount, eventCount)
	}
}

type failingEmailQueue struct{ err error }

func (q failingEmailQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	return q.err
}

func TestSendOutboxFailureRollsBackMessage(t *testing.T) {
	pool := openEmailTestDatabase(t)
	teamID := createEmailTestTeam(t, pool)
	service := NewService(NewRepository(pool), failingEmailQueue{err: errors.New("outbox unavailable")}, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	if _, err := service.Send(emailTestContext(teamID), emailTestRequest("recipient@example.com")); err == nil {
		t.Fatal("expected outbox failure")
	}
	assertEmailTestCounts(t, pool, teamID, 0, 0)
}

type recordingEmailQueue struct{ calls int }

func (q *recordingEmailQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	q.calls++
	return nil
}

func TestSendInsertFailureDoesNotEnqueueOutboxEvent(t *testing.T) {
	pool := openEmailTestDatabase(t)
	teamID := createEmailTestTeam(t, pool)
	const triggerName = "email_integration_force_insert_failure"
	const functionName = "email_integration_reject_insert"
	_, err := pool.Exec(t.Context(), `
		CREATE OR REPLACE FUNCTION `+functionName+`() RETURNS trigger LANGUAGE plpgsql AS $$
		BEGIN
			IF NEW.subject = 'force database failure' THEN
				RAISE EXCEPTION 'forced email insert failure';
			END IF;
			RETURN NEW;
		END $$;
		CREATE TRIGGER `+triggerName+` BEFORE INSERT ON email_messages
		FOR EACH ROW EXECUTE FUNCTION `+functionName+`();
	`)
	if err != nil {
		t.Fatalf("install failure trigger: %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), `DROP TRIGGER IF EXISTS `+triggerName+` ON email_messages`)
		_, _ = pool.Exec(context.Background(), `DROP FUNCTION IF EXISTS `+functionName+`()`)
	})

	queue := &recordingEmailQueue{}
	service := NewService(NewRepository(pool), queue, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	request := emailTestRequest("recipient@example.com")
	request.Subject = "force database failure"
	if _, err := service.Send(emailTestContext(teamID), request); err == nil {
		t.Fatal("expected forced email insert failure")
	}
	if queue.calls != 0 {
		t.Fatalf("outbox queue calls = %d, want 0", queue.calls)
	}
	assertEmailTestCounts(t, pool, teamID, 0, 0)
}

type failAfterEmailQueue struct {
	queue *emaildelivery.Queue
	calls int
}

func (q *failAfterEmailQueue) EnqueueEmailDeliveryTx(ctx context.Context, tx pgx.Tx, messageID, teamID uuid.UUID) error {
	q.calls++
	if err := q.queue.EnqueueEmailDeliveryTx(ctx, tx, messageID, teamID); err != nil {
		return err
	}
	if q.calls == 2 {
		return errors.New("fail second outbox operation")
	}
	return nil
}

func TestBatchFailureRollsBackEveryMessageAndEvent(t *testing.T) {
	pool := openEmailTestDatabase(t)
	teamID := createEmailTestTeam(t, pool)
	queue := &failAfterEmailQueue{queue: emaildelivery.NewQueue(outbox.NewRepository(pool))}
	service := NewService(NewRepository(pool), queue, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	_, err := service.BatchSend(emailTestContext(teamID), BatchSendRequest{Messages: []SendRequest{
		emailTestRequest("first@example.com"), emailTestRequest("second@example.com"),
	}})
	if err == nil {
		t.Fatal("expected second outbox operation to fail")
	}
	assertEmailTestCounts(t, pool, teamID, 0, 0)
}

func TestGetDoesNotExposeAnotherTeamsMessage(t *testing.T) {
	pool := openEmailTestDatabase(t)
	teamA := createEmailTestTeam(t, pool)
	teamB := createEmailTestTeam(t, pool)
	service := NewService(NewRepository(pool), emaildelivery.NewQueue(outbox.NewRepository(pool)), ServiceConfig{DefaultFromEmail: "sender@example.com"})

	message, err := service.Send(emailTestContext(teamA), emailTestRequest("recipient@example.com"))
	if err != nil {
		t.Fatalf("send team A email: %v", err)
	}
	if _, err := service.Get(emailTestContext(teamB), message.ID); err == nil {
		t.Fatal("expected cross-team get to return not found")
	} else {
		var appErr *apperrors.AppError
		if !errors.As(err, &appErr) || appErr.Status != 404 {
			t.Fatalf("cross-team get error = %v, want not found", err)
		}
	}
}

func assertEmailTestCounts(t *testing.T, pool *pgxpool.Pool, teamID uuid.UUID, wantMessages, wantEvents int) {
	t.Helper()
	var messages, events int
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM email_messages WHERE team_id = $1`, teamID).Scan(&messages); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM outbox_events WHERE aggregate_type = 'email_message' AND payload->>'team_id' = $1`, teamID.String()).Scan(&events); err != nil {
		t.Fatal(err)
	}
	if messages != wantMessages || events != wantEvents {
		t.Fatalf("message rows = %d, event rows = %d; want %d and %d", messages, events, wantMessages, wantEvents)
	}
}
