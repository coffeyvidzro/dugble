package database

import (
	"os"
	"regexp"
	"strings"
	"testing"
)

var namedQueryPattern = regexp.MustCompile(`(?m)^-- name: ([A-Za-z0-9_]+) :[a-z]+(?:\r?\n|$)`)

func TestTenantOwnedQueriesDeclareTenantScope(t *testing.T) {
	t.Parallel()

	// These queries deliberately resolve tenant scope from trusted credentials,
	// immutable parent records, or worker ownership rather than caller input.
	exemptions := map[string]map[string]struct{}{
		"audit_events.sql": querySet("CreateAuditEvent"),
		"billing.sql":      querySet("GetActiveProductRate"),
		"sender_domains.sql": querySet(
			"ClaimSenderDomainsForReconciliation", "CompleteSenderDomainReconciliation",
			"CompleteSenderDomainHealthCheck", "RecordSenderDomainHealthFailure",
			"RecordSenderDomainReconciliationFailure",
		),
		"team_invitations.sql": querySet(
			"GetTeamInvitationByTokenHash", "AcceptTeamInvitation", "DeclineTeamInvitation",
		),
		"team_tokens.sql": querySet("GetActiveTeamTokenByHash", "TouchTeamToken"),
		"teams.sql": querySet(
			"CreateTeamWithOwner", "GetTeam", "ListTeamsForUser", "UpdateTeam", "DisableTeam",
		),
		"webhook_deliveries.sql": querySet(
			"CreateWebhookDelivery", "CreateWebhookDeliveriesForEvent", "ClaimWebhookDeliveries", "MarkWebhookDeliverySucceeded",
			"ScheduleWebhookDeliveryRetry", "MarkWebhookDeliveryFailed", "ReleaseWebhookDeliveryClaim",
		),
	}
	files := []string{
		"audit_events.sql", "billing.sql", "email_messages.sql", "sender_domains.sql", "sender_ids.sql", "sms_messages.sql",
		"team_invitations.sql", "team_tokens.sql", "teams.sql", "webhook_deliveries.sql",
		"webhook_endpoints.sql", "webhook_events.sql",
	}

	for _, file := range files {
		t.Run(file, func(t *testing.T) {
			t.Parallel()
			contents, err := os.ReadFile("queries/" + file)
			if err != nil {
				t.Fatal(err)
			}
			queries := splitNamedQueries(string(contents))
			if len(queries) == 0 {
				t.Fatal("no named queries found")
			}
			for name, statement := range queries {
				if _, exempt := exemptions[file][name]; exempt {
					continue
				}
				if !strings.Contains(strings.ToLower(statement), "sqlc.arg(team_id)") {
					t.Errorf("query %s must accept team_id or receive an explicit trusted-query exemption", name)
				}
			}
		})
	}
}

func splitNamedQueries(contents string) map[string]string {
	matches := namedQueryPattern.FindAllStringSubmatchIndex(contents, -1)
	queries := make(map[string]string, len(matches))
	for index, match := range matches {
		end := len(contents)
		if index+1 < len(matches) {
			end = matches[index+1][0]
		}
		queries[contents[match[2]:match[3]]] = contents[match[1]:end]
	}
	return queries
}

func querySet(names ...string) map[string]struct{} {
	set := make(map[string]struct{}, len(names))
	for _, name := range names {
		set[name] = struct{}{}
	}
	return set
}
