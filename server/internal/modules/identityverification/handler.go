package identityverification

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) AnalyzeDocument(c *echo.Context) error {
	var req DocumentAnalysisRequest
	if err := decodeJSON(c, &req); err != nil {
		return err
	}
	result, err := h.service.AnalyzeDocument(c.Request().Context(), req)
	return respond(c, result, err)
}

func (h *Handler) CompareFaces(c *echo.Context) error {
	var req FaceComparisonRequest
	if err := decodeJSON(c, &req); err != nil {
		return err
	}
	result, err := h.service.CompareFaces(c.Request().Context(), req)
	return respond(c, result, err)
}

func (h *Handler) CheckLiveness(c *echo.Context) error {
	var req LivenessRequest
	if err := decodeJSON(c, &req); err != nil {
		return err
	}
	result, err := h.service.CheckLiveness(c.Request().Context(), req)
	return respond(c, result, err)
}

func decodeJSON(c *echo.Context, dst any) error {
	if err := json.NewDecoder(c.Request().Body).Decode(dst); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid JSON request body"})
	}
	return nil
}

func respond(c *echo.Context, result any, err error) error {
	if err == nil {
		return c.JSON(http.StatusOK, result)
	}
	if errors.Is(err, ErrAnalyzerNotConfigured) {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"error": "identity analyzer is not configured",
		})
	}
	return c.JSON(http.StatusInternalServerError, map[string]string{"error": "identity analysis failed"})
}
