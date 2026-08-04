package inbox

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/pkg/pgconv"
)

func (repository *Repository) ListRecipientFeed(ctx context.Context, access RecipientAccess, limit, offset int32) ([]RecipientFeedItem, error) {
	rows, err := repository.queries.ListInboxFeed(ctx, dbsqlc.ListInboxFeedParams{
		TeamID:      access.TeamID,
		RecipientID: access.RecipientID,
		LimitCount:  limit,
		OffsetCount: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("list inbox feed: %w", err)
	}
	items := make([]RecipientFeedItem, 0, len(rows))
	for _, row := range rows {
		var actions []Action
		if err := json.Unmarshal(row.Actions, &actions); err != nil {
			return nil, fmt.Errorf("decode inbox feed actions: %w", err)
		}
		var sourceID *string
		if row.SourceID != nil {
			value := row.SourceID.String()
			sourceID = &value
		}
		items = append(items, RecipientFeedItem{
			ReceiptID: row.ReceiptID.String(),
			Message: Message{
				ID:        row.ID.String(),
				TeamID:    row.TeamID.String(),
				Category:  row.Category,
				Priority:  row.Priority,
				Title:     row.Title,
				Body:      row.Body,
				Data:      json.RawMessage(row.Data),
				Actions:   actions,
				Source:    row.Source,
				SourceID:  sourceID,
				CreatedAt: pgconv.TimestamptzToTime(row.CreatedAt),
				UpdatedAt: pgconv.TimestamptzToTime(row.UpdatedAt),
			},
			SeenAt:    pgconv.TimestamptzToTimePtr(row.SeenAt),
			ReadAt:    pgconv.TimestamptzToTimePtr(row.ReadAt),
			CreatedAt: pgconv.TimestamptzToTime(row.ReceiptCreatedAt),
		})
	}
	return items, nil
}

func (repository *Repository) CountRecipientUnread(ctx context.Context, access RecipientAccess) (int64, error) {
	count, err := repository.queries.CountUnreadInboxReceipts(ctx, dbsqlc.CountUnreadInboxReceiptsParams{
		TeamID:      access.TeamID,
		RecipientID: access.RecipientID,
	})
	if err != nil {
		return 0, fmt.Errorf("count unread inbox receipts: %w", err)
	}
	return count, nil
}

func (repository *Repository) MarkRecipientSeen(ctx context.Context, access RecipientAccess, messageID uuid.UUID) (ReceiptState, error) {
	row, err := repository.queries.MarkInboxReceiptSeen(ctx, dbsqlc.MarkInboxReceiptSeenParams{
		TeamID: access.TeamID, MessageID: messageID, RecipientID: access.RecipientID,
	})
	if err != nil {
		return ReceiptState{}, fmt.Errorf("mark inbox receipt seen: %w", err)
	}
	return receiptStateFromSQLC(row), nil
}

func (repository *Repository) MarkRecipientRead(ctx context.Context, access RecipientAccess, messageID uuid.UUID) (ReceiptState, error) {
	row, err := repository.queries.MarkInboxReceiptRead(ctx, dbsqlc.MarkInboxReceiptReadParams{
		TeamID: access.TeamID, MessageID: messageID, RecipientID: access.RecipientID,
	})
	if err != nil {
		return ReceiptState{}, fmt.Errorf("mark inbox receipt read: %w", err)
	}
	return receiptStateFromSQLC(row), nil
}

func (repository *Repository) ArchiveRecipientMessage(ctx context.Context, access RecipientAccess, messageID uuid.UUID) (ReceiptState, error) {
	row, err := repository.queries.ArchiveInboxReceipt(ctx, dbsqlc.ArchiveInboxReceiptParams{
		TeamID: access.TeamID, MessageID: messageID, RecipientID: access.RecipientID,
	})
	if err != nil {
		return ReceiptState{}, fmt.Errorf("archive inbox receipt: %w", err)
	}
	return receiptStateFromSQLC(row), nil
}

func (repository *Repository) UnarchiveRecipientMessage(ctx context.Context, access RecipientAccess, messageID uuid.UUID) (ReceiptState, error) {
	row, err := repository.queries.UnarchiveInboxReceipt(ctx, dbsqlc.UnarchiveInboxReceiptParams{
		TeamID: access.TeamID, MessageID: messageID, RecipientID: access.RecipientID,
	})
	if err != nil {
		return ReceiptState{}, fmt.Errorf("unarchive inbox receipt: %w", err)
	}
	return receiptStateFromSQLC(row), nil
}

func receiptStateFromSQLC(row dbsqlc.InboxReceipt) ReceiptState {
	return ReceiptState{
		MessageID:  row.MessageID.String(),
		SeenAt:     pgconv.TimestamptzToTimePtr(row.SeenAt),
		ReadAt:     pgconv.TimestamptzToTimePtr(row.ReadAt),
		ArchivedAt: pgconv.TimestamptzToTimePtr(row.ArchivedAt),
		UpdatedAt:  pgconv.TimestamptzToTime(row.UpdatedAt),
	}
}
