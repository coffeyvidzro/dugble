package billing

import (
	"errors"
	"strings"

	"github.com/google/uuid"
)

var (
	ErrInvalidTeamID      = errors.New("billing team id is required")
	ErrInvalidMessageID   = errors.New("billing message id is required")
	ErrInvalidDestination = errors.New("billing destination country is required")
	ErrInvalidSegments    = errors.New("billing segments must be greater than zero")
)

func validateSMSAuthorization(input SMSAuthorizationInput) (SMSAuthorizationInput, error) {
	if input.TeamID == uuid.Nil {
		return SMSAuthorizationInput{}, ErrInvalidTeamID
	}
	if input.MessageID == uuid.Nil {
		return SMSAuthorizationInput{}, ErrInvalidMessageID
	}
	input.DestinationCountry = strings.ToUpper(strings.TrimSpace(input.DestinationCountry))
	if len(input.DestinationCountry) != 2 {
		return SMSAuthorizationInput{}, ErrInvalidDestination
	}
	if input.Segments <= 0 {
		return SMSAuthorizationInput{}, ErrInvalidSegments
	}
	return input, nil
}

func validateEmailAuthorization(input EmailAuthorizationInput) error {
	if input.TeamID == uuid.Nil {
		return ErrInvalidTeamID
	}
	if input.MessageID == uuid.Nil {
		return ErrInvalidMessageID
	}
	return nil
}
