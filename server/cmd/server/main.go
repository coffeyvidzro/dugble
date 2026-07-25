package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/database"
	smsdelivery "github.com/coffeyvidzro/dugble/server/internal/delivery/sms"
	"github.com/coffeyvidzro/dugble/server/internal/integration/email"
	"github.com/coffeyvidzro/dugble/server/internal/integration/security"
	smsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/arkesel"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider/mnotify"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/routing"
	"github.com/coffeyvidzro/dugble/server/internal/notifications"
	"github.com/coffeyvidzro/dugble/server/internal/platform/cache"
	"github.com/coffeyvidzro/dugble/server/internal/transport"
	"github.com/coffeyvidzro/dugble/server/internal/worker"
)

func main() {
	if err := run(); err != nil {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load configuration: %w", err)
	}

	startupCtx, cancelStartup := context.WithTimeout(
		ctx,
		15*time.Second,
	)
	defer cancelStartup()

	db, err := database.NewPostgres(
		startupCtx,
		cfg.DatabaseURL,
	)
	if err != nil {
		return fmt.Errorf("initialize PostgreSQL: %w", err)
	}
	defer db.Close()

	if err := worker.Migrate(startupCtx, db); err != nil {
		return fmt.Errorf("migrate River schema: %w", err)
	}

	riverClient, err := worker.NewProducer(db)
	if err != nil {
		return fmt.Errorf("initialize River producer: %w", err)
	}

	redisClient, err := cache.NewRedis(
		startupCtx,
		cfg.RedisURL,
	)
	if err != nil {
		return fmt.Errorf("initialize Redis: %w", err)
	}
	defer func() {
		if err := redisClient.Close(); err != nil {
			slog.Warn("close Redis client", "error", err)
		}
	}()

	arcjetClient, err := security.NewClient(cfg.ArcjetKey)
	if err != nil {
		return fmt.Errorf("initialize Arcjet: %w", err)
	}

	renderer, err := notifications.NewRenderer()
	if err != nil {
		return fmt.Errorf("initialize email renderer: %w", err)
	}

	notificationSender, err := email.NewSESSender(
		ctx,
		cfg.AWS.Region,
		cfg.AWS.FromEmail,
		cfg.AWS.AccessKey,
		cfg.AWS.SecretKey,
	)
	if err != nil {
		return fmt.Errorf("initialize SES email sender: %w", err)
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

	router, err := transport.NewRouter(
		cfg,
		transport.Dependencies{
			DB:          db,
			Redis:       redisClient,
			Arcjet:      arcjetClient,
			Sender:      notificationSender,
			Renderer:    renderer,
			SMSSender:   smsSender,
			SMSDelivery: smsdelivery.NewQueue(riverClient),
		},
	)
	if err != nil {
		return fmt.Errorf("create HTTP router: %w", err)
	}

	server := echo.StartConfig{
		Address:         ":" + cfg.HTTPPort,
		HideBanner:      true,
		HidePort:        true,
		GracefulTimeout: 15 * time.Second,

		BeforeServeFunc: func(httpServer *http.Server) error {
			httpServer.ReadHeaderTimeout = 5 * time.Second
			httpServer.ReadTimeout = 15 * time.Second
			httpServer.WriteTimeout = 30 * time.Second
			httpServer.IdleTimeout = 60 * time.Second

			return nil
		},

		OnShutdownError: func(err error) {
			slog.Error(
				"HTTP server graceful shutdown failed",
				"error", err,
			)
		},
	}

	slog.Info(
		"starting HTTP server",
		"address", server.Address,
	)

	if err := server.Start(ctx, router); err != nil {
		return fmt.Errorf("run HTTP server: %w", err)
	}

	slog.Info("HTTP server stopped")

	return nil
}
