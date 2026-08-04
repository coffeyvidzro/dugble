package inbox

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	platformevent "github.com/coffeyvidzro/dugble/server/internal/platform/event"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type eventEmitter interface {
	EmitTx(context.Context, pgx.Tx, platformevent.Envelope) (platformevent.Result, error)
}

type Service struct {
	repository *Repository
	events     eventEmitter
}

func NewService(repository *Repository, events eventEmitter) *Service {
	return &Service{repository: repository, events: events}
}

func (service *Service) CreateMessage(ctx context.Context, request CreateMessageRequest) (Message, error) {
	access, err := requireTenant(ctx, tenant.PermissionInboxWrite)
	if err != nil {
		return Message{}, err
	}
	validated, err := validateCreateMessage(request)
	if err != nil {
		return Message{}, err
	}
	var created Message
	err = service.repository.InTransaction(ctx, func(tx pgx.Tx) error {
		message, createErr := service.repository.CreateMessageTx(ctx, tx, access.Scope.TeamID, validated)
		if createErr != nil {
			return createErr
		}
		payload, marshalErr := json.Marshal(struct {
			Message        Message `json:"message"`
			RecipientCount int     `json:"recipient_count"`
		}{Message: message, RecipientCount: message.RecipientCount})
		if marshalErr != nil {
			return marshalErr
		}
		messageID := uuid.MustParse(message.ID)
		if _, emitErr := service.events.EmitTx(ctx, tx, platformevent.Envelope{
			Type: platformevent.TypeInboxMessageCreated,
			TeamID: access.Scope.TeamID,
			ObjectType: "inbox_message",
			ObjectID: &messageID,
			Data: payload,
			OccurredAt: message.CreatedAt,
		}); emitErr != nil {
			return emitErr
		}
		created = message
		return nil
	})
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to create Inbox message", err)
	}
	audit.Record(ctx, access, audit.Event{
		Action: "inbox_message.created",
		ResourceType: "inbox_message",
		ResourceID: created.ID,
		Metadata: map[string]any{"recipient_count": created.RecipientCount, "category": created.Category, "priority": created.Priority},
	})
	return created, nil
}

func (service *Service) GetMessage(ctx context.Context, value string) (Message, error) {
	access, err := requireTenant(ctx, tenant.PermissionInboxRead)
	if err != nil {
		return Message{}, err
	}
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return Message{}, apperrors.NewBadRequest("Inbox message id must be a valid UUID")
	}
	message, err := service.repository.GetMessage(ctx, id, access.Scope.TeamID)
	if errors.Is(err, pgx.ErrNoRows) {
		return Message{}, apperrors.NewNotFound("Inbox message not found")
	}
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to get Inbox message", err)
	}
	return message, nil
}

func (service *Service) ListMessages(ctx context.Context, request ListRequest) ([]Message, error) {
	access, err := requireTenant(ctx, tenant.PermissionInboxRead)
	if err != nil {
		return nil, err
	}
	normalizeListRequest(&request)
	messages, err := service.repository.ListMessages(ctx, access.Scope.TeamID, request.Limit, request.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list Inbox messages", err)
	}
	return messages, nil
}

func requireTenant(ctx context.Context, permission tenant.Permission) (tenant.AccessContext, error) {
	access, decision := tenant.ResolveAccess(ctx, permission)
	if !decision.Allowed {
		return tenant.AccessContext{}, apperrors.NewForbidden(decision.Reason)
	}
	return access, nil
}

func normalizeListRequest(request *ListRequest) {
	if request.Limit <= 0 || request.Limit > 100 {
		request.Limit = 50
	}
	if request.Offset < 0 {
		request.Offset = 0
	}
}
