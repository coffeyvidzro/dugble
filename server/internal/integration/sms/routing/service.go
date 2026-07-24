package routing

import (
	"context"
	"errors"
	"fmt"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	"github.com/coffeyvidzro/dugble/server/internal/integration/sms/provider"
)

var (
	ErrRoutingServiceNil     = errors.New("SMS routing service is nil")
	ErrStrategyRequired      = errors.New("SMS routing strategy is required")
	ErrProviderRequired      = errors.New("SMS provider is required")
	ErrProviderNotRegistered = errors.New("SMS provider is not registered")
)

type Service struct {
	// routes is a normalized, priority-sorted snapshot created at startup.
	// Keeping a private snapshot prevents later mutation of the caller's Config
	// from silently changing production routing.
	routes    []Route
	strategy  Strategy
	providers map[string]provider.Provider
}

func NewService(
	config Config,
	strategy Strategy,
	providers ...provider.Provider,
) (*Service, error) {
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("validate SMS routing config: %w", err)
	}
	if strategy == nil {
		return nil, ErrStrategyRequired
	}

	routes := config.enabledRoutes()
	registry := make(map[string]provider.Provider, len(providers))

	for _, upstream := range providers {
		if upstream == nil {
			return nil, ErrProviderRequired
		}

		providerID := normalizeProviderID(upstream.ID())
		if providerID == "" {
			return nil, ErrInvalidProviderID
		}

		if _, exists := registry[providerID]; exists {
			return nil, fmt.Errorf(
				"%w: %s",
				ErrDuplicateProvider,
				providerID,
			)
		}

		registry[providerID] = upstream
	}

	// Fail at application startup instead of discovering a missing provider
	// only after a customer submits an SMS.
	for _, route := range routes {
		if _, exists := registry[route.ProviderID]; !exists {
			return nil, fmt.Errorf(
				"%w: %s",
				ErrProviderNotRegistered,
				route.ProviderID,
			)
		}
	}

	return &Service{
		routes:    routes,
		strategy:  strategy,
		providers: registry,
	}, nil
}

func (s *Service) Route(
	ctx context.Context,
	req sms.SendRequest,
) ([]sms.Provider, error) {
	if s == nil {
		return nil, ErrRoutingServiceNil
	}
	if s.strategy == nil {
		return nil, ErrStrategyRequired
	}
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	req = req.Normalize()
	eligibleRoutes := make([]Route, 0, len(s.routes))
	for _, route := range s.routes {
		if route.TrafficClass == req.TrafficClass {
			eligibleRoutes = append(eligibleRoutes, route)
		}
	}
	if len(eligibleRoutes) == 0 {
		return nil, sms.ErrNoProviderAvailable
	}

	// A strategy receives a copy so a custom implementation cannot mutate the
	// service's route snapshot.
	routes := make([]Route, len(eligibleRoutes))
	copy(routes, eligibleRoutes)

	orderedRoutes := s.strategy.Order(ctx, req, routes)
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	// Only providers present in the traffic-class-specific route snapshot are
	// eligible. This prevents a custom strategy from injecting a provider from
	// another traffic class or a disabled route.
	enabled := make(map[string]struct{}, len(eligibleRoutes))
	for _, route := range eligibleRoutes {
		enabled[route.ProviderID] = struct{}{}
	}

	result := make([]sms.Provider, 0, len(orderedRoutes))
	seen := make(map[string]struct{}, len(orderedRoutes))

	for _, route := range orderedRoutes {
		providerID := normalizeProviderID(route.ProviderID)
		if providerID == "" {
			continue
		}
		if _, allowed := enabled[providerID]; !allowed {
			continue
		}
		if _, exists := seen[providerID]; exists {
			continue
		}

		upstream, exists := s.providers[providerID]
		if !exists || upstream == nil {
			continue
		}

		seen[providerID] = struct{}{}
		result = append(result, upstream)
	}

	if len(result) == 0 {
		return nil, sms.ErrNoProviderAvailable
	}

	return result, nil
}

// Provider returns a registered provider even when its route is currently
// disabled. This allows delivery-status checks for messages accepted before a
// provider was disabled.
func (s *Service) Provider(
	providerID string,
) (sms.Provider, bool) {
	if s == nil {
		return nil, false
	}

	providerID = normalizeProviderID(providerID)
	if providerID == "" {
		return nil, false
	}

	upstream, exists := s.providers[providerID]
	return upstream, exists
}

func (s *Service) ShouldFallback(
	ctx context.Context,
	providerID string,
	err error,
) bool {
	if s == nil || s.strategy == nil || err == nil {
		return false
	}
	if ctx.Err() != nil {
		return false
	}

	providerID = normalizeProviderID(providerID)
	if providerID == "" {
		return false
	}

	return s.strategy.ShouldFallback(
		ctx,
		providerID,
		err,
	)
}
