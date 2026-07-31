package sns

import (
	"context"
	"fmt"
)

type ConfirmSubscriptionInput struct {
	TopicARN string
	Token    string
}

type ConfirmSubscriptionClient interface {
	ConfirmSubscription(context.Context, ConfirmSubscriptionInput) error
}

type SubscriptionConfirmer interface {
	Confirm(context.Context, Envelope) error
}

type Confirmer struct {
	client ConfirmSubscriptionClient
}

func NewConfirmer(client ConfirmSubscriptionClient) *Confirmer {
	return &Confirmer{client: client}
}

func (c *Confirmer) Confirm(ctx context.Context, envelope Envelope) error {
	if envelope.Type != TypeSubscriptionConfirmation {
		return fmt.Errorf("%w: expected %s, got %s", ErrInvalidEnvelope, TypeSubscriptionConfirmation, envelope.Type)
	}
	if err := validateEnvelope(envelope); err != nil {
		return err
	}
	if c == nil || c.client == nil {
		return fmt.Errorf("%w: confirmation client is not configured", ErrConfirmationUnavailable)
	}
	if err := c.client.ConfirmSubscription(ctx, ConfirmSubscriptionInput{
		TopicARN: envelope.TopicARN,
		Token:    *envelope.Token,
	}); err != nil {
		return fmt.Errorf("%w: %v", ErrConfirmationUnavailable, err)
	}
	return nil
}
