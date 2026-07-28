"""Conservative, label-based extraction of Ghana Card enrollment fields."""

from dataclasses import dataclass
from re import sub
from typing import Protocol

from app.contracts.document import DocumentSide, ExtractedField, OCRLine


@dataclass(frozen=True)
class FieldSpecification:
    name: str
    labels: tuple[str, ...]
    required: bool = False

    def __post_init__(self) -> None:
        if (
            not self.name.strip()
            or not self.labels
            or not all(label.strip() for label in self.labels)
        ):
            raise ValueError("field specification name and labels must not be empty")


GHANA_CARD_FIELD_SPECIFICATIONS = (
    FieldSpecification("surname", ("surname",), required=True),
    FieldSpecification("given_names", ("first name", "given names"), required=True),
    FieldSpecification("date_of_birth", ("date of birth", "dob"), required=True),
    FieldSpecification("sex", ("sex",), required=False),
    FieldSpecification("nationality", ("nationality",), required=False),
    FieldSpecification(
        "personal_id_number",
        ("personal id number", "personal id no", "pin"),
        required=True,
    ),
    FieldSpecification("date_of_expiry", ("date of expiry", "expiry date"), required=False),
)


class DocumentFieldParser(Protocol):
    @property
    def version(self) -> str: ...

    def parse(
        self,
        side: DocumentSide,
        lines: tuple[OCRLine, ...],
    ) -> tuple[tuple[ExtractedField, ...], tuple[str, ...]]: ...


def _normalized_label(value: str) -> str:
    return sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def _split_labeled_line(text: str) -> tuple[str, str] | None:
    for separator in (":", "-"):
        label, found, value = text.partition(separator)
        if found and label.strip() and value.strip():
            return _normalized_label(label), " ".join(value.split())
    return None


class GhanaCardFieldParser:
    version = "ghana-card-label-parser-v1"

    def __init__(
        self,
        specifications: tuple[FieldSpecification, ...] = GHANA_CARD_FIELD_SPECIFICATIONS,
    ) -> None:
        self._specifications = specifications

    def parse(
        self,
        side: DocumentSide,
        lines: tuple[OCRLine, ...],
    ) -> tuple[tuple[ExtractedField, ...], tuple[str, ...]]:
        if side is DocumentSide.BACK:
            return (), ()
        candidates: dict[str, ExtractedField] = {}
        specifications_by_label = {
            _normalized_label(label): specification
            for specification in self._specifications
            for label in specification.labels
        }
        for line in lines:
            split_line = _split_labeled_line(line.text)
            if split_line is None:
                continue
            label, raw_value = split_line
            specification = specifications_by_label.get(label)
            if specification is None:
                continue
            field = ExtractedField(
                name=specification.name,
                raw_value=raw_value,
                normalized_value=" ".join(raw_value.split()),
                confidence=line.confidence,
            )
            existing = candidates.get(specification.name)
            if existing is None or field.confidence > existing.confidence:
                candidates[specification.name] = field

        fields = tuple(
            candidates[specification.name]
            for specification in self._specifications
            if specification.name in candidates
        )
        missing = tuple(
            specification.name
            for specification in self._specifications
            if specification.required and specification.name not in candidates
        )
        return fields, missing
