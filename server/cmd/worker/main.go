package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/riverqueue/river"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/database"
	smsdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/sms"
	smsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/arkesel"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/mnotify"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/routing"
	jetstreammessaging "github.com/coffeyvidzro/dugble/server/internal/messaging/jetstream"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	"github.com/coffeyvidzro/dugble/server/internal/worker"
)

func main() {
	if err := run(); err != nil {
		slog.Error("worker stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load configuration: %w", err)
	}

	startupCtx, cancelStartup := context.WithTimeout(ctx, 15*time.Second)
	defer cancelStartup()

	db, err := database.NewPostgres(startupCtx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("initialize PostgreSQL: %w", err)
	}
	defer db.Close()

	if err := worker.Migrate(startupCtx, db); err != nil {
		return fmt.Errorf("migrate River schema: %w", err)
	}

	messagingClient, err := jetstreammessaging.New(startupCtx, cfg.Messaging.URL, "dugble-worker")
	if err != nil {
		return fmt.Errorf("initialize JetStream: %w", err)
	}
	defer func() {
		if closeErr := messagingClient.Close(); closeErr != nil {
			slog.Warn("close JetStream client", "error", closeErr)
		}
	}()

	if err := messagingClient.Provision(startupCtx, jetstreammessaging.DefaultStreamLimits()); err != nil {
		return fmt.Errorf("provision JetStream topology: %w", err)
	}

	smsRouter, err := routing.NewService(
		routing.DefaultConfig(),
		routing.NewPriorityStrategy(),
		arkesel.NewProvider(arkesel.NewClient(cfg.Arkesel)),
		mnotify.NewProvider(mnotify.NewClient(cfg.MNotify)),
	)
	if err != nil {
		return fmt.Errorf("initialize SMS router: %w", err)
	}

	smsSender, err := smsintegration.NewService(smsRouter)
	if err != nil {
		return fmt.Errorf("initialize SMS sender: %w", err)
	}

	workers := river.NewWorkers()
	river.AddWorker(workers, smsdelivery.NewWorker(
		smsmodule.NewRepository(db),
		smsSender,
		wallet.NewRepository(db),
	))

	riverClient, err := worker.NewConsumer(db, workers, map[string]river.QueueConfig{
		smsdelivery.DeliverQueue: {MaxWorkers: worker.DefaultMaxWorkers},
	})
	if err != nil {
		return fmt.Errorf("initialize River consumer: %w", err)
	}

	if err := riverClient.Start(ctx); err != nil {
		return fmt.Errorf("start River worker: %w", err)
	}

	outboxRelay := outbox.NewRelay(
		outbox.NewRepository(db),
		messagingClient,
		outbox.Config{
			PollInterval: cfg.Messaging.OutboxPollInterval,
			BatchSize:    cfg.Messaging.OutboxBatchSize,
			LockTimeout:  cfg.Messaging.OutboxLockTimeout,
		},
	)
	relayErrors := make(chan error, 1)
	go func() {
		relayErrors <- outboxRelay.Run(ctx)
	}()

	slog.Info("worker started", "jetstream", "ready", "outbox_relay", "running")

	var runErr error
	select {
	case <-ctx.Done():
	case relayErr := <-relayErrors:
		if relayErr != nil && !errors.Is(relayErr, context.Canceled) {
			runErr = fmt.Errorf("run outbox relay: %w", relayErr)
		}
		stop()
	}

	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancelShutdown()
	if err := riverClient.Stop(shutdownCtx); err != nil {
		return errors.Join(runErr, fmt.Errorf("stop River worker: %w", err))
	}

	slog.Info("worker stopped")
	return runErr
}
