package verify

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

type AbuseContext struct {
	IPHash []byte
}

type abuseControls interface {
	AllowCreate(context.Context, uuid.UUID, uuid.UUID, string, []byte) error
	AllowCheck(context.Context, uuid.UUID, uuid.UUID, string, []byte) error
	AllowResend(context.Context, uuid.UUID, uuid.UUID, string, []byte) error
}

type AbusePolicy struct {
	CreateTeam      limit
	CreateService   limit
	CreateRecipient limit
	CreateIP        limit
	CheckRecipient  limit
	CheckIP         limit
	ResendRecipient limit
	ResendIP        limit
}

type limit struct {
	Count  int64
	Window time.Duration
}

func DefaultAbusePolicy() AbusePolicy {
	return AbusePolicy{
		CreateTeam:      limit{Count: 300, Window: time.Minute},
		CreateService:   limit{Count: 120, Window: time.Minute},
		CreateRecipient: limit{Count: 5, Window: 10 * time.Minute},
		CreateIP:        limit{Count: 30, Window: 10 * time.Minute},
		CheckRecipient:  limit{Count: 20, Window: 10 * time.Minute},
		CheckIP:         limit{Count: 60, Window: 10 * time.Minute},
		ResendRecipient: limit{Count: 5, Window: 10 * time.Minute},
		ResendIP:        limit{Count: 20, Window: 10 * time.Minute},
	}
}

type RedisAbuseControls struct {
	client *redis.Client
	secret []byte
	policy AbusePolicy
	now    func() time.Time
}

func NewRedisAbuseControls(client *redis.Client, secret []byte, policy AbusePolicy) (*RedisAbuseControls, error) {
	if client == nil {
		return nil, errors.New("verify abuse controls require Redis")
	}
	if len(secret) < 32 {
		return nil, errors.New("verify abuse controls require at least 32 secret bytes")
	}
	if err := validateAbusePolicy(policy); err != nil {
		return nil, err
	}
	return &RedisAbuseControls{client: client, secret: append([]byte(nil), secret...), policy: policy, now: time.Now}, nil
}

func (controls *RedisAbuseControls) AllowCreate(ctx context.Context, teamID, serviceID uuid.UUID, recipient string, ipHash []byte) error {
	return controls.allow(ctx, []rule{
		{scope: "create:team:" + teamID.String(), limit: controls.policy.CreateTeam},
		{scope: "create:service:" + serviceID.String(), limit: controls.policy.CreateService},
		{scope: "create:recipient:" + controls.digest(teamID.String()+":"+recipient), limit: controls.policy.CreateRecipient},
		{scope: "create:ip:" + controls.ipScope(teamID, ipHash), limit: controls.policy.CreateIP, optional: len(ipHash) == 0},
	})
}

func (controls *RedisAbuseControls) AllowCheck(ctx context.Context, teamID, verificationID uuid.UUID, recipient string, ipHash []byte) error {
	return controls.allow(ctx, []rule{
		{scope: "check:recipient:" + controls.digest(teamID.String()+":"+recipient), limit: controls.policy.CheckRecipient},
		{scope: "check:ip:" + controls.ipScope(teamID, ipHash), limit: controls.policy.CheckIP, optional: len(ipHash) == 0},
		{scope: "check:verification:" + verificationID.String(), limit: limit{Count: 25, Window: 10 * time.Minute}},
	})
}

func (controls *RedisAbuseControls) AllowResend(ctx context.Context, teamID, verificationID uuid.UUID, recipient string, ipHash []byte) error {
	return controls.allow(ctx, []rule{
		{scope: "resend:recipient:" + controls.digest(teamID.String()+":"+recipient), limit: controls.policy.ResendRecipient},
		{scope: "resend:ip:" + controls.ipScope(teamID, ipHash), limit: controls.policy.ResendIP, optional: len(ipHash) == 0},
		{scope: "resend:verification:" + verificationID.String(), limit: limit{Count: 6, Window: 10 * time.Minute}},
	})
}

type rule struct {
	scope    string
	limit    limit
	optional bool
}

var fixedWindowScript = redis.NewScript(`
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
if current > tonumber(ARGV[1]) then
  return 0
end
return 1
`)

func (controls *RedisAbuseControls) allow(ctx context.Context, rules []rule) error {
	if controls == nil || controls.client == nil || controls.now == nil {
		return errors.New("verify abuse controls are not configured")
	}
	now := controls.now().UTC()
	for _, rule := range rules {
		if rule.optional {
			continue
		}
		window := rule.limit.Window
		bucket := now.UnixMilli() / window.Milliseconds()
		key := "dugble:verify:abuse:v1:" + rule.scope + ":" + strconv.FormatInt(bucket, 10)
		allowed, err := fixedWindowScript.Run(ctx, controls.client, []string{key}, rule.limit.Count, window.Milliseconds()+1000).Int64()
		if err != nil {
			return fmt.Errorf("apply verification abuse control: %w", err)
		}
		if allowed != 1 {
			return apperrors.TooManyRequests("Too many verification requests. Try again later.")
		}
	}
	return nil
}

func (controls *RedisAbuseControls) digest(value string) string {
	mac := hmac.New(sha256.New, controls.secret)
	_, _ = mac.Write([]byte(strings.ToLower(strings.TrimSpace(value))))
	return hex.EncodeToString(mac.Sum(nil))
}

func (controls *RedisAbuseControls) ipScope(teamID uuid.UUID, ipHash []byte) string {
	if len(ipHash) == 0 {
		return ""
	}
	return controls.digest(teamID.String() + ":" + hex.EncodeToString(ipHash))
}

func validateAbusePolicy(policy AbusePolicy) error {
	limits := []limit{
		policy.CreateTeam, policy.CreateService, policy.CreateRecipient, policy.CreateIP,
		policy.CheckRecipient, policy.CheckIP, policy.ResendRecipient, policy.ResendIP,
	}
	for _, configured := range limits {
		if configured.Count <= 0 || configured.Window < time.Second {
			return errors.New("verify abuse limits require a positive count and window")
		}
	}
	return nil
}
