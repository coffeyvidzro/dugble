package middlewares

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

type CSRFConfig struct {
	Development    bool
	TrustedOrigins []string
}

func CSRF(config CSRFConfig) echo.MiddlewareFunc {
	return middleware.CSRFWithConfig(middleware.CSRFConfig{
		TrustedOrigins: config.TrustedOrigins,
		TokenLookup:    "header:" + echo.HeaderXCSRFToken,
		CookieName:     "dugble_csrf",
		CookiePath:     "/",
		CookieSecure:   !config.Development,
		CookieHTTPOnly: false,
		CookieSameSite: http.SameSiteLaxMode,
	})
}
