package inbox

import (
	"context"
	"encoding/json"
	"strconv"
	"strings"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

func (handler *Handler) CreateRecipientToken(c *echo.Context) error {
	var request CreateRecipientTokenRequest
	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	token, err := handler.service.CreateRecipientToken(c.Request().Context(), request)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.Created(c, token)
}

func (handler *Handler) RecipientFeed(c *echo.Context) error {
	access, err := handler.recipientAccess(c)
	if err != nil {
		return httputil.Error(c, err)
	}
	limit, _ := strconv.ParseInt(c.QueryParam("limit"), 10, 32)
	feed, err := handler.service.RecipientFeed(c.Request().Context(), access, RecipientFeedRequest{
		Limit: int32(limit), Cursor: c.QueryParam("cursor"),
	})
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, feed)
}

func (handler *Handler) RecipientUnreadCount(c *echo.Context) error {
	access, err := handler.recipientAccess(c)
	if err != nil {
		return httputil.Error(c, err)
	}
	count, err := handler.service.RecipientUnreadCount(c.Request().Context(), access)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, count)
}

func (handler *Handler) MarkRecipientSeen(c *echo.Context) error {
	return handler.updateRecipientState(c, handler.service.MarkRecipientSeen)
}

func (handler *Handler) MarkRecipientRead(c *echo.Context) error {
	return handler.updateRecipientState(c, handler.service.MarkRecipientRead)
}

func (handler *Handler) ArchiveRecipientMessage(c *echo.Context) error {
	return handler.updateRecipientState(c, handler.service.ArchiveRecipientMessage)
}

func (handler *Handler) UnarchiveRecipientMessage(c *echo.Context) error {
	return handler.updateRecipientState(c, handler.service.UnarchiveRecipientMessage)
}

func (handler *Handler) updateRecipientState(
	c *echo.Context,
	operation func(context.Context, RecipientAccess, string) (ReceiptState, error),
) error {
	access, err := handler.recipientAccess(c)
	if err != nil {
		return httputil.Error(c, err)
	}
	state, err := operation(c.Request().Context(), access, c.Param("message_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, state)
}

func (handler *Handler) recipientAccess(c *echo.Context) (RecipientAccess, error) {
	header := strings.TrimSpace(c.Request().Header.Get("Authorization"))
	parts := strings.Fields(header)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return RecipientAccess{}, apperrors.NewUnauthorized("Inbox recipient token is required")
	}
	return handler.service.ParseRecipientToken(parts[1])
}
