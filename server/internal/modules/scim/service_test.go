package scim

import (
	db "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"testing"
	"time"
)

func TestUserFromList(t *testing.T) {
	t.Parallel()
	id := uuid.New()
	external := "directory-42"
	now := time.Now().UTC()
	got := userFromList(db.ListSCIMUsersRow{ID: id, Email: "person@example.com", Name: "Global Person", ScimName: "Person", MembershipStatus: "active", ExternalID: &external, CreatedAt: pgtype.Timestamptz{Time: now, Valid: true}, UpdatedAt: pgtype.Timestamptz{Time: now, Valid: true}})
	if got.ID != id.String() || got.UserName != "person@example.com" || !got.Active || got.ExternalID != external {
		t.Fatalf("unexpected SCIM user: %#v", got)
	}
	if len(got.Schemas) != 1 || got.Schemas[0] != userSchema {
		t.Fatalf("unexpected schemas: %v", got.Schemas)
	}
}
func TestNumberDefaultsAndBounds(t *testing.T) {
	t.Parallel()
	if number("", 7) != 7 || number("0", 7) != 7 || number("12", 7) != 12 {
		t.Fatal("unexpected pagination parsing")
	}
}
