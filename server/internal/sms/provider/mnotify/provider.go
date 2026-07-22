package mnotify

import "github.com/coffeyvidzro/dugble/server/internal/sms/provider"

var _ provider.Provider = (*Client)(nil)
