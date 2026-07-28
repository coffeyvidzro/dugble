package domainreconciliation

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/google/uuid"

	domainmodule "github.com/coffeyvidzro/dugble/server/internal/modules/domain"
)

type repository interface {
	ClaimPendingReconciliations(context.Context, string, int32, time.Time) ([]domainmodule.ReconciliationClaim, error)
	CompleteReconciliation(context.Context, uuid.UUID, string, string, []domainmodule.VerificationRecord, time.Time) (domainmodule.SenderDomain, error)
	RecordReconciliationFailure(context.Context, uuid.UUID, string, error, time.Time) (domainmodule.SenderDomain, error)
}

type checker interface {
	Check(context.Context, domainmodule.SenderDomain) (domainmodule.ReconciliationResult, error)
}

type Config struct {
	PollInterval time.Duration
	BatchSize    int32
	Concurrency  int
	LockTimeout  time.Duration
	CheckTimeout time.Duration
}

type Consumer struct {
	repository repository
	checker    checker
	config     Config
	workerID   string
	now        func() time.Time
}

func NewConsumer(repository repository, checker checker, config Config, workerID string) *Consumer {
	return &Consumer{repository: repository, checker: checker, config: config, workerID: workerID, now: func() time.Time { return time.Now().UTC() }}
}

func (c *Consumer) Run(ctx context.Context) error {
	if c == nil || c.repository == nil || c.checker == nil {
		return errors.New("sender domain reconciliation consumer is not configured")
	}
	if c.workerID == "" || c.config.PollInterval <= 0 || c.config.BatchSize <= 0 || c.config.Concurrency <= 0 || c.config.LockTimeout <= 0 || c.config.CheckTimeout <= 0 {
		return errors.New("sender domain reconciliation configuration is invalid")
	}
	ticker := time.NewTicker(c.config.PollInterval)
	defer ticker.Stop()
	for {
		if err := c.poll(ctx); err != nil && !errors.Is(err, context.Canceled) {
			slog.Error("sender domain reconciliation poll failed", "error", err)
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}

func (c *Consumer) poll(ctx context.Context) error {
	now := c.now()
	claims, err := c.repository.ClaimPendingReconciliations(ctx, c.workerID, c.config.BatchSize, now.Add(-c.config.LockTimeout))
	if err != nil {
		return err
	}
	semaphore := make(chan struct{}, c.config.Concurrency)
	var wait sync.WaitGroup
	for _, claim := range claims {
		claim := claim
		wait.Add(1)
		go func() {
			defer wait.Done()
			select {
			case semaphore <- struct{}{}:
				defer func() { <-semaphore }()
			case <-ctx.Done():
				return
			}
			if err := c.reconcile(ctx, claim); err != nil && !errors.Is(err, context.Canceled) {
				slog.Error("sender domain reconciliation failed", "domain_id", claim.Domain.ID, "attempt", claim.Attempt, "error", err)
			}
		}()
	}
	wait.Wait()
	return ctx.Err()
}

func (c *Consumer) reconcile(ctx context.Context, claim domainmodule.ReconciliationClaim) error {
	id, err := uuid.Parse(claim.Domain.ID)
	if err != nil {
		return fmt.Errorf("parse sender domain id: %w", err)
	}
	checkCtx, cancel := context.WithTimeout(ctx, c.config.CheckTimeout)
	defer cancel()
	result, checkErr := c.checker.Check(checkCtx, claim.Domain)
	nextCheckAt := c.now().Add(nextCheckDelay(claim.Attempt, id))
	if checkErr != nil {
		_, recordErr := c.repository.RecordReconciliationFailure(ctx, id, c.workerID, checkErr, nextCheckAt)
		return errors.Join(checkErr, recordErr)
	}
	_, err = c.repository.CompleteReconciliation(ctx, id, c.workerID, result.Status, result.VerificationRecords, nextCheckAt)
	return err
}

func nextCheckDelay(attempt int32, id uuid.UUID) time.Duration {
	var delay time.Duration
	switch attempt {
	case 0, 1:
		delay = time.Minute
	case 2:
		delay = 2 * time.Minute
	case 3:
		delay = 5 * time.Minute
	case 4:
		delay = 10 * time.Minute
	case 5:
		delay = 30 * time.Minute
	default:
		delay = time.Hour << min(attempt-6, 2)
		if delay > 6*time.Hour {
			delay = 6 * time.Hour
		}
	}
	jitterPercent := int(id[0])%21 - 10
	return delay + time.Duration(jitterPercent)*delay/100
}
