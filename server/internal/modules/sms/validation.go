package sms

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf16"
	"unicode/utf8"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxBodyCharacters = 1600
	maxBatchMessages  = 100
)

var (
	e164Pattern = regexp.MustCompile(`^\+[1-9]\d{7,14}$`)
	tagPattern  = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)

	gsm7BasicRunes    = runeSet("@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà")
	gsm7ExtendedRunes = runeSet("\f^{}\\[~]|€")
)

func validateBatchSend(req BatchSendRequest) error {
	if len(req.Messages) == 0 {
		return apperrors.NewBadRequest("At least one SMS message is required")
	}
	if len(req.Messages) > maxBatchMessages {
		return apperrors.NewBadRequest(fmt.Sprintf("Batch SMS requests can include at most %d messages", maxBatchMessages))
	}
	return nil
}

func validateSend(req SendRequest) (SendRequest, error) {
	req.To = strings.TrimSpace(req.To)
	req.From = strings.TrimSpace(req.From)
	if req.To == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient is required")
	}
	if !e164Pattern.MatchString(req.To) {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient must be a valid E.164 phone number")
	}
	destinationCountry, err := smsapi.ResolveDestinationCountry(req.To)
	if err != nil {
		return SendRequest{}, apperrors.NewBadRequest("SMS recipient country is not supported")
	}
	req.DestinationCountry = destinationCountry
	if req.From == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS sender ID is required")
	}
	if utf8.RuneCountInString(req.From) > smsapi.MaxSenderIDCharacters {
		return SendRequest{}, apperrors.NewBadRequest("SMS sender ID must be at most 11 characters")
	}
	if strings.TrimSpace(req.Body) == "" {
		return SendRequest{}, apperrors.NewBadRequest("SMS body is required")
	}
	if utf8.RuneCountInString(req.Body) > maxBodyCharacters {
		return SendRequest{}, apperrors.NewBadRequest(fmt.Sprintf("SMS body must be at most %d characters", maxBodyCharacters))
	}
	if len(req.Metadata) == 0 {
		req.Metadata = json.RawMessage(`{}`)
	}
	if !json.Valid(req.Metadata) {
		return SendRequest{}, apperrors.NewBadRequest("Metadata must be valid JSON")
	}
	tags, err := normalizeSMSTags(req.Tags)
	if err != nil {
		return SendRequest{}, err
	}
	req.Tags = tags
	return req, nil
}

func normalizeSMSTags(tags []Tag) ([]Tag, error) {
	for index := range tags {
		tags[index].Name = strings.TrimSpace(tags[index].Name)
		tags[index].Value = strings.TrimSpace(tags[index].Value)
		if len(tags[index].Name) == 0 || len(tags[index].Value) == 0 || len(tags[index].Name) > 256 || len(tags[index].Value) > 256 ||
			!tagPattern.MatchString(tags[index].Name) || !tagPattern.MatchString(tags[index].Value) {
			return nil, apperrors.NewBadRequest("SMS tag names and values must use letters, numbers, underscores, or dashes and be at most 256 characters")
		}
	}
	return tags, nil
}

func countSegments(body string) int32 {
	unitCount, singleSegmentLimit, multiSegmentLimit := smsEncodingUnits(body)
	if unitCount <= singleSegmentLimit {
		return 1
	}
	return int32((unitCount + multiSegmentLimit - 1) / multiSegmentLimit)
}

func smsEncodingUnits(body string) (int, int, int) {
	septets := 0
	for _, value := range body {
		if gsm7BasicRunes[value] {
			septets++
			continue
		}
		if gsm7ExtendedRunes[value] {
			septets += 2
			continue
		}
		return len(utf16.Encode([]rune(body))), 70, 67
	}
	return septets, 160, 153
}

func runeSet(values string) map[rune]bool {
	set := make(map[rune]bool, utf8.RuneCountInString(values))
	for _, value := range values {
		set[value] = true
	}
	return set
}
