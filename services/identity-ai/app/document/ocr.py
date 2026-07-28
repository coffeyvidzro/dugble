"""OCR interface implemented by the future reviewed PaddleOCR adapter."""

from typing import Protocol

from PIL import Image

from app.contracts.document import OCRLine


class DocumentOCR(Protocol):
    @property
    def model_version(self) -> str: ...

    def extract_lines(self, image: Image.Image) -> tuple[OCRLine, ...]: ...
