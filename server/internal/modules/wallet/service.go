package wallet

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type Service struct{ repository *Repository }

func NewService(repository *Repository) *Service { return &Service{repository: repository} }

func (s *Service) Get(ctx context.Context) (Wallet, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWalletRead)
	if err != nil {
		return Wallet{}, err
	}
	wallet, err := s.repository.GetByTeam(ctx, tenantContext.TeamID, CurrencyUSD)
	if err != nil {
		wallet, err = s.repository.Create(ctx, tenantContext.TeamID, CurrencyUSD)
	}
	if err != nil {
		return Wallet{}, apperrors.NewInternal("Unable to get wallet", err)
	}
	return wallet, nil
}

func (s *Service) ListTransactions(ctx context.Context, req ListTransactionsRequest) ([]Transaction, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWalletRead)
	if err != nil {
		return nil, err
	}
	limit := req.Limit
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if req.Offset < 0 {
		req.Offset = 0
	}
	transactions, err := s.repository.ListTransactions(ctx, tenantContext.TeamID, limit, req.Offset)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list wallet transactions", err)
	}
	return transactions, nil
}

func (s *Service) TopUp(ctx context.Context, req TopUpRequest) (Transaction, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWalletTopUp)
	if err != nil {
		return Transaction{}, err
	}
	if req.Amount <= 0 {
		return Transaction{}, apperrors.NewBadRequest("Amount must be greater than zero")
	}
	var referenceID *uuid.UUID
	if req.ReferenceID != nil && strings.TrimSpace(*req.ReferenceID) != "" {
		parsed, err := uuid.Parse(strings.TrimSpace(*req.ReferenceID))
		if err != nil {
			return Transaction{}, apperrors.NewBadRequest("Reference id must be a valid UUID")
		}
		referenceID = &parsed
	}
	metadata := req.Metadata
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	if !json.Valid(metadata) {
		return Transaction{}, apperrors.NewBadRequest("Metadata must be valid JSON")
	}
	_, transaction, err := s.repository.Credit(ctx, tenantContext.TeamID, req.Amount, referenceID, req.Description, metadata)
	if err != nil {
		return Transaction{}, apperrors.NewInternal("Unable to top up wallet", err)
	}
	return transaction, nil
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
