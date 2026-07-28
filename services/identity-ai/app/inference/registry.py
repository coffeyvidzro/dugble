"""Process-local registry for initialized face model adapters."""

from dataclasses import dataclass
from threading import Lock

from app.face.detector import FaceDetector
from app.face.embedder import FaceEmbedder
from app.face.service import FaceComparisonService


@dataclass(frozen=True)
class FaceModels:
    detector: FaceDetector
    embedder: FaceEmbedder


class FaceModelRegistry:
    def __init__(self) -> None:
        self._lock = Lock()
        self._models: FaceModels | None = None

    @property
    def ready(self) -> bool:
        return self._models is not None

    def register(self, detector: FaceDetector, embedder: FaceEmbedder) -> None:
        with self._lock:
            if self._models is not None:
                raise RuntimeError("face models are already registered")
            self._models = FaceModels(detector=detector, embedder=embedder)

    def comparison_service(self) -> FaceComparisonService:
        models = self._models
        if models is None:
            raise RuntimeError("face models are not registered")
        return FaceComparisonService(models.detector, models.embedder)
