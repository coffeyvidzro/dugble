package smspricing

import (
	"context"
	"fmt"
)

func (r *Repository) PlanAudit(ctx context.Context, planID string) ([]AuditRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT actor_email, action, resource_type, COALESCE(resource_id::text, ''), metadata::text, created_at
		FROM sms_pricing_audit_log
		WHERE (resource_type = 'plan' AND resource_id = $1::uuid)
		   OR (resource_type = 'rate' AND metadata ->> 'plan_id' = $1)
		ORDER BY created_at DESC
		LIMIT 100
	`, planID)
	if err != nil {
		return nil, fmt.Errorf("list sms pricing plan audit log: %w", err)
	}
	defer rows.Close()

	audits := make([]AuditRow, 0)
	for rows.Next() {
		var row AuditRow
		if err := rows.Scan(&row.ActorEmail, &row.Action, &row.ResourceType, &row.ResourceID, &row.Metadata, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan sms pricing plan audit log: %w", err)
		}
		audits = append(audits, row)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate sms pricing plan audit log: %w", err)
	}
	return audits, nil
}
