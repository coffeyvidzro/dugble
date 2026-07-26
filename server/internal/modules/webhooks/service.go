package webhooks

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) CreateEndpoint(ctx context.Context, req CreateEndpointRequest) (CreatedEndpoint, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksWrite)
	if err != nil {
		return CreatedEndpoint{}, err
	}
	validated, err := validateCreateEndpoint(req)
	if err != nil {
		return CreatedEndpoint{}, err
	}
	secret, err := newSigningSecret()
	if err != nil {
		return CreatedEndpoint{}, apperrors.NewInternal("Unable to generate webhook signing secret", err)
	}
	endpoint, err := s.repository.CreateEndpoint(ctx, tenantContext.TeamID, validated, secret)
	if err != nil {
		return CreatedEndpoint{}, apperrors.NewInternal("Unable to create webhook endpoint", err)
	}
	return CreatedEndpoint{Endpoint: endpoint, SigningSecret: secret}, nil
}

func (s *Service) ListEndpoints(ctx context.Context, req ListRequest) ([]Endpoint, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksRead)
	if err != nil {
		return nil, err
	}
	normalizeListRequest(&req)
	endpoints, err := s.repository.ListEndpoints(ctx, tenantContext.TeamID, req.Limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list webhook endpoints", err)
	}
	return endpoints, nil
}

func (s *Service) GetEndpoint(ctx context.Context, value string) (Endpoint, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksRead)
	if err != nil {
		return Endpoint{}, err
	}
	id, err := parseID(value, "Webhook endpoint")
	if err != nil {
		return Endpoint{}, err
	}
	endpoint, err := s.repository.GetEndpoint(ctx, id, tenantContext.TeamID)
	if errors.Is(err, ErrEndpointNotFound) {
		return Endpoint{}, apperrors.NewNotFound("Webhook endpoint not found")
	}
	if err != nil {
		return Endpoint{}, apperrors.NewInternal("Unable to get webhook endpoint", err)
	}
	return endpoint, nil
}

func (s *Service) UpdateEndpoint(ctx context.Context, value string, req UpdateEndpointRequest) (Endpoint, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksWrite)
	if err != nil {
		return Endpoint{}, err
	}
	id, err := parseID(value, "Webhook endpoint")
	if err != nil {
		return Endpoint{}, err
	}
	current, err := s.repository.GetEndpoint(ctx, id, tenantContext.TeamID)
	if errors.Is(err, ErrEndpointNotFound) {
		return Endpoint{}, apperrors.NewNotFound("Webhook endpoint not found")
	}
	if err != nil {
		return Endpoint{}, apperrors.NewInternal("Unable to get webhook endpoint", err)
	}
	validated, err := validateUpdateEndpoint(current, req)
	if err != nil {
		return Endpoint{}, err
	}
	endpoint, err := s.repository.UpdateEndpoint(ctx, id, tenantContext.TeamID, validated)
	if err != nil {
		return Endpoint{}, apperrors.NewInternal("Unable to update webhook endpoint", err)
	}
	return endpoint, nil
}

func (s *Service) DeleteEndpoint(ctx context.Context, value string) error {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksWrite)
	if err != nil {
		return err
	}
	id, err := parseID(value, "Webhook endpoint")
	if err != nil {
		return err
	}
	err = s.repository.DisableEndpoint(ctx, id, tenantContext.TeamID)
	if errors.Is(err, ErrEndpointNotFound) {
		return apperrors.NewNotFound("Webhook endpoint not found")
	}
	if err != nil {
		return apperrors.NewInternal("Unable to disable webhook endpoint", err)
	}
	return nil
}

func (s *Service) RotateSecret(ctx context.Context, value string) (CreatedEndpoint, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksWrite)
	if err != nil {
		return CreatedEndpoint{}, err
	}
	id, err := parseID(value, "Webhook endpoint")
	if err != nil {
		return CreatedEndpoint{}, err
	}
	secret, err := newSigningSecret()
	if err != nil {
		return CreatedEndpoint{}, apperrors.NewInternal("Unable to generate webhook signing secret", err)
	}
	if err := s.repository.RotateSecret(ctx, id, tenantContext.TeamID, secret); errors.Is(err, ErrEndpointNotFound) {
		return CreatedEndpoint{}, apperrors.NewNotFound("Webhook endpoint not found")
	} else if err != nil {
		return CreatedEndpoint{}, apperrors.NewInternal("Unable to rotate webhook signing secret", err)
	}
	endpoint, err := s.repository.GetEndpoint(ctx, id, tenantContext.TeamID)
	if err != nil {
		return CreatedEndpoint{}, apperrors.NewInternal("Unable to get webhook endpoint", err)
	}
	return CreatedEndpoint{Endpoint: endpoint, SigningSecret: secret}, nil
}

