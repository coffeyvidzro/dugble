"""Validated environment-backed service configuration."""

from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass

_TRUE_VALUES = frozenset({"1", "true", "yes", "on"})


@dataclass(frozen=True)
class Settings:
    identity_enabled: bool = False
    api_key: str = ""

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
        )


def get_settings() -> Settings:
    """Read settings per request so deployments and tests observe current configuration."""

    return Settings.from_environment()
