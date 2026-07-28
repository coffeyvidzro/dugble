"""Verify local model files against the reviewed manifest."""

import argparse
import hashlib
import json
from pathlib import Path

from app.inference.manifest import ModelArtifact, load_model_manifest

DEFAULT_MANIFEST = Path(__file__).parents[1] / "models" / "manifest.json"
DEFAULT_MODEL_DIR = Path(__file__).parents[1] / "models"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as model_file:
        for chunk in iter(lambda: model_file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_artifact(artifact: ModelArtifact, model_dir: Path) -> dict[str, object]:
    path = model_dir / artifact.filename
    if not path.is_file():
        return {"logical_name": artifact.logical_name, "status": "missing"}
    actual_size = path.stat().st_size
    if actual_size != artifact.size_bytes:
        return {
            "logical_name": artifact.logical_name,
            "status": "size_mismatch",
            "expected_size": artifact.size_bytes,
            "actual_size": actual_size,
        }
    actual_sha256 = sha256_file(path)
    if actual_sha256 != artifact.sha256:
        return {
            "logical_name": artifact.logical_name,
            "status": "checksum_mismatch",
            "expected_sha256": artifact.sha256,
            "actual_sha256": actual_sha256,
        }
    return {
        "logical_name": artifact.logical_name,
        "version": artifact.version,
        "status": "verified",
    }


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
