package audit

import (
	"bytes"
	"context"
	"log/slog"
	"strings"
	"testing"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

func TestRecordIncludesActorTenantAndResource(t *testing.T) {
	var output bytes.Buffer
	previous := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&output, nil)))
	t.Cleanup(func() { slog.SetDefault(previous) })

	teamID, userID, tokenID := uuid.New(), uuid.New(), uuid.New()
	Record(context.Background(), tenant.AccessContext{
		Actor: tenant.Actor{Type: tenant.ActorTypeUser, UserID: userID, SessionID: "session-1", TokenID: tokenID},
		Scope: tenant.Scope{TeamID: teamID},
	}, Event{Action: "team.updated", ResourceType: "team", ResourceID: teamID.String()})

	for _, value := range []string{"security audit event", "team.updated", teamID.String(), userID.String(), tokenID.String(), "session-1"} {
		if !strings.Contains(output.String(), value) {
			t.Fatalf("audit output does not contain %q: %s", value, output.String())
		}
	}
}
