package email

import "testing"

func TestPersistAndExtractDeliveryRoute(t *testing.T) {
	headers := PersistDeliveryRoute(map[string]string{
		"X-Customer":                              "value",
		"x-dugble-internal-email-stream":          "spoofed",
		"X-Dugble-Internal-SES-Tenant":            "spoofed",
		"X-Dugble-Internal-SES-Configuration-Set": "spoofed",
	}, DeliveryRoute{
		Stream:           "transactional",
		ConfigurationSet: "dugble-transactional",
		SESTenantName:    "dugble-system",
	})

	route, applicationHeaders := ExtractDeliveryRoute(headers)
	if route.Stream != "transactional" || route.ConfigurationSet != "dugble-transactional" || route.SESTenantName != "dugble-system" {
		t.Fatalf("unexpected delivery route: %#v", route)
	}
	if len(applicationHeaders) != 1 || applicationHeaders["X-Customer"] != "value" {
		t.Fatalf("unexpected application headers: %#v", applicationHeaders)
	}
}
