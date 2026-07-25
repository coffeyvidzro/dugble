package sms

import (
	"errors"
	"strings"
)

const (
	CountryGhana   = "GH"
	CountryNigeria = "NG"
)

var ErrUnsupportedDestination = errors.New("unsupported SMS destination country")

type destinationPrefix struct {
	Prefix      string
	CountryCode string
}

// Keep this list ordered from the longest calling code to the shortest when
// additional markets are introduced.
var destinationPrefixes = []destinationPrefix{
	{Prefix: "+233", CountryCode: CountryGhana},
	{Prefix: "+234", CountryCode: CountryNigeria},
}

func ResolveDestinationCountry(number string) (string, error) {
	number = strings.TrimSpace(number)
	for _, candidate := range destinationPrefixes {
		if strings.HasPrefix(number, candidate.Prefix) {
			return candidate.CountryCode, nil
		}
	}
	return "", ErrUnsupportedDestination
}

func NormalizeCountryCode(value string) string {
	return strings.ToUpper(strings.TrimSpace(value))
}

func IsCountryCode(value string) bool {
	value = NormalizeCountryCode(value)
	if len(value) != 2 {
		return false
	}
	for _, character := range value {
		if character < 'A' || character > 'Z' {
			return false
		}
	}
	return true
}
