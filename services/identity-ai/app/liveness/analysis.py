"""Composite active-challenge and presentation-attack analysis."""

from collections.abc import Sequence
from datetime import datetime

from app.contracts.liveness import ActiveChallenge, LivenessSessionEvidence
from app.face.landmarks import CapturedFrame, FaceLandmarkTracker

from .presentation_attack import PresentationAttackDetector
from .service import ActiveChallengeService
from .sessions import LivenessSessionService


class LivenessAnalysisService:
    def __init__(
        self,
        tracker: FaceLandmarkTracker,
        attack_detector: PresentationAttackDetector,
        *,
        attack_threshold: float,
        challenge_service: ActiveChallengeService | None = None,
    ) -> None:
        if not 0 < attack_threshold < 1:
            raise ValueError("presentation-attack threshold must be within 0..1")
        self._tracker = tracker
        self._attack_detector = attack_detector
        self._challenge_service = challenge_service or ActiveChallengeService()
        self._attack_threshold = attack_threshold

    def analyze(
        self,
        challenge: ActiveChallenge,
        frames: Sequence[CapturedFrame],
    ) -> LivenessSessionEvidence:
        if not frames:
            raise ValueError("liveness analysis requires capture frames")
        observations = self._tracker.observe(frames)
        if len(observations) != len(frames):
            raise ValueError("landmark tracker must return one observation per frame")
        if any(
            observation.landmark_model_version != self._tracker.model_version
            for observation in observations
        ):
            raise ValueError("tracker returned an unexpected model version")
        challenge_evidence = self._challenge_service.evaluate(challenge, observations)
        attack_evidence = self._attack_detector.analyze([frame.image for frame in frames])
        if attack_evidence.model_version != self._attack_detector.model_version:
            raise ValueError("attack detector returned an unexpected model version")
        suspected_signals = tuple(
            signal for signal in attack_evidence.signals if signal.score >= self._attack_threshold
        )
        reasons = list(challenge_evidence.reasons)
        reasons.extend(
            f"presentation_attack_suspected:{signal.attack_type.value}"
            for signal in suspected_signals
        )
        return LivenessSessionEvidence(
            challenge=challenge_evidence,
            presentation_attack=attack_evidence,
            attack_threshold=self._attack_threshold,
            attack_suspected=bool(suspected_signals),
            reasons=tuple(reasons),
        )


class LivenessSubmissionService:
    """Consumes a server-owned session before running its one-shot analysis."""

    def __init__(
        self,
        sessions: LivenessSessionService,
        analyzer: LivenessAnalysisService,
    ) -> None:
        self._sessions = sessions
        self._analyzer = analyzer

    def submit(
        self,
        challenge_id: str,
        verification_id: str,
        frames: Sequence[CapturedFrame],
        *,
        now: datetime | None = None,
    ) -> LivenessSessionEvidence:
        challenge = self._sessions.consume(
            challenge_id,
            verification_id,
            now=now,
        )
        return self._analyzer.analyze(challenge, frames)
