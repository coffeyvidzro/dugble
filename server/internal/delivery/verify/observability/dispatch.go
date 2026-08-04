package observability

import (
	"context"
	"log/slog"
	"time"

	"github.com/newrelic/go-agent/v3/newrelic"

	verifydispatch "github.com/coffeyvidzro/dugble/server/internal/delivery/verify/dispatch"
	"github.com/coffeyvidzro/dugble/server/internal/monitoring"
)

type dispatchHandler interface {
	Handle(context.Context, verifydispatch.Command) error
	HandleExhausted(context.Context, verifydispatch.Command, error) error
}

type ObservedDispatchHandler struct {
	next    dispatchHandler
	metrics *Metrics
	app     *newrelic.Application
}

func NewObservedDispatchHandler(next dispatchHandler, metrics *Metrics, app *newrelic.Application) *ObservedDispatchHandler {
	return &ObservedDispatchHandler{next: next, metrics: metrics, app: app}
}

func (handler *ObservedDispatchHandler) Handle(ctx context.Context, command verifydispatch.Command) error {
	started := time.Now()
	observedCtx, finish := monitoring.Transaction(ctx, handler.app, "Verify/Dispatch/Handle")
	err := handler.next.Handle(observedCtx, command)
	finish(err)
	handler.metrics.Observe("dispatch", outcome(err), time.Since(started))
	if err != nil {
		slog.WarnContext(ctx, "verification dispatch failed",
			"verification_id", command.VerificationID,
			"challenge_id", command.ChallengeID,
			"team_id", command.TeamID,
			"error", err,
		)
	}
	return err
}

func (handler *ObservedDispatchHandler) HandleExhausted(ctx context.Context, command verifydispatch.Command, cause error) error {
	started := time.Now()
	observedCtx, finish := monitoring.Transaction(ctx, handler.app, "Verify/Dispatch/Exhausted")
	err := handler.next.HandleExhausted(observedCtx, command, cause)
	finish(err)
	handler.metrics.Observe("dispatch_exhausted", outcome(err), time.Since(started))
	if err != nil {
		slog.ErrorContext(ctx, "verification dispatch exhaustion handling failed",
			"verification_id", command.VerificationID,
			"challenge_id", command.ChallengeID,
			"team_id", command.TeamID,
			"cause", cause,
			"error", err,
		)
	} else {
		slog.ErrorContext(ctx, "verification dispatch exhausted",
			"verification_id", command.VerificationID,
			"challenge_id", command.ChallengeID,
			"team_id", command.TeamID,
			"cause", cause,
		)
	}
	return err
}

func outcome(err error) string {
	if err != nil {
		return "error"
	}
	return "success"
}
