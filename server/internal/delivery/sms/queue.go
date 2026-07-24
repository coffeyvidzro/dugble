package smsdelivery

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/riverqueue/river"
)

type Queue struct {
	client *river.Client[pgx.Tx]
}

func NewQueue(client *river.Client[pgx.Tx]) *Queue { return &Queue{client: client} }

func (q *Queue) EnqueueSMSDelivery(ctx context.Context, messageID uuid.UUID, teamID uuid.UUID) error {
	_, err := q.client.Insert(ctx, DeliverArgs{MessageID: messageID, TeamID: teamID}, deliveryInsertOpts())
	return err
}

func (q *Queue) EnqueueSMSDeliveryTx(ctx context.Context, tx pgx.Tx, messageID uuid.UUID, teamID uuid.UUID) error {
	_, err := q.client.InsertTx(ctx, tx, DeliverArgs{MessageID: messageID, TeamID: teamID}, deliveryInsertOpts())
	return err
}

func deliveryInsertOpts() *river.InsertOpts {
	return &river.InsertOpts{Queue: DeliverQueue, UniqueOpts: river.UniqueOpts{ByArgs: true}}
}
