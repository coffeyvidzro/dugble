"""MediaPipe Face Landmarker adapter for ordered capture frames."""

from __future__ import annotations

from collections.abc import Callable, Iterable
from math import atan2, degrees, sqrt
from pathlib import Path
from threading import Lock
from typing import Protocol

import numpy as np
from mediapipe.tasks.python.core.base_options import BaseOptions
from mediapipe.tasks.python.vision.core.image import Image as MediaPipeImage
from mediapipe.tasks.python.vision.core.image import ImageFormat
from mediapipe.tasks.python.vision.core.vision_task_running_mode import VisionTaskRunningMode
from mediapipe.tasks.python.vision.face_landmarker import (
    FaceLandmarker,
    FaceLandmarkerOptions,
    FaceLandmarkerResult,
)

from app.contracts.liveness import PoseObservation

from .landmarks import CapturedFrame


class LandmarkerBackend(Protocol):
    def detect_for_video(
        self, image: MediaPipeImage, timestamp_ms: int
    ) -> FaceLandmarkerResult: ...

    def close(self) -> None: ...


LandmarkerFactory = Callable[[FaceLandmarkerOptions], LandmarkerBackend]


def _head_pose(matrix: np.ndarray) -> tuple[float, float, float]:
    transform = np.asarray(matrix, dtype=np.float64)
    if transform.shape != (4, 4) or not np.isfinite(transform).all():
        raise ValueError("MediaPipe returned an invalid facial transformation matrix")
    rotation = transform[:3, :3]
    horizontal = sqrt(rotation[0, 0] ** 2 + rotation[1, 0] ** 2)
    pitch = atan2(rotation[2, 1], rotation[2, 2])
    yaw = atan2(-rotation[2, 0], horizontal)
    roll = atan2(rotation[1, 0], rotation[0, 0])
    return degrees(yaw), degrees(pitch), degrees(roll)


def _face_width_ratio(result: FaceLandmarkerResult) -> float:
    landmarks = result.face_landmarks[0]
    if not landmarks:
        raise ValueError("MediaPipe returned an empty face landmark set")
    coordinates = np.asarray([(point.x, point.y, point.z) for point in landmarks])
    if not np.isfinite(coordinates).all():
        raise ValueError("MediaPipe returned non-finite face landmarks")
    return float(np.clip(coordinates[:, 0].max() - coordinates[:, 0].min(), 0, 1))


class MediaPipeFaceLandmarkTracker:
    def __init__(
        self,
        model_path: Path,
        model_version: str,
        *,
        maximum_faces: int = 2,
        minimum_confidence: float = 0.5,
        landmarker_factory: LandmarkerFactory = FaceLandmarker.create_from_options,
    ) -> None:
        if not model_version.strip():
            raise ValueError("landmark model version must not be empty")
        if maximum_faces < 2:
            raise ValueError("capture guidance must detect at least two faces")
        if not 0 <= minimum_confidence <= 1:
            raise ValueError("landmark confidence must be within 0..1")
        options = FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=str(model_path)),
            running_mode=VisionTaskRunningMode.VIDEO,
            num_faces=maximum_faces,
            min_face_detection_confidence=minimum_confidence,
            min_face_presence_confidence=minimum_confidence,
            min_tracking_confidence=minimum_confidence,
            output_facial_transformation_matrixes=True,
        )
        self._model_version = model_version
        self._landmarker = landmarker_factory(options)
        self._lock = Lock()
        self._last_timestamp_ms = -1

    @property
    def model_version(self) -> str:
        return self._model_version

    def observe(self, frames: Iterable[CapturedFrame]) -> tuple[PoseObservation, ...]:
        captured_frames = tuple(frames)
        if not captured_frames:
            return ()
        started_at = captured_frames[0].captured_at
        relative_timestamps = tuple(
            round((frame.captured_at - started_at).total_seconds() * 1000)
            for frame in captured_frames
        )
        if any(
            current <= previous
            for previous, current in zip(
                relative_timestamps, relative_timestamps[1:], strict=False
            )
        ):
            raise ValueError("capture frame timestamps must be strictly increasing")
        observations: list[PoseObservation] = []
        with self._lock:
            session_start_ms = self._last_timestamp_ms + 1
            timestamps = tuple(
                session_start_ms + relative_timestamp
                for relative_timestamp in relative_timestamps
            )
            # Reserve the complete range before inference so a failed call cannot make a
            # later request reuse a timestamp already observed by the video-mode backend.
            self._last_timestamp_ms = timestamps[-1]
            for frame, timestamp_ms in zip(captured_frames, timestamps, strict=True):
                pixels = np.ascontiguousarray(frame.image.convert("RGB"), dtype=np.uint8)
                result = self._landmarker.detect_for_video(
                    MediaPipeImage(ImageFormat.SRGB, pixels), timestamp_ms
                )
                face_count = len(result.face_landmarks)
                yaw = pitch = roll = face_width_ratio = 0.0
                if face_count == 1:
                    if len(result.facial_transformation_matrixes) != 1:
                        raise ValueError("MediaPipe omitted the facial transformation matrix")
                    yaw, pitch, roll = _head_pose(result.facial_transformation_matrixes[0])
                    face_width_ratio = _face_width_ratio(result)
                observations.append(
                    PoseObservation(
                        captured_at=frame.captured_at,
                        face_count=face_count,
                        yaw_degrees=yaw,
                        pitch_degrees=pitch,
                        roll_degrees=roll,
                        face_width_ratio=face_width_ratio,
                        landmark_model_version=self.model_version,
                    )
                )
        return tuple(observations)

    def close(self) -> None:
        with self._lock:
            self._landmarker.close()


def load_mediapipe_landmark_model(logical_name: str, version: str, path: Path) -> object:
    if logical_name != "face-landmarks":
        raise ValueError(f"no MediaPipe adapter is registered for model: {logical_name}")
    return MediaPipeFaceLandmarkTracker(path, version)
