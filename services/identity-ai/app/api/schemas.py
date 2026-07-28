"""HTTP request contracts for identity analysis operations."""

from pydantic import BaseModel, Field


class FaceComparisonRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    reference_face_key: str = Field(min_length=1)
    probe_face_key: str = Field(min_length=1)


class LivenessRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    session_id: str = Field(min_length=1)
    video_object_key: str = Field(min_length=1)
