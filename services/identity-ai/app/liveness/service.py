"""Ordered evaluation of pose observations against an issued challenge."""

from app.contracts.liveness import (
    ActiveChallenge,
    ActiveChallengeEvidence,
    ChallengeStepEvidence,
    PoseObservation,
)

from .observations import DEFAULT_POSE_THRESHOLDS, PoseThresholds, action_observed


class ActiveChallengeService:
    def __init__(
        self,
        thresholds: PoseThresholds = DEFAULT_POSE_THRESHOLDS,
        minimum_matching_observations: int = 2,
    ) -> None:
        if minimum_matching_observations <= 0:
            raise ValueError("minimum matching observations must be positive")
        self._thresholds = thresholds
        self._minimum_matching_observations = minimum_matching_observations

    def evaluate(
        self,
        challenge: ActiveChallenge,
        observations: tuple[PoseObservation, ...],
    ) -> ActiveChallengeEvidence:
        ordered = tuple(sorted(observations, key=lambda item: item.captured_at))
        in_window = tuple(
            observation
            for observation in ordered
            if challenge.issued_at <= observation.captured_at <= challenge.expires_at
        )
        versions = {item.landmark_model_version for item in in_window}
        reasons: list[str] = []
        if not in_window:
            reasons.append("no_observations_within_challenge_window")
        if len(versions) > 1:
            reasons.append("landmark_model_version_changed")

        cursor = 0
        step_evidence: list[ChallengeStepEvidence] = []
        evaluation_allowed = bool(in_window) and len(versions) == 1
        for action in challenge.actions:
            matching_count = 0
            observed = False
            if evaluation_allowed:
                while cursor < len(in_window):
                    observation = in_window[cursor]
                    cursor += 1
                    if action_observed(action, observation, self._thresholds):
                        matching_count += 1
                        if matching_count >= self._minimum_matching_observations:
                            observed = True
                            break
                    else:
                        matching_count = 0
            step_evidence.append(
                ChallengeStepEvidence(
                    action=action,
                    observed=observed,
                    matching_observations=matching_count,
                )
            )
            if not observed:
                reasons.append(f"action_not_observed:{action.value}")

        observed_steps = sum(step.observed for step in step_evidence)
        completion_ratio = observed_steps / len(step_evidence)
        return ActiveChallengeEvidence(
            challenge_id=challenge.challenge_id,
            verification_id=challenge.verification_id,
            challenge_completed=observed_steps == len(step_evidence),
            completion_ratio=completion_ratio,
            steps=tuple(step_evidence),
            reasons=tuple(reasons),
            landmark_model_version=next(iter(versions)) if len(versions) == 1 else None,
        )
