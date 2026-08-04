CREATE TABLE IF NOT EXISTS inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'normal',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    source TEXT NOT NULL DEFAULT 'api',
    source_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_inbox_messages_id_team UNIQUE (id, team_id),
    CONSTRAINT chk_inbox_messages_category CHECK (
        length(trim(category)) > 0 AND category !~ '[[:space:]]'
    ),
    CONSTRAINT chk_inbox_messages_priority CHECK (
        priority IN ('low', 'normal', 'high', 'urgent')
    ),
    CONSTRAINT chk_inbox_messages_title CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_inbox_messages_body CHECK (length(trim(body)) > 0),
    CONSTRAINT chk_inbox_messages_data CHECK (jsonb_typeof(data) = 'object'),
    CONSTRAINT chk_inbox_messages_actions CHECK (jsonb_typeof(actions) = 'array'),
    CONSTRAINT chk_inbox_messages_source CHECK (
        source IN ('api', 'notify', 'system')
    )
);

CREATE INDEX IF NOT EXISTS idx_inbox_messages_team_created
    ON inbox_messages (team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbox_messages_team_category_created
    ON inbox_messages (team_id, category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbox_messages_source
    ON inbox_messages (team_id, source, source_id)
    WHERE source_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS inbox_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    recipient_id TEXT NOT NULL,
    seen_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_inbox_receipts_message_recipient
        UNIQUE (team_id, message_id, recipient_id),
    CONSTRAINT fk_inbox_receipts_message_same_team
        FOREIGN KEY (message_id, team_id)
        REFERENCES inbox_messages (id, team_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_inbox_receipts_recipient CHECK (
        length(trim(recipient_id)) > 0
    ),
    CONSTRAINT chk_inbox_receipts_read_seen CHECK (
        read_at IS NULL OR seen_at IS NOT NULL
    ),
    CONSTRAINT chk_inbox_receipts_timestamp_order CHECK (
        (seen_at IS NULL OR seen_at >= created_at)
        AND (read_at IS NULL OR read_at >= seen_at)
        AND (archived_at IS NULL OR archived_at >= created_at)
    )
);

CREATE INDEX IF NOT EXISTS idx_inbox_receipts_feed
    ON inbox_receipts (team_id, recipient_id, created_at DESC)
    WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inbox_receipts_unread
    ON inbox_receipts (team_id, recipient_id, created_at DESC)
    WHERE read_at IS NULL AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inbox_receipts_message
    ON inbox_receipts (message_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbox_receipts_archived
    ON inbox_receipts (team_id, recipient_id, archived_at DESC)
    WHERE archived_at IS NOT NULL;
