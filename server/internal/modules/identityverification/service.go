package identityverification

import "context"

type Service struct {
	analyzer Analyzer
}

func NewService(analyzer Analyzer) *Service {
	if analyzer == nil {
		analyzer = UnavailableAnalyzer{}
	}
	return &Service{analyzer: analyzer}
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
