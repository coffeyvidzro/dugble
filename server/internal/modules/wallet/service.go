package wallet

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/integration/hubtel"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type CheckoutInitiator interface {
	InitiateCheckout(ctx context.Context, req hubtel.InitiateCheckoutRequest) (hubtel.InitiateCheckoutResponse, error)
}

type Service struct {
	repository *Repository
	hubtel     CheckoutInitiator
}

func NewService(repository *Repository, hubtelClient ...CheckoutInitiator) *Service {
	service := &Service{repository: repository}
	if len(hubtelClient) > 0 {
		service.hubtel = hubtelClient[0]
	}
	return service
}

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

func (s *Service) TopUp(ctx context.Context, req TopUpRequest) (TopUpResponse, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWalletTopUp)
	if err != nil {
		return TopUpResponse{}, err
	}
	if s.hubtel == nil {
		return TopUpResponse{}, apperrors.NewInternal("Hubtel checkout is not configured", nil)
	}
	if req.Amount <= 0 {
		return TopUpResponse{}, apperrors.NewBadRequest("Amount must be greater than zero")
	}
	metadata := req.Metadata
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	if !json.Valid(metadata) {
		return TopUpResponse{}, apperrors.NewBadRequest("Metadata must be valid JSON")
	}

	clientReference := uuid.New()
	description := "Wallet top-up"
	if req.Description != nil && strings.TrimSpace(*req.Description) != "" {
		description = strings.TrimSpace(*req.Description)
	}

	checkout, err := s.hubtel.InitiateCheckout(ctx, hubtel.InitiateCheckoutRequest{
		TotalAmount:     req.Amount,
		Description:     description,
		ClientReference: clientReference.String(),
	})
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to initiate Hubtel checkout", err)
	}
	if checkout.ResponseCode != "0000" || !strings.EqualFold(checkout.Status, "Success") {
		return TopUpResponse{}, apperrors.NewBadRequest("Hubtel checkout was not accepted")
	}

	transactionMetadata, err := mergeMetadata(metadata, checkout.Data)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to prepare wallet metadata", err)
	}
	transaction, err := s.repository.CreatePendingTopUp(ctx, tenantContext.TeamID, req.Amount, clientReference, &description, transactionMetadata)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to create pending top-up", err)
	}

	return TopUpResponse{
		CheckoutURL:       checkout.Data.CheckoutURL,
		CheckoutID:        checkout.Data.CheckoutID,
		ClientReference:   checkout.Data.ClientReference,
		CheckoutDirectURL: checkout.Data.CheckoutDirectURL,
		Transaction:       transaction,
	}, nil
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

func mergeMetadata(metadata json.RawMessage, checkout hubtel.CheckoutData) (json.RawMessage, error) {
	values := map[string]any{}
	if len(metadata) > 0 {
		if err := json.Unmarshal(metadata, &values); err != nil {
			return nil, err
		}
	}
	values["provider"] = "hubtel"
	values["checkout_id"] = checkout.CheckoutID
	values["checkout_url"] = checkout.CheckoutURL
	values["checkout_direct_url"] = checkout.CheckoutDirectURL
	values["client_reference"] = checkout.ClientReference
	return json.Marshal(values)
}
