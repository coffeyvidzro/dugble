package inbox

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/audit"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

func (service *Service) CreateRecipientToken(ctx context.Context, request CreateRecipientTokenRequest) (RecipientToken, error) {
	tenantAccess, err := requireTenant(ctx, tenant.PermissionInboxWrite)
	if err != nil {
		return RecipientToken{}, err
	}
	recipients, err := normalizeRecipients([]string{request.RecipientID})
	if err != nil {
		return RecipientToken{}, err
	}
	if service.tokens == nil || service.tokenTTL <= 0 {
		return RecipientToken{}, apperrors.NewInternal("Inbox recipient tokens are not configured", errors.New("recipient token service is unavailable"))
	}
	token, expiresAt, err := service.tokens.Mint(tenantAccess.Scope.TeamID, recipients[0], service.tokenTTL)
	if err != nil {
		return RecipientToken{}, apperrors.NewInternal("Unable to create Inbox recipient token", err)
	}
	audit.Record(ctx, tenantAccess, audit.Event{
		Action:       "inbox_recipient_token.created",
		ResourceType: "inbox_recipient",
		ResourceID:   recipients[0],
	})
	return RecipientToken{Token: token, ExpiresAt: expiresAt}, nil
}

func (service *Service) ParseRecipientToken(value string) (RecipientAccess, error) {
	if service.tokens == nil {
		return RecipientAccess{}, apperrors.NewUnauthorized("Invalid Inbox recipient token")
	}
	access, err := service.tokens.Parse(strings.TrimSpace(value))
	if err != nil {
		return RecipientAccess{}, apperrors.NewUnauthorized("Invalid or expired Inbox recipient token")
	}
	return access, nil
}

func (service *Service) RecipientFeed(ctx context.Context, access RecipientAccess, request RecipientFeedRequest) (RecipientFeed, error) {
	limit := request.Limit
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	offset, err := decodeRecipientCursor(request.Cursor)
	if err != nil {
		return RecipientFeed{}, apperrors.NewBadRequest("Inbox cursor is invalid")
	}
	items, err := service.repository.ListRecipientFeed(ctx, access, limit+1, offset)
	if err != nil {
		return RecipientFeed{}, apperrors.NewInternal("Unable to list Inbox feed", err)
	}
	response := RecipientFeed{Items: items}
	if len(items) > int(limit) {
		response.Items = items[:limit]
		next := encodeRecipientCursor(offset + limit)
		response.NextCursor = &next
	}
	return response, nil
}

func (service *Service) RecipientUnreadCount(ctx context.Context, access RecipientAccess) (UnreadCount, error) {
	count, err := service.repository.CountRecipientUnread(ctx, access)
	if err != nil {
		return UnreadCount{}, apperrors.NewInternal("Unable to count unread Inbox messages", err)
	}
	return UnreadCount{Count: count}, nil
}

func (service *Service) MarkRecipientSeen(ctx context.Context, access RecipientAccess, value string) (ReceiptState, error) {
	return service.updateRecipientState(ctx, access, value, service.repository.MarkRecipientSeen)
}

func (service *Service) MarkRecipientRead(ctx context.Context, access RecipientAccess, value string) (ReceiptState, error) {
	return service.updateRecipientState(ctx, access, value, service.repository.MarkRecipientRead)
}

func (service *Service) ArchiveRecipientMessage(ctx context.Context, access RecipientAccess, value string) (ReceiptState, error) {
	return service.updateRecipientState(ctx, access, value, service.repository.ArchiveRecipientMessage)
}

func (service *Service) UnarchiveRecipientMessage(ctx context.Context, access RecipientAccess, value string) (ReceiptState, error) {
	return service.updateRecipientState(ctx, access, value, service.repository.UnarchiveRecipientMessage)
}

func (service *Service) updateRecipientState(
	ctx context.Context,
	access RecipientAccess,
	value string,
	operation func(context.Context, RecipientAccess, uuid.UUID) (ReceiptState, error),
) (ReceiptState, error) {
	messageID, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return ReceiptState{}, apperrors.NewBadRequest("Inbox message id must be a valid UUID")
	}
	state, err := operation(ctx, access, messageID)
	if errors.Is(err, pgx.ErrNoRows) {
		return ReceiptState{}, apperrors.NewNotFound("Inbox message not found")
	}
	if err != nil {
		return ReceiptState{}, apperrors.NewInternal("Unable to update Inbox message state", err)
	}
	return state, nil
}

func encodeRecipientCursor(offset int32) string {
	return base64.RawURLEncoding.EncodeToString([]byte(strconv.FormatInt(int64(offset), 10)))
}

func decodeRecipientCursor(cursor string) (int32, error) {
	cursor = strings.TrimSpace(cursor)
	if cursor == "" {
		return 0, nil
	}
	decoded, err := base64.RawURLEncoding.DecodeString(cursor)
	if err != nil {
		return 0, err
	}
	offset, err := strconv.ParseInt(string(decoded), 10, 32)
	if err != nil || offset < 0 {
		return 0, fmt.Errorf("invalid cursor offset")
	}
	return int32(offset), nil
}
