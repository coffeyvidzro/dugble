package emaildelivery

import (
	"context"
	"errors"
	"net"
	"strings"
	"time"

	"github.com/aws/smithy-go"
)

var defaultRetryDelays = []time.Duration{
	5 * time.Second,
	30 * time.Second,
	2 * time.Minute,
	10 * time.Minute,
	1 * time.Hour,
	6 * time.Hour,
}

type RetryPolicy struct {
	Delays []time.Duration
}

func DefaultRetryPolicy() RetryPolicy {
	return RetryPolicy{Delays: append([]time.Duration(nil), defaultRetryDelays...)}
}

func (p RetryPolicy) Delay(delivery uint64) time.Duration {
	delays := p.Delays
	if len(delays) == 0 {
		delays = defaultRetryDelays
	}
	index := int(delivery)
	if index < 1 {
		index = 1
	}
	index--
	if index >= len(delays) {
		index = len(delays) - 1
	}
	return delays[index]
}

func IsRetryable(err error) bool {
	if err == nil || errors.Is(err, context.Canceled) {
		return false
	}
	if errors.Is(err, context.DeadlineExceeded) {
		return true
	}
	var networkError net.Error
	if errors.As(err, &networkError) {
		return true
	}
	var apiError smithy.APIError
	if errors.As(err, &apiError) {
		switch strings.ToLower(apiError.ErrorCode()) {
		case "throttling", "throttlingexception", "requesttimeout", "requesttimeoutexception", "serviceunavailable", "internalfailure", "internalservererror":
			return true
		default:
			return false
		}
	}
	return false
}

func FailureCode(err error) string {
	if errors.Is(err, ErrUnsupportedAttachmentPath) {
		return "unsupported_attachment_path"
	}
	var apiError smithy.APIError
	if errors.As(err, &apiError) {
		code := strings.TrimSpace(apiError.ErrorCode())
		if code != "" {
			return strings.ToLower(code)
		}
	}
	return "provider_rejected"
}
