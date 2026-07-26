CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    signing_secret TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    subscribed_events TEXT[] NOT NULL DEFAULT '{}',
    api_version TEXT NOT NULL DEFAULT '2026-07-01',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    disabled_at TIMESTAMPTZ,
    CONSTRAINT chk_webhook_endpoint_url CHECK (url ~ '^https?://'),
    CONSTRAINT chk_webhook_endpoint_events CHECK (array_position(subscribed_events, '') IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_team
    ON webhook_endpoints (team_id, created_at DESC);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    object_type TEXT NOT NULL,
    object_id UUID,
    api_version TEXT NOT NULL DEFAULT '2026-07-01',
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_webhook_event_type CHECK (length(trim(type)) > 0 AND type !~ '[[:space:]]'),
    CONSTRAINT chk_webhook_event_payload CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_team
    ON webhook_events (team_id, created_at DESC);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES webhook_events(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_attempt_at TIMESTAMPTZ,
    response_status INTEGER,
    response_body TEXT,
    last_error TEXT,
    delivered_at TIMESTAMPTZ,
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, endpoint_id),
    CONSTRAINT chk_webhook_delivery_status CHECK (status IN ('pending', 'retrying', 'succeeded', 'failed')),
    CONSTRAINT chk_webhook_delivery_attempts CHECK (attempt_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_pending
    ON webhook_deliveries (next_attempt_at, created_at)
    WHERE status IN ('pending', 'retrying');

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event
    ON webhook_deliveries (event_id, created_at DESC);
