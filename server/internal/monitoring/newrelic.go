package monitoring

import (
	"context"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/newrelic/go-agent/v3/newrelic"
)

// NewRelic initializes a New Relic application when NEW_RELIC_LICENSE_KEY is set.
// Monitoring is intentionally optional so local development does not require credentials.
func NewRelic(appName string) (*newrelic.Application, error) {
	if strings.TrimSpace(os.Getenv("NEW_RELIC_LICENSE_KEY")) == "" {
		return nil, nil
	}

	return newrelic.NewApplication(
		newrelic.ConfigAppName(appName),
		newrelic.ConfigFromEnvironment(),
		newrelic.ConfigCodeLevelMetricsEnabled(true),
	)
}

// Shutdown flushes pending telemetry without forcing callers to special-case a disabled agent.
func Shutdown(app *newrelic.Application, timeout time.Duration) {
	if app != nil {
		app.Shutdown(timeout)
	}
}

// WrapHTTP records inbound HTTP requests and propagates the transaction through request context.
func WrapHTTP(app *newrelic.Application, next http.Handler) http.Handler {
	if app == nil {
		return next
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		txn := app.StartTransaction(r.Method + " unknown route")
		defer txn.End()

		txn.SetWebRequestHTTP(r)
		w = txn.SetWebResponse(w)
		r = newrelic.RequestWithTransactionContext(r, txn)
		next.ServeHTTP(w, r)
	})
}

// NameEchoTransaction replaces raw request paths with Echo's bounded route template.
func NameEchoTransaction(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		txn := newrelic.FromContext(c.Request().Context())
		if txn != nil {
			route := c.RouteInfo()
			path := route.Path
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

// Transaction starts a background transaction and returns a derived context.
// Worker handlers should create one transaction per delivery attempt or batch.
func Transaction(ctx context.Context, app *newrelic.Application, name string) (context.Context, func(error)) {
	if app == nil {
		return ctx, func(error) {}
	}

	txn := app.StartTransaction(name)
	return newrelic.NewContext(ctx, txn), func(err error) {
		if err != nil {
			txn.NoticeError(err)
		}
		txn.End()
	}
}
