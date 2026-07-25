package routing

import (
	"context"
	"errors"
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func TestRouteFiltersProvidersByDestinationCountry(t *testing.T) {
	ghanaProvider := countryProvider{id: "ghana-provider"}
	nigeriaProvider := countryProvider{id: "nigeria-provider"}
	service, err := NewService(
		Config{Routes: []Route{
			{ProviderID: ghanaProvider.id, DestinationCountry: sms.CountryGhana, Priority: 1, Enabled: true},
			{ProviderID: nigeriaProvider.id, DestinationCountry: sms.CountryNigeria, Priority: 1, Enabled: true},
		}},
		NewPriorityStrategy(),
		ghanaProvider,
		nigeriaProvider,
	)
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	providers, err := service.Route(context.Background(), sms.SendRequest{
		To:                 "+233241234567",
		From:               "DUGBLE",
		Message:            "hello",
		DestinationCountry: sms.CountryGhana,
	})
	if err != nil {
		t.Fatalf("Route returned error: %v", err)
	}
	if len(providers) != 1 || providers[0].ID() != ghanaProvider.id {
		t.Fatalf("Route providers = %#v, want only %q", providers, ghanaProvider.id)
	}
}

func TestRouteDoesNotCrossCountries(t *testing.T) {
	ghanaProvider := countryProvider{id: "ghana-provider"}
	service, err := NewService(
		Config{Routes: []Route{
			{ProviderID: ghanaProvider.id, DestinationCountry: sms.CountryGhana, Priority: 1, Enabled: true},
		}},
		NewPriorityStrategy(),
		ghanaProvider,
	)
	if err != nil {
		t.Fatalf("NewService returned error: %v", err)
	}

	_, err = service.Route(context.Background(), sms.SendRequest{
		To:                 "+2348012345678",
		From:               "DUGBLE",
		Message:            "hello",
		DestinationCountry: sms.CountryNigeria,
	})
	if !errors.Is(err, sms.ErrNoProviderAvailable) {
		t.Fatalf("Route error = %v, want ErrNoProviderAvailable", err)
	}
}

func TestConfigAllowsSameProviderAcrossCountries(t *testing.T) {
	config := Config{Routes: []Route{
		{ProviderID: "shared", DestinationCountry: sms.CountryGhana, Priority: 1, Enabled: true},
		{ProviderID: "shared", DestinationCountry: sms.CountryNigeria, Priority: 1, Enabled: true},
	}}
	if err := config.Validate(); err != nil {
		t.Fatalf("Validate returned error: %v", err)
	}
}

type countryProvider struct{ id string }

func (p countryProvider) ID() string { return p.id }

func (countryProvider) Send(context.Context, sms.SendRequest) (*sms.SendResponse, error) {
	return nil, errors.New("not implemented")
}

func (countryProvider) CheckStatus(context.Context, string) (*sms.StatusResponse, error) {
	return nil, errors.New("not implemented")
}
