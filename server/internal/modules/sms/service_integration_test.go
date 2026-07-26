package sms_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	smsdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/sms"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
	sms "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

func openSMSTestDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	databaseURL := os.Getenv("TEST_DATABASE_URL")
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

func setupSMSBatchTest(t *testing.T, pool *pgxpool.Pool, balance int64) (uuid.UUID, *sms.Service) {
	t.Helper()
	teamID, planID, ruleID := uuid.New(), uuid.New(), uuid.New()
	planName := "sms-batch-test-" + teamID.String()
	statements := []struct {
		query string
		args  []any
	}{
		{`INSERT INTO teams (id, name) VALUES ($1, $2)`, []any{teamID, planName}},
		{`INSERT INTO sender_ids (team_id, name, country_code, purpose, status) VALUES ($1, 'DUGBLE', 'GH', 'integration test', 'approved')`, []any{teamID}},
		{`INSERT INTO sms_pricing_plans (id, name, is_default) VALUES ($1, $2, false)`, []any{planID, planName}},
		{`INSERT INTO sms_pricing_rules (id, pricing_plan_id, unit_cost_micros, destination_country) VALUES ($1, $2, 10000, 'GH')`, []any{ruleID, planID}},
		{`INSERT INTO team_sms_settings (team_id, pricing_plan_id) VALUES ($1, $2)`, []any{teamID, planID}},
		{`INSERT INTO wallets (team_id, balance) VALUES ($1, $2)`, []any{teamID, balance}},
	}
	for _, statement := range statements {
		if _, err := pool.Exec(t.Context(), statement.query, statement.args...); err != nil {
			t.Fatalf("set up SMS batch test: %v", err)
		}
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), `DELETE FROM teams WHERE id = $1`, teamID)
		_, _ = pool.Exec(context.Background(), `DELETE FROM sms_pricing_rules WHERE id = $1`, ruleID)
		_, _ = pool.Exec(context.Background(), `DELETE FROM sms_pricing_plans WHERE id = $1`, planID)
	})
	service := sms.NewService(
		sms.NewRepository(pool), nil, wallet.NewRepository(pool),
		smsdelivery.NewQueue(outbox.NewRepository(pool)),
	)
	return teamID, service
}

func smsBatchTestContext(teamID uuid.UUID) context.Context {
	return tenant.ContextWithTenant(context.Background(), tenant.Context{TeamID: teamID, Permissions: []tenant.Permission{tenant.PermissionSMSSend}})
}

func smsBatchTestRequest() sms.BatchSendRequest {
	messages := make([]sms.SendRequest, 2)
	for index := range messages {
		messages[index] = sms.SendRequest{To: fmt.Sprintf("+2332412345%02d", index), From: "DUGBLE", Body: "hello"}
	}
	return sms.BatchSendRequest{Messages: messages}
}

func TestBatchSendCommitsMessagesChargesAndEventsAtomically(t *testing.T) {
	pool := openSMSTestDatabase(t)
	teamID, service := setupSMSBatchTest(t, pool, 100_000)
	messages, err := service.BatchSend(smsBatchTestContext(teamID), smsBatchTestRequest())
	if err != nil {
		t.Fatalf("send SMS batch: %v", err)
	}
	if len(messages) != 2 {
		t.Fatalf("messages = %d, want 2", len(messages))
	}
	assertSMSBatchCounts(t, pool, teamID, 2, 2, 2, 80_000)
}

func TestBatchSendRollsBackEntireBatchWhenBalanceRunsOut(t *testing.T) {
	pool := openSMSTestDatabase(t)
	teamID, service := setupSMSBatchTest(t, pool, 15_000)
	if _, err := service.BatchSend(smsBatchTestContext(teamID), smsBatchTestRequest()); err == nil {
		t.Fatal("expected insufficient batch balance")
	}
	assertSMSBatchCounts(t, pool, teamID, 0, 0, 0, 15_000)
}

func TestScheduledSMSCanBeUpdatedAndCanceledWithAtomicRefund(t *testing.T) {
	pool := openSMSTestDatabase(t)
	teamID, service := setupSMSBatchTest(t, pool, 100_000)
	request := sms.SendRequest{To: "+233241234567", From: "DUGBLE", Body: "scheduled", ScheduledAt: "in 1 hour"}
	message, err := service.Send(smsBatchTestContext(teamID), request)
	if err != nil {
		t.Fatalf("send scheduled SMS: %v", err)
	}
	updatedAt := time.Now().UTC().Add(2 * time.Hour).Truncate(time.Microsecond)
	if _, err := service.Update(smsBatchTestContext(teamID), message.ID, sms.UpdateRequest{ScheduledAt: updatedAt.Format(time.RFC3339Nano)}); err != nil {
		t.Fatalf("update scheduled SMS: %v", err)
	}
	var messageSchedule, eventSchedule time.Time
	if err := pool.QueryRow(t.Context(), `SELECT scheduled_at FROM sms_messages WHERE id = $1`, message.ID).Scan(&messageSchedule); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT available_at FROM outbox_events WHERE aggregate_id = $1`, message.ID).Scan(&eventSchedule); err != nil {
		t.Fatal(err)
	}
	if !messageSchedule.Equal(updatedAt) || !eventSchedule.Equal(updatedAt) {
		t.Fatalf("schedules were not updated atomically")
	}
	if _, err := service.Cancel(smsBatchTestContext(teamID), message.ID); err != nil {
		t.Fatalf("cancel scheduled SMS: %v", err)
	}
	var status string
	var events, refunds int
	var balance int64
	if err := pool.QueryRow(t.Context(), `SELECT status FROM sms_messages WHERE id = $1`, message.ID).Scan(&status); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM outbox_events WHERE aggregate_id = $1`, message.ID).Scan(&events); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM wallet_transactions WHERE team_id = $1 AND transaction_type = 'refund'`, teamID).Scan(&refunds); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT balance FROM wallets WHERE team_id = $1`, teamID).Scan(&balance); err != nil {
		t.Fatal(err)
	}
	if status != sms.StatusCanceled || events != 0 || refunds != 1 || balance != 100_000 {
		t.Fatalf("status=%s events=%d refunds=%d balance=%d", status, events, refunds, balance)
	}
}

func assertSMSBatchCounts(t *testing.T, pool *pgxpool.Pool, teamID uuid.UUID, messages, events, charges int, balance int64) {
	t.Helper()
	var gotMessages, gotEvents, gotCharges int
	var gotBalance int64
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM sms_messages WHERE team_id = $1`, teamID).Scan(&gotMessages); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM outbox_events WHERE aggregate_type = 'sms_message' AND payload->>'team_id' = $1`, teamID.String()).Scan(&gotEvents); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT count(*) FROM wallet_transactions WHERE team_id = $1 AND transaction_type = 'sms_charge'`, teamID).Scan(&gotCharges); err != nil {
		t.Fatal(err)
	}
	if err := pool.QueryRow(t.Context(), `SELECT balance FROM wallets WHERE team_id = $1`, teamID).Scan(&gotBalance); err != nil {
		t.Fatal(err)
	}
	if gotMessages != messages || gotEvents != events || gotCharges != charges || gotBalance != balance {
		t.Fatalf("messages=%d events=%d charges=%d balance=%d; want %d %d %d %d", gotMessages, gotEvents, gotCharges, gotBalance, messages, events, charges, balance)
	}
}
