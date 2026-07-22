package domain

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/pkg/pgconv"
)

var ErrSenderDomainAlreadyExists = errors.New("sender domain already exists")

type Repository struct{ queries *dbsqlc.Queries }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{queries: dbsqlc.New(db)} }

func (r *Repository) Create(
	ctx context.Context,
	teamID uuid.UUID,
	domain string,
	provider string,
	providerRegion string,
	createdBy uuid.UUID,
) (SenderDomain, error) {
	row, err := r.queries.CreateSenderDomain(ctx, dbsqlc.CreateSenderDomainParams{
		TeamID:              teamID,
		Domain:              domain,
		Provider:            provider,
		ProviderRegion:      providerRegion,
		VerificationRecords: []byte("[]"),
		CreatedBy:           &createdBy,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return SenderDomain{}, ErrSenderDomainAlreadyExists
		}
		return SenderDomain{}, fmt.Errorf("create sender domain: %w", err)
	}
	return senderDomainFromSQLC(row), nil
}

func (r *Repository) List(ctx context.Context, teamID uuid.UUID) ([]SenderDomain, error) {
	rows, err := r.queries.ListSenderDomains(ctx, dbsqlc.ListSenderDomainsParams{TeamID: teamID})
	if err != nil {
		return nil, fmt.Errorf("list sender domains: %w", err)
	}
	domains := make([]SenderDomain, 0, len(rows))
	for _, row := range rows {
		domains = append(domains, senderDomainFromSQLC(row))
	}
	return domains, nil
}

func (r *Repository) Get(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (SenderDomain, error) {
	row, err := r.queries.GetSenderDomain(ctx, dbsqlc.GetSenderDomainParams{ID: id, TeamID: teamID})
	if err != nil {
		return SenderDomain{}, fmt.Errorf("get sender domain: %w", err)
	}
	return senderDomainFromSQLC(row), nil
}

func (r *Repository) Delete(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (SenderDomain, error) {
	row, err := r.queries.DeleteSenderDomain(ctx, dbsqlc.DeleteSenderDomainParams{ID: id, TeamID: teamID})
	if err != nil {
		return SenderDomain{}, fmt.Errorf("delete sender domain: %w", err)
	}
	return senderDomainFromSQLC(row), nil
}

func senderDomainFromSQLC(row dbsqlc.SenderDomain) SenderDomain {
	var createdBy *string
	if row.CreatedBy != nil {
		value := row.CreatedBy.String()
		createdBy = &value
	}
	return SenderDomain{
		ID:                  row.ID.String(),
		TeamID:              row.TeamID.String(),
		Domain:              row.Domain,
		Provider:            row.Provider,
		ProviderRegion:      row.ProviderRegion,
		Status:              row.Status,
		VerificationRecords: json.RawMessage(row.VerificationRecords),
		FailureReason:       row.FailureReason,
		LastCheckedAt:       pgconv.TimestamptzToTimePtr(row.LastCheckedAt),
		VerifiedAt:          pgconv.TimestamptzToTimePtr(row.VerifiedAt),
		DisabledAt:          pgconv.TimestamptzToTimePtr(row.DisabledAt),
		CreatedBy:           createdBy,
		CreatedAt:           row.CreatedAt.Time,
		UpdatedAt:           row.UpdatedAt.Time,
	}
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
