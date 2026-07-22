package wallet

import (
	"encoding/json"

	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/integration/hubtel"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

func (h *Handler) HubtelWebhook(c *echo.Context) error {
	var payload hubtel.CallbackPayload
	if err := json.NewDecoder(c.Request().Body).Decode(&payload); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	transaction, err := h.service.HandleHubtelCallback(c.Request().Context(), payload)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, transaction)
}
