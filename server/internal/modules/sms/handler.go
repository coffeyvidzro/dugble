package sms

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) List(c *echo.Context) error {
	messages, err := h.service.List(c.Request().Context(), ListRequest{Limit: parseInt32(c.QueryParam("limit")), Offset: parseInt32(c.QueryParam("offset"))})
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, messages)
}

func (h *Handler) Get(c *echo.Context) error {
	message, err := h.service.Get(c.Request().Context(), c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, message)
}

func (h *Handler) Send(c *echo.Context) error {
	var req SendRequest
	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	message, err := h.service.Send(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.Created(c, message)
}

func (h *Handler) BatchSend(c *echo.Context) error {
	var req BatchSendRequest
	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	message, err := h.service.BatchSend(c.Request().Context(), req)
	if err != nil {
		if len(message.Messages) > 0 {
			return httputil.Partial(c, http.StatusMultiStatus, message, err)
		}
		return httputil.Error(c, err)
	}
	return httputil.Created(c, message)
}

func (h *Handler) SyncStatus(c *echo.Context) error {
	message, err := h.service.SyncStatus(c.Request().Context(), c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, message)
}

func parseInt32(value string) int32 {
	parsed, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return 0
	}
	return int32(parsed)
}
