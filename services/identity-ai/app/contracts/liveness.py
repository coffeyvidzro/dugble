"""Contracts for capture guidance and active-challenge evidence."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from math import isclose, isfinite


class ChallengeAction(StrEnum):
    TURN_LEFT = "turn_left"
    TURN_RIGHT = "turn_right"
    LOOK_FORWARD = "look_forward"


class CaptureInstruction(StrEnum):
    NO_FACE = "no_face"
    MULTIPLE_FACES = "multiple_faces"
    MOVE_CLOSER = "move_closer"
    MOVE_BACK = "move_back"
    LOOK_FORWARD = "look_forward"
    HOLD_STILL = "hold_still"


@dataclass(frozen=True)
class PoseObservation:
    captured_at: datetime
    face_count: int
    yaw_degrees: float
    pitch_degrees: float
    roll_degrees: float
    face_width_ratio: float
    landmark_model_version: str

    def __post_init__(self) -> None:
        if self.captured_at.tzinfo is None or self.captured_at.utcoffset() is None:
            raise ValueError("pose observation timestamp must be timezone-aware")
        if self.face_count < 0:
            raise ValueError("face count must not be negative")
        angles = (self.yaw_degrees, self.pitch_degrees, self.roll_degrees)
        if not all(isfinite(angle) for angle in angles):
            raise ValueError("pose angles must be finite")
        if not isfinite(self.face_width_ratio) or not 0 <= self.face_width_ratio <= 1:
            raise ValueError("face width ratio must be within 0..1")
        if not self.landmark_model_version.strip():
            raise ValueError("landmark model version must not be empty")


@dataclass(frozen=True)
class CaptureGuidanceEvidence:
    suitable_for_capture: bool
    instructions: tuple[CaptureInstruction, ...]
    landmark_model_version: str

    def __post_init__(self) -> None:
        if self.suitable_for_capture != (not self.instructions):
            raise ValueError("capture suitability must agree with its instructions")
        if not self.landmark_model_version.strip():
            raise ValueError("landmark model version must not be empty")


@dataclass(frozen=True)
class ActiveChallenge:
    challenge_id: str
    verification_id: str
    actions: tuple[ChallengeAction, ...]
    issued_at: datetime
    expires_at: datetime

    def __post_init__(self) -> None:
        if not self.challenge_id.strip():
            raise ValueError("challenge ID must not be empty")
        if not self.verification_id.strip():
            raise ValueError("verification ID must not be empty")
        if not self.actions:
            raise ValueError("challenge must contain at least one action")
        if len(set(self.actions)) != len(self.actions):
            raise ValueError("challenge actions must not repeat")
        if self.issued_at.tzinfo is None or self.issued_at.utcoffset() is None:
            raise ValueError("challenge issue timestamp must be timezone-aware")
        if self.expires_at.tzinfo is None or self.expires_at.utcoffset() is None:
            raise ValueError("challenge expiry timestamp must be timezone-aware")
        if self.expires_at <= self.issued_at:
            raise ValueError("challenge expiry must follow its issue time")


@dataclass(frozen=True)
class ChallengeStepEvidence:
    action: ChallengeAction
    observed: bool
    matching_observations: int

    def __post_init__(self) -> None:
        if self.matching_observations < 0:
            raise ValueError("matching observation count must not be negative")
        if self.observed and self.matching_observations == 0:
            raise ValueError("an observed challenge step requires matching observations")


@dataclass(frozen=True)
class ActiveChallengeEvidence:
    challenge_id: str
    verification_id: str
    challenge_completed: bool
    completion_ratio: float
    steps: tuple[ChallengeStepEvidence, ...]
    reasons: tuple[str, ...]
    landmark_model_version: str | None

    def __post_init__(self) -> None:
        if not self.challenge_id.strip() or not self.verification_id.strip():
            raise ValueError("challenge and verification IDs must not be empty")
        if not self.steps:
            raise ValueError("challenge evidence must contain steps")
        if not isfinite(self.completion_ratio) or not 0 <= self.completion_ratio <= 1:
            raise ValueError("challenge completion ratio must be within 0..1")
        observed_steps = sum(step.observed for step in self.steps)
        if not isclose(self.completion_ratio, observed_steps / len(self.steps)):
            raise ValueError("challenge completion ratio must agree with step evidence")
        if self.challenge_completed != (observed_steps == len(self.steps)):
            raise ValueError("challenge completion must agree with step evidence")
