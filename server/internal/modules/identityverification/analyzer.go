package identityverification

import (
	"context"
	"errors"
)

var ErrAnalyzerNotConfigured = errors.New("identity analyzer is not configured")

// Analyzer defines the boundary between Dugble's verification workflow and the
// self-hosted AI service that performs document, face, and liveness analysis.
type Analyzer interface {
	AnalyzeDocument(context.Context, DocumentAnalysisRequest) (DocumentAnalysisResult, error)
	CompareFaces(context.Context, FaceComparisonRequest) (FaceComparisonResult, error)
	CheckLiveness(context.Context, LivenessRequest) (LivenessResult, error)
}

// UnavailableAnalyzer keeps the module safe until the private AI service client
// is implemented and configured.
type UnavailableAnalyzer struct{}

func (UnavailableAnalyzer) AnalyzeDocument(context.Context, DocumentAnalysisRequest) (DocumentAnalysisResult, error) {
	return DocumentAnalysisResult{}, ErrAnalyzerNotConfigured
}

func (UnavailableAnalyzer) CompareFaces(context.Context, FaceComparisonRequest) (FaceComparisonResult, error) {
	return FaceComparisonResult{}, ErrAnalyzerNotConfigured
}

func (UnavailableAnalyzer) CheckLiveness(context.Context, LivenessRequest) (LivenessResult, error) {
	return LivenessResult{}, ErrAnalyzerNotConfigured
}
