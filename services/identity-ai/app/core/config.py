"""Validated environment-backed service configuration."""

from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path

_TRUE_VALUES = frozenset({"1", "true", "yes", "on"})
_DEFAULT_REQUIRED_MODELS = (
    "face-detector",
    "face-embedder",
    "face-landmarks",
    "presentation-attack",
)


def _csv(values: Mapping[str, str], name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    raw = values.get(name)
    if raw is None:
        return default
    parsed = tuple(dict.fromkeys(item.strip() for item in raw.split(",") if item.strip()))
    if not parsed:
        raise ValueError(f"{name} must contain at least one value")
    return parsed


def _path(values: Mapping[str, str], name: str, default: str) -> Path:
    raw = values.get(name, default).strip()
    if not raw:
        raise ValueError(f"{name} must not be empty")
    return Path(raw)


@dataclass(frozen=True)
class Settings:
    identity_enabled: bool = False
    api_key: str = ""
    model_manifest: Path = Path("models/manifest.json")
    model_dir: Path = Path("models")
    required_models: tuple[str, ...] = _DEFAULT_REQUIRED_MODELS
    onnx_providers: tuple[str, ...] = ("CPUExecutionProvider",)

    @property
    def authentication_configured(self) -> bool:
        return bool(self.api_key)

    @classmethod
    def from_environment(cls, environment: Mapping[str, str] | None = None) -> Settings:
        values = os.environ if environment is None else environment
        enabled = values.get("IDENTITY_AI_ENABLED", "false").strip().lower()
        return cls(
            identity_enabled=enabled in _TRUE_VALUES,
            api_key=values.get("IDENTITY_AI_API_KEY", "").strip(),
            model_manifest=_path(
                values,
                "IDENTITY_AI_MODEL_MANIFEST",
                "models/manifest.json",
            ),
            model_dir=_path(values, "IDENTITY_AI_MODEL_DIR", "models"),
            required_models=_csv(
                values,
                "IDENTITY_AI_REQUIRED_MODELS",
                _DEFAULT_REQUIRED_MODELS,
            ),
            onnx_providers=_csv(
                values,
                "IDENTITY_AI_ONNX_PROVIDERS",
                ("CPUExecutionProvider",),
            ),
        )


def get_settings() -> Settings:
    """Read settings per request so deployments and tests observe current configuration."""

    return Settings.from_environment()
