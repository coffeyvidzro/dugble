"""Validated manifest for externally managed model artifacts."""

from __future__ import annotations

import json
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path, PurePath
from urllib.parse import urlparse


class ModelRuntime(StrEnum):
    ONNX = "onnx"
    EXTERNAL = "external"


@dataclass(frozen=True)
class ModelArtifact:
    logical_name: str
    version: str
    filename: str
    sha256: str
    size_bytes: int
    source_url: str
    license_name: str
    license_url: str
    runtime: ModelRuntime = ModelRuntime.ONNX

    def __post_init__(self) -> None:
        text_values = (
            self.logical_name,
            self.version,
            self.filename,
            self.source_url,
            self.license_name,
            self.license_url,
        )
        if not all(isinstance(value, str) and value.strip() for value in text_values):
            raise ValueError("model manifest text fields must not be empty")
        path = PurePath(self.filename)
        if (
            path.name != self.filename
            or self.filename in {".", ".."}
            or "/" in self.filename
            or "\\" in self.filename
        ):
            raise ValueError("model filename must be a basename")
        if (
            not isinstance(self.sha256, str)
            or len(self.sha256) != 64
            or any(character not in "0123456789abcdef" for character in self.sha256)
        ):
            raise ValueError("model SHA-256 must be 64 lowercase hexadecimal characters")
        if (
            not isinstance(self.size_bytes, int)
            or isinstance(self.size_bytes, bool)
            or self.size_bytes <= 0
        ):
            raise ValueError("model size must be positive")
        source = urlparse(self.source_url)
        license_source = urlparse(self.license_url)
        if source.scheme != "https" or not source.netloc:
            raise ValueError("model source URL must use HTTPS")
        if license_source.scheme != "https" or not license_source.netloc:
            raise ValueError("model license URL must use HTTPS")
        if not isinstance(self.runtime, ModelRuntime):
            raise ValueError("model runtime must be a supported value")


@dataclass(frozen=True)
class ModelManifest:
    schema_version: int
    models: tuple[ModelArtifact, ...]

    def __post_init__(self) -> None:
        if not isinstance(self.schema_version, int) or isinstance(self.schema_version, bool):
            raise ValueError("model manifest schema version must be an integer")
        if self.schema_version != 1:
            raise ValueError("unsupported model manifest schema version")
        names = tuple(model.logical_name for model in self.models)
        filenames = tuple(model.filename for model in self.models)
        if len(set(names)) != len(names):
            raise ValueError("model logical names must be unique")
        if len(set(filenames)) != len(filenames):
            raise ValueError("model filenames must be unique")


def load_model_manifest(path: str | Path) -> ModelManifest:
    manifest_path = Path(path)
    raw = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or set(raw) != {"schema_version", "models"}:
        raise ValueError("model manifest must contain only schema_version and models")
    if not isinstance(raw["models"], list):
        raise ValueError("model manifest models must be a list")
    try:
        artifacts = tuple(
            ModelArtifact(
                **(
                    entry
                    | {
                        "runtime": ModelRuntime(entry.get("runtime", ModelRuntime.ONNX)),
                    }
                )
            )
            for entry in raw["models"]
        )
    except (TypeError, ValueError) as error:
        raise ValueError("model manifest entry has invalid fields") from error
    return ModelManifest(schema_version=raw["schema_version"], models=artifacts)
