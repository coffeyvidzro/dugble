package sqlc

import (
	"strings"
	"testing"
)

func TestGetActiveTeamTokenByHashRequiresActiveTeam(t *testing.T) {
	t.Parallel()

	if !strings.Contains(getActiveTeamTokenByHash, "JOIN teams t ON t.id = tt.team_id") {
		t.Fatalf("GetActiveTeamTokenByHash must join teams to check team status")
	}
	if !strings.Contains(getActiveTeamTokenByHash, "AND t.status = 'active'") {
		t.Fatalf("GetActiveTeamTokenByHash must require the owning team to be active")
	}
}
