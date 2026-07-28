package identity

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/coffeyvidzro/dugble/server/internal/config"
)

func testClient(server *httptest.Server) *Client {
	client := NewClient(config.IdentityAIConfig{
		BaseURL:         server.URL,
		APIKey:          "internal-secret",
		GuidanceTimeout: time.Second,
		AnalysisTimeout: time.Second,
		MaxResponseSize: 1 << 20,
	})
	client.HTTPClient = server.Client()
	return client
}

func TestClientReadyUsesInternalBearerCredential(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/ready" {
			t.Fatalf("path = %q", request.URL.Path)
		}
		if got := request.Header.Get("Authorization"); got != "Bearer internal-secret" {
			t.Fatalf("Authorization = %q", got)
		}
		response.Header().Set("Content-Type", "application/json")
		_, _ = response.Write([]byte(`{"status":"ready","enabled":true,"authentication_configured":true,"models_ready":true,"model_status":"ready"}`))
	}))
	defer server.Close()

	readiness, err := testClient(server).Ready(context.Background())
	if err != nil {
		t.Fatalf("Ready() error = %v", err)
	}
	if !readiness.ModelsReady || readiness.ModelStatus != "ready" {
		t.Fatalf("Ready() = %+v", readiness)
	}
}

func TestClientValidatesLivenessEvidence(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		response.Header().Set("Content-Type", "application/json")
		_, _ = response.Write([]byte(`{
			"challenge":{"challenge_id":"challenge-1","challenge_completed":true,"completion_ratio":1,"reasons":[],"landmark_model_version":"landmarks-v1"},
			"presentation_attack":{"signals":[{"attack_type":"two_dimensional","score":0.2}],"model_version":"pad-v1"},
			"attack_threshold":0.6,
			"attack_suspected":false,
			"reasons":[]
		}`))
	}))
	defer server.Close()

	evidence, err := testClient(server).CheckLiveness(context.Background(), LivenessRequest{
		VerificationID:  "verification-1",
		SessionID:       "session-1",
		VideoObjectKey:  "private/capture-1",
		AttackThreshold: 0.6,
	})
	if err != nil {
		t.Fatalf("CheckLiveness() error = %v", err)
	}
	if evidence.AttackSuspected || evidence.Challenge.CompletionRatio != 1 {
		t.Fatalf("CheckLiveness() = %+v", evidence)
	}
}

func TestClientClassifiesUnavailableResponseAsRetryable(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, _ *http.Request) {
		response.WriteHeader(http.StatusServiceUnavailable)
		_, _ = response.Write([]byte(`{"detail":"model_runtime_unavailable"}`))
	}))
	defer server.Close()

	_, err := testClient(server).Ready(context.Background())
	var apiErr *APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("Ready() error = %T %v", err, err)
	}
	if !apiErr.Retryable || apiErr.Code != "model_runtime_unavailable" {
		t.Fatalf("APIError = %+v", apiErr)
	}
}

func TestClientRejectsOversizedResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, _ *http.Request) {
		_, _ = response.Write([]byte(`{"status":"` + string(make([]byte, 128)) + `"}`))
	}))
	defer server.Close()
	client := testClient(server)
	client.maxResponseSize = 32

	_, err := client.Ready(context.Background())
	if err == nil {
		t.Fatal("Ready() error = nil")
	}
}

func TestClientRejectsExternalMediaURLBeforeSending(t *testing.T) {
	called := false
	server := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		called = true
	}))
	defer server.Close()

	_, err := testClient(server).CheckLiveness(context.Background(), LivenessRequest{
		VerificationID:  "verification-1",
		SessionID:       "session-1",
		VideoObjectKey:  "https://example.test/capture",
		AttackThreshold: 0.6,
	})
	if err == nil {
		t.Fatal("CheckLiveness() error = nil")
	}
	if called {
		t.Fatal("identity AI request was sent for an external media URL")
	}
}
