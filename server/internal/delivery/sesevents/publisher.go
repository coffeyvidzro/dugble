package sesevents

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type publisher interface {
	Publish(context.Context, string, []byte, map[string]string, string) error
}

type confirmer interface {
	Confirm(context.Context, string) error
}

// HTTPConfirmer confirms only pre-verified subscriptions hosted by Amazon SNS.
type HTTPConfirmer struct{ client *http.Client }

func NewHTTPConfirmer(client *http.Client) *HTTPConfirmer {
	if client == nil {
		client = &http.Client{Timeout: 5 * time.Second, CheckRedirect: func(request *http.Request, via []*http.Request) error {
			if err := validateSubscribeURL(request.URL); err != nil {
				return err
			}
			if len(via) >= 3 {
				return errors.New("too many SNS confirmation redirects")
			}
			return nil
		}}
	}
	return &HTTPConfirmer{client: client}
}

func (c *HTTPConfirmer) Confirm(ctx context.Context, rawURL string) error {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return err
	}
	if err := validateSubscribeURL(parsed); err != nil {
		return err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, parsed.String(), nil)
	if err != nil {
		return err
	}
	response, err := c.client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, 4<<10))
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("SNS confirmation returned HTTP %d", response.StatusCode)
	}
	return nil
}

func validateSubscribeURL(parsed *url.URL) error {
	if parsed == nil || parsed.Scheme != "https" || parsed.User != nil || parsed.Port() != "" {
		return errors.New("invalid SNS subscription URL")
	}
	host := strings.ToLower(parsed.Hostname())
	if !(strings.HasPrefix(host, "sns.") && (strings.HasSuffix(host, ".amazonaws.com") || strings.HasSuffix(host, ".amazonaws.com.cn"))) {
		return errors.New("untrusted SNS subscription host")
	}
	return nil
}
