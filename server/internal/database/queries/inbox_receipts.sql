-- name: CreateInboxReceipt :one
INSERT INTO inbox_receipts (team_id, message_id, recipient_id)
SELECT message.team_id, message.id, sqlc.arg(recipient_id)
FROM inbox_messages AS message
WHERE message.id = sqlc.arg(message_id)
  AND message.team_id = sqlc.arg(team_id)
ON CONFLICT (team_id, message_id, recipient_id) DO UPDATE
SET updated_at = inbox_receipts.updated_at
RETURNING *;

-- name: CreateInboxReceipts :many
INSERT INTO inbox_receipts (team_id, message_id, recipient_id)
SELECT message.team_id, message.id, recipient.recipient_id
FROM inbox_messages AS message
CROSS JOIN unnest(sqlc.arg(recipient_ids)::text[]) AS recipient(recipient_id)
WHERE message.id = sqlc.arg(message_id)
  AND message.team_id = sqlc.arg(team_id)
ON CONFLICT (team_id, message_id, recipient_id) DO NOTHING
RETURNING *;

-- name: GetInboxReceipt :one
SELECT receipt.*
FROM inbox_receipts AS receipt
JOIN teams AS team ON team.id = receipt.team_id
WHERE receipt.team_id = sqlc.arg(team_id)
  AND receipt.message_id = sqlc.arg(message_id)
  AND receipt.recipient_id = sqlc.arg(recipient_id)
  AND team.status = 'active';

-- name: ListInboxFeed :many
SELECT
    receipt.id AS receipt_id,
    receipt.recipient_id,
    receipt.seen_at,
    receipt.read_at,
    receipt.archived_at,
    receipt.created_at AS receipt_created_at,
    message.*
FROM inbox_receipts AS receipt
JOIN inbox_messages AS message
  ON message.id = receipt.message_id
 AND message.team_id = receipt.team_id
JOIN teams AS team ON team.id = receipt.team_id
WHERE receipt.team_id = sqlc.arg(team_id)
  AND receipt.recipient_id = sqlc.arg(recipient_id)
  AND receipt.archived_at IS NULL
  AND team.status = 'active'
ORDER BY receipt.created_at DESC, receipt.id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: CountUnreadInboxReceipts :one
SELECT count(*)::bigint
FROM inbox_receipts AS receipt
JOIN teams AS team ON team.id = receipt.team_id
WHERE receipt.team_id = sqlc.arg(team_id)
  AND receipt.recipient_id = sqlc.arg(recipient_id)
  AND receipt.read_at IS NULL
  AND receipt.archived_at IS NULL
  AND team.status = 'active';

-- name: MarkInboxReceiptSeen :one
UPDATE inbox_receipts
SET seen_at = COALESCE(seen_at, now()),
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND message_id = sqlc.arg(message_id)
  AND recipient_id = sqlc.arg(recipient_id)
RETURNING *;

-- name: MarkInboxReceiptRead :one
UPDATE inbox_receipts
SET seen_at = COALESCE(seen_at, now()),
    read_at = COALESCE(read_at, now()),
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND message_id = sqlc.arg(message_id)
  AND recipient_id = sqlc.arg(recipient_id)
RETURNING *;

-- name: ArchiveInboxReceipt :one
UPDATE inbox_receipts
SET archived_at = COALESCE(archived_at, now()),
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND message_id = sqlc.arg(message_id)
  AND recipient_id = sqlc.arg(recipient_id)
RETURNING *;

-- name: UnarchiveInboxReceipt :one
UPDATE inbox_receipts
SET archived_at = NULL,
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND message_id = sqlc.arg(message_id)
  AND recipient_id = sqlc.arg(recipient_id)
RETURNING *;
