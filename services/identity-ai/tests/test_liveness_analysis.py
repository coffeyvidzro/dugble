from datetime import UTC, datetime, timedelta

import pytest
from PIL import Image

from app.contracts.liveness import ActiveChallenge, ChallengeAction, PoseObservation
from app.contracts.presentation_attack import (
    PresentationAttackEvidence,
    PresentationAttackSignal,
    PresentationAttackType,
)
from app.face.landmarks import CapturedFrame
from app.liveness.analysis import LivenessAnalysisService, LivenessSubmissionService
from app.liveness.sessions import (
    InMemoryLivenessSessionStore,
    LivenessSessionConsumedError,
    LivenessSessionService,
)


class Tracker:
    model_version = "landmarks-v1"

    def __init__(self, observations) -> None:
        self.observations = observations

    def observe(self, frames):
        return self.observations


class AttackDetector:
    model_version = "pad-v1"

    def __init__(self, scores) -> None:
        self.scores = scores
        self.frame_count = 0

    def analyze(self, frames):
        self.frame_count = len(frames)
        return PresentationAttackEvidence(
            signals=tuple(
                PresentationAttackSignal(attack_type=attack_type, score=score)
                for attack_type, score in self.scores
            ),
            model_version=self.model_version,
        )


def test_liveness_analysis_combines_ordered_challenge_and_attack_evidence():
    started_at = datetime(2026, 1, 1, tzinfo=UTC)
    challenge = ActiveChallenge(
        challenge_id="challenge-1",
        verification_id="verification-1",
        actions=(ChallengeAction.TURN_LEFT,),
        issued_at=started_at,
        expires_at=started_at + timedelta(seconds=30),
    )
    observations = tuple(
        PoseObservation(
            captured_at=started_at + timedelta(milliseconds=index * 100),
            face_count=1,
            yaw_degrees=-25,
            pitch_degrees=0,
            roll_degrees=0,
            face_width_ratio=0.4,
            landmark_model_version="landmarks-v1",
        )
        for index in (1, 2)
    )
    detector = AttackDetector(
        (
            (PresentationAttackType.PRINT, 0.2),
            (PresentationAttackType.SCREEN_REPLAY, 0.8),
        )
    )
    frames = tuple(
        CapturedFrame(Image.new("RGB", (20, 20)), observation.captured_at)
        for observation in observations
    )

    evidence = LivenessAnalysisService(
        Tracker(observations), detector, attack_threshold=0.5
    ).analyze(challenge, frames)

    assert evidence.challenge.challenge_completed is True
    assert evidence.attack_suspected is True
    assert evidence.reasons == ("presentation_attack_suspected:screen_replay",)
    assert detector.frame_count == 2


def test_liveness_analysis_preserves_challenge_failure_reasons_without_attack():
    started_at = datetime(2026, 1, 1, tzinfo=UTC)
    challenge = ActiveChallenge(
        challenge_id="challenge-1",
        verification_id="verification-1",
        actions=(ChallengeAction.TURN_RIGHT,),
        issued_at=started_at,
        expires_at=started_at + timedelta(seconds=30),
    )
    observation = PoseObservation(
        captured_at=started_at + timedelta(seconds=1),
        face_count=1,
        yaw_degrees=0,
        pitch_degrees=0,
        roll_degrees=0,
        face_width_ratio=0.4,
        landmark_model_version="landmarks-v1",
    )
    frames = (CapturedFrame(Image.new("RGB", (20, 20)), observation.captured_at),)
    detector = AttackDetector(((PresentationAttackType.PRINT, 0.1),))

    evidence = LivenessAnalysisService(
        Tracker((observation,)), detector, attack_threshold=0.5
    ).analyze(challenge, frames)

    assert evidence.attack_suspected is False
    assert evidence.reasons == ("action_not_observed:turn_right",)


def test_submission_consumes_server_session_before_analysis():
    now = datetime(2026, 1, 1, tzinfo=UTC)
    sessions = LivenessSessionService(InMemoryLivenessSessionStore())
    challenge = sessions.create(
        "verification-1",
        now=now,
        actions=(ChallengeAction.LOOK_FORWARD,),
        action_count=1,
    )
    observations = tuple(
        PoseObservation(
            captured_at=now + timedelta(milliseconds=index * 100),
            face_count=1,
            yaw_degrees=0,
            pitch_degrees=0,
            roll_degrees=0,
            face_width_ratio=0.4,
            landmark_model_version="landmarks-v1",
        )
        for index in (1, 2)
    )
    frames = tuple(
        CapturedFrame(Image.new("RGB", (20, 20)), observation.captured_at)
        for observation in observations
    )
    analyzer = LivenessAnalysisService(
        Tracker(observations),
        AttackDetector(((PresentationAttackType.PRINT, 0.1),)),
        attack_threshold=0.5,
    )
    submissions = LivenessSubmissionService(sessions, analyzer)

    evidence = submissions.submit(
        challenge.challenge_id,
        "verification-1",
        frames,
        now=now + timedelta(seconds=1),
    )

    assert evidence.challenge.challenge_completed is True
    with pytest.raises(LivenessSessionConsumedError):
        submissions.submit(
            challenge.challenge_id,
            "verification-1",
            frames,
            now=now + timedelta(seconds=2),
        )
