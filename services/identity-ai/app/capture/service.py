"""Orchestration for landmark-backed capture guidance."""

from collections.abc import Iterable

from app.contracts.liveness import CaptureGuidanceEvidence, PoseObservation
from app.face.landmarks import CapturedFrame, FaceLandmarkTracker

from .guidance import (
    DEFAULT_CAPTURE_GUIDANCE_THRESHOLDS,
    CaptureGuidanceThresholds,
    assess_capture_guidance,
)


class CaptureGuidanceService:
    def __init__(
        self,
        tracker: FaceLandmarkTracker,
        thresholds: CaptureGuidanceThresholds = DEFAULT_CAPTURE_GUIDANCE_THRESHOLDS,
    ) -> None:
        self._tracker = tracker
        self._thresholds = thresholds

    def observe(self, frames: Iterable[CapturedFrame]) -> tuple[PoseObservation, ...]:
        observations = self._tracker.observe(frames)
        if any(
            observation.landmark_model_version != self._tracker.model_version
            for observation in observations
        ):
            raise ValueError("tracker returned an unexpected model version")
        return observations

    def guide(self, frames: Iterable[CapturedFrame]) -> tuple[CaptureGuidanceEvidence, ...]:
        return tuple(
            assess_capture_guidance(observation, self._thresholds)
            for observation in self.observe(frames)
        )
