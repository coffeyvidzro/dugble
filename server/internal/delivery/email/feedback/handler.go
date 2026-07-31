package feedback

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
)

type eventProcessor interface {
	Process(context.Context, uuid.UUID) error
}

type Handler struct {
	repository eventProcessor
}

func NewHandler(repository eventProcessor) *Handler {
	return &Handler{repository: repository}
}

func (h *Handler) Handle(ctx context.Context, event ProviderEventReference) error {
	if h == nil || h.repository == nil {
		return errors.New("email feedback handler is not configured")
	}
	if event.EventID == uuid.Nil {
		return errors.New("email feedback event ID is required")
	}
	if strings.TrimSpace(event.Provider) != ProviderSES {
		return errors.New("unsupported email feedback provider")
	}
	return h.repository.Process(ctx, event.EventID)
}
