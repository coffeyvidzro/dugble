"""Pose classification used by ordered active challenges."""

from dataclasses import dataclass
from math import isfinite

from app.contracts.liveness import ChallengeAction, PoseObservation


@dataclass(frozen=True)
class PoseThresholds:
    turn_yaw_degrees: float = 20.0
    forward_yaw_degrees: float = 10.0
    forward_pitch_degrees: float = 10.0

    def __post_init__(self) -> None:
        values = (
            self.turn_yaw_degrees,
            self.forward_yaw_degrees,
            self.forward_pitch_degrees,
        )
        if not all(isfinite(value) for value in values):
            raise ValueError("pose thresholds must be finite")
        if min(values) <= 0:
            raise ValueError("pose thresholds must be positive")
        if self.forward_yaw_degrees >= self.turn_yaw_degrees:
            raise ValueError("forward yaw must be smaller than turn yaw")


DEFAULT_POSE_THRESHOLDS = PoseThresholds()


def action_observed(
    action: ChallengeAction,
    observation: PoseObservation,
    thresholds: PoseThresholds,
) -> bool:
    if observation.face_count != 1:
        return False
    if action is ChallengeAction.TURN_LEFT:
        return observation.yaw_degrees <= -thresholds.turn_yaw_degrees
    if action is ChallengeAction.TURN_RIGHT:
        return observation.yaw_degrees >= thresholds.turn_yaw_degrees
    return (
        abs(observation.yaw_degrees) <= thresholds.forward_yaw_degrees
        and abs(observation.pitch_degrees) <= thresholds.forward_pitch_degrees
    )
