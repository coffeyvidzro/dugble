package email

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const (
	maxBatchSize         = 50
	maxBatchPayloadBytes = 10 << 20
)

type DeliveryQueue interface {
	EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error
}
type Service struct {
	repository *Repository
	delivery   DeliveryQueue
	config     ServiceConfig
}

type ServiceConfig struct {
	DefaultFromEmail string
	DefaultFromName  string
}

func NewService(repository *Repository, delivery DeliveryQueue, config ServiceConfig) *Service {
	return &Service{repository: repository, delivery: delivery, config: config}
}

func requireTenant(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tc, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Team context is required")
	}
	if !tenant.ContextCan(tc, permission) {
		return tenant.Context{}, apperrors.NewForbidden("You do not have permission to perform this action")
	}
	return tc, nil
}

func (s *Service) Send(ctx context.Context, req SendRequest) (Message, error) {
	tc, err := requireTenant(ctx, tenant.PermissionEmailSend)
	if err != nil {
		return Message{}, err
	}
	validated, err := validateSend(req, s.config)
	if err != nil {
		return Message{}, err
	}
	if s.delivery == nil {
		return Message{}, apperrors.NewInternal("Email delivery queue is not configured", nil)
	}
	tx, err := s.repository.BeginTx(ctx)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to begin email transaction", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	m, err := s.repository.CreateTx(ctx, tx, tc.TeamID, validated)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to create email message", err)
	}
	if err := s.delivery.EnqueueEmailDeliveryTx(ctx, tx, uuid.MustParse(m.ID), tc.TeamID); err != nil {
		return Message{}, apperrors.NewInternal("Unable to enqueue email delivery", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Message{}, apperrors.NewInternal("Unable to commit email transaction", err)
	}
	return m, nil
}

func (s *Service) Get(ctx context.Context, value string) (Message, error) {
	tc, err := requireTenant(ctx, tenant.PermissionEmailRead)
	if err != nil {
		return Message{}, err
	}
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return Message{}, apperrors.NewBadRequest("Email message id must be a valid UUID")
	}
	m, err := s.repository.Get(ctx, id, tc.TeamID)
	if errors.Is(err, ErrNotFound) {
		return Message{}, apperrors.NewNotFound("Email message not found")
	}
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to get email message", err)
	}
	return m, nil
}

func (s *Service) List(ctx context.Context, req ListRequest) ([]MessageSummary, error) {
	tc, err := requireTenant(ctx, tenant.PermissionEmailRead)
	if err != nil {
		return nil, err
	}
	if req.Limit <= 0 || req.Limit > 100 {
		req.Limit = 50
	}
	if req.Offset < 0 {
		req.Offset = 0
	}
	m, err := s.repository.List(ctx, tc.TeamID, req.Limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list email messages", err)
	}
	return m, nil
}

func (s *Service) BatchSend(ctx context.Context, req BatchSendRequest) ([]Message, error) {
	if len(req.Messages) == 0 || len(req.Messages) > maxBatchSize {
		return nil, apperrors.NewBadRequest("messages must contain between 1 and 50 items")
	}
	tc, err := requireTenant(ctx, tenant.PermissionEmailSend)
	if err != nil {
		return nil, err
	}
	if s.delivery == nil {
		return nil, apperrors.NewInternal("Email delivery queue is not configured", nil)
	}

	validated := make([]validatedSend, len(req.Messages))
	totalPayloadBytes := 0
	for index, item := range req.Messages {
		validated[index], err = validateSend(item, s.config)
		if err != nil {
			return nil, err
		}
		totalPayloadBytes += bodySize(validated[index].HTMLBody) + bodySize(validated[index].TextBody) + len(validated[index].Metadata)
		if totalPayloadBytes > maxBatchPayloadBytes {
			return nil, apperrors.NewBadRequest("Email batch payload is too large")
		}
	}

	tx, err := s.repository.BeginTx(ctx)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to begin email batch transaction", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	result := make([]Message, 0, len(validated))
	for _, item := range validated {
		message, createErr := s.repository.CreateTx(ctx, tx, tc.TeamID, item)
		if createErr != nil {
			return nil, apperrors.NewInternal("Unable to create email message", createErr)
		}
		if enqueueErr := s.delivery.EnqueueEmailDeliveryTx(ctx, tx, uuid.MustParse(message.ID), tc.TeamID); enqueueErr != nil {
			return nil, apperrors.NewInternal("Unable to enqueue email delivery", enqueueErr)
		}
		result = append(result, message)
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, apperrors.NewInternal("Unable to commit email batch transaction", err)
	}
	return result, nil
}

func bodySize(body *string) int {
	if body == nil {
		return 0
	}
	return len(*body)
}
