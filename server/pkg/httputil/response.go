package httputil

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v5"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

// Response is the standard JSON envelope for API responses.
type Response struct {
	Success bool      `json:"success"`
	Data    any       `json:"data,omitempty"`
	Error   *ErrorObj `json:"error,omitempty"`
}

// ErrorObj describes an API error.
type ErrorObj struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// OK sends a 200 response with data.
func OK(c *echo.Context, data any) error {
	return c.JSON(http.StatusOK, Response{
		Success: true,
		Data:    data,
	})
}

// Created sends a 201 response with data.
func Created(c *echo.Context, data any) error {
	return c.JSON(http.StatusCreated, Response{
		Success: true,
		Data:    data,
	})
}

// Error sends an error response based on AppError.
func Error(c *echo.Context, err error) error {
	status := http.StatusInternalServerError

	errObj := &ErrorObj{
		Code:    "INTERNAL_ERROR",
		Message: "An unexpected error occurred",
	}

	if appErr, ok := errors.AsType[*apperrors.AppError](err); ok {
		status = appErr.Status
		errObj.Code = appErr.Code
		errObj.Message = appErr.Message
	}

	return c.JSON(status, Response{
		Success: false,
		Error:   errObj,
	})
}
