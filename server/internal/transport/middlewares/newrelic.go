package middlewares

import (
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/newrelic/go-agent/v3/newrelic"
)

// NewRelic names the transaction with Echo's bounded route template and records handler errors.
func NewRelic() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			txn := newrelic.FromContext(c.Request().Context())
			if txn != nil {
				path := strings.TrimSpace(c.RouteInfo().Path)
				if path == "" {
					path = "unmatched"
				}
				txn.SetName(c.Request().Method + " " + path)
			}

			err := next(c)
			if err != nil && txn != nil {
				txn.NoticeError(err)
			}
			return err
		}
	}
}
