"""Verify local model files against the reviewed manifest."""

import argparse
import json
from pathlib import Path

from app.inference.artifacts import verify_artifact
from app.inference.manifest import load_model_manifest

DEFAULT_MANIFEST = Path(__file__).parents[1] / "models" / "manifest.json"
DEFAULT_MODEL_DIR = Path(__file__).parents[1] / "models"


def verify_models(manifest_path: Path, model_dir: Path) -> dict[str, object]:
    manifest = load_model_manifest(manifest_path)
    results = tuple(verify_artifact(artifact, model_dir) for artifact in manifest.models)
    all_artifacts_verified = all(result["status"] == "verified" for result in results)
    return {
        "manifest_schema_version": manifest.schema_version,
        "model_count": len(results),
        "all_artifacts_verified": all_artifacts_verified,
        "ready": bool(results) and all_artifacts_verified,
        "models": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--model-dir", type=Path, default=DEFAULT_MODEL_DIR)
    arguments = parser.parse_args()
    report = verify_models(arguments.manifest, arguments.model_dir)
    print(json.dumps(report, indent=2, sort_keys=True))
    if not report["all_artifacts_verified"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
