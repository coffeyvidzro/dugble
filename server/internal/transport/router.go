package transport

import (
	"github.com/arcjet/arcjet-go"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/redis/go-redis/v9"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/integration/fx"
	"github.com/coffeyvidzro/dugble/server/internal/integration/hubtel"
	"github.com/coffeyvidzro/dugble/server/internal/modules/auth"
	"github.com/coffeyvidzro/dugble/server/internal/modules/domain"
	emailmodule "github.com/coffeyvidzro/dugble/server/internal/modules/email"
	"github.com/coffeyvidzro/dugble/server/internal/modules/senderid"
	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/team"
	"github.com/coffeyvidzro/dugble/server/internal/modules/teamtoken"
	"github.com/coffeyvidzro/dugble/server/internal/modules/user"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
	"github.com/coffeyvidzro/dugble/server/internal/modules/webhooks"
	"github.com/coffeyvidzro/dugble/server/internal/notifications"
	"github.com/coffeyvidzro/dugble/server/internal/platform/idempotency"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	"github.com/coffeyvidzro/dugble/server/internal/transport/csrf"
	"github.com/coffeyvidzro/dugble/server/internal/transport/health"
	"github.com/coffeyvidzro/dugble/server/internal/transport/middlewares"
)

type Dependencies struct {
	DB *pgxpool.Pool
	Redis *redis.Client
	Arcjet *arcjet.Client
	Sender notifications.EmailSender
	Renderer *notifications.Renderer
	SMSSender smsmodule.Sender
	SMSDelivery smsmodule.DeliveryQueue
	EmailDelivery emailmodule.DeliveryQueue
}

func NewRouter(cfg *config.Config, deps Dependencies) (*echo.Echo, error) {
	router := echo.New()
	router.Use(middleware.RequestID())
	router.Use(middleware.RequestLogger())
	router.Use(middleware.Recover())
	router.Use(middleware.BodyLimit(12 << 20))
	router.Use(middlewares.NewCORS(cfg.CORSOrigins, cfg.IsDevelopment()))
	router.Use(middlewares.NewSecure(cfg.IsDevelopment()))
	router.Use(middlewares.Arcjet(deps.Arcjet))
	if deps.DB != nil { router.Use(middlewares.Idempotency(middlewares.IdempotencyConfig{Repository: idempotency.NewRepository(deps.DB)})) }

	healthHandler := health.NewHandler(deps.DB, deps.Redis)
	router.GET("/health", healthHandler.Live)
	router.GET("/ready", healthHandler.Ready)

	emailService := notifications.NewEmailService(deps.Sender, deps.Renderer, cfg.FrontendURL)
	sessionRepository := session.NewRepository(deps.DB)
	authRepository := auth.NewRepository(deps.DB)
	authService := auth.NewService(authRepository, sessionRepository, emailService)
	authMiddleware := middlewares.SessionAuth(middlewares.SessionAuthConfig{Sessions: sessionRepository, Users: authRepository})
	csrfConfig := middlewares.CSRFConfig{Development: cfg.IsDevelopment(), TrustedOrigins: cfg.CORSOrigins}
	csrfMiddleware := middlewares.CSRF(csrfConfig)
	csrfHandler := csrf.NewHandler()
	router.GET("/csrf", csrfHandler.Token, csrfMiddleware)

	auth.RegisterRoutes(router, auth.NewHandler(authService, cfg.IsDevelopment(), cfg.CookieDomain), authMiddleware, csrfMiddleware)
	userRepository := user.NewRepository(deps.DB)
	user.RegisterRoutes(router, user.NewHandler(user.NewService(userRepository)), authMiddleware, csrfMiddleware)

	teamRepository := team.NewRepository(deps.DB)
	teamService := team.NewService(teamRepository, emailService)
	teamTokenRepository := teamtoken.NewRepository(deps.DB)
	domainRepository := domain.NewRepository(deps.DB)
	senderIDRepository := senderid.NewRepository(deps.DB)
	smsRepository := smsmodule.NewRepository(deps.DB)
	walletRepository := wallet.NewRepository(deps.DB)
	hubtelProvider := hubtel.NewProvider(hubtel.NewClient(cfg.Hubtel))
	fxClient := fx.NewCachedProvider(fx.NewFrankfurterClient(), deps.Redis)
	tenantMiddleware := func(permission tenant.Permission) echo.MiddlewareFunc { return middlewares.Tenant(middlewares.TenantConfig{Memberships: teamRepository, Required: permission}) }

	team.RegisterRoutes(router, team.NewHandler(teamService), authMiddleware, csrfMiddleware, tenantMiddleware)
	teamtoken.RegisterRoutes(router, teamtoken.NewHandler(teamtoken.NewService(teamTokenRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)
	senderid.RegisterRoutes(router, senderid.NewHandler(senderid.NewService(senderIDRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)
	domain.RegisterRoutes(router, domain.NewHandler(domain.NewService(domainRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)

	walletService := wallet.NewService(walletRepository, wallet.ServiceConfig{FrontendURL: cfg.FrontendURL, BackendURL: cfg.BackendURL}, hubtelProvider, fxClient)
	wallet.RegisterRoutes(router, wallet.NewHandler(walletService), authMiddleware, csrfMiddleware, tenantMiddleware)

	smsService := smsmodule.NewService(smsRepository, deps.SMSSender, walletRepository, deps.SMSDelivery)
	smsmodule.RegisterRoutes(router, smsmodule.NewHandler(smsService), authMiddleware, csrfMiddleware, tenantMiddleware)

	emailServiceAPI := emailmodule.NewService(emailmodule.NewRepository(deps.DB), deps.EmailDelivery, emailmodule.ServiceConfig{DefaultFromEmail: cfg.AWS.FromEmail})
	emailmodule.RegisterRoutes(router, emailmodule.NewHandler(emailServiceAPI), authMiddleware, csrfMiddleware, tenantMiddleware)

	webhookService := webhooks.NewService(webhooks.NewRepository(deps.DB))
	webhooks.RegisterRoutes(router, webhooks.NewHandler(webhookService), authMiddleware, csrfMiddleware, tenantMiddleware)

	session.RegisterRoutes(router, session.NewHandler(session.NewService(sessionRepository)), authMiddleware, csrfMiddleware)
	return router, nil
}
