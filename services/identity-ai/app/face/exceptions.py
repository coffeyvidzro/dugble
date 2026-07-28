"""Failures that prevent reliable facial comparison evidence."""


class FacePipelineError(ValueError):
    """Base class for expected face-pipeline failures."""


class FaceCountError(FacePipelineError):
    def __init__(self, input_name: str, actual_count: int) -> None:
        self.input_name = input_name
        self.actual_count = actual_count
        super().__init__(f"{input_name} must contain exactly one face; detected {actual_count}")


class IncompatibleEmbeddingError(FacePipelineError):
    """Raised when two embeddings cannot be compared safely."""
