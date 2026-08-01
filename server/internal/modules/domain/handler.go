package domain

import (
	"encoding/json"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) List(c *echo.Context) error {
	domains, err := h.service.List(c.Request().Context())
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, domains)
}

func (h *Handler) Get(c *echo.Context) error {
	domain, err := h.service.Get(c.Request().Context(), c.Param("domain_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, domain)
}

func (h *Handler) Create(c *echo.Context) error {
	var req CreateRequest
	if err := decodeJSON(c, &req); err != nil {
		return err
	}
	result, err := h.service.Create(c.Request().Context(), req)
	if err != nil {
		return httputil.Error(c, err)
	}
	if result.Provisioning != nil {
		return httputil.Accepted(c, result.Provisioning)
	}
	return httputil.Created(c, result.Domain)
}

func (h *Handler) ProvisioningStatus(c *echo.Context) error {
	status, err := h.service.ProvisioningStatus(c.Request().Context(), c.Param("region"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, status)
}

func (h *Handler) Verify(c *echo.Context) error {
	domain, err := h.service.Verify(c.Request().Context(), c.Param("domain_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, domain)
}

func (h *Handler) Delete(c *echo.Context) error {
	domain, err := h.service.Delete(c.Request().Context(), c.Param("domain_id"))
	if err != nil {
		return httputil.Error(c, err)
	}
	return httputil.OK(c, domain)
}

func decodeJSON(c *echo.Context, dst any) error {
	if err := json.NewDecoder(c.Request().Body).Decode(dst); err != nil {
		return httputil.Error(c, apperrors.NewBadRequest("Invalid JSON request body"))
	}
	return nil
}
