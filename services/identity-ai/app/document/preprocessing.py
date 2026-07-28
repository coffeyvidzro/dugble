"""Perspective-correction and OCR-preprocessing interface."""

from typing import Protocol

from PIL import Image

from app.contracts.document import DocumentDetection


class DocumentPreprocessor(Protocol):
    @property
    def version(self) -> str: ...

    def rectify(self, image: Image.Image, detection: DocumentDetection) -> Image.Image: ...
