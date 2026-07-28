"""Card-boundary detector interface for document capture."""

from typing import Protocol

from PIL import Image

from app.contracts.document import DocumentDetection


class DocumentDetector(Protocol):
    @property
    def model_version(self) -> str: ...

    def detect(self, image: Image.Image) -> tuple[DocumentDetection, ...]: ...
