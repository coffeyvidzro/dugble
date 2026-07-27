package identity

import (
	"context"
	"errors"
)

var ErrAnalyzerNotConfigured = errors.New("identity analyzer is not configured")

// Analyzer defines the boundary between Dugble and the private identity AI service.
type Analyzer interface {
	AnalyzeDocument(context.Context, DocumentAnalysisRequest) (DocumentAnalysisResult, error)
	CompareFaces(context.Context, FaceComparisonRequest) (FaceComparisonResult, error)
	CheckLiveness(context.Context, LivenessRequest) (LivenessResult, error)
}

type unavailableAnalyzer struct{}

func (unavailableAnalyzer) AnalyzeDocument(context.Context, DocumentAnalysisRequest) (DocumentAnalysisResult, error) {
	return DocumentAnalysisResult{}, ErrAnalyzerNotConfigured
}

func (unavailableAnalyzer) CompareFaces(context.Context, FaceComparisonRequest) (FaceComparisonResult, error) {
	return FaceComparisonResult{}, ErrAnalyzerNotConfigured
}

func (unavailableAnalyzer) CheckLiveness(context.Context, LivenessRequest) (LivenessResult, error) {
	return LivenessResult{}, ErrAnalyzerNotConfigured
}

type Service struct {
	repository Repository
	analyzer   Analyzer
}

func NewService(repository Repository, analyzer Analyzer) *Service {
	if analyzer == nil {
		analyzer = unavailableAnalyzer{}
	}
	return &Service{repository: repository, analyzer: analyzer}
}

func (s *Service) AnalyzeDocument(ctx context.Context, req DocumentAnalysisRequest) (DocumentAnalysisResult, error) {
	return s.analyzer.AnalyzeDocument(ctx, req)
}

func (s *Service) CompareFaces(ctx context.Context, req FaceComparisonRequest) (FaceComparisonResult, error) {
	return s.analyzer.CompareFaces(ctx, req)
}

func (s *Service) CheckLiveness(ctx context.Context, req LivenessRequest) (LivenessResult, error) {
	return s.analyzer.CheckLiveness(ctx, req)
}
