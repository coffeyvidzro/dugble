package worker

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"
	"github.com/riverqueue/river/rivermigrate"
)

const DefaultMaxWorkers = 10

func NewProducer(db *pgxpool.Pool) (*river.Client[pgx.Tx], error) {
	return river.NewClient(riverpgxv5.New(db), &river.Config{})
}

func NewConsumer(db *pgxpool.Pool, workers *river.Workers, queues map[string]river.QueueConfig) (*river.Client[pgx.Tx], error) {
	if len(queues) == 0 {
		queues = map[string]river.QueueConfig{river.QueueDefault: {MaxWorkers: DefaultMaxWorkers}}
	}
	return river.NewClient(riverpgxv5.New(db), &river.Config{
		Queues:          queues,
		Workers:         workers,
		JobTimeout:      30 * time.Second,
		SoftStopTimeout: 15 * time.Second,
	})
}

func Migrate(ctx context.Context, db *pgxpool.Pool) error {
	migrator, err := rivermigrate.New(riverpgxv5.New(db), nil)
	if err != nil {
		return fmt.Errorf("create River migrator: %w", err)
	}
	if _, err := migrator.Migrate(ctx, rivermigrate.DirectionUp, nil); err != nil {
		return fmt.Errorf("run River migrations: %w", err)
	}
	return nil
}
