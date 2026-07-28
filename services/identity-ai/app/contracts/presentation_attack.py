"""Evidence contracts for supported facial presentation attacks."""

from dataclasses import dataclass
from enum import StrEnum
from math import isfinite


class PresentationAttackType(StrEnum):
    TWO_DIMENSIONAL = "two_dimensional"
    PRINT = "print"
    SCREEN_REPLAY = "screen_replay"
    VIDEO_REPLAY = "video_replay"
    MASK = "mask"
    CAMERA_INJECTION = "camera_injection"
    SYNTHETIC_MEDIA = "synthetic_media"


@dataclass(frozen=True)
class PresentationAttackSignal:
    attack_type: PresentationAttackType
    score: float

    def __post_init__(self) -> None:
        if not isfinite(self.score) or not 0 <= self.score <= 1:
            raise ValueError("presentation-attack score must be within 0..1")


@dataclass(frozen=True)
class PresentationAttackEvidence:
    signals: tuple[PresentationAttackSignal, ...]
    model_version: str

    def __post_init__(self) -> None:
        if not self.signals:
            raise ValueError("presentation-attack evidence must contain signals")
        if not self.model_version.strip():
            raise ValueError("presentation-attack model version must not be empty")
        attack_types = tuple(signal.attack_type for signal in self.signals)
        if len(set(attack_types)) != len(attack_types):
            raise ValueError("presentation-attack signals must not contain duplicates")
