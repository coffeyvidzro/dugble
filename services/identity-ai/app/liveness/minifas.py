"""ONNX MiniFAS adapter for supported two-dimensional presentation attacks."""

from collections.abc import Sequence
from math import floor

import cv2
import numpy as np
from PIL import Image

from app.contracts.face import FaceDetection
from app.contracts.presentation_attack import (
    PresentationAttackEvidence,
    PresentationAttackSignal,
    PresentationAttackType,
)
from app.face.detector import FaceDetector
from app.face.exceptions import FaceCountError
from app.inference.runtime import ONNXModelSession


class MiniFASPresentationAttackDetector:
    """Scores print and display-style attacks; it does not cover every attack class."""

    def __init__(
        self,
        session: ONNXModelSession,
        face_detector: FaceDetector,
        *,
        minimum_frames: int = 3,
        maximum_frames: int = 64,
        minimum_face_size: int = 64,
        crop_expansion: float = 1.5,
    ) -> None:
        if session.logical_name != "presentation-attack":
            raise ValueError("MiniFAS requires the presentation-attack model")
        if session.input_names != ("input",) or session.output_names != ("output",):
            raise ValueError("MiniFAS model inputs and outputs do not match the reviewed contract")
        if minimum_frames <= 0 or maximum_frames < minimum_frames:
            raise ValueError("MiniFAS frame bounds must be positive and ordered")
        if minimum_face_size <= 0 or crop_expansion <= 1:
            raise ValueError("MiniFAS crop settings are invalid")
        self._session = session
        self._face_detector = face_detector
        self._minimum_frames = minimum_frames
        self._maximum_frames = maximum_frames
        self._minimum_face_size = minimum_face_size
        self._crop_expansion = crop_expansion

    @property
    def model_version(self) -> str:
        return self._session.model_version

    def _crop(self, image: Image.Image, detection: FaceDetection) -> np.ndarray:
        pixels = np.ascontiguousarray(image.convert("RGB"), dtype=np.uint8)
        box = detection.bounding_box
        if min(box.width, box.height) < self._minimum_face_size:
            raise ValueError("face is too small for presentation-attack analysis")
        crop_size = max(1, round(max(box.width, box.height) * self._crop_expansion))
        center_x = box.x + box.width / 2
        center_y = box.y + box.height / 2
        left = floor(center_x - crop_size / 2)
        top = floor(center_y - crop_size / 2)
        right = left + crop_size
        bottom = top + crop_size
        image_height, image_width = pixels.shape[:2]
        pad_left = max(0, -left)
        pad_top = max(0, -top)
        pad_right = max(0, right - image_width)
        pad_bottom = max(0, bottom - image_height)
        if any((pad_left, pad_top, pad_right, pad_bottom)):
            pixels = cv2.copyMakeBorder(
                pixels,
                pad_top,
                pad_bottom,
                pad_left,
                pad_right,
                cv2.BORDER_REFLECT_101,
            )
        left += pad_left
        right += pad_left
        top += pad_top
        bottom += pad_top
        crop = pixels[top:bottom, left:right]
        if crop.shape != (crop_size, crop_size, 3):
            raise ValueError("could not create the reviewed MiniFAS face crop")
        interpolation = cv2.INTER_LANCZOS4 if crop_size < 128 else cv2.INTER_AREA
        resized = cv2.resize(crop, (128, 128), interpolation=interpolation)
        return resized.transpose(2, 0, 1).astype(np.float32) / 255.0

    def analyze(self, frames: Sequence[Image.Image]) -> PresentationAttackEvidence:
        if not self._minimum_frames <= len(frames) <= self._maximum_frames:
            raise ValueError(
                f"presentation-attack analysis requires {self._minimum_frames}.."
                f"{self._maximum_frames} frames"
            )
        crops: list[np.ndarray] = []
        for index, frame in enumerate(frames):
            detections = self._face_detector.detect(frame)
            if len(detections) != 1:
                raise FaceCountError(f"presentation-attack frame {index}", len(detections))
            crops.append(self._crop(frame, detections[0]))
        logits = np.asarray(
            self._session.run({"input": np.stack(crops).astype(np.float32)})[0],
            dtype=np.float64,
        )
        if logits.shape != (len(frames), 2) or not np.isfinite(logits).all():
            raise ValueError("MiniFAS returned invalid logits")
        shifted = logits - logits.max(axis=1, keepdims=True)
        probabilities = np.exp(shifted) / np.exp(shifted).sum(axis=1, keepdims=True)
        spoof_score = float(np.median(probabilities[:, 1]))
        return PresentationAttackEvidence(
            signals=(
                PresentationAttackSignal(
                    attack_type=PresentationAttackType.TWO_DIMENSIONAL,
                    score=spoof_score,
                ),
            ),
            model_version=self.model_version,
        )
