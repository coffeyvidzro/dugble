package email

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

const (
	maxSendRequestBytes  int64 = 3 << 20
	maxBatchRequestBytes int64 = 6 << 20
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) Send(c *echo.Context) error {
	var req SendRequest
	if err := decodeJSONBody(c, maxSendRequestBytes, &req); err != nil {
		return httputil.Error(c, err)
	}
	message, err := h.service.Send(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	c.Response().Header().Set("Location", "/emails/"+message.ID)
	return c.JSON(http.StatusAccepted, httputil.Response{
		Success: true,
		Data:    message.QueuedResponse(),
	})
}

func (h *Handler) Get(c *echo.Context) error {
	message, err := h.service.Get(c.Request().Context(), c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, message)
}

func (h *Handler) List(c *echo.Context) error {
	messages, err := h.service.List(c.Request().Context(), ListRequest{
		Limit:  parse(c.QueryParam("limit")),
		Offset: parse(c.QueryParam("offset")),
	})
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, messages)
}

func (h *Handler) BatchSend(c *echo.Context) error {
	var req BatchSendRequest
	if err := decodeJSONBody(c, maxBatchRequestBytes, &req); err != nil {
		return httputil.Error(c, err)
	}
	messages, err := h.service.BatchSend(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	queued := make([]QueuedMessage, 0, len(messages))
	for _, message := range messages {
		queued = append(queued, message.QueuedResponse())
	}
	return c.JSON(http.StatusAccepted, httputil.Response{
		Success: true,
		Data:    queued,
	})
}

func decodeJSONBody(c *echo.Context, maxBytes int64, destination any) error {
	request := c.Request()
	request.Body = http.MaxBytesReader(c.Response(), request.Body, maxBytes)
	decoder := json.NewDecoder(request.Body)
	if err := decoder.Decode(destination); err != nil {
		var maxBytesError *http.MaxBytesError
		if errors.As(err, &maxBytesError) {
			return apperrors.NewPayloadTooLarge("Request body is too large")
		}
		return apperrors.NewBadRequest("Invalid JSON request body")
	}

	var trailing any
	if err := decoder.Decode(&trailing); !errors.Is(err, io.EOF) {
		var maxBytesError *http.MaxBytesError
		if errors.As(err, &maxBytesError) {
			return apperrors.NewPayloadTooLarge("Request body is too large")
		}
		return apperrors.NewBadRequest("Request body must contain a single JSON object")
	}
	return nil
}

func parse(value string) int32 {
	n, _ := strconv.ParseInt(value, 10, 32)
	return int32(n)
}
