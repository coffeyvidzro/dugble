"""Face embedding boundary implemented by the future SFace adapter."""

from typing import Protocol

from PIL import Image

from app.contracts.face import FaceDetection, FaceEmbedding


class FaceEmbedder(Protocol):
    @property
    def model_version(self) -> str: ...

    def embed(self, image: Image.Image, detection: FaceDetection) -> FaceEmbedding: ...
