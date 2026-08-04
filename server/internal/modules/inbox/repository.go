package inbox

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/coffeyvidzro/dugble/server/internal/database"
	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/pkg/pgconv"
)

type Repository struct {
	db      *pgxpool.Pool
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db, queries: dbsqlc.New(db)}
}

func (repository *Repository) InTransaction(ctx context.Context, operation func(pgx.Tx) error) error {
	return database.InTransaction(ctx, repository.db, operation)
}

func (repository *Repository) CreateMessageTx(ctx context.Context, tx pgx.Tx, teamID uuid.UUID, input validatedCreateMessage) (Message, error) {
	queries := repository.queries.WithTx(tx)
	row, err := queries.CreateInboxMessage(ctx, dbsqlc.CreateInboxMessageParams{
		TeamID:   teamID,
		Category: input.Category,
		Priority: input.Priority,
		Title:    input.Title,
		Body:     input.Body,
		Data:     input.Data,
		Actions:  input.Actions,
		Source:   "api",
	})
	if err != nil {
		return Message{}, fmt.Errorf("create inbox message: %w", err)
	}
	receipts, err := queries.CreateInboxReceipts(ctx, dbsqlc.CreateInboxReceiptsParams{
		RecipientIds: input.Recipients,
		MessageID:    row.ID,
		TeamID:       teamID,
	})
	if err != nil {
		return Message{}, fmt.Errorf("create inbox receipts: %w", err)
	}
	if len(receipts) != len(input.Recipients) {
		return Message{}, fmt.Errorf("create inbox receipts: inserted %d of %d recipients", len(receipts), len(input.Recipients))
	}
	message, err := messageFromSQLC(row)
	if err != nil {
		return Message{}, err
	}
	message.RecipientCount = len(receipts)
	return message, nil
}

func (repository *Repository) GetMessage(ctx context.Context, id, teamID uuid.UUID) (Message, error) {
	row, err := repository.queries.GetInboxMessage(ctx, dbsqlc.GetInboxMessageParams{ID: id, TeamID: teamID})
	if err != nil {
		return Message{}, fmt.Errorf("get inbox message: %w", err)
	}
	return messageFromSQLC(row)
}

func (repository *Repository) ListMessages(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Message, error) {
	rows, err := repository.queries.ListInboxMessages(ctx, dbsqlc.ListInboxMessagesParams{
		TeamID:      teamID,
		LimitCount:  limit,
		OffsetCount: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("list inbox messages: %w", err)
	}
	messages := make([]Message, 0, len(rows))
	for _, row := range rows {
		message, conversionErr := messageFromSQLC(row)
		if conversionErr != nil {
			return nil, conversionErr
		}
		messages = append(messages, message)
	}
	return messages, nil
}

func messageFromSQLC(row dbsqlc.InboxMessage) (Message, error) {
	var actions []Action
	if err := json.Unmarshal(row.Actions, &actions); err != nil {
		return Message{}, fmt.Errorf("decode inbox actions: %w", err)
	}
	var sourceID *string
	if row.SourceID != nil {
		value := row.SourceID.String()
		sourceID = &value
	}
	return Message{
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
	}, nil
}
