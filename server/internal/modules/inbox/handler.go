package inbox

import (
	"encoding/json"
	"strconv"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (handler *Handler) CreateMessage(c *echo.Context) error {
	var request CreateMessageRequest
	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	message, err := handler.service.CreateMessage(c.Request().Context(), request)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.Created(c, message)
}

func (handler *Handler) GetMessage(c *echo.Context) error {
	message, err := handler.service.GetMessage(c.Request().Context(), c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, message)
}

func (handler *Handler) ListMessages(c *echo.Context) error {
	limit, _ := strconv.ParseInt(c.QueryParam("limit"), 10, 32)
	offset, _ := strconv.ParseInt(c.QueryParam("offset"), 10, 32)
	messages, err := handler.service.ListMessages(c.Request().Context(), ListRequest{Limit: int32(limit), Offset: int32(offset)})
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, messages)
}
