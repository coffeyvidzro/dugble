package domain

import (
	"errors"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	emailInfrastructureProvisioningMessage = "Customer email infrastructure is being prepared; retry sender-domain creation shortly"
	emailInfrastructureRetryAfterHeader    = "10"
	emailInfrastructureRetryAfterSeconds   = 10
)

type ProvisioningResponse struct {
	Status            string `json:"status"`
	Message           string `json:"message"`
	RetryAfterSeconds int    `json:"retry_after_seconds"`
}

func emailInfrastructureProvisioningResponse() ProvisioningResponse {
	return ProvisioningResponse{
		Status:            "provisioning",
		Message:           "Customer email infrastructure is being prepared",
		RetryAfterSeconds: emailInfrastructureRetryAfterSeconds,
	}
}

func isEmailInfrastructureProvisioning(err error) bool {
	var appErr *apperrors.AppError
	return errors.As(err, &appErr) &&
		appErr.Code == "CONFLICT" &&
		appErr.Message == emailInfrastructureProvisioningMessage
}
