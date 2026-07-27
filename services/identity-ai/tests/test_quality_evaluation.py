import json
from pathlib import Path

import pytest

from evaluation.quality import DEFAULT_MANIFEST, evaluate_manifest, main


def test_synthetic_fixture_set_matches_expectations() -> None:
    report = evaluate_manifest()

    assert report["analyzer_version"] == "quality-v1"
    assert report["fixture_set"] == "synthetic-quality-v1"
    assert report["summary"] == {
        "total": 9,
        "matched": 9,
        "mismatched": 0,
        "true_accept": 4,
        "false_accept": 0,
        "false_reject": 0,
        "true_reject": 5,
    }


def test_mismatched_expectation_returns_failure(tmp_path: Path) -> None:
    manifest = json.loads(DEFAULT_MANIFEST.read_text())
    fixture = manifest["fixtures"][0]
    fixture["expected_acceptable"] = False
    fixture["expected_reasons"] = ["image_too_blurry"]
    manifest["fixtures"] = [fixture]
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(json.dumps(manifest))
    output_path = tmp_path / "report.json"

    exit_code = main(["--manifest", str(manifest_path), "--output", str(output_path)])
    report = json.loads(output_path.read_text())

    assert exit_code == 1
    assert report["summary"]["mismatched"] == 1
    assert not report["fixtures"][0]["matched"]


def test_unsupported_manifest_is_rejected(tmp_path: Path) -> None:
    path = tmp_path / "manifest.json"
    path.write_text('{"schema_version": 2, "fixtures": []}')

    with pytest.raises(ValueError, match="unsupported quality fixture manifest"):
        evaluate_manifest(path)
