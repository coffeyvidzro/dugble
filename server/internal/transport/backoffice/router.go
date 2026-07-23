package backoffice

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"github.com/coffeyvidzro/dugble/server/internal/config"
	"github.com/coffeyvidzro/dugble/server/internal/modules/auth"
	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/transport/health"
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

	healthHandler := health.NewHandler(deps.DB, nil)
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
	protected.GET("/teams", handler.Teams)
	protected.GET("/sms", handler.SMSMessages)
	protected.GET("/wallets", handler.Wallets)
	protected.GET("/sender-ids", handler.SenderIDs)
	protected.GET("/domains", handler.Domains)

	return router, nil
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

type DashboardStats struct {
	Users            int64
	Teams            int64
	SMSToday         int64
	FailedSMS24Hours int64
	PendingSenderIDs int64
	PendingDomains   int64
}

type UserRow struct {
	ID            string
	Email         string
	Name          string
	EmailVerified bool
	CreatedAt     time.Time
}

type TeamRow struct {
	ID        string
	Name      string
	Status    string
	CreatedAt time.Time
}

type SMSRow struct {
	ID           string
	TeamName     string
	ToNumber     string
	FromName     string
	Status       string
	ProviderID   string
	ErrorMessage string
	CreatedAt    time.Time
}

type WalletRow struct {
	ID        string
	TeamName  string
	Currency  string
	Balance   int64
	Status    string
	UpdatedAt time.Time
}

type SenderIDRow struct {
	ID          string
	TeamName    string
	Name        string
	CountryCode string
	Status      string
	CreatedAt   time.Time
}

type DomainRow struct {
	ID        string
	TeamName  string
	Domain    string
	Provider  string
	Status    string
	CreatedAt time.Time
}

func (r *Repository) DashboardStats(ctx context.Context) (DashboardStats, error) {
	var stats DashboardStats
	if err := r.db.QueryRow(ctx, `
		SELECT
			(SELECT count(*) FROM users),
			(SELECT count(*) FROM teams),
			(SELECT count(*) FROM sms_messages WHERE created_at >= date_trunc('day', now())),
			(SELECT count(*) FROM sms_messages WHERE created_at >= now() - interval '24 hours' AND status IN ('failed', 'undelivered', 'rejected', 'expired')),
			(SELECT count(*) FROM sender_ids WHERE status = 'pending'),
			(SELECT count(*) FROM sender_domains WHERE status = 'pending')
	`).Scan(&stats.Users, &stats.Teams, &stats.SMSToday, &stats.FailedSMS24Hours, &stats.PendingSenderIDs, &stats.PendingDomains); err != nil {
		return DashboardStats{}, fmt.Errorf("load dashboard stats: %w", err)
	}

	return stats, nil
}

func (r *Repository) Users(ctx context.Context) ([]UserRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, email, name, email_verified, created_at
		FROM users
		ORDER BY created_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	var users []UserRow
	for rows.Next() {
		var row UserRow
		if err := rows.Scan(&row.ID, &row.Email, &row.Name, &row.EmailVerified, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, row)
	}

	return users, rows.Err()
}

func (r *Repository) Teams(ctx context.Context) ([]TeamRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, name, status, created_at
		FROM teams
		ORDER BY created_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("list teams: %w", err)
	}
	defer rows.Close()

	var teams []TeamRow
	for rows.Next() {
		var row TeamRow
		if err := rows.Scan(&row.ID, &row.Name, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan team: %w", err)
		}
		teams = append(teams, row)
	}

	return teams, rows.Err()
}

func (r *Repository) SMSMessages(ctx context.Context) ([]SMSRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			s.id::text,
			t.name,
			s.to_number,
			s.from_name,
			s.status,
			coalesce(s.provider_id, ''),
			coalesce(s.error_message, ''),
			s.created_at
		FROM sms_messages s
		JOIN teams t ON t.id = s.team_id
		ORDER BY s.created_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("list sms messages: %w", err)
	}
	defer rows.Close()

	var messages []SMSRow
	for rows.Next() {
		var row SMSRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.ToNumber, &row.FromName, &row.Status, &row.ProviderID, &row.ErrorMessage, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan sms message: %w", err)
		}
		messages = append(messages, row)
	}

	return messages, rows.Err()
}

func (r *Repository) Wallets(ctx context.Context) ([]WalletRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT w.id::text, t.name, w.currency, w.balance, w.status, w.updated_at
		FROM wallets w
		JOIN teams t ON t.id = w.team_id
		ORDER BY w.updated_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("list wallets: %w", err)
	}
	defer rows.Close()

	var wallets []WalletRow
	for rows.Next() {
		var row WalletRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Currency, &row.Balance, &row.Status, &row.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan wallet: %w", err)
		}
		wallets = append(wallets, row)
	}

	return wallets, rows.Err()
}

func (r *Repository) SenderIDs(ctx context.Context) ([]SenderIDRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT s.id::text, t.name, s.name, s.country_code, s.status, s.created_at
		FROM sender_ids s
		JOIN teams t ON t.id = s.team_id
		ORDER BY s.created_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("list sender ids: %w", err)
	}
	defer rows.Close()

	var senderIDs []SenderIDRow
	for rows.Next() {
		var row SenderIDRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Name, &row.CountryCode, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan sender id: %w", err)
		}
		senderIDs = append(senderIDs, row)
	}

	return senderIDs, rows.Err()
}

func (r *Repository) Domains(ctx context.Context) ([]DomainRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT d.id::text, t.name, d.domain, d.provider, d.status, d.created_at
		FROM sender_domains d
		JOIN teams t ON t.id = d.team_id
		ORDER BY d.created_at DESC
		LIMIT 50
	`)
	if err != nil {
		return nil, fmt.Errorf("list domains: %w", err)
	}
	defer rows.Close()

	var domains []DomainRow
	for rows.Next() {
		var row DomainRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Domain, &row.Provider, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan domain: %w", err)
		}
		domains = append(domains, row)
	}

	return domains, rows.Err()
}

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{repository: repository}
}

type PageData struct {
	Title string
	Data  any
}

func (h *Handler) Dashboard(c *echo.Context) error {
	stats, err := h.repository.DashboardStats(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "dashboard.html", PageData{Title: "Dashboard", Data: stats})
}

func (h *Handler) Users(c *echo.Context) error {
	users, err := h.repository.Users(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "users.html", PageData{Title: "Users", Data: users})
}

func (h *Handler) Teams(c *echo.Context) error {
	teams, err := h.repository.Teams(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "teams.html", PageData{Title: "Teams", Data: teams})
}

func (h *Handler) SMSMessages(c *echo.Context) error {
	messages, err := h.repository.SMSMessages(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "sms.html", PageData{Title: "SMS", Data: messages})
}

func (h *Handler) Wallets(c *echo.Context) error {
	wallets, err := h.repository.Wallets(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "wallets.html", PageData{Title: "Wallets", Data: wallets})
}

func (h *Handler) SenderIDs(c *echo.Context) error {
	senderIDs, err := h.repository.SenderIDs(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "sender_ids.html", PageData{Title: "Sender IDs", Data: senderIDs})
}

func (h *Handler) Domains(c *echo.Context) error {
	domains, err := h.repository.Domains(c.Request().Context())
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "domains.html", PageData{Title: "Domains", Data: domains})
}
