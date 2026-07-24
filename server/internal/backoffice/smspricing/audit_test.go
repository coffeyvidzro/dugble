package smspricing

import (
	"strings"
	"testing"
)

func TestPlanAuditQueryUsesCompatibleParameterCasts(t *testing.T) {
	if !strings.Contains(planAuditQuery, "resource_id = $1::uuid") {
		t.Fatal("plan audit query must compare plan resource IDs as UUIDs")
	}
	if !strings.Contains(planAuditQuery, "metadata ->> 'plan_id' = $1::text") {
		t.Fatal("plan audit query must compare JSON metadata plan IDs as text")
	}
}
