from datetime import UTC, datetime

import pytest

from app.contracts.liveness import CaptureInstruction, PoseObservation
from app.face.guidance import assess_capture_guidance


def observation(**overrides) -> PoseObservation:
    values = {
        "captured_at": datetime(2026, 7, 28, tzinfo=UTC),
        "face_count": 1,
        "yaw_degrees": 0.0,
        "pitch_degrees": 0.0,
        "roll_degrees": 0.0,
        "face_width_ratio": 0.4,
        "landmark_model_version": "mediapipe-test-v1",
    }
    values.update(overrides)
    return PoseObservation(**values)


def test_centered_single_face_is_suitable_for_capture():
    evidence = assess_capture_guidance(observation())

    assert evidence.suitable_for_capture is True
    assert evidence.instructions == ()
    assert evidence.landmark_model_version == "mediapipe-test-v1"


@pytest.mark.parametrize(
    ("overrides", "expected_instruction"),
    [
        ({"face_count": 0, "face_width_ratio": 0.0}, CaptureInstruction.NO_FACE),
        ({"face_count": 2}, CaptureInstruction.MULTIPLE_FACES),
        ({"face_width_ratio": 0.1}, CaptureInstruction.MOVE_CLOSER),
        ({"face_width_ratio": 0.9}, CaptureInstruction.MOVE_BACK),
        ({"yaw_degrees": 20.0}, CaptureInstruction.LOOK_FORWARD),
        ({"roll_degrees": 20.0}, CaptureInstruction.HOLD_STILL),
    ],
)
def test_guidance_returns_specific_recapture_instruction(overrides, expected_instruction):
    evidence = assess_capture_guidance(observation(**overrides))

    assert evidence.suitable_for_capture is False
    assert expected_instruction in evidence.instructions


def test_pose_observation_requires_timezone_aware_timestamp():
    with pytest.raises(ValueError, match="timezone-aware"):
        observation(captured_at=datetime(2026, 7, 28))
