package sesevents

import "context"

type publisher interface {
	Publish(context.Context, string, []byte, map[string]string, string) error
}

type confirmer interface {
	Confirm(context.Context, string) error
}
