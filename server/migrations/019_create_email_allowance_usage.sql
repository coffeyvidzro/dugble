CREATE TABLE IF NOT EXISTS email_allowance_usage (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    reference_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (team_id, reference_id),
    CONSTRAINT chk_email_allowance_usage_reference
        CHECK (length(trim(reference_id)) > 0)
);
