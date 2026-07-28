"""Face detector boundary implemented by the future YuNet adapter."""

from typing import Protocol

from PIL import Image

from app.contracts.face import FaceDetection


class FaceDetector(Protocol):
    @property
    def model_version(self) -> str: ...

    def detect(self, image: Image.Image) -> tuple[FaceDetection, ...]: ...
