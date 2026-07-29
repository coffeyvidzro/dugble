from datetime import UTC, datetime, timedelta
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest
from PIL import Image

from app.capture.service import CaptureGuidanceService
from app.contracts.liveness import CaptureInstruction
from app.face.landmarks import CapturedFrame
from app.face.mediapipe_landmarks import MediaPipeFaceLandmarkTracker


class FakeLandmarker:
    def __init__(self, results) -> None:
        self.results = iter(results)
        self.timestamps = []
        self.closed = False

    def detect_for_video(self, image, timestamp_ms):
        assert image.width == 100
        self.timestamps.append(timestamp_ms)
        return next(self.results)

    def close(self) -> None:
        self.closed = True


class StrictTimestampLandmarker(FakeLandmarker):
    def detect_for_video(self, image, timestamp_ms):
        if self.timestamps and timestamp_ms <= self.timestamps[-1]:
            raise ValueError("backend timestamps must increase across calls")
        return super().detect_for_video(image, timestamp_ms)


def result(*, face_count: int = 1, matrix=None):
    face = [
        SimpleNamespace(x=0.25, y=0.4, z=0.0),
        SimpleNamespace(x=0.75, y=0.6, z=0.0),
    ]
    return SimpleNamespace(
        face_landmarks=[face for _ in range(face_count)],
        facial_transformation_matrixes=(
            [np.eye(4, dtype=np.float32) if matrix is None else matrix] if face_count == 1 else []
        ),
    )


def frame(captured_at: datetime) -> CapturedFrame:
    return CapturedFrame(Image.new("RGB", (100, 80), (1, 2, 3)), captured_at)


def test_tracker_maps_ordered_frames_to_pose_observations():
    backend = FakeLandmarker([result(), result(face_count=0)])
    options = []
    tracker = MediaPipeFaceLandmarkTracker(
        Path("face_landmarker.task"),
        "landmarks-v1",
        landmarker_factory=lambda value: options.append(value) or backend,
    )
    started_at = datetime(2026, 1, 1, tzinfo=UTC)

    observations = tracker.observe(
        [frame(started_at), frame(started_at + timedelta(milliseconds=125))]
    )

    assert backend.timestamps == [0, 125]
    assert options[0].num_faces == 2
    assert options[0].output_facial_transformation_matrixes is True
    assert observations[0].face_count == 1
    assert observations[0].face_width_ratio == pytest.approx(0.5)
    assert observations[0].yaw_degrees == pytest.approx(0)
    assert observations[1].face_count == 0
    assert observations[1].landmark_model_version == "landmarks-v1"


def test_tracker_rejects_frames_without_strictly_increasing_milliseconds():
    backend = FakeLandmarker([result()])
    tracker = MediaPipeFaceLandmarkTracker(
        Path("face_landmarker.task"),
        "landmarks-v1",
        landmarker_factory=lambda _: backend,
    )
    captured_at = datetime(2026, 1, 1, tzinfo=UTC)

    with pytest.raises(ValueError, match="strictly increasing"):
        tracker.observe([frame(captured_at), frame(captured_at)])


def test_tracker_keeps_backend_timestamps_increasing_across_capture_sessions():
    backend = StrictTimestampLandmarker([result(), result(), result(), result()])
    tracker = MediaPipeFaceLandmarkTracker(
        Path("face_landmarker.task"),
        "landmarks-v1",
        landmarker_factory=lambda _: backend,
    )
    started_at = datetime(2026, 1, 1, tzinfo=UTC)

    tracker.observe([frame(started_at), frame(started_at + timedelta(milliseconds=125))])
    tracker.observe([frame(started_at), frame(started_at + timedelta(milliseconds=50))])

    assert backend.timestamps == [0, 125, 126, 176]


def test_tracker_releases_mediapipe_backend():
    backend = FakeLandmarker([])
    tracker = MediaPipeFaceLandmarkTracker(
        Path("face_landmarker.task"),
        "landmarks-v1",
        landmarker_factory=lambda _: backend,
    )

    tracker.close()

    assert backend.closed is True


def test_capture_service_turns_landmarks_into_per_frame_guidance():
    backend = FakeLandmarker([result(), result(face_count=2)])
    tracker = MediaPipeFaceLandmarkTracker(
        Path("face_landmarker.task"),
        "landmarks-v1",
        landmarker_factory=lambda _: backend,
    )
    started_at = datetime(2026, 1, 1, tzinfo=UTC)

    guidance = CaptureGuidanceService(tracker).guide(
        [frame(started_at), frame(started_at + timedelta(milliseconds=100))]
    )

    assert guidance[0].suitable_for_capture is True
    assert guidance[1].instructions == (CaptureInstruction.MULTIPLE_FACES,)


def test_captured_frame_requires_timezone_aware_timestamp():
    with pytest.raises(ValueError, match="timezone-aware"):
        frame(datetime(2026, 1, 1))


def test_captured_frame_requires_pillow_image():
    with pytest.raises(TypeError, match="Pillow image"):
        CapturedFrame("not-an-image", datetime(2026, 1, 1, tzinfo=UTC))  # type: ignore[arg-type]
