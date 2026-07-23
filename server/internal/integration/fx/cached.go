package fx

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	defaultRefreshAfter = 2 * time.Hour
	defaultMaxStaleAge  = 36 * time.Hour
	defaultCacheTTL     = 48 * time.Hour
)

type Provider interface {
	LatestRate(ctx context.Context, base string, quote string) (Rate, error)
}

type CachedProvider struct {
	source       Provider
	redis        redis.Cmdable
	refreshAfter time.Duration
	maxStaleAge  time.Duration
	cacheTTL     time.Duration
	now          func() time.Time
}

type cachedRate struct {
	Rate      Rate      `json:"rate"`
	FetchedAt time.Time `json:"fetched_at"`
}

func NewCachedProvider(source Provider, client redis.Cmdable) *CachedProvider {
	return &CachedProvider{
		source:       source,
		redis:        client,
		refreshAfter: defaultRefreshAfter,
		maxStaleAge:  defaultMaxStaleAge,
		cacheTTL:     defaultCacheTTL,
		now:          time.Now,
	}
}

func (p *CachedProvider) LatestRate(ctx context.Context, base string, quote string) (Rate, error) {
	if p == nil || p.source == nil {
		return Rate{}, errors.New("FX source is required")
	}
	base = strings.ToUpper(strings.TrimSpace(base))
	quote = strings.ToUpper(strings.TrimSpace(quote))
	if base == "" || quote == "" {
		return Rate{}, errors.New("base and quote currencies are required")
	}

	entry, cacheErr := p.read(ctx, base, quote)
	if cacheErr == nil && p.age(entry) <= p.refreshAfter {
		return entry.Rate, nil
	}

	fresh, fetchErr := p.source.LatestRate(ctx, base, quote)
	if fetchErr == nil {
		_ = p.write(ctx, fresh)
		return fresh, nil
	}
	if cacheErr == nil && p.age(entry) <= p.maxStaleAge {
		return entry.Rate, nil
	}
	if cacheErr != nil {
		return Rate{}, fmt.Errorf("fetch FX rate after cache failure: %w", fetchErr)
	}
	return Rate{}, fmt.Errorf("refresh stale FX rate: %w", fetchErr)
}

func (p *CachedProvider) Refresh(ctx context.Context, base string, quote string) (Rate, error) {
	if p == nil || p.source == nil {
		return Rate{}, errors.New("FX source is required")
	}
	fresh, err := p.source.LatestRate(ctx, base, quote)
	if err != nil {
		return Rate{}, err
	}
	if err := p.write(ctx, fresh); err != nil {
		return Rate{}, err
	}
	return fresh, nil
}

func (p *CachedProvider) read(ctx context.Context, base string, quote string) (cachedRate, error) {
	if p.redis == nil {
		return cachedRate{}, errors.New("Redis FX cache is not configured")
	}
	value, err := p.redis.Get(ctx, rateCacheKey(base, quote)).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return cachedRate{}, errors.New("FX rate is not cached")
		}
		return cachedRate{}, fmt.Errorf("read cached FX rate: %w", err)
	}
	var entry cachedRate
	if err := json.Unmarshal([]byte(value), &entry); err != nil {
		return cachedRate{}, fmt.Errorf("decode cached FX rate: %w", err)
	}
	if entry.FetchedAt.IsZero() || entry.Rate.Rate <= 0 {
		return cachedRate{}, errors.New("cached FX rate is invalid")
	}
	return entry, nil
}

func (p *CachedProvider) write(ctx context.Context, rate Rate) error {
	if p.redis == nil {
		return errors.New("Redis FX cache is not configured")
	}
	base := strings.ToUpper(strings.TrimSpace(rate.Base))
	quote := strings.ToUpper(strings.TrimSpace(rate.Quote))
	if base == "" || quote == "" || rate.Rate <= 0 {
		return errors.New("FX rate is invalid")
	}
	entry := cachedRate{Rate: rate, FetchedAt: p.now().UTC()}
	value, err := json.Marshal(entry)
	if err != nil {
		return fmt.Errorf("encode cached FX rate: %w", err)
	}
	if err := p.redis.Set(ctx, rateCacheKey(base, quote), value, p.cacheTTL).Err(); err != nil {
		return fmt.Errorf("cache FX rate: %w", err)
	}
	return nil
}

func (p *CachedProvider) age(entry cachedRate) time.Duration {
	age := p.now().UTC().Sub(entry.FetchedAt)
	if age < 0 {
		return 0
	}
	return age
}

func rateCacheKey(base string, quote string) string {
	return "fx:rate:" + strings.ToUpper(strings.TrimSpace(base)) + ":" + strings.ToUpper(strings.TrimSpace(quote))
}
