package routing

import (
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

var (
	ErrNoRoutesConfigured = errors.New("no SMS routes configured")
	ErrNoEnabledRoutes    = errors.New("no SMS routes are enabled")
	ErrInvalidProviderID  = errors.New("invalid SMS provider ID")
	ErrInvalidCountryCode = errors.New("invalid SMS destination country")
	ErrInvalidPriority    = errors.New("invalid SMS provider priority")
	ErrDuplicateProvider  = errors.New("duplicate SMS provider")
	ErrDuplicatePriority  = errors.New("duplicate SMS provider priority")
)

type Route struct {
	ProviderID         string
	DestinationCountry string
	Priority           int
	Enabled            bool
}

type Config struct {
	Routes []Route
}

func DefaultConfig() Config {
	return Config{
		Routes: []Route{
			{
				ProviderID:         "mnotify",
				DestinationCountry: sms.CountryGhana,
				Priority:           1,
				Enabled:            true,
			},
			{
				ProviderID:         "celcom",
				DestinationCountry: sms.CountryKenya,
				Priority:           1,
				Enabled:            true,
			},
			{
				ProviderID:         "arkesel",
				DestinationCountry: sms.CountryNigeria,
				Priority:           1,
				Enabled:            true,
			},
		},
	}
}

func (c Config) Validate() error {
	if len(c.Routes) == 0 {
		return ErrNoRoutesConfigured
	}

	providers := make(map[string]struct{}, len(c.Routes))
	priorities := make(map[string]string, len(c.Routes))
	enabledCount := 0

	for _, route := range c.Routes {
		providerID := normalizeProviderID(route.ProviderID)
		if providerID == "" {
			return ErrInvalidProviderID
		}
		country := sms.NormalizeCountryCode(route.DestinationCountry)
		if !sms.IsCountryCode(country) {
			return fmt.Errorf("%w for provider %q: %q", ErrInvalidCountryCode, providerID, route.DestinationCountry)
		}
		if route.Priority < 1 {
			return fmt.Errorf("%w for provider %q", ErrInvalidPriority, providerID)
		}

		providerKey := country + ":" + providerID
		if _, exists := providers[providerKey]; exists {
			return fmt.Errorf("%w for country %q: %s", ErrDuplicateProvider, country, providerID)
		}
		providers[providerKey] = struct{}{}

		priorityKey := fmt.Sprintf("%s:%d", country, route.Priority)
		if existingProvider, exists := priorities[priorityKey]; exists {
			return fmt.Errorf(
				"%w: providers %q and %q both use priority %d for country %q",
				existingProvider,
				providerID,
				route.Priority,
				country,
			)
		}
		priorities[priorityKey] = providerID

		if route.Enabled {
			enabledCount++
		}
	}

	if enabledCount == 0 {
		return ErrNoEnabledRoutes
	}
	return nil
}

func (c Config) enabledRoutes() []Route {
	routes := make([]Route, 0, len(c.Routes))
	for _, route := range c.Routes {
		if !route.Enabled {
			continue
		}
		route.ProviderID = normalizeProviderID(route.ProviderID)
		route.DestinationCountry = sms.NormalizeCountryCode(route.DestinationCountry)
		routes = append(routes, route)
	}

	sort.SliceStable(routes, func(i, j int) bool {
		if routes[i].DestinationCountry != routes[j].DestinationCountry {
			return routes[i].DestinationCountry < routes[j].DestinationCountry
		}
		return routes[i].Priority < routes[j].Priority
	})
	return routes
}

func normalizeProviderID(providerID string) string {
	return strings.ToLower(strings.TrimSpace(providerID))
}
