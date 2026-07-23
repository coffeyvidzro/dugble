package senderid

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxSenderIDLength  = 11
	maxPurposeLength   = 500
	maxProviderLength  = 120
	maxBulkSenderIDs   = 50
)

var countryCodePattern = regexp.MustCompile(`^[A-Z]{2}$`)

type Service struct{ repository *Repository }

func NewService(repository *Repository) *Service { return &Service{repository: repository} }

func (s *Service) List(ctx context.Context) ([]SenderID, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderIDsRead)
	if err != nil {
		return nil, err
	}
	senderIDs, err := s.repository.List(ctx, tenantContext.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list sender IDs", err)
	}
	return senderIDs, nil
}

func (s *Service) Get(ctx context.Context, senderID string) (SenderID, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderIDsRead)
	if err != nil {
		return SenderID{}, err
	}
	parsedSenderID, err := uuid.Parse(strings.TrimSpace(senderID))
	if err != nil {
		return SenderID{}, apperrors.NewBadRequest("Sender ID id must be a valid UUID")
	}
	value, err := s.repository.Get(ctx, parsedSenderID, tenantContext.TeamID)
	if err != nil {
		return SenderID{}, apperrors.NewNotFound("Sender ID not found")
	}
	return value, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (SenderID, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderIDsCreate)
	if err != nil {
		return SenderID{}, err
	}
	name, countryCode, purpose, provider, err := validateCreate(req)
	if err != nil {
		return SenderID{}, err
	}
	senderID, err := s.repository.Create(
		ctx,
		tenantContext.TeamID,
		name,
		countryCode,
		purpose,
		provider,
		tenantContext.UserID,
	)
	if err != nil {
		if errors.Is(err, ErrSenderIDAlreadyExists) {
			return SenderID{}, apperrors.NewConflict(
				"Sender ID already exists for this team and country",
			)
		}
		return SenderID{}, apperrors.NewInternal("Unable to create sender ID", err)
	}
	return senderID, nil
}

func (s *Service) CreateBulk(ctx context.Context, req BulkCreateRequest) ([]SenderID, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderIDsCreate)
	if err != nil {
		return nil, err
	}

	requests, err := validateBulkCreate(req)
	if err != nil {
		return nil, err
	}

	senderIDs, err := s.repository.CreateBulk(
		ctx,
		tenantContext.TeamID,
		requests,
		tenantContext.UserID,
	)
	if err != nil {
		if errors.Is(err, ErrSenderIDAlreadyExists) {
			return nil, apperrors.NewConflict(
				"One or more sender IDs already exist for this team and country",
			)
		}
		return nil, apperrors.NewInternal("Unable to create sender IDs", err)
	}
	return senderIDs, nil
}

func (s *Service) Delete(ctx context.Context, senderID string) (SenderID, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderIDsDelete)
	if err != nil {
		return SenderID{}, err
	}
	parsedSenderID, err := uuid.Parse(strings.TrimSpace(senderID))
	if err != nil {
		return SenderID{}, apperrors.NewBadRequest("Sender ID id must be a valid UUID")
	}
	value, err := s.repository.Delete(ctx, parsedSenderID, tenantContext.TeamID)
	if err != nil {
		return SenderID{}, apperrors.NewNotFound("Sender ID not found")
	}
	return value, nil
}

func validateCreate(req CreateRequest) (string, string, string, *string, error) {
	name := strings.TrimSpace(req.Name)
	countryCode := strings.ToUpper(strings.TrimSpace(req.CountryCode))
	purpose := strings.TrimSpace(req.Purpose)
	provider := normalizeOptional(req.Provider)

	if name == "" {
		return "", "", "", nil, apperrors.NewBadRequest("Sender ID name is required")
	}
	if len(name) > maxSenderIDLength {
		return "", "", "", nil, apperrors.NewBadRequest("Sender ID name must be at most 11 characters")
	}
	if !countryCodePattern.MatchString(countryCode) {
		return "", "", "", nil, apperrors.NewBadRequest("Country code must be a valid ISO 3166-1 alpha-2 code")
	}
	if purpose == "" {
		return "", "", "", nil, apperrors.NewBadRequest("Sender ID purpose is required")
	}
	if len(purpose) > maxPurposeLength {
		return "", "", "", nil, apperrors.NewBadRequest("Sender ID purpose must be at most 500 characters")
	}
	if provider != nil && len(*provider) > maxProviderLength {
		return "", "", "", nil, apperrors.NewBadRequest("Sender ID provider must be at most 120 characters")
	}
	return name, countryCode, purpose, provider, nil
}

func validateBulkCreate(req BulkCreateRequest) ([]CreateRequest, error) {
	if len(req.SenderIDs) == 0 {
		return nil, apperrors.NewBadRequest("At least one sender ID is required")
	}
	if len(req.SenderIDs) > maxBulkSenderIDs {
		return nil, apperrors.NewBadRequest("A maximum of 50 sender IDs can be requested at once")
	}

	requests := make([]CreateRequest, 0, len(req.SenderIDs))
	seen := make(map[string]struct{}, len(req.SenderIDs))
	for _, senderID := range req.SenderIDs {
		name, countryCode, purpose, provider, err := validateCreate(CreateRequest{
			Name:        senderID,
			CountryCode: req.CountryCode,
			Purpose:     req.Purpose,
			Provider:    req.Provider,
		})
		if err != nil {
			return nil, err
		}

		key := strings.ToLower(name)
		if _, exists := seen[key]; exists {
			return nil, apperrors.NewBadRequest(fmt.Sprintf("Sender ID %q is duplicated in the request", name))
		}
		seen[key] = struct{}{}
		requests = append(requests, CreateRequest{
			Name:        name,
			CountryCode: countryCode,
			Purpose:     purpose,
			Provider:    provider,
		})
	}
	return requests, nil
}

func normalizeOptional(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func requireTenantPermission(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Tenant context is required")
	}
	if !tenant.ContextCan(tenantContext, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Sender ID permission is required")
	}
	return tenantContext, nil
}
