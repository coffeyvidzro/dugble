package wallet

import (
	"context"
	"encoding/json"
	"errors"
	"math"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/integration/fx"
	"github.com/coffeyvidzro/dugble/server/internal/integration/hubtel"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type RateProvider interface {
	LatestRate(ctx context.Context, base string, quote string) (fx.Rate, error)
}

type PaymentProvider interface {
	InitiateCheckout(ctx context.Context, req hubtel.InitiateCheckoutRequest) (hubtel.InitiateCheckoutResponse, error)
	VerifyTransaction(ctx context.Context, clientReference string) (hubtel.PaymentStatus, error)
	MapCallback(payload hubtel.CallbackPayload) (hubtel.PaymentStatus, error)
}

type Service struct {
	repository  *Repository
	hubtel      PaymentProvider
	rates       RateProvider
	frontendURL string
	backendURL  string
}

type ServiceConfig struct {
	FrontendURL string
	BackendURL  string
}

func NewService(repository *Repository, cfg ServiceConfig, hubtelClient PaymentProvider, rates RateProvider) *Service {
	service := &Service{
		repository:  repository,
		frontendURL: strings.TrimRight(strings.TrimSpace(cfg.FrontendURL), "/"),
		backendURL:  strings.TrimRight(strings.TrimSpace(cfg.BackendURL), "/"),
	}
	service.hubtel = hubtelClient
	service.rates = rates
	return service
}

func (s *Service) Get(ctx context.Context) (Wallet, error) {
	tenantContext, err := requireTenant(ctx, tenant.PermissionWalletRead)
	if err != nil {
		return Wallet{}, err
	}
	wallet, err := s.repository.GetByTeam(ctx, tenantContext.TeamID, CurrencyUSD)
	if err == nil {
		return wallet, nil
	}
	if !errors.Is(err, ErrWalletNotFound) {
		return Wallet{}, apperrors.NewInternal("Unable to get wallet", err)
	}
	wallet, err = s.repository.Create(ctx, tenantContext.TeamID, CurrencyUSD)
	if err != nil {
		return Wallet{}, apperrors.NewInternal("Unable to create wallet", err)
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
	if s.rates == nil {
		return TopUpResponse{}, apperrors.NewInternal("FX rates are not configured", nil)
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

	rate, err := s.rates.LatestRate(ctx, CurrencyUSD, "GHS")
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to fetch USD/GHS exchange rate", err)
	}
	paymentAmount := roundMoney((float64(req.Amount) / 100) * rate.Rate)

	transactionMetadata, err := mergeMetadata(metadata, hubtel.CheckoutData{}, rate, req.Amount, paymentAmount)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to prepare wallet metadata", err)
	}
	transaction, err := s.repository.CreatePendingTopUp(ctx, tenantContext.TeamID, req.Amount, clientReference, &description, transactionMetadata)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to create pending top-up", err)
	}
	transactionID, err := uuid.Parse(transaction.ID)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to parse top-up transaction id", err)
	}

	checkout, err := s.hubtel.InitiateCheckout(ctx, hubtel.InitiateCheckoutRequest{
		TotalAmount:     paymentAmount,
		Description:     description,
		CallbackURL:     s.backendURL + "/wallet/webhook/hubtel",
		ReturnURL:       s.frontendURL + "/dashboard/usage",
		CancellationURL: s.frontendURL + "/dashboard/usage",
		ClientReference: clientReference.String(),
	})
	if err != nil {
		_, _ = s.repository.MarkTopUpFailed(ctx, transactionID, transaction.BalanceAfter, transactionMetadata)
		return TopUpResponse{}, apperrors.NewInternal("Unable to initiate Hubtel checkout", err)
	}
	if checkout.ResponseCode != "0000" || !strings.EqualFold(checkout.Status, "Success") {
		_, _ = s.repository.MarkTopUpFailed(ctx, transactionID, transaction.BalanceAfter, transactionMetadata)
		return TopUpResponse{}, apperrors.NewBadRequest("Hubtel checkout was not accepted")
	}

	transactionMetadata, err = mergeMetadata(metadata, checkout.Data, rate, req.Amount, paymentAmount)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to prepare wallet metadata", err)
	}
	transaction, err = s.repository.UpdateTransactionMetadata(ctx, transactionID, transactionMetadata)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to attach Hubtel checkout metadata", err)
	}

	return TopUpResponse{
		CheckoutURL:       checkout.Data.CheckoutURL,
		CheckoutID:        checkout.Data.CheckoutID,
		ClientReference:   checkout.Data.ClientReference,
		CheckoutDirectURL: checkout.Data.CheckoutDirectURL,
		WalletCurrency:    CurrencyUSD,
		WalletAmount:      req.Amount,
		PaymentCurrency:   "GHS",
		PaymentAmount:     paymentAmount,
		ExchangeRate:      rate.Rate,
		ExchangeRateDate:  rate.Date,
		Transaction:       transaction,
	}, nil
}

