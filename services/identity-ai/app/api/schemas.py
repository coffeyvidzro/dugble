"""HTTP contracts for identity analysis operations."""

from pydantic import BaseModel, ConfigDict, Field

from app.contracts.liveness import ChallengeAction
from app.contracts.presentation_attack import PresentationAttackType


class FaceComparisonRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    reference_face_key: str = Field(min_length=1)
    probe_face_key: str = Field(min_length=1)


class LivenessRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    session_id: str = Field(min_length=1)
    video_object_key: str = Field(min_length=1)


class FaceComparisonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    similarity: float
    detector_version: str
    embedding_model_version: str


class ChallengeStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action: ChallengeAction
    observed: bool
    matching_observations: int


class ActiveChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    challenge_id: str
    verification_id: str
    challenge_completed: bool
    completion_ratio: float
    steps: tuple[ChallengeStepResponse, ...]
    reasons: tuple[str, ...]
    landmark_model_version: str | None


class PresentationAttackSignalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attack_type: PresentationAttackType
    score: float


class PresentationAttackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    signals: tuple[PresentationAttackSignalResponse, ...]
    model_version: str


class LivenessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    challenge: ActiveChallengeResponse
    presentation_attack: PresentationAttackResponse
    attack_threshold: float
    attack_suspected: bool
    reasons: tuple[str, ...]