func (s *Service) TestEndpoint(ctx context.Context, value string) (Delivery, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksWrite)
	if err != nil {
		return Delivery{}, err
	}
	endpointID, err := parseID(value, "Webhook endpoint")
	if err != nil {
		return Delivery{}, err
	}
	if _, err := s.repository.GetEndpoint(ctx, endpointID, tenantContext.TeamID); errors.Is(err, ErrEndpointNotFound) {
		return Delivery{}, apperrors.NewNotFound("Webhook endpoint not found")
	} else if err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to get webhook endpoint", err)
	}

	tx, err := s.repository.BeginTx(ctx)
	if err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to begin webhook test transaction", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	event, err := s.repository.CreateTestEventTx(ctx, tx, tenantContext.TeamID)
	if err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to create webhook test event", err)
	}
	delivery, err := s.repository.CreateDeliveryTx(ctx, tx, uuid.MustParse(event.ID), endpointID)
	if err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to create webhook test delivery", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to commit webhook test transaction", err)
	}
	return delivery, nil
}

func (s *Service) ListEvents(ctx context.Context, req ListRequest) ([]Event, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksRead)
	if err != nil {
		return nil, err
	}
	normalizeListRequest(&req)
	events, err := s.repository.ListEvents(ctx, tenantContext.TeamID, req.Limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list webhook events", err)
	}
	return events, nil
}

func (s *Service) GetEvent(ctx context.Context, value string) (Event, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksRead)
	if err != nil {
		return Event{}, err
	}
	id, err := parseID(value, "Webhook event")
	if err != nil {
		return Event{}, err
	}
	event, err := s.repository.GetEvent(ctx, id, tenantContext.TeamID)
	if errors.Is(err, ErrEventNotFound) {
		return Event{}, apperrors.NewNotFound("Webhook event not found")
	}
	if err != nil {
		return Event{}, apperrors.NewInternal("Unable to get webhook event", err)
	}
	return event, nil
}

func (s *Service) GetDelivery(ctx context.Context, value string) (Delivery, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksRead)
	if err != nil {
		return Delivery{}, err
	}
	id, err := parseID(value, "Webhook delivery")
	if err != nil {
		return Delivery{}, err
	}
	delivery, err := s.repository.GetDelivery(ctx, id, tenantContext.TeamID)
	if errors.Is(err, ErrDeliveryNotFound) {
		return Delivery{}, apperrors.NewNotFound("Webhook delivery not found")
	}
	if err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to get webhook delivery", err)
	}
	return delivery, nil
}

func (s *Service) RetryDelivery(ctx context.Context, value string) (Delivery, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWebhooksWrite)
	if err != nil {
		return Delivery{}, err
	}
	id, err := parseID(value, "Webhook delivery")
	if err != nil {
		return Delivery{}, err
	}
	delivery, err := s.repository.RetryDelivery(ctx, id, tenantContext.TeamID)
	if errors.Is(err, ErrDeliveryNotFound) {
		return Delivery{}, apperrors.NewNotFound("Webhook delivery not found")
	}
	if err != nil {
		return Delivery{}, apperrors.NewInternal("Unable to retry webhook delivery", err)
	}
	return delivery, nil
}

func requireTenant(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Team context is required")
	}
	if !tenant.ContextCan(tenantContext, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Team permission is required")
	}
	return tenantContext, nil
}

func parseID(value, resource string) (uuid.UUID, error) {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest(resource + " id must be a valid UUID")
	}
	return id, nil
}

func normalizeListRequest(req *ListRequest) {
	if req.Limit <= 0 || req.Limit > 100 {
		req.Limit = 50
	}
	if req.Offset < 0 {
		req.Offset = 0
	}
}
