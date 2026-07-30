package transport

import (
	"github.com/arcjet/arcjet-go"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/redis/go-redis/v9"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/modules/auditevent"
	"github.com/coffeyvidzro/dugble/server/internal/modules/auth"
	"github.com/coffeyvidzro/dugble/server/internal/modules/domain"
	emailmodule "github.com/coffeyvidzro/dugble/server/internal/modules/email"
	"github.com/coffeyvidzro/dugble/server/internal/modules/identitypolicy"
	"github.com/coffeyvidzro/dugble/server/internal/modules/mfa"
	"github.com/coffeyvidzro/dugble/server/internal/modules/senderid"
	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/sso"
	"github.com/coffeyvidzro/dugble/server/internal/modules/team"
	"github.com/coffeyvidzro/dugble/server/internal/modules/teamtoken"
	"github.com/coffeyvidzro/dugble/server/internal/modules/user"
	"github.com/coffeyvidzro/dugble/server/internal/modules/webhooks"
	"github.com/coffeyvidzro/dugble/server/internal/modules/workload"
	"github.com/coffeyvidzro/dugble/server/internal/notifications"
	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
	"github.com/coffeyvidzro/dugble/server/internal/platform/idempotency"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	platformwebhook "github.com/coffeyvidzro/dugble/server/internal/platform/webhook"
	"github.com/coffeyvidzro/dugble/server/internal/transport/csrf"
	"github.com/coffeyvidzro/dugble/server/internal/transport/health"
	"github.com/coffeyvidzro/dugble/server/internal/transport/middlewares"
)

type Dependencies struct {
	DB             *pgxpool.Pool
	Redis          *redis.Client
	Arcjet         *arcjet.Client
	Sender         platformemail.Sender
	DomainProvider platformemail.DomainProvider
	DNSVerifier    platformemail.DNSVerifier
	Renderer       *notifications.Renderer
	SMSSender      smsmodule.Sender
	SMSDelivery    smsmodule.DeliveryQueue
	EmailDelivery  emailmodule.DeliveryQueue
}

