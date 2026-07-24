package backoffice

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/modules/auth"
	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/transport/middlewares"
)

type Dependencies struct {
	DB *pgxpool.Pool
}

func NewRouter(cfg *config.Config, deps Dependencies) (*echo.Echo, error) {
	router := echo.New()

	renderer, err := NewRenderer()
	if err != nil {
		return nil, fmt.Errorf("create backoffice renderer: %w", err)
	}
	router.Renderer = renderer

	router.Use(middleware.RequestID())
	router.Use(middleware.RequestLogger())
	router.Use(middleware.Recover())
	router.Use(middlewares.NewSecure(cfg.IsDevelopment()))

	if err := RegisterAssets(router); err != nil {
		return nil, fmt.Errorf("register backoffice assets: %w", err)
	}

	healthHandler := NewHealthHandler(deps.DB)
	router.GET("/health", healthHandler.Live)
	router.GET("/ready", healthHandler.Ready)

	sessionRepository := session.NewRepository(deps.DB)
	authRepository := auth.NewRepository(deps.DB)
	authMiddleware := middlewares.SessionAuth(middlewares.SessionAuthConfig{
		Sessions: sessionRepository,
		Users:    authRepository,
	})

	handler := NewHandler(NewRepository(deps.DB))

	protected := router.Group("")
	protected.Use(authMiddleware)
	protected.Use(RequireAdmin(cfg.Backoffice.AdminEmails))

	protected.GET("/", handler.Dashboard)
	protected.GET("/users", handler.Users)
	protected.GET("/users/:id", handler.UserDetail)
	protected.GET("/teams", handler.Teams)
	protected.GET("/teams/:id", handler.TeamDetail)
	protected.GET("/sms", handler.SMSMessages)
	protected.GET("/sms/:id", handler.SMSDetail)
	protected.GET("/wallets", handler.Wallets)
	protected.GET("/sender-ids", handler.SenderIDs)
	protected.GET("/domains", handler.Domains)

	return router, nil
}
