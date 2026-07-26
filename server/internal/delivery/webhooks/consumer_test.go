package webhookdelivery

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

type claimStoreFunc func(context.Context, string, int32, time.Time) ([]ClaimedDelivery, error)

func (f claimStoreFunc) Claim(ctx context.Context, workerID string, limit int32, staleBefore time.Time) ([]ClaimedDelivery, error) {
	return f(ctx, workerID, limit, staleBefore)
}

type deliveryHandlerFunc func(context.Context, ClaimedDelivery) error

func (f deliveryHandlerFunc) Handle(ctx context.Context, delivery ClaimedDelivery) error {
	return f(ctx, delivery)
}

func TestProcessBatchStopsWaitingForSemaphoreWhenCanceled(t *testing.T) {
	store := claimStoreFunc(func(context.Context, string, int32, time.Time) ([]ClaimedDelivery, error) {
		return []ClaimedDelivery{{}, {}}, nil
	})
	started := make(chan struct{}, 2)
	release := make(chan struct{})
	var calls atomic.Int32
	handler := deliveryHandlerFunc(func(context.Context, ClaimedDelivery) error {
		calls.Add(1)
		started <- struct{}{}
		<-release
		return nil
	})
	consumer := NewConsumer(store, handler, ConsumerConfig{Concurrency: 1})
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		_, err := consumer.processBatch(ctx)
		done <- err
	}()

	<-started
	cancel()
	close(release)

	if err := <-done; !errors.Is(err, context.Canceled) {
		t.Fatalf("processBatch() error = %v, want context.Canceled", err)
	}
	if got := calls.Load(); got != 1 {
		t.Fatalf("Handle() calls = %d, want 1", got)
	}
}
