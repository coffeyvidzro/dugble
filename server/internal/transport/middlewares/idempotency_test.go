package middlewares

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
)

func TestRequestIdempotencyScopeUsesSessionCookie(t *testing.T) {
	t.Parallel()

	request := httptest.NewRequest(http.MethodPost, "/sms/messages", nil)
	request.AddCookie(&http.Cookie{Name: authnz.SessionCookieName, Value: "session-secret"})

	scope, ok := requestIdempotencyScope(request)
	if !ok {
		t.Fatal("expected session cookie scope")
	}
	if !strings.HasPrefix(scope, "session:") {
		t.Fatalf("scope = %q, want session-prefixed scope", scope)
	}
	if strings.Contains(scope, "session-secret") {
		t.Fatal("scope should not contain the raw session credential")
	}
}

func TestRequestIdempotencyScopeUsesBearerToken(t *testing.T) {
	t.Parallel()

	request := httptest.NewRequest(http.MethodPost, "/sms/messages", nil)
	request.Header.Set(echo.HeaderAuthorization, "Bearer dugble_token_secret")

	scope, ok := requestIdempotencyScope(request)
	if !ok {
		t.Fatal("expected bearer token scope")
	}
	if !strings.HasPrefix(scope, "bearer:") {
		t.Fatalf("scope = %q, want bearer-prefixed scope", scope)
	}
	if strings.Contains(scope, "dugble_token_secret") {
		t.Fatal("scope should not contain the raw bearer credential")
	}
}

func TestHashRequestIncludesQueryAndBody(t *testing.T) {
	t.Parallel()

	base := hashRequest(http.MethodPost, "/sms/messages", "team_id=123", []byte(`{"body":"one"}`))
	if base == hashRequest(http.MethodPost, "/sms/messages", "team_id=456", []byte(`{"body":"one"}`)) {
		t.Fatal("expected different query strings to produce different hashes")
	}
	if base == hashRequest(http.MethodPost, "/sms/messages", "team_id=123", []byte(`{"body":"two"}`)) {
		t.Fatal("expected different bodies to produce different hashes")
	}
}

func TestReadAndRestoreBodyAllowsDownstreamRead(t *testing.T) {
	t.Parallel()

	request := httptest.NewRequest(http.MethodPost, "/sms/messages", strings.NewReader(`{"message":"hello"}`))
	body, err := readAndRestoreBody(request)
	if err != nil {
		t.Fatalf("readAndRestoreBody returned error: %v", err)
	}
	if string(body) != `{"message":"hello"}` {
		t.Fatalf("body = %q, want original body", body)
	}

	restored, err := io.ReadAll(request.Body)
	if err != nil {
		t.Fatalf("read restored body: %v", err)
	}
	if string(restored) != string(body) {
		t.Fatalf("restored body = %q, want %q", restored, body)
	}
}

func TestEncodeResponseHeadersFiltersNonReplayableHeaders(t *testing.T) {
	t.Parallel()

	headers := http.Header{}
	headers.Set(echo.HeaderContentType, "application/json")
	headers.Set(echo.HeaderSetCookie, "dugble_session=secret")
	headers.Set(echo.HeaderXRequestID, "request-id")

	encoded, err := encodeResponseHeaders(headers)
	if err != nil {
		t.Fatalf("encodeResponseHeaders returned error: %v", err)
	}

	restored := http.Header{}
	if err := restoreResponseHeaders(restored, encoded); err != nil {
		t.Fatalf("restoreResponseHeaders returned error: %v", err)
	}
	if restored.Get(echo.HeaderContentType) != "application/json" {
		t.Fatalf("content type = %q, want application/json", restored.Get(echo.HeaderContentType))
	}
	if restored.Get(echo.HeaderSetCookie) != "" {
		t.Fatal("expected Set-Cookie to be filtered from replayable headers")
	}
	if restored.Get(echo.HeaderXRequestID) != "" {
		t.Fatal("expected X-Request-Id to be filtered from replayable headers")
	}
}
