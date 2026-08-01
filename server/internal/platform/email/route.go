package email

import "strings"

const (
	internalStreamHeader           = "X-Dugble-Internal-Email-Stream"
	internalConfigurationSetHeader = "X-Dugble-Internal-SES-Configuration-Set"
	internalSESTenantHeader        = "X-Dugble-Internal-SES-Tenant"
)

// DeliveryRoute is the immutable provider route selected when a message is
// accepted. It is persisted with the message and must not be accepted directly
// from public API callers.
type DeliveryRoute struct {
	Stream           string
	ConfigurationSet string
	SESTenantName    string
}

// BuiltInDeliveryRoute is Dugble's authoritative SES routing policy. The AWS
// resource names are product invariants rather than deployment configuration.
// Callers persist the returned route with every accepted message.
func BuiltInDeliveryRoute(stream string) DeliveryRoute {
	switch strings.ToLower(strings.TrimSpace(stream)) {
	case "marketing":
		return DeliveryRoute{
			Stream:           "marketing",
			ConfigurationSet: "dugble-marketing",
			SESTenantName:    "dugble-system",
		}
	default:
		return DeliveryRoute{
			Stream:           "transactional",
			ConfigurationSet: "dugble-transactional",
			SESTenantName:    "dugble-system",
		}
	}
}

// PersistDeliveryRoute returns a copy of headers containing server-owned route
// metadata. Existing values for these internal keys are always overwritten.
func PersistDeliveryRoute(headers map[string]string, route DeliveryRoute) map[string]string {
	result := make(map[string]string, len(headers)+3)
	for key, value := range headers {
		if isInternalRouteHeader(key) {
			continue
		}
		result[key] = value
	}
	result[internalStreamHeader] = strings.TrimSpace(route.Stream)
	result[internalConfigurationSetHeader] = strings.TrimSpace(route.ConfigurationSet)
	result[internalSESTenantHeader] = strings.TrimSpace(route.SESTenantName)
	return result
}

// ExtractDeliveryRoute removes server-owned route metadata before application
// headers are rendered into the MIME message.
func ExtractDeliveryRoute(headers map[string]string) (DeliveryRoute, map[string]string) {
	route := DeliveryRoute{}
	result := make(map[string]string, len(headers))
	for key, value := range headers {
		switch {
		case strings.EqualFold(key, internalStreamHeader):
			route.Stream = strings.TrimSpace(value)
		case strings.EqualFold(key, internalConfigurationSetHeader):
			route.ConfigurationSet = strings.TrimSpace(value)
		case strings.EqualFold(key, internalSESTenantHeader):
			route.SESTenantName = strings.TrimSpace(value)
		default:
			result[key] = value
		}
	}
	return route, result
}

func isInternalRouteHeader(key string) bool {
	return strings.EqualFold(key, internalStreamHeader) ||
		strings.EqualFold(key, internalConfigurationSetHeader) ||
		strings.EqualFold(key, internalSESTenantHeader)
}
