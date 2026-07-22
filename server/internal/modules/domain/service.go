package domain

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxDomainLength         = 253
	maxProviderLength       = 120
	maxProviderRegionLength = 120
)

var domainPattern = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$`)

type Service struct{ repository *Repository }

func NewService(repository *Repository) *Service { return &Service{repository: repository} }

func (s *Service) List(ctx context.Context) ([]SenderDomain, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsRead)
	if err != nil {
		return nil, err
	}
	domains, err := s.repository.List(ctx, tenantContext.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list sender domains", err)
	}
	return domains, nil
}

func (s *Service) Get(ctx context.Context, domainID string) (SenderDomain, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsRead)
	if err != nil {
		return SenderDomain{}, err
	}
	parsedDomainID, err := uuid.Parse(strings.TrimSpace(domainID))
	if err != nil {
		return SenderDomain{}, apperrors.NewBadRequest("Sender domain id must be a valid UUID")
	}
	domain, err := s.repository.Get(ctx, parsedDomainID, tenantContext.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	return domain, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (SenderDomain, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsCreate)
	if err != nil {
		return SenderDomain{}, err
	}
	domainName, provider, providerRegion, err := validateCreate(req)
	if err != nil {
		return SenderDomain{}, err
	}
	domain, err := s.repository.Create(
		ctx,
		tenantContext.TeamID,
		domainName,
		provider,
		providerRegion,
		tenantContext.UserID,
	)
	if err != nil {
		if errors.Is(err, ErrSenderDomainAlreadyExists) {
			return SenderDomain{}, apperrors.NewConflict("Sender domain already exists")
		}
		return SenderDomain{}, apperrors.NewInternal("Unable to create sender domain", err)
	}
	return domain, nil
}

func (s *Service) Delete(ctx context.Context, domainID string) (SenderDomain, error) {
	tenantContext, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsDelete)
	if err != nil {
		return SenderDomain{}, err
	}
	parsedDomainID, err := uuid.Parse(strings.TrimSpace(domainID))
	if err != nil {
		return SenderDomain{}, apperrors.NewBadRequest("Sender domain id must be a valid UUID")
	}
	domain, err := s.repository.Delete(ctx, parsedDomainID, tenantContext.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	return domain, nil
}

func validateCreate(req CreateRequest) (string, string, string, error) {
	domainName := normalizeDomain(req.Domain)
	provider := strings.TrimSpace(req.Provider)
	providerRegion := strings.TrimSpace(req.ProviderRegion)

	if provider == "" {
		provider = DefaultProvider
	}
	if domainName == "" {
		return "", "", "", apperrors.NewBadRequest("Sender domain is required")
	}
	if len(domainName) > maxDomainLength || !domainPattern.MatchString(domainName) {
		return "", "", "", apperrors.NewBadRequest("Sender domain must be a valid domain name")
	}
	if len(provider) > maxProviderLength {
		return "", "", "", apperrors.NewBadRequest("Sender domain provider must be at most 120 characters")
	}
	if providerRegion == "" {
		return "", "", "", apperrors.NewBadRequest("Sender domain provider region is required")
	}
	if len(providerRegion) > maxProviderRegionLength {
		return "", "", "", apperrors.NewBadRequest("Sender domain provider region must be at most 120 characters")
	}
	return domainName, provider, providerRegion, nil
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

func requireTenantPermission(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Tenant context is required")
	}
	if !tenant.ContextCan(tenantContext, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Sender domain permission is required")
	}
	return tenantContext, nil
}