func (s *Service) HandleHubtelCallback(ctx context.Context, payload hubtel.CallbackPayload) (Transaction, error) {
	if s.hubtel == nil {
		return Transaction{}, apperrors.NewInternal("Hubtel checkout is not configured", nil)
	}
	callbackStatus, err := s.hubtel.MapCallback(payload)
	if err != nil {
		return Transaction{}, apperrors.NewBadRequest("Invalid Hubtel callback payload")
	}
	clientReference, err := uuid.Parse(strings.TrimSpace(callbackStatus.ClientReference))
	if err != nil {
		return Transaction{}, apperrors.NewBadRequest("Hubtel client reference must be a UUID")
	}

	verifiedStatus, err := s.hubtel.VerifyTransaction(ctx, callbackStatus.ClientReference)
	if err != nil {
		return Transaction{}, apperrors.NewInternal("Unable to verify Hubtel transaction", err)
	}
	paid := hubtel.IsPaidStatus(verifiedStatus.Status)
	metadata, err := mergeSettlementMetadata(callbackStatus, verifiedStatus)
	if err != nil {
		return Transaction{}, apperrors.NewInternal("Unable to prepare Hubtel settlement metadata", err)
	}
	transaction, err := s.repository.SettleTopUp(ctx, clientReference, paid, metadata)
	if err != nil {
		return Transaction{}, apperrors.NewInternal("Unable to settle Hubtel top-up", err)
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

func mergeMetadata(metadata json.RawMessage, checkout hubtel.CheckoutData, rate fx.Rate, walletAmount int64, paymentAmount float64) (json.RawMessage, error) {
	values := map[string]any{}
	if len(metadata) > 0 {
		if err := json.Unmarshal(metadata, &values); err != nil {
			return nil, err
		}
	}
	values["provider"] = "hubtel"
	values["wallet_currency"] = CurrencyUSD
	values["wallet_amount"] = walletAmount
	values["payment_currency"] = "GHS"
	values["payment_amount"] = paymentAmount
	values["exchange_rate"] = rate.Rate
	values["exchange_rate_date"] = rate.Date
	values["exchange_rate_source"] = "frankfurter"
	values["checkout_id"] = checkout.CheckoutID
	values["checkout_url"] = checkout.CheckoutURL
	values["checkout_direct_url"] = checkout.CheckoutDirectURL
	values["client_reference"] = checkout.ClientReference
	return json.Marshal(values)
}

func mergeSettlementMetadata(callbackStatus hubtel.PaymentStatus, verifiedStatus hubtel.PaymentStatus) (json.RawMessage, error) {
	values := map[string]any{
		"provider":        "hubtel",
		"callback_status": callbackStatus.Status,
		"verified_status": verifiedStatus.Status,
	}
	if len(callbackStatus.Raw) > 0 {
		var raw any
		if err := json.Unmarshal(callbackStatus.Raw, &raw); err != nil {
			return nil, err
		}
		values["callback"] = raw
	}
	if len(verifiedStatus.Raw) > 0 {
		var raw any
		if err := json.Unmarshal(verifiedStatus.Raw, &raw); err != nil {
			return nil, err
		}
		values["status_check"] = raw
	}
	return json.Marshal(values)
}

func roundMoney(amount float64) float64 { return math.Round(amount*100) / 100 }
