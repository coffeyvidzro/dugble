package sns

import (
	"context"
	"crypto"
	"crypto/rsa"
	"crypto/sha1" // SNS signature version 1 requires SHA-1 for protocol compatibility.
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

const maxCertificateSize = 64 << 10

var ErrVerificationUnavailable = errors.New("SNS verification is temporarily unavailable")

type Message struct {
	Type             string `json:"Type"`
	MessageID        string `json:"MessageId"`
	TopicARN         string `json:"TopicArn"`
	Subject          string `json:"Subject,omitempty"`
	Message          string `json:"Message"`
	Timestamp        string `json:"Timestamp"`
	Token            string `json:"Token,omitempty"`
	SubscribeURL     string `json:"SubscribeURL,omitempty"`
	SignatureVersion string `json:"SignatureVersion"`
	Signature        string `json:"Signature"`
	SigningCertURL   string `json:"SigningCertURL"`
}

type certificateFetcher interface {
	Fetch(context.Context, string) (*x509.Certificate, error)
}

type Verifier struct {
	topics  map[string]struct{}
	fetcher certificateFetcher
}

func NewVerifier(topicARNs []string, client *http.Client) *Verifier {
	topics := make(map[string]struct{}, len(topicARNs))
	for _, topic := range topicARNs {
		if topic = strings.TrimSpace(topic); topic != "" {
			topics[topic] = struct{}{}
		}
	}
	return &Verifier{topics: topics, fetcher: newCertificateCache(client)}
}

func (v *Verifier) Verify(ctx context.Context, raw []byte) (Message, error) {
	if v == nil || v.fetcher == nil {
		return Message{}, errors.New("SNS verifier is not configured")
	}
	var message Message
	if err := json.Unmarshal(raw, &message); err != nil {
		return Message{}, fmt.Errorf("decode SNS message: %w", err)
	}
	if _, ok := v.topics[message.TopicARN]; !ok {
		return Message{}, errors.New("SNS topic is not allowed")
	}
	canonical, err := canonicalMessage(message)
	if err != nil {
		return Message{}, err
	}
	certificate, err := v.fetcher.Fetch(ctx, message.SigningCertURL)
	if err != nil {
		return Message{}, fmt.Errorf("%w: fetch signing certificate: %v", ErrVerificationUnavailable, err)
	}
	publicKey, ok := certificate.PublicKey.(*rsa.PublicKey)
	if !ok {
		return Message{}, errors.New("SNS signing certificate does not contain an RSA key")
	}
	signature, err := base64.StdEncoding.DecodeString(message.Signature)
	if err != nil {
		return Message{}, errors.New("SNS signature is not valid base64")
	}
	var digest []byte
	var algorithm crypto.Hash
	switch message.SignatureVersion {
	case "1":
		sum := sha1.Sum([]byte(canonical))
		digest, algorithm = sum[:], crypto.SHA1
	case "2":
		sum := sha256.Sum256([]byte(canonical))
		digest, algorithm = sum[:], crypto.SHA256
	default:
		return Message{}, errors.New("unsupported SNS signature version")
	}
	if err := rsa.VerifyPKCS1v15(publicKey, algorithm, digest, signature); err != nil {
		return Message{}, errors.New("SNS signature verification failed")
	}
	return message, nil
}

func canonicalMessage(message Message) (string, error) {
	if strings.TrimSpace(message.MessageID) == "" || strings.TrimSpace(message.TopicARN) == "" || strings.TrimSpace(message.Timestamp) == "" {
		return "", errors.New("SNS message is missing required fields")
	}
	fields := make([]string, 0, 14)
	appendField := func(name, value string) { fields = append(fields, name, value) }
	switch message.Type {
	case "Notification":
		appendField("Message", message.Message)
		appendField("MessageId", message.MessageID)
		if message.Subject != "" {
			appendField("Subject", message.Subject)
		}
		appendField("Timestamp", message.Timestamp)
		appendField("TopicArn", message.TopicARN)
		appendField("Type", message.Type)
	case "SubscriptionConfirmation", "UnsubscribeConfirmation":
		if message.Token == "" || message.SubscribeURL == "" {
			return "", errors.New("SNS confirmation is missing required fields")
		}
		appendField("Message", message.Message)
		appendField("MessageId", message.MessageID)
		appendField("SubscribeURL", message.SubscribeURL)
		appendField("Timestamp", message.Timestamp)
		appendField("Token", message.Token)
		appendField("TopicArn", message.TopicARN)
		appendField("Type", message.Type)
	default:
		return "", errors.New("unsupported SNS message type")
	}
	return strings.Join(fields, "\n"), nil
}

type certificateCache struct {
	client *http.Client
	mu     sync.Mutex
	items  map[string]*x509.Certificate
}

func newCertificateCache(client *http.Client) *certificateCache {
	if client == nil {
		client = &http.Client{Timeout: 5 * time.Second}
	}
	clientCopy := *client
	clientCopy.CheckRedirect = func(request *http.Request, via []*http.Request) error {
		if err := validateAWSURL(request.URL.String()); err != nil {
			return err
		}
		if len(via) >= 3 {
			return errors.New("too many SNS certificate redirects")
		}
		return nil
	}
	return &certificateCache{client: &clientCopy, items: make(map[string]*x509.Certificate)}
}

func (c *certificateCache) Fetch(ctx context.Context, rawURL string) (*x509.Certificate, error) {
	if err := validateAWSURL(rawURL); err != nil {
		return nil, err
	}
	c.mu.Lock()
	if certificate := c.items[rawURL]; certificate != nil && time.Now().Before(certificate.NotAfter) {
		c.mu.Unlock()
		return certificate, nil
	}
	c.mu.Unlock()

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return nil, err
	}
	response, err := c.client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("certificate endpoint returned HTTP %d", response.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, maxCertificateSize+1))
	if err != nil {
		return nil, err
	}
	if len(body) > maxCertificateSize {
		return nil, errors.New("SNS signing certificate is too large")
	}
	block, _ := pem.Decode(body)
	if block == nil || block.Type != "CERTIFICATE" {
		return nil, errors.New("SNS signing certificate is not valid PEM")
	}
	certificate, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, err
	}
	if time.Now().Before(certificate.NotBefore) || time.Now().After(certificate.NotAfter) {
		return nil, errors.New("SNS signing certificate is not currently valid")
	}
	c.mu.Lock()
	c.items[rawURL] = certificate
	c.mu.Unlock()
	return certificate, nil
}

func validateAWSURL(rawURL string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil || parsed.Scheme != "https" || parsed.User != nil || parsed.Port() != "" {
		return errors.New("invalid SNS AWS URL")
	}
	host := strings.ToLower(parsed.Hostname())
	if !(strings.HasPrefix(host, "sns.") && (strings.HasSuffix(host, ".amazonaws.com") || strings.HasSuffix(host, ".amazonaws.com.cn"))) {
		return errors.New("SNS AWS URL has an untrusted host")
	}
	if !strings.HasPrefix(parsed.EscapedPath(), "/SimpleNotificationService-") || !strings.HasSuffix(parsed.EscapedPath(), ".pem") {
		return errors.New("SNS signing certificate URL has an invalid path")
	}
	return nil
}
