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

type DeliveryQueue interface {
	EnqueueEmailDelivery(context.Context, uuid.UUID, uuid.UUID) error
	EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error
}

type ServiceConfig struct {
	DefaultFromEmail string
	DefaultFromName  string
}

type Service struct {
	repository *Repository
	delivery   DeliveryQueue
	config     ServiceConfig
}

func NewService(repository *Repository, delivery DeliveryQueue, config ServiceConfig) *Service {
	return &Service{repository: repository, delivery: delivery, config: config}
}

func (s *Service) List(ctx context.Context, req ListRequest) ([]Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionEmailRead)
	if err != nil {
		return nil, err
	}
	if req.Limit <= 0 || req.Limit > 100 {
		req.Limit = 50
	}
	if req.Offset < 0 {
		req.Offset = 0
	}
	messages, err := s.repository.List(ctx, tenantContext.TeamID, req.Limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list email messages", err)
	}
	return messages, nil
}

func (s *Service) Get(ctx context.Context, messageID string) (Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionEmailRead)
	if err != nil {
		return Message{}, err
	}
	parsedID, err := uuid.Parse(strings.TrimSpace(messageID))
	if err != nil {
		return Message{}, apperrors.NewBadRequest("Email message id must be a valid UUID")
	}
	message, err := s.repository.Get(ctx, parsedID, tenantContext.TeamID)
	if err != nil {
		if errors.Is(err, ErrMessageNotFound) {
			return Message{}, apperrors.NewNotFound("Email message not found")
		}
		return Message{}, apperrors.NewInternal("Unable to get email message", err)
	}
	return message, nil
}

func (s *Service) Send(ctx context.Context, req SendRequest) (Message, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionEmailSend)
	if err != nil {
		return Message{}, err
	}
	if s.repository == nil {
		return Message{}, apperrors.NewInternal("Email repository is not configured", nil)
	}
	if s.delivery == nil {
		return Message{}, apperrors.NewInternal("Email delivery queue is not configured", nil)
	}

	validated, err := validateSend(req, s.config)
	if err != nil {
		return Message{}, err
	}
	if validated.IdempotencyKey != nil {
		existing, lookupErr := s.repository.GetByIdempotencyKey(ctx, tenantContext.TeamID, *validated.IdempotencyKey)
		switch {
		case lookupErr == nil:
			return resolveIdempotent(existing, validated)
		case !errors.Is(lookupErr, ErrMessageNotFound):
			return Message{}, apperrors.NewInternal("Unable to check email idempotency key", lookupErr)
		}
	}

	tx, err := s.repository.BeginTx(ctx)
	if err != nil {
		return Message{}, apperrors.NewInternal("Unable to begin email send transaction", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	created, err := s.repository.WithTx(tx).Create(ctx, createMessageParams{
		TeamID:          tenantContext.TeamID,
		IdempotencyKey:  validated.IdempotencyKey,
		IdempotencyHash: validated.IdempotencyHash,
		MessageType:     validated.MessageType,
		FromEmail:       validated.FromEmail,
		FromName:        validated.FromName,
		ReplyToEmail:    validated.ReplyToEmail,
		ToEmail:         validated.ToEmail,
		ToName:          validated.ToName,
		Subject:         validated.Subject,
		HTMLBody:        validated.HTMLBody,
		TextBody:        validated.TextBody,
		Status:          StatusQueued,
		Metadata:        validated.Metadata,
	})
	if err != nil {
		if validated.IdempotencyKey != nil && isIdempotencyUniqueViolation(err) {
			_ = tx.Rollback(ctx)
			existing, lookupErr := s.repository.GetByIdempotencyKey(ctx, tenantContext.TeamID, *validated.IdempotencyKey)
			if lookupErr != nil {
				return Message{}, apperrors.NewInternal("Unable to resolve concurrent email request", lookupErr)
			}
			return resolveIdempotent(existing, validated)
		}
		return Message{}, apperrors.NewInternal("Unable to create email message", err)
	}

	messageID := uuid.MustParse(created.ID)
	if err := s.delivery.EnqueueEmailDeliveryTx(ctx, tx, messageID, tenantContext.TeamID); err != nil {
		return Message{}, apperrors.NewInternal("Unable to enqueue email delivery", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Message{}, apperrors.NewInternal("Unable to commit email send transaction", err)
	}
	return created, nil
}

func resolveIdempotent(existing Message, validated validatedSend) (Message, error) {
	if existing.IdempotencyHash != nil && validated.IdempotencyHash != nil && *existing.IdempotencyHash == *validated.IdempotencyHash {
		return existing, nil
	}
	return Message{}, apperrors.NewConflict("Idempotency-Key was already used with a different email request")
}

func requireTenant(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tenantContext, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Team context is required")
	}
	if !tenant.ContextCan(tenantContext, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Insufficient permissions")
	}
	return tenantContext, nil
}
