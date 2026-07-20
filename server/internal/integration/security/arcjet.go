package security

import (
	"fmt"

	"github.com/arcjet/arcjet-go"
)

func NewClient(arcjetKey string) (*arcjet.Client, error) {
	client, err := arcjet.NewClient(arcjet.Config{
		Key: arcjetKey,
		Rules: []arcjet.Rule{
			arcjet.Shield(arcjet.ShieldOptions{
				Mode: arcjet.ModeLive,
			}),
			arcjet.DetectBot(arcjet.BotOptions{
				Mode:  arcjet.ModeLive,
				Allow: []string{}, // empty = block all bots
			}),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("create Arcjet client: %w", err)
	}

	return client, nil
}
