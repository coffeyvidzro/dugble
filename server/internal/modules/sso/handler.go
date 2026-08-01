package sso

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
	app "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
)

type Handler struct {
	service      *Service
	development  bool
	cookieDomain string
}

func NewHandler(s *Service, dev bool, domain string) *Handler {
	return &Handler{s, dev, strings.TrimSpace(domain)}
}
func (h *Handler) Get(c *echo.Context) error {
	v, e := h.service.Get(c.Request().Context())
	if e != nil {
		return httputil.Error(c, e)
	}
	return httputil.OK(c, v)
}
func (h *Handler) Upsert(c *echo.Context) error {
	var in UpsertRequest
	if json.NewDecoder(c.Request().Body).Decode(&in) != nil {
		return httputil.Error(c, app.NewBadRequest("Invalid JSON request body"))
	}
	v, e := h.service.Upsert(c.Request().Context(), in)
	if e != nil {
		return httputil.Error(c, e)
	}
	return httputil.OK(c, v)
}
func (h *Handler) Delete(c *echo.Context) error {
	if e := h.service.Delete(c.Request().Context()); e != nil {
		return httputil.Error(c, e)
	}
	return c.NoContent(http.StatusNoContent)
}
func (h *Handler) Begin(c *echo.Context) error {
	id, e := uuid.Parse(c.Param("team_id"))
	if e != nil {
		return httputil.Error(c, app.NewBadRequest("Team ID must be a valid UUID"))
	}
	location, e := h.service.Begin(c.Request().Context(), id)
	if e != nil {
		return httputil.Error(c, e)
	}
	return c.Redirect(http.StatusFound, location)
}
func (h *Handler) Callback(c *echo.Context) error {
	r, e := h.service.Complete(c.Request().Context(), c.QueryParam("state"), c.QueryParam("code"), str(c.Request().UserAgent()), str(c.RealIP()))
	if e != nil {
		return httputil.Error(c, e)
	}
	c.SetCookie(&http.Cookie{Name: authnz.SessionCookieName, Value: r.Token, Path: "/", Domain: h.cookieDomain, Expires: r.ExpiresAt, HttpOnly: true, Secure: !h.development, SameSite: http.SameSiteLaxMode})
	return httputil.OK(c, map[string]string{"user_id": r.UserID})
}
func str(v string) *string {
	v = strings.TrimSpace(v)
	if v == "" {
		return nil
	}
	return &v
}
