from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from app.contracts.face import BoundingBox, FaceDetection, Point
from app.face.opencv_models import SFaceEmbedder, YuNetFaceDetector


class FakeYuNet:
    def __init__(self) -> None:
        self.input_size = None
        self.image = None

    def setInputSize(self, input_size) -> None:
        self.input_size = input_size

    def detect(self, image):
        self.image = image
        return 1, np.asarray(
            [[10, 20, 80, 100, 30, 50, 65, 50, 48, 70, 34, 92, 62, 92, 0.95]],
            dtype=np.float32,
        )


class FakeSFace:
    def __init__(self) -> None:
        self.image = None
        self.face = None

    def alignCrop(self, image, face):
        self.image = image
        self.face = face
        return np.zeros((112, 112, 3), dtype=np.uint8)

    def feature(self, aligned):
        assert aligned.shape == (112, 112, 3)
        return np.arange(128, dtype=np.float32).reshape(1, 128)


def detection(landmark_count: int = 5) -> FaceDetection:
    return FaceDetection(
        bounding_box=BoundingBox(10, 20, 80, 100),
        confidence=0.95,
        landmarks=tuple(Point(index + 1, index + 2) for index in range(landmark_count)),
    )


def test_yunet_adapter_converts_rgb_to_bgr_and_maps_contract(monkeypatch):
    backend = FakeYuNet()
    monkeypatch.setattr(
        "app.face.opencv_models.cv2.FaceDetectorYN.create",
        lambda *_: backend,
    )
    detector = YuNetFaceDetector(Path("yunet.onnx"), "yunet-test")

    result = detector.detect(Image.new("RGB", (160, 120), (1, 2, 3)))

    assert detector.model_version == "yunet-test"
    assert backend.input_size == (160, 120)
    assert backend.image[0, 0].tolist() == [3, 2, 1]
    assert len(result) == 1
    assert result[0].bounding_box == BoundingBox(10, 20, 80, 100)
    assert result[0].landmarks[0] == Point(30, 50)
    assert result[0].confidence == pytest.approx(0.95)


def test_yunet_adapter_returns_empty_tuple_when_no_face_is_detected(monkeypatch):
    backend = FakeYuNet()
    backend.detect = lambda _: (1, None)
    monkeypatch.setattr(
        "app.face.opencv_models.cv2.FaceDetectorYN.create",
        lambda *_: backend,
    )

    assert YuNetFaceDetector(Path("yunet.onnx"), "v1").detect(Image.new("RGB", (8, 8))) == ()


def test_sface_adapter_aligns_face_and_returns_versioned_embedding(monkeypatch):
    backend = FakeSFace()
    monkeypatch.setattr(
        "app.face.opencv_models.cv2.FaceRecognizerSF.create",
        lambda *_: backend,
    )
    embedder = SFaceEmbedder(Path("sface.onnx"), "sface-test")

    result = embedder.embed(Image.new("RGB", (160, 120), (1, 2, 3)), detection())

    assert result.model_version == "sface-test"
    assert len(result.values) == 128
    assert result.values[-1] == 127
    assert backend.image[0, 0].tolist() == [3, 2, 1]
    assert backend.face.shape == (15,)


def test_sface_adapter_requires_yunet_five_point_landmarks(monkeypatch):
    monkeypatch.setattr(
        "app.face.opencv_models.cv2.FaceRecognizerSF.create",
        lambda *_: FakeSFace(),
    )
    embedder = SFaceEmbedder(Path("sface.onnx"), "sface-test")

    with pytest.raises(ValueError, match="exactly five landmarks"):
        embedder.embed(Image.new("RGB", (8, 8)), detection(4))
