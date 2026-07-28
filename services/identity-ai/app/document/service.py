"""Document-side analysis orchestration for supervised enrollment."""

from PIL import Image

from app.contracts.document import (
    DocumentEnrollmentEvidence,
    DocumentSide,
    DocumentSideEvidence,
)
from app.imaging import ImageSource, decode_image, normalize_image
from app.imaging.quality import assess_image

from .detector import DocumentDetector
from .exceptions import DocumentCountError
from .ocr import DocumentOCR
from .parser import DocumentFieldParser
from .preprocessing import DocumentPreprocessor


class DocumentEnrollmentService:
    def __init__(
        self,
        detector: DocumentDetector,
        preprocessor: DocumentPreprocessor,
        ocr: DocumentOCR,
        parser: DocumentFieldParser,
    ) -> None:
        self._detector = detector
        self._preprocessor = preprocessor
        self._ocr = ocr
        self._parser = parser

    def analyze_side(
        self,
        side: DocumentSide,
        source: ImageSource | Image.Image,
    ) -> DocumentSideEvidence:
        image = normalize_image(source) if isinstance(source, Image.Image) else decode_image(source)
        quality = assess_image(image)
        detections = self._detector.detect(image)
        if len(detections) != 1:
            raise DocumentCountError(side.value, len(detections))

        detection = detections[0]
        rectified = self._preprocessor.rectify(image, detection)
        lines = self._ocr.extract_lines(rectified)
        fields, missing = self._parser.parse(side, lines)
        reasons = [f"quality:{reason}" for reason in quality.reasons]
        reasons.extend(f"missing_required_field:{name}" for name in missing)
        return DocumentSideEvidence(
            side=side,
            quality=quality,
            detection_confidence=detection.confidence,
            fields=fields,
            missing_required_fields=missing,
            reasons=tuple(reasons),
            detector_version=self._detector.model_version,
            preprocessor_version=self._preprocessor.version,
            ocr_model_version=self._ocr.model_version,
            parser_version=self._parser.version,
        )

    def analyze(
        self,
        verification_id: str,
        sides: tuple[tuple[DocumentSide, ImageSource | Image.Image], ...],
    ) -> DocumentEnrollmentEvidence:
        if not verification_id.strip():
            raise ValueError("verification ID must not be empty")
        side_names = tuple(side for side, _ in sides)
        if len(set(side_names)) != len(side_names):
            raise ValueError("document enrollment must not repeat a side")
        return DocumentEnrollmentEvidence(
            verification_id=verification_id,
            sides=tuple(self.analyze_side(side, source) for side, source in sides),
        )
