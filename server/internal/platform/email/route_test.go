package email

import "testing"

func TestSystemDeliveryRouteUsesSystemTenant(t *testing.T) {
	route := SystemDeliveryRoute()
	if route.Stream != "transactional" || route.ConfigurationSet != "dugble-transactional" || route.SESTenantName != "dugble-system" {
		t.Fatalf("unexpected system route: %#v", route)
	}
}

func TestCustomerDeliveryRouteUsesCustomerTenant(t *testing.T) {
	route := CustomerDeliveryRoute("marketing", " dugble-t-customer ")
	if route.Stream != "marketing" || route.ConfigurationSet != "dugble-marketing" || route.SESTenantName != "dugble-t-customer" {
		t.Fatalf("unexpected customer route: %#v", route)
	}
}

func TestPersistAndExtractDeliveryRoute(t *testing.T) {
	headers := PersistDeliveryRoute(map[string]string{
		"X-Customer":                              "value",
		"x-dugble-internal-email-stream":          "spoofed",
		"X-Dugble-Internal-SES-Tenant":            "spoofed",
		"X-Dugble-Internal-SES-Configuration-Set": "spoofed",
	}, CustomerDeliveryRoute("transactional", "dugble-t-customer"))

	route, applicationHeaders := ExtractDeliveryRoute(headers)
	if route.Stream != "transactional" || route.ConfigurationSet != "dugble-transactional" || route.SESTenantName != "dugble-t-customer" {
		t.Fatalf("unexpected delivery route: %#v", route)
	}
	if len(applicationHeaders) != 1 || applicationHeaders["X-Customer"] != "value" {
		t.Fatalf("unexpected application headers: %#v", applicationHeaders)
	}
}
