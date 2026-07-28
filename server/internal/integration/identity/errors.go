package identity

import "fmt"

type APIError struct {
	StatusCode int
	Code       string
	Retryable  bool
}

func (e *APIError) Error() string {
	if e.Code == "" {
		return fmt.Sprintf("identity AI returned status %d", e.StatusCode)
	}
	return fmt.Sprintf("identity AI returned status %d (%s)", e.StatusCode, e.Code)
}

func retryableStatus(statusCode int) bool {
	return statusCode == 429 || statusCode >= 500
}
