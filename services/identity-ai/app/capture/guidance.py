"""Deterministic live-capture guidance from face-pose observations."""

from dataclasses import dataclass
from math import isfinite

from app.contracts.liveness import (
    CaptureGuidanceEvidence,
    CaptureInstruction,
    PoseObservation,
)


@dataclass(frozen=True)
class CaptureGuidanceThresholds:
    minimum_face_width_ratio: float = 0.2
    maximum_face_width_ratio: float = 0.75
    maximum_absolute_yaw: float = 12.0
    maximum_absolute_pitch: float = 10.0
    maximum_absolute_roll: float = 10.0

    def __post_init__(self) -> None:
        values = (
            self.minimum_face_width_ratio,
            self.maximum_face_width_ratio,
            self.maximum_absolute_yaw,
            self.maximum_absolute_pitch,
            self.maximum_absolute_roll,
        )
        if not all(isfinite(value) for value in values):
            raise ValueError("capture guidance thresholds must be finite")
        if not 0 < self.minimum_face_width_ratio < self.maximum_face_width_ratio <= 1:
            raise ValueError("face width thresholds must be ordered within 0..1")
        if (
            min(
                self.maximum_absolute_yaw,
                self.maximum_absolute_pitch,
                self.maximum_absolute_roll,
            )
            <= 0
        ):
            raise ValueError("pose thresholds must be positive")


DEFAULT_CAPTURE_GUIDANCE_THRESHOLDS = CaptureGuidanceThresholds()


def assess_capture_guidance(
    observation: PoseObservation,
    thresholds: CaptureGuidanceThresholds = DEFAULT_CAPTURE_GUIDANCE_THRESHOLDS,
) -> CaptureGuidanceEvidence:
    instructions: list[CaptureInstruction] = []
    if observation.face_count == 0:
        instructions.append(CaptureInstruction.NO_FACE)
    elif observation.face_count > 1:
        instructions.append(CaptureInstruction.MULTIPLE_FACES)
    else:
        if observation.face_width_ratio < thresholds.minimum_face_width_ratio:
            instructions.append(CaptureInstruction.MOVE_CLOSER)
        elif observation.face_width_ratio > thresholds.maximum_face_width_ratio:
            instructions.append(CaptureInstruction.MOVE_BACK)
        if (
            abs(observation.yaw_degrees) > thresholds.maximum_absolute_yaw
            or abs(observation.pitch_degrees) > thresholds.maximum_absolute_pitch
        ):
            instructions.append(CaptureInstruction.LOOK_FORWARD)
        if abs(observation.roll_degrees) > thresholds.maximum_absolute_roll:
            instructions.append(CaptureInstruction.HOLD_STILL)

    return CaptureGuidanceEvidence(
        suitable_for_capture=not instructions,
        instructions=tuple(instructions),
        landmark_model_version=observation.landmark_model_version,
    )
