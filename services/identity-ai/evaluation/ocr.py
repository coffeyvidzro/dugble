"""Field-level exact-match metrics for redacted OCR evaluation records."""

import argparse
from dataclasses import dataclass

from evaluation.common import read_json_lines, require_exact_fields, write_report


def _normalized(value: str) -> str:
    return " ".join(value.casefold().split())


@dataclass(frozen=True)
class OCRSample:
    sample_id: str
    expected: dict[str, str]
    observed: dict[str, str]

    def __post_init__(self) -> None:
        if not self.sample_id.strip():
            raise ValueError("sample ID must not be empty")
        if not self.expected:
            raise ValueError("OCR sample must contain expected fields")
        for fields in (self.expected, self.observed):
            if not all(key.strip() and value.strip() for key, value in fields.items()):
                raise ValueError("OCR field names and values must not be empty")


def evaluate_ocr(samples: tuple[OCRSample, ...]) -> dict[str, object]:
    if not samples:
        raise ValueError("OCR evaluation requires samples")
    sample_ids = tuple(sample.sample_id for sample in samples)
    if len(set(sample_ids)) != len(sample_ids):
        raise ValueError("OCR evaluation sample IDs must be unique")
    total_fields = 0
    exact_matches = 0
    missing_fields = 0
    by_field: dict[str, dict[str, int]] = {}
    for sample in samples:
        for name, expected in sample.expected.items():
            total_fields += 1
            field_metrics = by_field.setdefault(
                name, {"expected": 0, "exact_matches": 0, "missing": 0}
            )
            field_metrics["expected"] += 1
            observed = sample.observed.get(name)
            if observed is None:
                missing_fields += 1
                field_metrics["missing"] += 1
            elif _normalized(observed) == _normalized(expected):
                exact_matches += 1
                field_metrics["exact_matches"] += 1
    return {
        "metric_version": "ocr-fields-v1",
        "samples": len(samples),
        "expected_fields": total_fields,
        "exact_matches": exact_matches,
        "missing_fields": missing_fields,
        "exact_match_rate": exact_matches / total_fields,
        "by_field": by_field,
    }


def _string_map(value: object, name: str) -> dict[str, str]:
    if not isinstance(value, dict) or not all(
        isinstance(key, str) and isinstance(item, str) for key, item in value.items()
    ):
        raise ValueError(f"{name} must be an object of string fields")
    return value


def _sample(record: dict[str, object]) -> OCRSample:
    require_exact_fields(record, ("sample_id", "expected", "observed"))
    if not isinstance(record["sample_id"], str):
        raise ValueError("sample_id must be a string")
    return OCRSample(
        record["sample_id"],
        _string_map(record["expected"], "expected"),
        _string_map(record["observed"], "observed"),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="JSONL with redacted expected and observed field maps")
    parser.add_argument("--output")
    arguments = parser.parse_args()
    samples = tuple(_sample(record) for record in read_json_lines(arguments.input))
    write_report(evaluate_ocr(samples), arguments.output)


if __name__ == "__main__":
    main()
