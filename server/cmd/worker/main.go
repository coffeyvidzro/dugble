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

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/database"
	smsdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/sms"
	webhookdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/webhooks"
	smsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/arkesel"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/mnotify"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/routing"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/inbox"
	jetstreammessaging "github.com/coffeyvidzro/dugble/server/internal/messaging/jetstream"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
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

	smsHandler := smsdelivery.NewHandler(
		smsmodule.NewRepository(db),
		smsSender,
		wallet.NewRepository(db),
	)
	smsConsumer := smsdelivery.NewConsumer(
		messagingClient,
		inbox.NewRepository(db),
		smsHandler,
		smsdelivery.ConsumerConfig{
			Concurrency:    cfg.Messaging.SMSConsumerConcurrency,
			AckWait:        cfg.Messaging.SMSConsumerAckWait,
			HandlerTimeout: cfg.Messaging.SMSHandlerTimeout,
			MaxDeliver:     cfg.Messaging.SMSConsumerMaxDeliver,
		},
	)

	outboxRelay := outbox.NewRelay(
		outbox.NewRepository(db),
		messagingClient,
		outbox.Config{
			PollInterval: cfg.Messaging.OutboxPollInterval,
			BatchSize:    cfg.Messaging.OutboxBatchSize,
			LockTimeout:  cfg.Messaging.OutboxLockTimeout,
		},
	)

	webhookWorkerID := "webhook-delivery-" + uuid.NewString()
	webhookRepository := webhookdelivery.NewRepository(db)
	webhookHandler := webhookdelivery.NewHandler(
		webhookRepository,
		webhookdelivery.NewClient(cfg.WebhookDelivery.HTTPTimeout),
		webhookdelivery.DefaultRetryPolicy(),
		webhookWorkerID,
	)
	webhookConsumer := webhookdelivery.NewConsumer(
		webhookRepository,
		webhookHandler,
		webhookdelivery.ConsumerConfig{
			PollInterval:  cfg.WebhookDelivery.PollInterval,
			BatchSize:     cfg.WebhookDelivery.BatchSize,
			Concurrency:   cfg.WebhookDelivery.Concurrency,
			LockTimeout:   cfg.WebhookDelivery.LockTimeout,
			HandleTimeout: cfg.WebhookDelivery.HandleTimeout,
		},
		webhookWorkerID,
	)

	type componentResult struct {
		name string
		err  error
	}
	components := []struct {
		name string
		run  func(context.Context) error
	}{
		{name: "outbox relay", run: outboxRelay.Run},
		{name: "SMS JetStream consumer", run: smsConsumer.Run},
		{name: "webhook delivery consumer", run: webhookConsumer.Run},
	}
	results := make(chan componentResult, len(components))
	for _, component := range components {
		go func() {
			results <- componentResult{name: component.name, err: component.run(ctx)}
		}()
	}

	slog.Info(
		"worker started",
		"jetstream", "ready",
		"outbox_relay", "running",
		"sms_consumer", smsdelivery.DeliverConsumerName,
		"webhook_consumer", webhookWorkerID,
	)

	completed := 0
	var runErr error
	select {
	case <-ctx.Done():
		stop()
	case result := <-results:
		completed++
		if result.err != nil && !errors.Is(result.err, context.Canceled) {
			runErr = errors.Join(runErr, fmt.Errorf("run %s: %w", result.name, result.err))
		}
		stop()
	}

	shutdownTimer := time.NewTimer(30 * time.Second)
	defer shutdownTimer.Stop()
	for completed < len(components) {
		select {
		case result := <-results:
			completed++
			if result.err != nil && !errors.Is(result.err, context.Canceled) {
				runErr = errors.Join(runErr, fmt.Errorf("run %s: %w", result.name, result.err))
			}
		case <-shutdownTimer.C:
			runErr = errors.Join(runErr, errors.New("worker components did not stop within 30 seconds"))
			completed = len(components)
		}
	}

	slog.Info("worker stopped")
	return runErr
}
