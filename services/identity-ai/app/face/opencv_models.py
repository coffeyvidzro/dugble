"""Concrete OpenCV YuNet detection and SFace embedding adapters."""

from __future__ import annotations

from pathlib import Path
from threading import Lock

import cv2
import numpy as np
from PIL import Image

from app.contracts.face import BoundingBox, FaceDetection, FaceEmbedding, Point


def _bgr_image(image: Image.Image) -> np.ndarray:
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
    return np.ascontiguousarray(rgb[:, :, ::-1])


def _face_row(detection: FaceDetection) -> np.ndarray:
    if len(detection.landmarks) != 5:
        raise ValueError("SFace alignment requires exactly five landmarks")
    box = detection.bounding_box
    values = [box.x, box.y, box.width, box.height]
    values.extend(coordinate for point in detection.landmarks for coordinate in (point.x, point.y))
    values.append(detection.confidence)
    row = np.asarray(values, dtype=np.float32)
    if row.shape != (15,) or not np.isfinite(row).all():
        raise ValueError("face alignment input is invalid")
    return row


class YuNetFaceDetector:
    def __init__(
        self,
        model_path: Path,
        model_version: str,
        *,
        score_threshold: float = 0.6,
        nms_threshold: float = 0.3,
        top_k: int = 5000,
    ) -> None:
        if not 0 <= score_threshold <= 1 or not 0 <= nms_threshold <= 1:
            raise ValueError("YuNet thresholds must be within 0..1")
        if top_k <= 0:
            raise ValueError("YuNet top_k must be positive")
        if not model_version.strip():
            raise ValueError("YuNet model version must not be empty")
        self._model_version = model_version
        self._lock = Lock()
        self._detector = cv2.FaceDetectorYN.create(
            str(model_path),
            "",
            (320, 320),
            score_threshold,
            nms_threshold,
            top_k,
        )

    @property
    def model_version(self) -> str:
        return self._model_version

    def detect(self, image: Image.Image) -> tuple[FaceDetection, ...]:
        bgr = _bgr_image(image)
        height, width = bgr.shape[:2]
        with self._lock:
            self._detector.setInputSize((width, height))
            _, faces = self._detector.detect(bgr)
        if faces is None:
            return ()

        detections: list[FaceDetection] = []
        for face in np.asarray(faces, dtype=np.float32):
            if face.shape != (15,) or not np.isfinite(face).all():
                raise ValueError("YuNet returned invalid face output")
            detections.append(
                FaceDetection(
                    bounding_box=BoundingBox(*(float(value) for value in face[:4])),
                    confidence=float(face[14]),
                    landmarks=tuple(
                        Point(float(face[index]), float(face[index + 1]))
                        for index in range(4, 14, 2)
                    ),
                )
            )
        return tuple(detections)


class SFaceEmbedder:
    def __init__(self, model_path: Path, model_version: str) -> None:
        if not model_version.strip():
            raise ValueError("SFace model version must not be empty")
        self._model_version = model_version
        self._lock = Lock()
        self._recognizer = cv2.FaceRecognizerSF.create(str(model_path), "")

    @property
    def model_version(self) -> str:
        return self._model_version

    def embed(self, image: Image.Image, detection: FaceDetection) -> FaceEmbedding:
        bgr = _bgr_image(image)
        face = _face_row(detection)
        with self._lock:
            aligned = self._recognizer.alignCrop(bgr, face)
            feature = self._recognizer.feature(aligned)
        values = np.asarray(feature, dtype=np.float32).reshape(-1)
        if values.shape != (128,) or not np.isfinite(values).all():
            raise ValueError("SFace returned an invalid embedding")
        return FaceEmbedding(
            values=tuple(float(value) for value in values),
            model_version=self.model_version,
        )


def load_opencv_face_model(logical_name: str, version: str, path: Path) -> object:
    try:
        if logical_name == "face-detector":
            return YuNetFaceDetector(path, version)
        if logical_name == "face-embedder":
            return SFaceEmbedder(path, version)
        raise ValueError(f"no OpenCV face adapter is registered for model: {logical_name}")
    except cv2.error as error:
        raise RuntimeError(f"OpenCV could not initialize model: {logical_name}") from error
