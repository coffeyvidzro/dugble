"""HTTP request contracts for identity analysis operations."""

from pydantic import BaseModel, Field


class DocumentAnalysisRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    object_key: str = Field(min_length=1)
    document_type: str = Field(min_length=1)
    country_code: str = Field(min_length=2, max_length=2)


class FaceComparisonRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    document_face_key: str = Field(min_length=1)
    selfie_key: str = Field(min_length=1)


class LivenessRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    video_object_key: str = Field(min_length=1)
    challenge: list[str] = Field(min_length=1)
