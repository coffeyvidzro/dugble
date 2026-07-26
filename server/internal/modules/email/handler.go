package email

import (
	"encoding/json"
	"strconv"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }
func (h *Handler) Send(c *echo.Context) error {
	var req SendRequest
	if json.NewDecoder(c.Request().Body).Decode(&req) != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	m, err := h.service.Send(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	c.Response().Header().Set("Location", "/emails/"+m.ID)
	return httputil.Accepted(c, m.Summary())
}
func (h *Handler) Get(c *echo.Context) error {
	m, err := h.service.Get(c.Request().Context(), c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, m)
}
func (h *Handler) List(c *echo.Context) error {
	m, err := h.service.List(c.Request().Context(), ListRequest{Limit: parse(c.QueryParam("limit")), Offset: parse(c.QueryParam("offset"))})
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, m)
}
func (h *Handler) BatchSend(c *echo.Context) error {
	var req BatchSendRequest
	if json.NewDecoder(c.Request().Body).Decode(&req) != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	m, err := h.service.BatchSend(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.Accepted(c, Summaries(m))
}
func parse(value string) int32 { n, _ := strconv.ParseInt(value, 10, 32); return int32(n) }
