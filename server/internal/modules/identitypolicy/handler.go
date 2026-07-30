package identitypolicy

import (
	"encoding/json"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) Get(c *echo.Context) error {
	policy, err := h.service.Get(c.Request().Context())
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, policy)
}

func (h *Handler) Update(c *echo.Context) error {
	var request UpdateRequest
	if err := json.NewDecoder(c.Request().Body).Decode(&request); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	policy, err := h.service.Update(c.Request().Context(), request)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, policy)
}
