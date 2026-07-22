package transport

import (
	"github.com/arcjet/arcjet-go"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/redis/go-redis/v9"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/integration/hubtel"
	"github.com/coffeyvidzro/dugble/server/internal/modules/auth"
	"github.com/coffeyvidzro/dugble/server/internal/modules/domain"
	"github.com/coffeyvidzro/dugble/server/internal/modules/senderid"
	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/modules/team"
	"github.com/coffeyvidzro/dugble/server/internal/modules/teamtoken"
	"github.com/coffeyvidzro/dugble/server/internal/modules/user"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	"github.com/coffeyvidzro/dugble/server/internal/notifications"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/coffeyvidzro/dugble/server/internal/transport/csrf"
	"github.com/coffeyvidzro/dugble/server/internal/transport/health"
	"github.com/coffeyvidzro/dugble/server/internal/transport/middlewares"
)

// Dependencies contains infrastructure required by the HTTP transport.
type Dependencies struct {
	DB       *pgxpool.Pool
	Redis    *redis.Client
	Arcjet   *arcjet.Client
	Sender   notifications.EmailSender
	Renderer *notifications.Renderer
}

// NewRouter creates and configures the HTTP router.
func NewRouter(cfg *config.Config, deps Dependencies) (*echo.Echo, error) {

	router := echo.New()

	// Global middlewares.
	router.Use(middleware.RequestID())
	router.Use(middleware.RequestLogger())
	router.Use(middleware.Recover())

	router.Use(middlewares.NewCORS(cfg.CORSOrigins, cfg.IsDevelopment()))
	router.Use(middlewares.NewSecure(cfg.IsDevelopment()))
	router.Use(middlewares.Arcjet(deps.Arcjet))

	// Public infrastructure routes.
	healthHandler := health.NewHandler(deps.DB, deps.Redis)
	router.GET("/health", healthHandler.Live)
	router.GET("/ready", healthHandler.Ready)

	emailService := notifications.NewEmailService(deps.Sender, deps.Renderer, cfg.FrontendURL)

	sessionRepository := session.NewRepository(deps.DB)
	authRepository := auth.NewRepository(deps.DB)
	authService := auth.NewService(
		authRepository,
		sessionRepository,
		emailService,
	)
	authMiddleware := middlewares.SessionAuth(middlewares.SessionAuthConfig{
		Sessions: sessionRepository,
		Users:    authRepository,
	})
	csrfMiddleware := middlewares.CSRF(
		middlewares.CSRFConfig{
			Development:    cfg.IsDevelopment(),
			TrustedOrigins: cfg.CORSOrigins,
		},
	)
	csrfHandler := csrf.NewHandler()
	router.GET("/csrf", csrfHandler.Token, csrfMiddleware)

	auth.RegisterRoutes(
		router,
		auth.NewHandler(authService, cfg.IsDevelopment()),
		authMiddleware,
		csrfMiddleware,
	)

	userRepository := user.NewRepository(deps.DB)
	userService := user.NewService(userRepository)
	user.RegisterRoutes(router, user.NewHandler(userService), authMiddleware, csrfMiddleware)

	teamRepository := team.NewRepository(deps.DB)
	teamService := team.NewService(teamRepository, emailService)
	teamTokenRepository := teamtoken.NewRepository(deps.DB)
	domainRepository := domain.NewRepository(deps.DB)
	senderIDRepository := senderid.NewRepository(deps.DB)
	walletRepository := wallet.NewRepository(deps.DB)
	hubtelProvider := hubtel.NewProvider(hubtel.NewClient(cfg.Hubtel))
	tenantMiddleware := func(permission tenant.Permission) echo.MiddlewareFunc {
		return middlewares.Tenant(
			middlewares.TenantConfig{Memberships: teamRepository, Required: permission},
		)
	}
	team.RegisterRoutes(
		router,
		team.NewHandler(teamService),
		authMiddleware,
		csrfMiddleware,
		tenantMiddleware,
	)

	teamTokenService := teamtoken.NewService(teamTokenRepository)
	teamtoken.RegisterRoutes(
		router,
		teamtoken.NewHandler(teamTokenService),
		authMiddleware,
		csrfMiddleware,
		tenantMiddleware,
	)

	senderIDService := senderid.NewService(senderIDRepository)
	senderid.RegisterRoutes(
		router,
		senderid.NewHandler(senderIDService),
		authMiddleware,
		csrfMiddleware,
		tenantMiddleware,
	)

	domainService := domain.NewService(domainRepository)
	domain.RegisterRoutes(
		router,
		domain.NewHandler(domainService),
		authMiddleware,
		csrfMiddleware,
		tenantMiddleware,
	)

	walletService := wallet.NewService(
		walletRepository,
		wallet.ServiceConfig{FrontendURL: cfg.FrontendURL, BackendURL: cfg.BackendURL},
		hubtelProvider,
	)
	wallet.RegisterRoutes(
		router,
		wallet.NewHandler(walletService),
		authMiddleware,
		csrfMiddleware,
		tenantMiddleware,
	)

	sessionService := session.NewService(sessionRepository)
	session.RegisterRoutes(
		router,
		session.NewHandler(sessionService),
		authMiddleware,
		csrfMiddleware,
	)

	return router, nil
}
