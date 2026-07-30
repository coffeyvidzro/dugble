package audit

import (
	"context"
	"log/slog"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type Event struct {
	Action       string
	ResourceType string
	ResourceID   string
	Metadata     map[string]any
}

func Record(ctx context.Context, access tenant.AccessContext, event Event) {
	attributes := []slog.Attr{
		slog.String("audit_action", event.Action),
		slog.String("resource_type", event.ResourceType),
		slog.String("resource_id", event.ResourceID),
		slog.String("actor_type", string(access.Actor.Type)),
		slog.String("team_id", access.Scope.TeamID.String()),
		slog.String("outcome", "success"),
	}
	if access.Actor.UserID != uuid.Nil {
		attributes = append(attributes, slog.String("actor_user_id", access.Actor.UserID.String()))
	}
	if access.Actor.SessionID != "" {
		attributes = append(attributes, slog.String("actor_session_id", access.Actor.SessionID))
	}
	if access.Actor.TokenID != uuid.Nil {
		attributes = append(attributes, slog.String("actor_token_id", access.Actor.TokenID.String()))
	}
	for key, value := range event.Metadata {
		attributes = append(attributes, slog.Any(key, value))
	}
	slog.LogAttrs(ctx, slog.LevelInfo, "security audit event", attributes...)
}
