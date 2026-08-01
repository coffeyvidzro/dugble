package domain

import (
	"regexp"
	"strings"

	"github.com/google/uuid"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const maxDomainLength = 253

var (
	domainPattern    = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$`)
	labelPattern     = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`)
	supportedRegions = map[string]struct{}{
		"eu-north-1": {}, "us-east-1": {}, "eu-west-1": {}, "sa-east-1": {}, "ap-northeast-1": {},
	}
)

func validateCreate(req CreateRequest) (string, string, string, error) {
	domainName := normalizeDomain(req.Domain)
	region := strings.ToLower(strings.TrimSpace(req.Region))
	returnPath := strings.ToLower(strings.TrimSpace(req.CustomReturnPath))
	if region == "" {
		region = DefaultRegion
	}
	if returnPath == "" {
		returnPath = DefaultCustomReturnPath
	}
	if domainName == "" {
		return "", "", "", apperrors.NewBadRequest("Sender domain is required")
	}
	if len(domainName) > maxDomainLength || !domainPattern.MatchString(domainName) {
		return "", "", "", apperrors.NewBadRequest("Sender domain must be a valid domain name")
	}
	if _, ok := supportedRegions[region]; !ok {
		return "", "", "", apperrors.NewBadRequest("Sender domain region is not supported")
	}
	if !labelPattern.MatchString(returnPath) {
		return "", "", "", apperrors.NewBadRequest("Custom return path must be a valid DNS label")
	}
	return domainName, region, returnPath, nil
}

func normalizeDomain(value string) string {
	domainName := strings.TrimSpace(strings.ToLower(value))
	domainName = strings.TrimPrefix(domainName, "http://")
	domainName = strings.TrimPrefix(domainName, "https://")
	domainName = strings.TrimSuffix(domainName, ".")
	if before, _, ok := strings.Cut(domainName, "/"); ok {
		domainName = before
	}
	return domainName
}

func parseDomainID(value string) (uuid.UUID, error) {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("Sender domain id must be a valid UUID")
	}
	return id, nil
}
