package scim

import (
	"encoding/json"
	"errors"
	app "github.com/coffeyvidzro/dugble/server/pkg/errors"
	"github.com/coffeyvidzro/dugble/server/pkg/httputil"
	"github.com/google/uuid"
	"github.com/labstack/echo/v5"
	"net/http"
	"regexp"
	"strconv"
	"strings"
)

type Handler struct{ service *Service }

func NewHandler(s *Service) *Handler { return &Handler{s} }
func (h *Handler) Authenticate(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		header := strings.TrimSpace(c.Request().Header.Get("Authorization"))
		if !strings.HasPrefix(strings.ToLower(header), "bearer ") {
			return scimError(c, app.NewUnauthorized("SCIM bearer token is required"))
		}
		ctx, e := h.service.Authenticate(c.Request().Context(), strings.TrimSpace(header[7:]))
		if e != nil {
			return scimError(c, e)
		}
		c.SetRequest(c.Request().WithContext(ctx))
		return next(c)
	}
}
func (h *Handler) CreateToken(c *echo.Context) error {
	var in TokenRequest
	if decode(c, &in) != nil {
		return httputil.Error(c, app.NewBadRequest("Invalid JSON request body"))
	}
	v, e := h.service.CreateToken(c.Request().Context(), in)
	if e != nil {
		return httputil.Error(c, e)
	}
	return httputil.Created(c, v)
}
func (h *Handler) ListTokens(c *echo.Context) error {
	v, e := h.service.ListTokens(c.Request().Context())
	if e != nil {
		return httputil.Error(c, e)
	}
	return httputil.OK(c, v)
}
func (h *Handler) RevokeToken(c *echo.Context) error {
	id, e := uuid.Parse(c.Param("token_id"))
	if e != nil {
		return httputil.Error(c, app.NewBadRequest("Token ID must be a valid UUID"))
	}
	if e = h.service.RevokeToken(c.Request().Context(), id); e != nil {
		return httputil.Error(c, e)
	}
	return c.NoContent(http.StatusNoContent)
}

var filterPattern = regexp.MustCompile(`(?i)^userName\s+eq\s+"([^"]+)"$`)

func (h *Handler) ListUsers(c *echo.Context) error {
	start := number(c.QueryParam("startIndex"), 1)
	count := number(c.QueryParam("count"), 100)
	var email *string
	if f := strings.TrimSpace(c.QueryParam("filter")); f != "" {
		m := filterPattern.FindStringSubmatch(f)
		if len(m) != 2 {
			return scimError(c, app.NewBadRequest("Only userName eq filters are supported"))
		}
		email = &m[1]
	}
	v, e := h.service.ListUsers(c.Request().Context(), email, start, count)
	if e != nil {
		return scimError(c, e)
	}
	return c.JSON(http.StatusOK, v)
}
func (h *Handler) GetUser(c *echo.Context) error {
	id, e := uuid.Parse(c.Param("id"))
	if e != nil {
		return scimError(c, app.NewNotFound("SCIM user not found"))
	}
	v, e := h.service.GetUser(c.Request().Context(), id)
	if e != nil {
		return scimError(c, e)
	}
	return c.JSON(http.StatusOK, v)
}
func (h *Handler) CreateUser(c *echo.Context) error {
	var in User
	if decode(c, &in) != nil {
		return scimError(c, app.NewBadRequest("Invalid SCIM user"))
	}
	v, e := h.service.CreateUser(c.Request().Context(), in)
	if e != nil {
		return scimError(c, e)
	}
	return c.JSON(http.StatusCreated, v)
}
func (h *Handler) ReplaceUser(c *echo.Context) error {
	id, e := uuid.Parse(c.Param("id"))
	if e != nil {
		return scimError(c, app.NewNotFound("SCIM user not found"))
	}
	var in User
	if decode(c, &in) != nil {
		return scimError(c, app.NewBadRequest("Invalid SCIM user"))
	}
	v, e := h.service.ReplaceUser(c.Request().Context(), id, in)
	if e != nil {
		return scimError(c, e)
	}
	return c.JSON(http.StatusOK, v)
}
func (h *Handler) PatchUser(c *echo.Context) error {
	id, e := uuid.Parse(c.Param("id"))
	if e != nil {
		return scimError(c, app.NewNotFound("SCIM user not found"))
	}
	var in PatchRequest
	if decode(c, &in) != nil {
		return scimError(c, app.NewBadRequest("Invalid SCIM patch"))
	}
	v, e := h.service.PatchUser(c.Request().Context(), id, in)
	if e != nil {
		return scimError(c, e)
	}
	return c.JSON(http.StatusOK, v)
}
func (h *Handler) DeleteUser(c *echo.Context) error {
	id, e := uuid.Parse(c.Param("id"))
	if e != nil {
		return scimError(c, app.NewNotFound("SCIM user not found"))
	}
	if e = h.service.DeleteUser(c.Request().Context(), id); e != nil {
		return scimError(c, e)
	}
	return c.NoContent(http.StatusNoContent)
}
func (h *Handler) ServiceProviderConfig(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{"schemas": []string{"urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"}, "patch": map[string]bool{"supported": true}, "filter": map[string]any{"supported": true, "maxResults": 100}, "bulk": map[string]bool{"supported": false}, "sort": map[string]bool{"supported": false}, "etag": map[string]bool{"supported": false}, "authenticationSchemes": []map[string]any{{"type": "oauthbearertoken", "name": "Bearer Token", "primary": true}}})
}
func decode(c *echo.Context, v any) error { return json.NewDecoder(c.Request().Body).Decode(v) }
func number(v string, d int32) int32 {
	n, e := strconv.ParseInt(v, 10, 32)
	if e != nil || n < 1 {
		return d
	}
	return int32(n)
}
func scimError(c *echo.Context, e error) error {
	status := http.StatusInternalServerError
	detail := "An unexpected error occurred"
	var a *app.AppError
	if errors.As(e, &a) {
		status = a.Status
		detail = a.Message
	}
	return c.JSON(status, map[string]any{"schemas": []string{"urn:ietf:params:scim:api:messages:2.0:Error"}, "status": strconv.Itoa(status), "detail": detail})
}

func (h *Handler) Schemas(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{"schemas": []string{"urn:ietf:params:scim:api:messages:2.0:ListResponse"}, "totalResults": 1, "Resources": []map[string]any{{"id": userSchema, "name": "User", "description": "Dugble user account"}}})
}
func (h *Handler) ResourceTypes(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]any{"schemas": []string{"urn:ietf:params:scim:api:messages:2.0:ListResponse"}, "totalResults": 1, "Resources": []map[string]any{{"id": "User", "name": "User", "endpoint": "/Users", "schema": userSchema}}})
}
