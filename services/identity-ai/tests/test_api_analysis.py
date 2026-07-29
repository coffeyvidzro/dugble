from types import SimpleNamespace

from PIL import Image

from app.api.analysis import RuntimeIdentityAnalysisOperations
from app.api.schemas import FaceComparisonRequest, LivenessRequest
from app.contracts.face import FaceComparisonEvidence


class FakeMediaStore:
    def __init__(self) -> None:
        self.images = {
            "reference": Image.new("RGB", (8, 8)),
            "probe": Image.new("RGB", (8, 8)),
        }
        self.frames = (object(),)

    def image(self, object_key):
        return self.images[object_key]

    def capture_frames(self, object_key):
        assert object_key == "capture"
        return self.frames


class FakeFaceService:
    def compare(self, reference, probe):
        assert reference is not probe
        return FaceComparisonEvidence(0.8, "detector-v1", "embedder-v1")


class FakeAnalyzer:
    def analyze(self, challenge, frames):
        assert challenge == "issued-challenge"
        assert len(frames) == 1
        return "liveness-evidence"


class FakeBundle:
    def face_comparison_service(self):
        return FakeFaceService()

    def liveness_analysis_service(self, *, attack_threshold):
        assert attack_threshold == 0.6
        return FakeAnalyzer()


class FakeSessions:
    def consume(self, challenge_id, verification_id, *, now=None):
        assert (challenge_id, verification_id, now) == ("challenge-1", "verification-1", None)
        return "issued-challenge"


def test_runtime_operations_execute_model_backed_analysis_workflows():
    manager = SimpleNamespace(ready=True, bundle=FakeBundle())
    operations = RuntimeIdentityAnalysisOperations(
        manager, FakeMediaStore(), FakeSessions(), attack_threshold=0.6
    )

    face = operations.compare_faces(
        FaceComparisonRequest(
            verification_id="verification-1",
            reference_face_key="reference",
            probe_face_key="probe",
        )
    )
    liveness = operations.check_liveness(
        LivenessRequest(
            verification_id="verification-1",
            session_id="challenge-1",
            video_object_key="capture",
        )
    )

    assert face.similarity == 0.8
    assert liveness == "liveness-evidence"
