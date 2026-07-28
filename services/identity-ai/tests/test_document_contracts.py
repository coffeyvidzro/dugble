import math

import pytest

from app.contracts.document import DocumentDetection, DocumentPoint, OCRLine


def test_document_detection_requires_bounded_confidence():
    corners = (
        DocumentPoint(0, 0),
        DocumentPoint(10, 0),
        DocumentPoint(10, 10),
        DocumentPoint(0, 10),
    )

    with pytest.raises(ValueError, match="within 0..1"):
        DocumentDetection(corners=corners, confidence=1.1)


def test_document_detection_rejects_degenerate_corners():
    corners = (
        DocumentPoint(0, 0),
        DocumentPoint(1, 1),
        DocumentPoint(2, 2),
        DocumentPoint(3, 3),
    )

    with pytest.raises(ValueError, match="non-zero area"):
        DocumentDetection(corners=corners, confidence=0.9)


@pytest.mark.parametrize("confidence", [math.nan, math.inf, -0.1])
def test_ocr_line_rejects_invalid_confidence(confidence):
    with pytest.raises(ValueError, match="within 0..1"):
        OCRLine("Surname: Mensah", confidence)
