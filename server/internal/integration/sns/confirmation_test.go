package sns

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return f(request)
}

func TestHTTPConfirmerConfirmsTrustedSNSURL(t *testing.T) {
	calls := 0
	client := &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		calls++
		if request.URL.Host != "sns.us-east-1.amazonaws.com" {
			t.Fatalf("confirmation host = %q", request.URL.Host)
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader("ok")), Header: make(http.Header)}, nil
	})}
	if err := NewHTTPConfirmer(client).Confirm(context.Background(), "https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription&Token=test"); err != nil {
		t.Fatalf("confirm SNS subscription: %v", err)
	}
	if calls != 1 {
		t.Fatalf("confirmation calls = %d", calls)
	}
}

func TestHTTPConfirmerRejectsUntrustedURL(t *testing.T) {
	client := &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		t.Fatal("untrusted URL must not be requested")
		return nil, nil
	})}
	if err := NewHTTPConfirmer(client).Confirm(context.Background(), "https://sns.us-east-1.amazonaws.com.attacker.example/?Token=test"); err == nil {
		t.Fatal("expected untrusted confirmation URL to be rejected")
	}
}
