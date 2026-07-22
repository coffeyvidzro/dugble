package arkesel

import "github.com/coffeyvidzro/dugble/server/internal/integration/sms"

var _ sms.Provider = (*Client)(nil)
