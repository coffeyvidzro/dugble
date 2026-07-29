-- name: CreateEmailProviderEvent :execrows
INSERT INTO email_provider_events (
    id,
    email_message_id,
    provider,
    transport,
    provider_notification_id,
    provider_message_id,
    event_type,
    occurred_at,
    received_at,
    normalized_payload,
    provider_payload
) VALUES (
    sqlc.arg(id),
    (
        SELECT id
        FROM email_messages
        WHERE provider = 'ses'
          AND provider_message_id = sqlc.arg(provider_message_id)
    ),
    sqlc.arg(provider),
    sqlc.arg(transport),
    sqlc.arg(provider_notification_id),
    sqlc.arg(provider_message_id),
    sqlc.arg(event_type),
    sqlc.arg(occurred_at),
    sqlc.arg(received_at),
    sqlc.arg(normalized_payload),
    sqlc.arg(provider_payload)
)
ON CONFLICT (provider, transport, provider_notification_id) DO NOTHING;

-- name: LinkEmailProviderEvent :execrows
UPDATE email_provider_events AS event
SET email_message_id = message.id
FROM email_messages AS message
WHERE event.provider = sqlc.arg(provider)
  AND event.transport = sqlc.arg(transport)
  AND event.provider_notification_id = sqlc.arg(provider_notification_id)
  AND event.email_message_id IS NULL
  AND message.provider = 'ses'
  AND message.provider_message_id = event.provider_message_id;

-- name: GetEmailProviderEventByNotification :one
SELECT *
FROM email_provider_events
WHERE provider = sqlc.arg(provider)
  AND transport = sqlc.arg(transport)
  AND provider_notification_id = sqlc.arg(provider_notification_id);

-- name: MarkEmailProviderEventProcessed :execrows
UPDATE email_provider_events
SET processed_at = COALESCE(processed_at, sqlc.arg(processed_at))
WHERE id = sqlc.arg(id);
