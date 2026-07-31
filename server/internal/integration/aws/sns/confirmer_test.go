package sns

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestHTTPConfirmerConfirmsSubscription(t *testing.T) {
	envelope := confirmationEnvelope()
	requests := 0
	client := &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		requests++
		if request.Method != http.MethodGet {
			t.Fatalf("request method = %s, want GET", request.Method)
		}
		return &http.Response{
			StatusCode: http.StatusOK,
			Header:     make(http.Header),
			Body:       io.NopCloser(strings.NewReader("confirmed")),
			Request:    request,
		}, nil
	})}

	if err := NewHTTPConfirmer(client).Confirm(context.Background(), envelope); err != nil {
		t.Fatalf("Confirm() error = %v", err)
	}
	if requests != 1 {
		t.Fatalf("HTTP requests = %d, want 1", requests)
	}
}

func TestHTTPConfirmerRejectsMismatchedTopic(t *testing.T) {
	envelope := confirmationEnvelope()
	value := strings.Replace(*envelope.SubscribeURL, envelope.TopicARN, "arn:aws:sns:us-east-1:123456789012:other", 1)
	envelope.SubscribeURL = &value
	client := &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
		t.Fatal("HTTP request should not be sent")
		return nil, nil
	})}

	err := NewHTTPConfirmer(client).Confirm(context.Background(), envelope)
	if !errors.Is(err, ErrInvalidConfirmationURL) {
		t.Fatalf("Confirm() error = %v, want ErrInvalidConfirmationURL", err)
	}
}

func TestHTTPConfirmerRejectsUntrustedHost(t *testing.T) {
	envelope := confirmationEnvelope()
	value := strings.Replace(*envelope.SubscribeURL, "sns.us-east-1.amazonaws.com", "example.com", 1)
	envelope.SubscribeURL = &value

	err := NewHTTPConfirmer(nil).Confirm(context.Background(), envelope)
	if !errors.Is(err, ErrInvalidConfirmationURL) {
		t.Fatalf("Confirm() error = %v, want ErrInvalidConfirmationURL", err)
	}
}

func TestHTTPConfirmerReturnsUnavailableForNonSuccess(t *testing.T) {
	envelope := confirmationEnvelope()
	client := &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		return &http.Response{
			StatusCode: http.StatusServiceUnavailable,
			Header:     make(http.Header),
			Body:       io.NopCloser(strings.NewReader("unavailable")),
			Request:    request,
		}, nil
	})}

	err := NewHTTPConfirmer(client).Confirm(context.Background(), envelope)
	if !errors.Is(err, ErrConfirmationUnavailable) {
		t.Fatalf("Confirm() error = %v, want ErrConfirmationUnavailable", err)
	}
}

func confirmationEnvelope() Envelope {
	topicARN := "arn:aws:sns:us-east-1:123456789012:ses-events"
	token := "confirmation-token"
	subscribeURL := "https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription&TopicArn=" + topicARN + "&Token=" + token + "&Version=2010-03-31"
	return Envelope{
		Type:             TypeSubscriptionConfirmation,
		MessageID:        "message-id",
		TopicARN:         topicARN,
		Message:          "confirm subscription",
		Timestamp:        "2026-07-31T08:00:00Z",
		SignatureVersion: "2",
		Signature:        "signature",
		SigningCertURL:   testCertificateURL,
		SubscribeURL:     &subscribeURL,
		Token:            &token,
	}
}
