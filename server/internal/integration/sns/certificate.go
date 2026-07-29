package sns

import (
	"context"
	"crypto/x509"
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

type certificateFetcher interface {
	Fetch(context.Context, string) (*x509.Certificate, error)
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
		if err := validateCertificateURL(request.URL.String()); err != nil {
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
	if err := validateCertificateURL(rawURL); err != nil {
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

func validateCertificateURL(rawURL string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil || parsed.Scheme != "https" || parsed.User != nil || parsed.Port() != "" {
		return errors.New("invalid SNS certificate URL")
	}
	if !isTrustedSNSHost(parsed.Hostname()) {
		return errors.New("SNS certificate URL has an untrusted host")
	}
	if !strings.HasPrefix(parsed.EscapedPath(), "/SimpleNotificationService-") || !strings.HasSuffix(parsed.EscapedPath(), ".pem") {
		return errors.New("SNS signing certificate URL has an invalid path")
	}
	return nil
}

func isTrustedSNSHost(host string) bool {
	host = strings.ToLower(host)
	return strings.HasPrefix(host, "sns.") && (strings.HasSuffix(host, ".amazonaws.com") || strings.HasSuffix(host, ".amazonaws.com.cn"))
}
