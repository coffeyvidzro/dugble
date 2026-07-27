from dataclasses import dataclass

from .quality import QualityResult, assess_image_quality


@dataclass(frozen=True)
class DocumentResult:
    document_valid: bool
    quality: QualityResult
    fraud_score: float
    extracted_data: dict[str, str]
    reasons: list[str]


def analyze_document(object_key: str, _: str, __: str) -> DocumentResult:
    """Placeholder for quality checks, OCR, parsing, and fraud analysis."""
    assess_image_quality(object_key)
    raise NotImplementedError("document analysis is not implemented")
