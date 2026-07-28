import numpy as np
import pytest
from PIL import Image

from app.contracts.face import BoundingBox, FaceDetection, Point
from app.contracts.presentation_attack import PresentationAttackType
from app.face.exceptions import FaceCountError
from app.liveness.minifas import MiniFASPresentationAttackDetector


class Session:
    logical_name = "presentation-attack"
    model_version = "minifas-test"
    input_names = ("input",)
    output_names = ("output",)

    def __init__(self, logits) -> None:
        self.logits = np.asarray(logits, dtype=np.float32)
        self.batch = None

    def run(self, inputs):
        self.batch = inputs["input"]
        return (self.logits,)


class Detector:
    model_version = "detector-test"

    def __init__(self, count: int = 1) -> None:
        self.count = count

    def detect(self, image):
        detection = FaceDetection(
            bounding_box=BoundingBox(18, 18, 64, 64),
            confidence=0.99,
            landmarks=tuple(Point(index, index) for index in range(5)),
        )
        return tuple(detection for _ in range(self.count))


def frames(count: int = 3):
    return tuple(Image.new("RGB", (100, 100), (10, 20, 30)) for _ in range(count))


def test_minifas_batches_reviewed_crops_and_returns_median_spoof_probability():
    session = Session([[3, 1], [0, 2], [2, 0]])
    analyzer = MiniFASPresentationAttackDetector(session, Detector())

    evidence = analyzer.analyze(frames())

    assert session.batch.shape == (3, 3, 128, 128)
    assert session.batch.dtype == np.float32
    assert session.batch.min() >= 0 and session.batch.max() <= 1
    assert evidence.model_version == "minifas-test"
    assert evidence.signals[0].attack_type is PresentationAttackType.TWO_DIMENSIONAL
    assert evidence.signals[0].score == pytest.approx(0.11920292)


def test_minifas_requires_exactly_one_face_in_every_frame():
    analyzer = MiniFASPresentationAttackDetector(Session([[0, 1]] * 3), Detector(2))

    with pytest.raises(FaceCountError, match="detected 2"):
        analyzer.analyze(frames())


@pytest.mark.parametrize("count", [2, 65])
def test_minifas_enforces_bounded_frame_count(count):
    analyzer = MiniFASPresentationAttackDetector(Session([[0, 1]] * count), Detector())

    with pytest.raises(ValueError, match="requires 3..64 frames"):
        analyzer.analyze(frames(count))


def test_minifas_rejects_unreviewed_output_shape():
    analyzer = MiniFASPresentationAttackDetector(Session([[0, 1]]), Detector())

    with pytest.raises(ValueError, match="invalid logits"):
        analyzer.analyze(frames())
