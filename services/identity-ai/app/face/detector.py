"""Face detector boundary implemented by model-specific adapters."""

from typing import Protocol, runtime_checkable

from PIL import Image

from app.contracts.face import FaceDetection


@runtime_checkable
class FaceDetector(Protocol):
    @property
    def model_version(self) -> str: ...

    def detect(self, image: Image.Image) -> tuple[FaceDetection, ...]: ...
