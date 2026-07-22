package wallet

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
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
	if req.AmountCents <= 0 {
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
	paymentAmountCents, err := convertUSDCentsToGHSPesewas(req.AmountCents, rate.Rate)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to convert wallet top-up amount", err)
	}
	paymentAmount := minorToMajor(paymentAmountCents)

	transactionMetadata, err := mergeMetadata(metadata, hubtel.CheckoutData{}, rate, req.AmountCents, paymentAmountCents)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to prepare wallet metadata", err)
	}
	transaction, err := s.repository.CreatePendingTopUp(ctx, tenantContext.TeamID, req.AmountCents, clientReference, &description, transactionMetadata)
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

	transactionMetadata, err = mergeMetadata(metadata, checkout.Data, rate, req.AmountCents, paymentAmountCents)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to prepare wallet metadata", err)
	}
	transaction, err = s.repository.UpdateTransactionMetadata(ctx, transactionID, transactionMetadata)
	if err != nil {
		return TopUpResponse{}, apperrors.NewInternal("Unable to attach Hubtel checkout metadata", err)
	}

	return TopUpResponse{
		CheckoutURL:        checkout.Data.CheckoutURL,
		CheckoutID:         checkout.Data.CheckoutID,
		ClientReference:    checkout.Data.ClientReference,
		CheckoutDirectURL:  checkout.Data.CheckoutDirectURL,
		WalletCurrency:     CurrencyUSD,
		WalletAmountCents:  req.AmountCents,
		PaymentCurrency:    "GHS",
		PaymentAmount:      paymentAmount,
		PaymentAmountCents: paymentAmountCents,
		ExchangeRate:       formatRate(rate.Rate),
		ExchangeRateDate:   rate.Date,
		Transaction:        transaction,
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

func mergeMetadata(metadata json.RawMessage, checkout hubtel.CheckoutData, rate fx.Rate, walletAmountCents int64, paymentAmountCents int64) (json.RawMessage, error) {
	values := map[string]any{}
	if len(metadata) > 0 {
		if err := json.Unmarshal(metadata, &values); err != nil {
			return nil, err
		}
	}
	values["provider"] = "hubtel"
	values["wallet_currency"] = CurrencyUSD
	values["wallet_amount_cents"] = walletAmountCents
	values["payment_currency"] = "GHS"
	values["payment_amount"] = minorToMajor(paymentAmountCents)
	values["payment_amount_cents"] = paymentAmountCents
	values["exchange_rate"] = formatRate(rate.Rate)
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

func convertUSDCentsToGHSPesewas(usdCents int64, rate float64) (int64, error) {
	if usdCents <= 0 {
		return 0, fmt.Errorf("usd cents must be positive")
	}
	if rate <= 0 {
		return 0, fmt.Errorf("exchange rate must be positive")
	}
	rateRat, ok := new(big.Rat).SetString(formatRate(rate))
	if !ok {
		return 0, fmt.Errorf("parse exchange rate")
	}
	amount := new(big.Rat).SetInt64(usdCents)
	amount.Mul(amount, rateRat)
	numerator := new(big.Int).Set(amount.Num())
	denominator := amount.Denom()
	quotient, remainder := new(big.Int).QuoRem(numerator, denominator, new(big.Int))
	if new(big.Int).Mul(remainder, big.NewInt(2)).Cmp(denominator) >= 0 {
		quotient.Add(quotient, big.NewInt(1))
	}
	return quotient.Int64(), nil
}

func minorToMajor(amountCents int64) float64 { return float64(amountCents) / 100 }

func formatRate(rate float64) string { return fmt.Sprintf("%.10f", rate) }
