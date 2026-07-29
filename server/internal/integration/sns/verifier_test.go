package sns

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"testing"
	"time"
)

type staticCertificateFetcher struct{ certificate *x509.Certificate }

func (f staticCertificateFetcher) Fetch(context.Context, string) (*x509.Certificate, error) {
	return f.certificate, nil
}

func TestVerifierAcceptsSignedAllowedNotification(t *testing.T) {
	privateKey, certificate := testCertificate(t)
	message := Message{Type: "Notification", MessageID: "notification-1", TopicARN: "arn:aws:sns:us-east-1:123456789012:events", Subject: "Amazon SES Email Event Notification", Message: `{"eventType":"Delivery"}`, Timestamp: "2026-07-29T12:00:00Z", SignatureVersion: "2", SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-test.pem"}
	canonical, err := canonicalMessage(message)
	if err != nil {
		t.Fatal(err)
	}
	digest := sha256.Sum256([]byte(canonical))
	signature, err := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, digest[:])
	if err != nil {
		t.Fatal(err)
	}
	message.Signature = base64.StdEncoding.EncodeToString(signature)
	raw, _ := json.Marshal(message)
	verifier := NewVerifier([]string{message.TopicARN}, nil)
	verifier.fetcher = staticCertificateFetcher{certificate}
	verified, err := verifier.Verify(context.Background(), raw)
	if err != nil {
		t.Fatalf("verify notification: %v", err)
	}
	if verified.MessageID != message.MessageID {
		t.Fatalf("message id = %q", verified.MessageID)
	}
}

func TestVerifierRejectsUnknownTopicBeforeCertificateFetch(t *testing.T) {
	verifier := NewVerifier([]string{"arn:aws:sns:us-east-1:123456789012:allowed"}, nil)
	raw := []byte(`{"Type":"Notification","MessageId":"id","TopicArn":"arn:aws:sns:us-east-1:123456789012:other"}`)
	if _, err := verifier.Verify(context.Background(), raw); err == nil {
		t.Fatal("expected unknown topic to be rejected")
	}
}

func TestCanonicalMessageDoesNotEndWithNewline(t *testing.T) {
	message := Message{
		Type:      "Notification",
		MessageID: "notification-1",
		TopicARN:  "arn:aws:sns:us-east-1:123456789012:events",
		Message:   "My Test Message",
		Timestamp: "2019-01-31T04:37:04.321Z",
	}
	canonical, err := canonicalMessage(message)
	if err != nil {
		t.Fatalf("canonicalize SNS message: %v", err)
	}
	want := "Message\nMy Test Message\nMessageId\nnotification-1\nTimestamp\n2019-01-31T04:37:04.321Z\nTopicArn\narn:aws:sns:us-east-1:123456789012:events\nType\nNotification"
	if canonical != want {
		t.Fatalf("canonical SNS message mismatch:\n got: %q\nwant: %q", canonical, want)
	}
}

func TestValidateAWSURL(t *testing.T) {
	valid := "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-deadbeef.pem"
	if err := validateCertificateURL(valid); err != nil {
		t.Fatalf("valid URL rejected: %v", err)
	}
	for _, candidate := range []string{"http://sns.us-east-1.amazonaws.com/SimpleNotificationService-x.pem", "https://sns.us-east-1.amazonaws.com.attacker.example/SimpleNotificationService-x.pem", "https://sns.us-east-1.amazonaws.com/not-a-certificate.pem"} {
		if err := validateCertificateURL(candidate); err == nil {
			t.Errorf("expected %q to be rejected", candidate)
		}
	}
}

func testCertificate(t *testing.T) (*rsa.PrivateKey, *x509.Certificate) {
	t.Helper()
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	template := &x509.Certificate{SerialNumber: big.NewInt(1), Subject: pkix.Name{CommonName: "SNS test"}, NotBefore: time.Now().Add(-time.Hour), NotAfter: time.Now().Add(time.Hour), KeyUsage: x509.KeyUsageDigitalSignature}
	der, err := x509.CreateCertificate(rand.Reader, template, template, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	certificate, err := x509.ParseCertificate(der)
	if err != nil {
		t.Fatal(err)
	}
	return key, certificate
}
