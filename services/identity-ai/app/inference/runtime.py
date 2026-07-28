"""Runtime-neutral model session contract for future ONNX Runtime adapters."""

from collections.abc import Mapping, Sequence
from typing import Protocol


class InferenceSession(Protocol):
    @property
    def model_version(self) -> str: ...

    def run(self, inputs: Mapping[str, Sequence[float]]) -> Mapping[str, Sequence[float]]: ...
