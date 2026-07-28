"""Bounded JSON Lines input and report output helpers."""

import json
from collections.abc import Iterable
from pathlib import Path

DEFAULT_MAX_INPUT_BYTES = 10 * 1024 * 1024
DEFAULT_MAX_SAMPLES = 100_000


def read_json_lines(
    path: str | Path,
    *,
    max_input_bytes: int = DEFAULT_MAX_INPUT_BYTES,
    max_samples: int = DEFAULT_MAX_SAMPLES,
) -> tuple[dict[str, object], ...]:
    if max_input_bytes <= 0 or max_samples <= 0:
        raise ValueError("evaluation input limits must be positive")
    input_path = Path(path)
    if input_path.stat().st_size > max_input_bytes:
        raise ValueError("evaluation input exceeds the size limit")
    records: list[dict[str, object]] = []
    for line_number, line in enumerate(
        input_path.read_text(encoding="utf-8").splitlines(), start=1
    ):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as error:
            raise ValueError(f"invalid JSON on line {line_number}") from error
        if not isinstance(value, dict):
            raise ValueError(f"evaluation record on line {line_number} must be an object")
        records.append(value)
        if len(records) > max_samples:
            raise ValueError("evaluation input exceeds the sample limit")
    return tuple(records)


def write_report(report: dict[str, object], output: str | Path | None) -> None:
    serialized = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if output is None:
        print(serialized, end="")
        return
    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(serialized, encoding="utf-8")


def require_exact_fields(record: dict[str, object], fields: Iterable[str]) -> None:
    expected = set(fields)
    if set(record) != expected:
        raise ValueError(f"evaluation record fields must be {sorted(expected)}")
