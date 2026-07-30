package middlewares

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/modules/session"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
)

type sessionStoreStub struct {
	record session.Record
	err    error
}

func (s sessionStoreStub) GetByTokenHash(context.Context, string) (session.Record, error) {
	return s.record, s.err
}

func (sessionStoreStub) Touch(context.Context, string) error { return nil }

type principalRepositoryStub struct{}

func (principalRepositoryStub) GetPrincipalByUserID(context.Context, string) (authnz.Principal, error) {
	return authnz.Principal{}, errors.New("unexpected principal lookup")
}

func TestSessionAuthClassifiesLookupErrors(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		err        error
		wantStatus int
	}{
		{name: "missing session", err: pgx.ErrNoRows, wantStatus: http.StatusUnauthorized},
		{name: "wrapped missing session", err: fmt.Errorf("lookup: %w", pgx.ErrNoRows), wantStatus: http.StatusUnauthorized},
		{name: "database failure", err: errors.New("database unavailable"), wantStatus: http.StatusInternalServerError},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			request := httptest.NewRequest(http.MethodGet, "/sessions", nil)
			request.AddCookie(&http.Cookie{Name: authnz.SessionCookieName, Value: "secret"})
			response := httptest.NewRecorder()
			ctx := echo.New().NewContext(request, response)
			handler := SessionAuth(SessionAuthConfig{
				Sessions: sessionStoreStub{err: test.err},
				Users:    principalRepositoryStub{},
			})(func(*echo.Context) error {
				t.Fatal("next handler must not run")
				return nil
			})

			if err := handler(ctx); err != nil {
				t.Fatalf("SessionAuth() error = %v", err)
			}
			if response.Code != test.wantStatus {
				t.Fatalf("status = %d, want %d", response.Code, test.wantStatus)
			}
		})
	}
}
