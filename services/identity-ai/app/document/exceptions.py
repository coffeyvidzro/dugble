"""Expected failures that prevent document enrollment analysis."""


class DocumentPipelineError(ValueError):
    """Base class for document-pipeline failures."""


class DocumentCountError(DocumentPipelineError):
    def __init__(self, side: str, actual_count: int) -> None:
        self.side = side
        self.actual_count = actual_count
        super().__init__(f"{side} image must contain exactly one card; detected {actual_count}")
