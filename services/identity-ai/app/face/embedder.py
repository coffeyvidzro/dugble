"""Face embedding boundary implemented by model-specific adapters."""

from typing import Protocol, runtime_checkable

from PIL import Image

from app.contracts.face import FaceDetection, FaceEmbedding


@runtime_checkable
class FaceEmbedder(Protocol):
    @property
    def model_version(self) -> str: ...

    def embed(self, image: Image.Image, detection: FaceDetection) -> FaceEmbedding: ...
