import pytest
from PIL import Image

from app.contracts.face import FaceDetection, FaceEmbedding
from app.inference.registry import FaceModelRegistry


class EmptyDetector:
    model_version = "yunet-test-v1"

    def detect(self, _: Image.Image) -> tuple[FaceDetection, ...]:
        return ()


class EmptyEmbedder:
    model_version = "sface-test-v1"

    def embed(self, _: Image.Image, __: FaceDetection) -> FaceEmbedding:
        raise AssertionError("an empty detector must not invoke the embedder")


def test_registry_is_not_ready_before_models_are_registered():
    registry = FaceModelRegistry()

    assert registry.ready is False
    with pytest.raises(RuntimeError, match="not registered"):
        registry.comparison_service()


def test_registry_constructs_service_after_one_time_registration():
    registry = FaceModelRegistry()
    detector = EmptyDetector()
    embedder = EmptyEmbedder()

    registry.register(detector, embedder)

    assert registry.ready is True
    assert registry.comparison_service() is not registry.comparison_service()
    with pytest.raises(RuntimeError, match="already registered"):
        registry.register(detector, embedder)
