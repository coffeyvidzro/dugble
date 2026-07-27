package identityverification

import "time"

const (
	StatusPending      = "pending"
	StatusProcessing   = "processing"
	StatusApproved     = "approved"
	StatusManualReview = "manual_review"
	StatusRejected     = "rejected"
)

type Verification struct {
	ID        string    `json:"id"`
	TeamID    string    `json:"team_id"`
	SubjectID string    `json:"subject_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateRequest struct {
	SubjectID string `json:"subject_id"`
}

type DocumentAnalysisRequest struct {
	VerificationID string `json:"verification_id"`
	ObjectKey      string `json:"object_key"`
	DocumentType   string `json:"document_type"`
	CountryCode    string `json:"country_code"`
}

type DocumentAnalysisResult struct {
	DocumentValid bool               `json:"document_valid"`
	QualityScore  float64            `json:"quality_score"`
	FraudScore    float64            `json:"fraud_score"`
	ExtractedData map[string]string  `json:"extracted_data,omitempty"`
	Reasons       []string           `json:"reasons,omitempty"`
}

type FaceComparisonRequest struct {
	VerificationID string `json:"verification_id"`
	DocumentFaceKey string `json:"document_face_key"`
	SelfieKey       string `json:"selfie_key"`
}

type FaceComparisonResult struct {
	FaceDetected bool    `json:"face_detected"`
	Similarity   float64 `json:"similarity"`
}

type LivenessRequest struct {
	VerificationID string   `json:"verification_id"`
	VideoObjectKey string   `json:"video_object_key"`
	Challenge      []string `json:"challenge"`
}

type LivenessResult struct {
	Passed bool    `json:"passed"`
	Score  float64 `json:"score"`
}
