"""Model artifact integrity verification shared by startup and tooling."""

import hashlib
from pathlib import Path

from app.inference.manifest import ModelArtifact


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
