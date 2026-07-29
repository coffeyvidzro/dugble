"""Application boundary used by the private HTTP analysis routes."""

from collections.abc import Sequence
from typing import Protocol

from app.contracts.face import FaceComparisonEvidence
from app.contracts.liveness import LivenessSessionEvidence
from app.face.landmarks import CapturedFrame
from app.imaging import ImageSource
from app.inference.foundation import RuntimeManager
from app.liveness.analysis import LivenessSubmissionService
from app.liveness.sessions import LivenessSessionService

from .schemas import FaceComparisonRequest, LivenessRequest


class IdentityAnalysisOperations(Protocol):
    """Resolve private media references and execute identity analysis workflows."""

    def compare_faces(self, request: FaceComparisonRequest) -> FaceComparisonEvidence: ...

    def check_liveness(self, request: LivenessRequest) -> LivenessSessionEvidence: ...


class BiometricMediaStore(Protocol):
    """Retrieve approved private media without exposing storage details to HTTP routes."""

    def image(self, object_key: str) -> ImageSource: ...

    def capture_frames(self, object_key: str) -> Sequence[CapturedFrame]: ...


class RuntimeIdentityAnalysisOperations:
    """Execute HTTP requests using verified runtime models and server-owned sessions."""

    def __init__(
        self,
        runtime_manager: RuntimeManager,
        media_store: BiometricMediaStore,
        liveness_sessions: LivenessSessionService,
        *,
        attack_threshold: float,
    ) -> None:
        if not 0 < attack_threshold < 1:
            raise ValueError("presentation-attack threshold must be within 0..1")
        self._runtime_manager = runtime_manager
        self._media_store = media_store
        self._liveness_sessions = liveness_sessions
        self._attack_threshold = attack_threshold

    def _bundle(self):
        if not self._runtime_manager.ready or self._runtime_manager.bundle is None:
            raise RuntimeError("identity model runtime is unavailable")
        return self._runtime_manager.bundle

    def compare_faces(self, request: FaceComparisonRequest) -> FaceComparisonEvidence:
        service = self._bundle().face_comparison_service()
        reference = self._media_store.image(request.reference_face_key)
        probe = self._media_store.image(request.probe_face_key)
        return service.compare(reference, probe)

    def check_liveness(self, request: LivenessRequest) -> LivenessSessionEvidence:
        analyzer = self._bundle().liveness_analysis_service(
            attack_threshold=self._attack_threshold
        )
        submission = LivenessSubmissionService(self._liveness_sessions, analyzer)
        frames = self._media_store.capture_frames(request.video_object_key)
        return submission.submit(request.session_id, request.verification_id, frames)
