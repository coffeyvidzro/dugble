package routing

import (
	"context"
	"errors"
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func TestRouteFiltersProvidersByTrafficClass(t *testing.T) {
	a2pProvider := trafficClassProvider{id: "a2p-provider"}
	localProvider := trafficClassProvider{id: "local-provider"}
	service, err := NewService(
		Config{Routes: []Route{
			{ProviderID: a2pProvider.id, TrafficClass: sms.TrafficClassA2P, Priority: 1, Enabled: true},
			{ProviderID: localProvider.id, TrafficClass: sms.TrafficClassLocal, Priority: 1, Enabled: true},
		}},
		NewPriorityStrategy(),
		a2pProvider,
		localProvider,
	)
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	providers, err := service.Route(context.Background(), sms.SendRequest{
		To:           "+233241234567",
		From:         "DUGBLE",
		Message:      "hello",
		TrafficClass: sms.TrafficClassLocal,
	})
	if err != nil {
		t.Fatalf("Route returned error: %v", err)
	}
	if len(providers) != 1 || providers[0].ID() != localProvider.id {
		t.Fatalf("Route providers = %#v, want only %q", providers, localProvider.id)
	}
}

func TestRouteDoesNotCrossTrafficClasses(t *testing.T) {
	a2pProvider := trafficClassProvider{id: "a2p-provider"}
	service, err := NewService(
		Config{Routes: []Route{
			{ProviderID: a2pProvider.id, TrafficClass: sms.TrafficClassA2P, Priority: 1, Enabled: true},
		}},
		NewPriorityStrategy(),
		a2pProvider,
	)
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	_, err = service.Route(context.Background(), sms.SendRequest{
		To:           "+233241234567",
		From:         "DUGBLE",
		Message:      "hello",
		TrafficClass: sms.TrafficClassLocal,
	})
	if !errors.Is(err, sms.ErrNoProviderAvailable) {
		t.Fatalf("Route error = %v, want ErrNoProviderAvailable", err)
	}
}

func TestConfigAllowsSameProviderAcrossTrafficClasses(t *testing.T) {
	config := Config{Routes: []Route{
		{ProviderID: "shared", TrafficClass: sms.TrafficClassA2P, Priority: 1, Enabled: true},
		{ProviderID: "shared", TrafficClass: sms.TrafficClassLocal, Priority: 1, Enabled: true},
	}}
	if err := config.Validate(); err != nil {
		t.Fatalf("Validate returned error: %v", err)
	}
}

type trafficClassProvider struct{ id string }

func (p trafficClassProvider) ID() string { return p.id }

func (trafficClassProvider) Send(context.Context, sms.SendRequest) (*sms.SendResponse, error) {
	return nil, errors.New("not implemented")
}

func (trafficClassProvider) CheckStatus(context.Context, string) (*sms.StatusResponse, error) {
	return nil, errors.New("not implemented")
}
