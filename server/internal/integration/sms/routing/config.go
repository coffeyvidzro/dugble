package routing

import (
	"errors"
	"fmt"
	"sort"
	"strings"
)

var (
	ErrNoRoutesConfigured = errors.New("no SMS routes configured")
	ErrNoEnabledRoutes    = errors.New("no SMS routes are enabled")
	ErrInvalidProviderID  = errors.New("invalid SMS provider ID")
	ErrInvalidPriority    = errors.New("invalid SMS provider priority")
	ErrDuplicateProvider  = errors.New("duplicate SMS provider")
	ErrDuplicatePriority  = errors.New("duplicate SMS provider priority")
)

type Route struct {
	ProviderID string
	Priority   int
	Enabled    bool
}

type Config struct {
	Routes []Route
}

func DefaultConfig() Config {
	return Config{
		Routes: []Route{
			{
				ProviderID: "arkesel",
				Priority:   1,
				Enabled:    true,
			},
			{
				ProviderID: "mnotify",
				Priority:   2,
				Enabled:    true,
			},
		},
	}
}

func (c Config) Validate() error {
	if len(c.Routes) == 0 {
		return ErrNoRoutesConfigured
	}

	providers := make(map[string]struct{}, len(c.Routes))
	priorities := make(map[int]string, len(c.Routes))
	enabledCount := 0

	for _, route := range c.Routes {
		providerID := normalizeProviderID(route.ProviderID)
		if providerID == "" {
			return ErrInvalidProviderID
		}

		if route.Priority < 1 {
			return fmt.Errorf(
				"%w for provider %q",
				ErrInvalidPriority,
				providerID,
			)
		}

		if _, exists := providers[providerID]; exists {
			return fmt.Errorf(
				"%w: %s",
				ErrDuplicateProvider,
				providerID,
			)
		}
		providers[providerID] = struct{}{}

		if existingProvider, exists := priorities[route.Priority]; exists {
			return fmt.Errorf(
				"%w: providers %q and %q both use priority %d",
				ErrDuplicatePriority,
				existingProvider,
				providerID,
				route.Priority,
			)
		}
		priorities[route.Priority] = providerID

		if route.Enabled {
			enabledCount++
		}
	}

	if enabledCount == 0 {
		return ErrNoEnabledRoutes
	}

	return nil
}

// enabledRoutes returns a normalized, sorted copy. The caller can safely retain
// or modify the returned slice without mutating Config.
func (c Config) enabledRoutes() []Route {
	routes := make([]Route, 0, len(c.Routes))

	for _, route := range c.Routes {
		if !route.Enabled {
			continue
		}

		route.ProviderID = normalizeProviderID(route.ProviderID)
		routes = append(routes, route)
	}

	sort.SliceStable(routes, func(i, j int) bool {
		return routes[i].Priority < routes[j].Priority
	})

	return routes
}

func normalizeProviderID(providerID string) string {
	return strings.ToLower(strings.TrimSpace(providerID))
}
