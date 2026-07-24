package backoffice

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
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

	return c.Render(http.StatusOK, "dashboard.html", PageData{Title: "Dashboard", Data: stats})
}

func (h *Handler) Users(c *echo.Context) error {
	filter := UserFilter{Query: cleanQuery(c.QueryParam("q"))}
	users, err := h.repository.Users(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "users.html", PageData{Title: "Users", Data: users, Filter: filter})
}

func (h *Handler) Teams(c *echo.Context) error {
	filter := TeamFilter{Query: cleanQuery(c.QueryParam("q"))}
	teams, err := h.repository.Teams(c.Request().Context(), filter)
	if err != nil {
		return err
	}

	return c.Render(http.StatusOK, "teams.html", PageData{Title: "Teams", Data: teams, Filter: filter})
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

	return c.Render(http.StatusOK, "sms.html", PageData{Title: "SMS", Data: messages, Filter: filter})
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

	return c.Render(http.StatusOK, "wallets.html", PageData{Title: "Wallets", Data: wallets, Filter: filter})
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

	return c.Render(http.StatusOK, "sender_ids.html", PageData{Title: "Sender IDs", Data: senderIDs, Filter: filter})
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

	return c.Render(http.StatusOK, "domains.html", PageData{Title: "Domains", Data: domains, Filter: filter})
}

func cleanQuery(value string) string {
	return strings.TrimSpace(value)
}
