// Package inbox preserves the previous import path while callers migrate to messaging/processed.
// Deprecated: import github.com/coffeyvidzro/dugble/server/internal/messaging/processed instead.
package inbox

import processed "github.com/coffeyvidzro/dugble/server/internal/messaging/processed"

type Repository = processed.Repository

var NewRepository = processed.NewRepository
