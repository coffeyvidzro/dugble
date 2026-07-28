from dataclasses import dataclass

import pytest
from PIL import Image

from app.contracts.face import BoundingBox, FaceDetection, FaceEmbedding
from app.face.exceptions import FaceCountError, IncompatibleEmbeddingError
from app.face.service import FaceComparisonService
from app.face.similarity import cosine_similarity


def detection() -> FaceDetection:
    return FaceDetection(BoundingBox(0, 0, 10, 10), confidence=0.99, landmarks=())


@dataclass
class FakeDetector:
    detections: tuple[FaceDetection, ...]
    model_version: str = "yunet-test-v1"

    def detect(self, _: Image.Image) -> tuple[FaceDetection, ...]:
        return self.detections


class PixelEmbedder:
    model_version = "sface-test-v1"

    def embed(self, image: Image.Image, _: FaceDetection) -> FaceEmbedding:
        red, green, blue = image.getpixel((0, 0))
        return FaceEmbedding(
            values=(float(red), float(green), float(blue)),
            model_version=self.model_version,
        )


def test_cosine_similarity_compares_embeddings_without_a_policy_threshold():
    first = FaceEmbedding((1.0, 0.0), "sface-v1")
    second = FaceEmbedding((0.0, 1.0), "sface-v1")

    assert cosine_similarity(first, first) == pytest.approx(1.0)
    assert cosine_similarity(first, second) == pytest.approx(0.0)


def test_cosine_similarity_rejects_incompatible_model_versions():
    with pytest.raises(IncompatibleEmbeddingError, match="different model versions"):
        cosine_similarity(FaceEmbedding((1.0,), "v1"), FaceEmbedding((1.0,), "v2"))


def test_service_returns_versioned_comparison_evidence():
    service = FaceComparisonService(FakeDetector((detection(),)), PixelEmbedder())
    image = Image.new("RGB", (20, 20), (20, 40, 60))

    evidence = service.compare(image, image.copy())

    assert evidence.similarity == pytest.approx(1.0)
    assert evidence.detector_version == "yunet-test-v1"
    assert evidence.embedding_model_version == "sface-test-v1"


@pytest.mark.parametrize("detections", [(), (detection(), detection())])
def test_service_requires_exactly_one_face_per_input(detections):
    service = FaceComparisonService(FakeDetector(detections), PixelEmbedder())

    with pytest.raises(FaceCountError) as error:
        service.compare(Image.new("RGB", (20, 20)), Image.new("RGB", (20, 20)))

    assert error.value.input_name == "reference image"
    assert error.value.actual_count == len(detections)
