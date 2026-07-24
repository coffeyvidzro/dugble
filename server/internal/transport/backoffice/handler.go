package backoffice

import (
	"errors"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/transport/middlewares"
)

type Handler struct {
	repository *Repository
}

func NewHandler(repository *Repository) *Handler {
	return &Handler{repository: repository}
}

func (h *Handler) Dashboard(c *echo.Context) error {
	stats, err := h.repository.DashboardStats(c.Request().Context())
	if err != nil {
		return err
	}

	return h.render(c, "dashboard.html", "Dashboard", stats, nil)
}

func (h *Handler) Users(c *echo.Context) error {
	filter := UserFilter{Query: cleanQuery(c.QueryParam("q"))}
	users, err := h.repository.Users(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return h.render(c, "users.html", "Users", users, filter)
}

func (h *Handler) UserDetail(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid user id")
	}

	detail, err := h.repository.UserDetail(c.Request().Context(), id)
	if err != nil {
		return handleDetailError(c, err)
	}

	return h.render(c, "user_detail.html", detail.User.Email, detail, nil)
}

func (h *Handler) Teams(c *echo.Context) error {
	filter := TeamFilter{Query: cleanQuery(c.QueryParam("q"))}
	teams, err := h.repository.Teams(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return h.render(c, "teams.html", "Teams", teams, filter)
}

func (h *Handler) TeamDetail(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid team id")
	}

	detail, err := h.repository.TeamDetail(c.Request().Context(), id)
	if err != nil {
		return handleDetailError(c, err)
	}

	return h.render(c, "team_detail.html", detail.Team.Name, detail, nil)
}

func (h *Handler) SMSMessages(c *echo.Context) error {
	filter := SMSFilter{
		Query:  cleanQuery(c.QueryParam("q")),
		Status: cleanQuery(c.QueryParam("status")),
	}
	messages, err := h.repository.SMSMessages(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return h.render(c, "sms.html", "SMS", messages, filter)
}

func (h *Handler) SMSDetail(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid sms id")
	}

	detail, err := h.repository.SMSDetail(c.Request().Context(), id)
	if err != nil {
		return handleDetailError(c, err)
	}

	return h.render(c, "sms_detail.html", "SMS "+detail.ID, detail, nil)
}

func (h *Handler) Wallets(c *echo.Context) error {
	filter := WalletFilter{
		Query:  cleanQuery(c.QueryParam("q")),
		Status: cleanQuery(c.QueryParam("status")),
	}
	wallets, err := h.repository.Wallets(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return h.render(c, "wallets.html", "Wallets", wallets, filter)
}

func (h *Handler) SenderIDs(c *echo.Context) error {
	filter := SenderIDFilter{
		Query:  cleanQuery(c.QueryParam("q")),
		Status: cleanQuery(c.QueryParam("status")),
	}
	senderIDs, err := h.repository.SenderIDs(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return h.render(c, "sender_ids.html", "Sender IDs", senderIDs, filter)
}

func (h *Handler) ApproveSenderID(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid sender id")
	}
	if err := h.repository.ApproveSenderID(c.Request().Context(), id); err != nil {
		return handleDetailError(c, err)
	}

	return c.Redirect(http.StatusSeeOther, "/sender-ids?status=pending")
}

func (h *Handler) RejectSenderID(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid sender id")
	}

	reason := cleanQuery(c.Request().FormValue("reason"))
	if reason == "" {
		return c.String(http.StatusBadRequest, "rejection reason is required")
	}

	if err := h.repository.RejectSenderID(c.Request().Context(), id, reason); err != nil {
		return handleDetailError(c, err)
	}

	return c.Redirect(http.StatusSeeOther, "/sender-ids?status=pending")
}

func (h *Handler) Domains(c *echo.Context) error {
	filter := DomainFilter{
		Query:  cleanQuery(c.QueryParam("q")),
		Status: cleanQuery(c.QueryParam("status")),
	}
	domains, err := h.repository.Domains(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return h.render(c, "domains.html", "Domains", domains, filter)
}

func (h *Handler) VerifyDomain(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid domain id")
	}
	if err := h.repository.VerifyDomain(c.Request().Context(), id); err != nil {
		return handleDetailError(c, err)
	}

	return c.Redirect(http.StatusSeeOther, "/domains?status=pending")
}

func (h *Handler) FailDomain(c *echo.Context) error {
	id, ok := validID(c)
	if !ok {
		return c.String(http.StatusBadRequest, "invalid domain id")
	}

	reason := cleanQuery(c.Request().FormValue("reason"))
	if reason == "" {
		return c.String(http.StatusBadRequest, "failure reason is required")
	}

	if err := h.repository.FailDomain(c.Request().Context(), id, reason); err != nil {
		return handleDetailError(c, err)
	}

	return c.Redirect(http.StatusSeeOther, "/domains?status=pending")
}

func cleanQuery(value string) string {
	return strings.TrimSpace(value)
}

func validID(c *echo.Context) (string, bool) {
	id := cleanQuery(c.Param("id"))
	if _, err := uuid.Parse(id); err != nil {
		return "", false
	}

	return id, true
}

func handleDetailError(c *echo.Context, err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return c.String(http.StatusNotFound, "not found")
	}

	return err
}

func (h *Handler) render(c *echo.Context, templateName string, title string, data any, filter any) error {
	token, _ := c.Get(middlewares.CSRFContextKey).(string)

	return c.Render(http.StatusOK, templateName, PageData{
		Title:  title,
		Data:   data,
		Filter: filter,
		CSRF:   token,
	})
}