func NewRouter(cfg *config.Config, deps Dependencies) (*echo.Echo, error) {
	router := echo.New()
	router.Use(middleware.RequestID())
	router.Use(middlewares.AuditRequestContext)
	router.Use(middleware.RequestLogger())
	router.Use(middleware.Recover())
	router.Use(middleware.BodyLimit(12 << 20))
	router.Use(middlewares.NewCORS(cfg.CORSOrigins, cfg.IsDevelopment()))
	router.Use(middlewares.NewSecure(cfg.IsDevelopment()))
	router.Use(middlewares.Arcjet(deps.Arcjet))
	if deps.DB != nil {
		router.Use(middlewares.Idempotency(middlewares.IdempotencyConfig{Repository: idempotency.NewRepository(deps.DB)}))
	}
	healthHandler := health.NewHandler(deps.DB, deps.Redis)
	router.GET("/health", healthHandler.Live)
	router.GET("/ready", healthHandler.Ready)

	emailService := notifications.NewEmailService(deps.Sender, deps.Renderer, cfg.FrontendURL, cfg.AWS.FromEmail)
	auditRepository := audit.NewRepository(deps.DB)
	audit.SetSink(auditRepository)
	sessionRepository := session.NewRepository(deps.DB)
	authRepository := auth.NewRepository(deps.DB)
	mfaCipher, err := authnz.NewSecretCipher(cfg.MFAEncryptionKey)
	if err != nil {
		return nil, err
	}
	ssoRepository := sso.NewRepository(deps.DB)
	ssoService := sso.NewService(ssoRepository, sessionRepository, mfaCipher, cfg.BackendURL)
	mfaService := mfa.NewService(mfa.NewRepository(deps.DB), mfaCipher, "Dugble")
	authService := auth.NewService(authRepository, sessionRepository, emailService, mfaService)
	authMiddleware := middlewares.SessionAuth(middlewares.SessionAuthConfig{Sessions: sessionRepository, Users: authRepository})
	csrfConfig := middlewares.CSRFConfig{Development: cfg.IsDevelopment(), TrustedOrigins: cfg.CORSOrigins}
	csrfMiddleware := middlewares.CSRF(csrfConfig)
	csrfHandler := csrf.NewHandler()
	router.GET("/csrf", csrfHandler.Token, csrfMiddleware)
	auth.RegisterRoutes(router, auth.NewHandler(authService, cfg.IsDevelopment(), cfg.CookieDomain), authMiddleware, csrfMiddleware)
	mfa.RegisterRoutes(router, mfa.NewHandler(mfaService), authMiddleware, csrfMiddleware)

	userRepository := user.NewRepository(deps.DB)
	user.RegisterRoutes(router, user.NewHandler(user.NewService(userRepository)), authMiddleware, csrfMiddleware)
	teamRepository := team.NewRepository(deps.DB)
	teamService := team.NewService(teamRepository, emailService)
	identityPolicyRepository := identitypolicy.NewRepository(deps.DB)
	teamTokenRepository := teamtoken.NewRepository(deps.DB)
	workloadRepository := workload.NewRepository(deps.DB)
	workloadService := workload.NewService(workloadRepository)
	domainRepository := domain.NewRepository(deps.DB)
	senderIDRepository := senderid.NewRepository(deps.DB)
	webhookRepository := webhooks.NewRepository(deps.DB)
	webhookEmitter := platformwebhook.NewEmitter(webhookRepository)
	smsRepository := smsmodule.NewRepositoryWithWebhookEmitter(deps.DB, webhookEmitter)
	tenantMiddleware := func(permission tenant.Permission) echo.MiddlewareFunc {
		return middlewares.Tenant(middlewares.TenantConfig{Memberships: teamRepository, Policies: identityPolicyRepository, Required: permission})
	}
	tenantAccess := func(permission tenant.Permission) echo.MiddlewareFunc {
		return middlewares.TenantAccess(middlewares.TenantAccessConfig{Sessions: sessionRepository, Users: authRepository, Memberships: teamRepository, Policies: identityPolicyRepository, Tokens: teamTokenRepository, Workloads: workloadRepository, CSRF: csrfConfig, Required: permission})
	}
	team.RegisterRoutes(router, team.NewHandler(teamService), authMiddleware, csrfMiddleware, tenantMiddleware)
	sso.RegisterRoutes(router, sso.NewHandler(ssoService, cfg.IsDevelopment(), cfg.CookieDomain), authMiddleware, csrfMiddleware, tenantMiddleware)
	auditevent.RegisterRoutes(router, auditevent.NewHandler(auditevent.NewService(auditRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)
	identitypolicy.RegisterRoutes(router, identitypolicy.NewHandler(identitypolicy.NewService(identityPolicyRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)
	teamtoken.RegisterRoutes(router, teamtoken.NewHandler(teamtoken.NewService(teamTokenRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)
	workload.RegisterRoutes(router, workload.NewHandler(workloadService), authMiddleware, csrfMiddleware, tenantMiddleware)
	senderid.RegisterRoutes(router, senderid.NewHandler(senderid.NewService(senderIDRepository)), authMiddleware, csrfMiddleware, tenantMiddleware)
	domain.RegisterRoutes(router, domain.NewHandler(domain.NewService(domainRepository, deps.DomainProvider, deps.DNSVerifier)), authMiddleware, csrfMiddleware, tenantMiddleware)
	smsService := smsmodule.NewService(smsRepository, deps.SMSSender, deps.SMSDelivery)
	smsmodule.RegisterRoutes(router, smsmodule.NewHandler(smsService), tenantAccess)
	emailServiceAPI := emailmodule.NewService(emailmodule.NewRepository(deps.DB), deps.EmailDelivery, emailmodule.ServiceConfig{
		DefaultFromEmail: cfg.AWS.FromEmail,
		DefaultProvider:  domain.DefaultProvider,
		DefaultRegion:    cfg.AWS.Region,
	})
	emailmodule.RegisterRoutes(router, emailmodule.NewHandler(emailServiceAPI), tenantAccess)
	webhookService := webhooks.NewService(webhookRepository, webhookEmitter)
	webhooks.RegisterRoutes(router, webhooks.NewHandler(webhookService), authMiddleware, csrfMiddleware, tenantMiddleware)
	session.RegisterRoutes(router, session.NewHandler(session.NewService(sessionRepository)), authMiddleware, csrfMiddleware)
	return router, nil
}
