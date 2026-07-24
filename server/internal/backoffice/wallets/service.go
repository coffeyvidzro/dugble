package wallets

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

var ErrInvalidRequest = errors.New("invalid wallet request")

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context, filter Filter) ([]Row, error) {
	filter.Query = strings.TrimSpace(filter.Query)
	filter.Status = strings.TrimSpace(filter.Status)
	return s.repository.List(ctx, filter)
}

func (s *Service) Detail(ctx context.Context, id string) (Detail, error) {
	return s.repository.Detail(ctx, strings.TrimSpace(id))
}

func (s *Service) Adjust(ctx context.Context, id string, req AdjustmentRequest) error {
	amountMicros, err := ParseUSDMicros(req.AmountUSD)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidRequest, err)
	}

	switch strings.TrimSpace(req.Direction) {
	case "credit":
	case "debit":
		amountMicros = -amountMicros
	default:
		return fmt.Errorf("%w: direction must be credit or debit", ErrInvalidRequest)
	}

	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		return fmt.Errorf("%w: adjustment reason is required", ErrInvalidRequest)
	}

	return s.repository.Adjust(ctx, strings.TrimSpace(id), amountMicros, reason)
}
