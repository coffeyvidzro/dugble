package email

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
	messages, err := h.service.List(c.Request().Context(), ListRequest{
		Limit:  parseInt32(c.QueryParam("limit")),
		Offset: parseInt32(c.QueryParam("offset")),
	})
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, Responses(messages))
}

func (h *Handler) Get(c *echo.Context) error {
	message, err := h.service.Get(c.Request().Context(), c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, message.Response())
}

func (h *Handler) Send(c *echo.Context) error {
	var req SendRequest
	if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	req.IdempotencyKey = c.Request().Header.Get("Idempotency-Key")
	message, err := h.service.Send(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	c.Response().Header().Set("Location", "/emails/"+message.ID)
	return c.JSON(http.StatusAccepted, httputil.Response{
		Success: true,
		Data:    message.Response(),
	})
}

func parseInt32(value string) int32 {
	parsed, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return 0
	}
	return int32(parsed)
}
