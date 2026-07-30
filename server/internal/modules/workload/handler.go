package workload

import (
	"encoding/json"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
	"github.com/labstack/echo/v5"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }
func (h *Handler) List(c *echo.Context) error {
	rows, err := h.service.List(c.Request().Context())
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, rows)
}
func (h *Handler) Create(c *echo.Context) error {
	var request MutationRequest
	if err := decode(c, &request); err != nil {
		return err
	}
	row, err := h.service.Create(c.Request().Context(), request)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.Created(c, row)
}
func (h *Handler) Update(c *echo.Context) error {
	var request MutationRequest
	if err := decode(c, &request); err != nil {
		return err
	}
	row, err := h.service.Update(c.Request().Context(), c.Param("workload_id"), request)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, row)
}
func (h *Handler) Disable(c *echo.Context) error {
	row, err := h.service.Disable(c.Request().Context(), c.Param("workload_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, row)
}
func (h *Handler) CreateCredential(c *echo.Context) error {
	var request CredentialRequest
	if err := decode(c, &request); err != nil {
		return err
	}
	row, err := h.service.CreateCredential(c.Request().Context(), c.Param("workload_id"), request)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.Created(c, row)
}
func (h *Handler) RevokeCredential(c *echo.Context) error {
	if err := h.service.RevokeCredential(c.Request().Context(), c.Param("workload_id"), c.Param("credential_id")); err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, map[string]bool{"revoked": true})
}
func (h *Handler) Exchange(c *echo.Context) error {
	var request ExchangeRequest
	if err := decode(c, &request); err != nil {
		return err
	}
	token, err := h.service.Exchange(c.Request().Context(), request.Credential)
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, token)
}
func decode(c *echo.Context, destination any) error {
	if err := json.NewDecoder(c.Request().Body).Decode(destination); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	return nil
}
