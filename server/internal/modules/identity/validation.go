package identity

import (
	"errors"
	"strings"
)

func validateCreateVerification(request CreateVerificationRequest) (CreateVerificationRequest, error) {
	request.ExternalReference = strings.TrimSpace(request.ExternalReference)
	request.SubjectReference = strings.TrimSpace(request.SubjectReference)
	if request.ReferenceID != nil {
		value := strings.TrimSpace(*request.ReferenceID)
		request.ReferenceID = &value
	}
	if request.SubjectReference == "" {
		return CreateVerificationRequest{}, errors.New("subject reference is required")
	}
	if len(request.SubjectReference) > 200 || len(request.ExternalReference) > 200 {
		return CreateVerificationRequest{}, errors.New("identity references must not exceed 200 characters")
	}
	if !validPurpose(request.Purpose) {
		return CreateVerificationRequest{}, errors.New("identity verification purpose is invalid")
	}
	checks, err := normalizeChecks(request.Checks)
	if err != nil {
		return CreateVerificationRequest{}, err
	}
	request.Checks = checks
	if containsCheck(checks, CheckFaceComparison) && (request.ReferenceID == nil || *request.ReferenceID == "") {
		return CreateVerificationRequest{}, errors.New("face comparison requires a reference ID")
	}
	return request, nil
}

func normalizeChecks(checks []Check) ([]Check, error) {
	if len(checks) == 0 {
		return nil, errors.New("at least one identity check is required")
	}
	result := make([]Check, 0, len(checks))
	seen := make(map[Check]struct{}, len(checks))
	for _, check := range checks {
		if !validCheck(check) {
			return nil, errors.New("identity verification check is invalid")
		}
		if _, exists := seen[check]; exists {
			return nil, errors.New("identity verification checks must not contain duplicates")
		}
		seen[check] = struct{}{}
		result = append(result, check)
	}
	return result, nil
}

func validPurpose(purpose Purpose) bool {
	switch purpose {
	case PurposeOnboarding, PurposeStepUpAuthentication, PurposeAccountRecovery, PurposeTransaction, PurposeBotDeterrence:
		return true
	default:
		return false
	}
}

func validCheck(check Check) bool {
	switch check {
	case CheckFaceLiveness, CheckFaceComparison, CheckPresentationAttack, CheckBiometricQuality:
		return true
	default:
		return false
	}
}

func containsCheck(checks []Check, target Check) bool {
	for _, check := range checks {
		if check == target {
			return true
		}
	}
	return false
}
