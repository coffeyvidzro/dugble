"""Evaluate the deterministic quality analyzer against a fixture manifest."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Sequence

from app.quality import ANALYZER_VERSION, QualityResult, assess_image

from .synthetic_quality import render_fixture

DEFAULT_MANIFEST = Path(__file__).parents[1] / "tests/fixtures/quality/manifest.json"


@dataclass(frozen=True)
class FixtureEvaluation:
    fixture_id: str
    expected_acceptable: bool
    actual_acceptable: bool
    expected_reasons: list[str]
    actual_reasons: list[str]
    score: float

    @property
    def matched(self) -> bool:
        return (
            self.expected_acceptable == self.actual_acceptable
            and self.expected_reasons == self.actual_reasons
        )


def _load_manifest(path: Path) -> dict[str, Any]:
    try:
        manifest = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"could not load fixture manifest: {path}") from error
    if manifest.get("schema_version") != 1 or not isinstance(
        manifest.get("fixtures"), list
    ):
        raise ValueError("unsupported quality fixture manifest")
    return manifest


def evaluate_manifest(path: Path = DEFAULT_MANIFEST) -> dict[str, Any]:
    """Evaluate every fixture and return a JSON-serializable report."""

    manifest = _load_manifest(path)
    evaluations: list[FixtureEvaluation] = []
    for fixture in manifest["fixtures"]:
        result: QualityResult = assess_image(render_fixture(fixture))
        evaluations.append(
            FixtureEvaluation(
                fixture_id=fixture["id"],
                expected_acceptable=fixture["expected_acceptable"],
                actual_acceptable=result.meets_quality_thresholds,
                expected_reasons=fixture["expected_reasons"],
                actual_reasons=result.reasons,
                score=result.score,
            )
        )

    matched = sum(evaluation.matched for evaluation in evaluations)
    true_accept = sum(
        evaluation.expected_acceptable and evaluation.actual_acceptable
        for evaluation in evaluations
    )
    false_accept = sum(
        not evaluation.expected_acceptable and evaluation.actual_acceptable
        for evaluation in evaluations
    )
    false_reject = sum(
        evaluation.expected_acceptable and not evaluation.actual_acceptable
        for evaluation in evaluations
    )
    true_reject = sum(
        not evaluation.expected_acceptable and not evaluation.actual_acceptable
        for evaluation in evaluations
    )
    return {
        "schema_version": 1,
        "analyzer_version": ANALYZER_VERSION,
        "fixture_set": manifest["fixture_set"],
        "summary": {
            "total": len(evaluations),
            "matched": matched,
            "mismatched": len(evaluations) - matched,
            "true_accept": true_accept,
            "false_accept": false_accept,
            "false_reject": false_reject,
            "true_reject": true_reject,
        },
        "fixtures": [
            {**asdict(evaluation), "matched": evaluation.matched}
            for evaluation in evaluations
        ],
    }


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output", type=Path, help="write JSON to this path")
    args = parser.parse_args(argv)

    try:
        report = evaluate_manifest(args.manifest)
    except ValueError as error:
        parser.error(str(error))
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.output:
        args.output.write_text(rendered)
    else:
        print(rendered, end="")
    return 1 if report["summary"]["mismatched"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
