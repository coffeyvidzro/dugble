from datetime import UTC, datetime, timedelta

from app.contracts.liveness import ActiveChallenge, ChallengeAction, PoseObservation
from app.liveness.service import ActiveChallengeService

ISSUED_AT = datetime(2026, 7, 28, 12, tzinfo=UTC)


def challenge() -> ActiveChallenge:
    return ActiveChallenge(
        challenge_id="challenge-1",
        verification_id="verification-1",
        actions=(ChallengeAction.TURN_LEFT, ChallengeAction.TURN_RIGHT),
        issued_at=ISSUED_AT,
        expires_at=ISSUED_AT + timedelta(seconds=30),
    )


def observation(offset_seconds: int, yaw: float, *, version: str = "mediapipe-test-v1"):
    return PoseObservation(
        captured_at=ISSUED_AT + timedelta(seconds=offset_seconds),
        face_count=1,
        yaw_degrees=yaw,
        pitch_degrees=0,
        roll_degrees=0,
        face_width_ratio=0.4,
        landmark_model_version=version,
    )


def test_service_requires_ordered_sustained_action_observations():
    service = ActiveChallengeService(minimum_matching_observations=2)
    observations = (
        observation(4, 30),
        observation(2, -30),
        observation(1, -25),
        observation(3, 25),
    )

    evidence = service.evaluate(challenge(), observations)

    assert evidence.challenge_completed is True
    assert evidence.verification_id == "verification-1"
    assert evidence.completion_ratio == 1
    assert all(step.matching_observations == 2 for step in evidence.steps)
    assert evidence.reasons == ()


def test_service_does_not_treat_wrong_action_order_as_completion():
    service = ActiveChallengeService(minimum_matching_observations=2)
    observations = (
        observation(1, 25),
        observation(2, 30),
        observation(3, -25),
        observation(4, -30),
    )

    evidence = service.evaluate(challenge(), observations)

    assert evidence.challenge_completed is False
    assert "action_not_observed:turn_right" in evidence.reasons


def test_service_excludes_expired_observations():
    service = ActiveChallengeService(minimum_matching_observations=1)

    evidence = service.evaluate(challenge(), (observation(31, -30),))

    assert evidence.challenge_completed is False
    assert "no_observations_within_challenge_window" in evidence.reasons


def test_service_rejects_model_version_changes_within_one_challenge():
    service = ActiveChallengeService(minimum_matching_observations=1)
    observations = (
        observation(1, -30, version="model-v1"),
        observation(2, 30, version="model-v2"),
    )

    evidence = service.evaluate(challenge(), observations)

    assert evidence.challenge_completed is False
    assert "landmark_model_version_changed" in evidence.reasons
    assert evidence.landmark_model_version is None
