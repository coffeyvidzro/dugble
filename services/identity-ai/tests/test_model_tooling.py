import hashlib
import json
from pathlib import Path

import pytest

from app.inference.manifest import ModelArtifact, load_model_manifest
from scripts.benchmark import benchmark_quality
from scripts.download_models import download_artifact
from scripts.verify_models import verify_artifact, verify_models


def artifact(content: bytes = b"reviewed-model") -> ModelArtifact:
    return ModelArtifact(
        logical_name="face-detector",
        version="test-v1",
        filename="face-detector.onnx",
        sha256=hashlib.sha256(content).hexdigest(),
        size_bytes=len(content),
        source_url="https://models.example.test/face-detector.onnx",
        license_name="Reviewed License",
        license_url="https://models.example.test/license",
    )


def write_manifest(path: Path, model: ModelArtifact) -> None:
    path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "models": [
                    {
                        "logical_name": model.logical_name,
                        "version": model.version,
                        "filename": model.filename,
                        "sha256": model.sha256,
                        "size_bytes": model.size_bytes,
                        "source_url": model.source_url,
                        "license_name": model.license_name,
                        "license_url": model.license_url,
                    }
                ],
            }
        ),
        encoding="utf-8",
    )


def test_manifest_and_verifier_accept_exact_reviewed_artifact(tmp_path):
    content = b"reviewed-model"
    model = artifact(content)
    manifest_path = tmp_path / "manifest.json"
    write_manifest(manifest_path, model)
    (tmp_path / model.filename).write_bytes(content)

    manifest = load_model_manifest(manifest_path)
    report = verify_models(manifest_path, tmp_path)

    assert manifest.models == (model,)
    assert report["all_artifacts_verified"] is True
    assert report["ready"] is True


def test_empty_manifest_is_valid_but_not_model_ready(tmp_path):
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text('{"schema_version": 1, "models": []}', encoding="utf-8")

    report = verify_models(manifest_path, tmp_path)

    assert report["all_artifacts_verified"] is True
    assert report["ready"] is False


def test_verifier_rejects_checksum_mismatch(tmp_path):
    model = artifact()
    (tmp_path / model.filename).write_bytes(b"tampered-model")

    result = verify_artifact(model, tmp_path)

    assert result["status"] in {"size_mismatch", "checksum_mismatch"}


@pytest.mark.parametrize("filename", ["../model.onnx", "folder/model.onnx", "folder\\model.onnx"])
def test_manifest_rejects_model_path_traversal(filename):
    values = artifact().__dict__ | {"filename": filename}

    with pytest.raises(ValueError, match="basename"):
        ModelArtifact(**values)


class FakeResponse:
    def __init__(self, content: bytes) -> None:
        self._content = content
        self._position = 0

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def geturl(self) -> str:
        return "https://models.example.test/face-detector.onnx"

    def read(self, size: int) -> bytes:
        chunk = self._content[self._position : self._position + size]
        self._position += len(chunk)
        return chunk


def test_downloader_verifies_bytes_before_atomic_install(tmp_path, monkeypatch):
    content = b"reviewed-model"
    model = artifact(content)
    monkeypatch.setattr(
        "scripts.download_models.urlopen",
        lambda *_args, **_kwargs: FakeResponse(content),
    )

    download_artifact(model, tmp_path, timeout_seconds=1)

    assert (tmp_path / model.filename).read_bytes() == content
    assert not tuple(tmp_path.glob("*.partial"))


def test_synthetic_quality_benchmark_returns_timing_summary():
    report = benchmark_quality(2)

    assert report["rounds"] == 2
    assert report["mean_milliseconds"] > 0
    assert report["p95_milliseconds"] > 0
