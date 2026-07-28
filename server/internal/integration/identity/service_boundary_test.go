package identity_test

import (
	"context"
	"testing"

	identityintegration "github.com/coffeyvidzro/dugble/server/internal/integration/identity"
	identitymodule "github.com/coffeyvidzro/dugble/server/internal/modules/identity"
)

type analyzerStub struct {
	request identityintegration.LivenessRequest
}

func (a *analyzerStub) Ready(context.Context) (identityintegration.Readiness, error) {
	return identityintegration.Readiness{Status: "ready", ModelsReady: true}, nil
}

func (a *analyzerStub) CheckLiveness(_ context.Context, request identityintegration.LivenessRequest) (identityintegration.LivenessEvidence, error) {
	a.request = request
	return identityintegration.LivenessEvidence{
		Challenge: identityintegration.ChallengeEvidence{
			ChallengeID:        "challenge-1",
			ChallengeCompleted: true,
			CompletionRatio:    1,
		},
		PresentationAttack: identityintegration.PresentationAttackEvidence{
			Signals:      []identityintegration.PresentationAttackSignal{{AttackType: "two_dimensional", Score: 0.8}},
			ModelVersion: "pad-v1",
		},
		AttackThreshold: request.AttackThreshold,
		AttackSuspected: true,
		Reasons:         []string{"presentation_attack_suspected:two_dimensional"},
	}, nil
}

func (a *analyzerStub) CompareFaces(context.Context, identityintegration.FaceComparisonRequest) (identityintegration.FaceComparisonEvidence, error) {
	return identityintegration.FaceComparisonEvidence{
		Similarity:            0.75,
		DetectorVersion:       "detector-v1",
		EmbeddingModelVersion: "embedder-v1",
	}, nil
}

func TestIdentityServiceOwnsPolicyThresholdsAndCustomerOutcome(t *testing.T) {
	analyzer := &analyzerStub{}
	service, err := identitymodule.NewService(analyzer, identitymodule.ServiceConfig{
		PolicyVersion:           "identity-v1",
		AttackThreshold:         0.7,
		FaceSimilarityThreshold: 0.8,
	})
	if err != nil {
		t.Fatalf("NewService() error = %v", err)
	}

	liveness, err := service.AnalyzeLiveness(context.Background(), identityintegration.LivenessRequest{
		VerificationID:  "verification-1",
		SessionID:       "session-1",
		VideoObjectKey:  "private/capture-1",
		AttackThreshold: 0.1,
	})
	if err != nil {
		t.Fatalf("AnalyzeLiveness() error = %v", err)
	}
	if analyzer.request.AttackThreshold != 0.7 {
		t.Fatalf("analyzer attack threshold = %v, want 0.7", analyzer.request.AttackThreshold)
	}
	if liveness.Outcome != identitymodule.OutcomeManualReview || liveness.PolicyVersion != "identity-v1" {
		t.Fatalf("AnalyzeLiveness() = %+v", liveness)
	}

	comparison, err := service.CompareFaces(context.Background(), identityintegration.FaceComparisonRequest{})
	if err != nil {
		t.Fatalf("CompareFaces() error = %v", err)
	}
	if comparison.Matched {
		t.Fatalf("CompareFaces() = %+v, want unmatched", comparison)
	}
}
