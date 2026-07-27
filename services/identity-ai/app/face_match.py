from dataclasses import dataclass


@dataclass(frozen=True)
class FaceMatchResult:
    face_detected: bool
    similarity: float


def compare_faces(_: str, __: str) -> FaceMatchResult:
    """Placeholder for document-photo to selfie face comparison."""
    raise NotImplementedError("face comparison is not implemented")
