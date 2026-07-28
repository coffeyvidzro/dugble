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
	domainreconciliation "github.com/coffeyvidzro/dugble/server/internal/delivery/domain"
	emaildelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/email"
	smsdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/sms"
	webhookdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/webhooks"
	emailintegration "github.com/coffeyvidzro/dugble/server/internal/integration/email"
	smsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/arkesel"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/mnotify"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/routing"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/inbox"
	jetstreammessaging "github.com/coffeyvidzro/dugble/server/internal/messaging/jetstream"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
	domainmodule "github.com/coffeyvidzro/dugble/server/internal/modules/domain"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	webhookmodule "github.com/coffeyvidzro/dugble/server/internal/modules/webhooks"
	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
	platformwebhook "github.com/coffeyvidzro/dugble/server/internal/platform/webhook"
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

	processedEvents := inbox.NewRepository(db)
	emailSender, err := emailintegration.NewSESSender(startupCtx, cfg.AWS.Region, cfg.AWS.FromEmail, cfg.AWS.AccessKey, cfg.AWS.SecretKey)
	if err != nil {
		return fmt.Errorf("initialize SES email sender: %w", err)
	}
	emailConsumer := emaildelivery.NewConsumer(
		messagingClient,
		processedEvents,
		emaildelivery.NewHandler(emaildelivery.NewRepository(db), emailSender),
		emaildelivery.ConsumerConfig{
			Concurrency:    cfg.Messaging.EmailConsumerConcurrency,
			AckWait:        cfg.Messaging.EmailConsumerAckWait,
			HandlerTimeout: cfg.Messaging.EmailHandlerTimeout,
			MaxDeliver:     cfg.Messaging.EmailConsumerMaxDeliver,
			RetryPolicy:    emaildelivery.DefaultRetryPolicy(),
		},
	)
	domainRepository := domainmodule.NewRepository(db)
	domainService := domainmodule.NewService(domainRepository, emailSender, platformemail.NewNetDNSVerifier())
	domainWorkerID := "sender-domain-reconciliation-" + uuid.NewString()
	domainConsumer := domainreconciliation.NewConsumer(domainRepository, domainService, domainreconciliation.Config{
		PollInterval: cfg.DomainReconciliation.PollInterval,
		BatchSize:    cfg.DomainReconciliation.BatchSize,
		Concurrency:  cfg.DomainReconciliation.Concurrency,
		LockTimeout:  cfg.DomainReconciliation.LockTimeout,
		CheckTimeout: cfg.DomainReconciliation.CheckTimeout,
	}, domainWorkerID)

	smsRouter, err := routing.NewService(routing.DefaultConfig(), routing.NewPriorityStrategy(), arkesel.NewProvider(arkesel.NewClient(cfg.Arkesel)), mnotify.NewProvider(mnotify.NewClient(cfg.MNotify)))
	if err != nil {
		return fmt.Errorf("initialize SMS router: %w", err)
	}
	smsSender, err := smsintegration.NewService(smsRouter)
	if err != nil {
		return fmt.Errorf("initialize SMS sender: %w", err)
	}
	webhookModuleRepository := webhookmodule.NewRepository(db)
	webhookEmitter := platformwebhook.NewEmitter(webhookModuleRepository)
	smsHandler := smsdelivery.NewHandler(smsmodule.NewRepositoryWithWebhookEmitter(db, webhookEmitter), smsSender, wallet.NewRepository(db))
	smsConsumer := smsdelivery.NewConsumer(messagingClient, processedEvents, smsHandler, smsdelivery.ConsumerConfig{
		Concurrency: cfg.Messaging.SMSConsumerConcurrency, AckWait: cfg.Messaging.SMSConsumerAckWait,
		HandlerTimeout: cfg.Messaging.SMSHandlerTimeout, MaxDeliver: cfg.Messaging.SMSConsumerMaxDeliver,
	})
	outboxRelay := outbox.NewRelay(outbox.NewRepository(db), messagingClient, outbox.Config{
		PollInterval: cfg.Messaging.OutboxPollInterval, BatchSize: cfg.Messaging.OutboxBatchSize, LockTimeout: cfg.Messaging.OutboxLockTimeout,
	})
	webhookWorkerID := "webhook-delivery-" + uuid.NewString()
	webhookRepository := webhookdelivery.NewRepository(db, webhookdelivery.RepositoryConfig{AutoDisableAfter: cfg.WebhookDelivery.AutoDisableAfter})
	webhookHandler := webhookdelivery.NewHandler(webhookRepository, webhookdelivery.NewClient(cfg.WebhookDelivery.HTTPTimeout), webhookdelivery.DefaultRetryPolicy(), webhookWorkerID)
	webhookConsumer := webhookdelivery.NewConsumer(webhookRepository, webhookHandler, webhookdelivery.ConsumerConfig{
		PollInterval: cfg.WebhookDelivery.PollInterval, BatchSize: cfg.WebhookDelivery.BatchSize,
		Concurrency: cfg.WebhookDelivery.Concurrency, LockTimeout: cfg.WebhookDelivery.LockTimeout,
		HandleTimeout: cfg.WebhookDelivery.HandleTimeout,
	}, webhookWorkerID)

	type componentResult struct {
		name string
		err  error
	}
	components := []struct {
		name string
		run  func(context.Context) error
	}{
		{name: "outbox relay", run: outboxRelay.Run},
		{name: "email JetStream consumer", run: emailConsumer.Run},
		{name: "SMS JetStream consumer", run: smsConsumer.Run},
		{name: "webhook delivery consumer", run: webhookConsumer.Run},
		{name: "sender domain reconciliation consumer", run: domainConsumer.Run},
	}
	results := make(chan componentResult, len(components))
	for _, component := range components {
		go func() { results <- componentResult{name: component.name, err: component.run(ctx)} }()
	}
	slog.Info("worker started", "jetstream", "ready", "outbox_relay", "running", "email_consumer", emaildelivery.DeliverConsumerName, "sms_consumer", smsdelivery.DeliverConsumerName, "webhook_consumer", webhookWorkerID, "domain_reconciliation_consumer", domainWorkerID)
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
