from dataclasses import dataclass

import pytest
from PIL import Image

from app.contracts.document import (
    DocumentDetection,
    DocumentPoint,
    DocumentSide,
    OCRLine,
)
from app.document.exceptions import DocumentCountError
from app.document.parser import GhanaCardFieldParser
from app.document.service import DocumentEnrollmentService


def detection() -> DocumentDetection:
    return DocumentDetection(
        corners=(
            DocumentPoint(0, 0),
            DocumentPoint(639, 0),
            DocumentPoint(639, 399),
            DocumentPoint(0, 399),
        ),
        confidence=0.96,
    )


@dataclass
class FakeDetector:
    detections: tuple[DocumentDetection, ...]
    model_version: str = "card-detector-test-v1"

    def detect(self, _: Image.Image) -> tuple[DocumentDetection, ...]:
        return self.detections


class IdentityPreprocessor:
    version = "perspective-test-v1"

    def rectify(self, image: Image.Image, _: DocumentDetection) -> Image.Image:
        return image.copy()


class FixedOCR:
    model_version = "paddleocr-test-v1"

    def extract_lines(self, _: Image.Image) -> tuple[OCRLine, ...]:
        return (
            OCRLine("Surname: Mensah", 0.94),
            OCRLine("First Name: Ama", 0.93),
            OCRLine("Date of Birth: 01 JAN 1990", 0.92),
            OCRLine("Personal ID Number: GHA-000000000-0", 0.91),
        )


def service(detections: tuple[DocumentDetection, ...]) -> DocumentEnrollmentService:
    return DocumentEnrollmentService(
        FakeDetector(detections),
        IdentityPreprocessor(),
        FixedOCR(),
        GhanaCardFieldParser(),
    )


def test_service_returns_versioned_front_enrollment_evidence():
    evidence = service((detection(),)).analyze(
        "verification-1",
        ((DocumentSide.FRONT, Image.new("RGB", (640, 400), "gray")),),
    )

    front = evidence.sides[0]
    assert evidence.verification_id == "verification-1"
    assert front.side is DocumentSide.FRONT
    assert front.detection_confidence == 0.96
    assert front.missing_required_fields == ()
    assert tuple(field.name for field in front.fields) == (
        "surname",
        "given_names",
        "date_of_birth",
        "personal_id_number",
    )
    assert front.detector_version == "card-detector-test-v1"
    assert front.preprocessor_version == "perspective-test-v1"
    assert front.ocr_model_version == "paddleocr-test-v1"
    assert front.parser_version == "ghana-card-label-parser-v1"


@pytest.mark.parametrize("detections", [(), (detection(), detection())])
def test_service_requires_exactly_one_document_per_side(detections):
    with pytest.raises(DocumentCountError) as error:
        service(detections).analyze_side(
            DocumentSide.FRONT,
            Image.new("RGB", (640, 400), "gray"),
        )

    assert error.value.side == "front"
    assert error.value.actual_count == len(detections)


def test_service_rejects_duplicate_document_sides():
    image = Image.new("RGB", (640, 400), "gray")

    with pytest.raises(ValueError, match="repeat a side"):
        service((detection(),)).analyze(
            "verification-1",
            ((DocumentSide.FRONT, image), (DocumentSide.FRONT, image)),
        )
