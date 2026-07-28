"""Concrete ONNX Runtime session creation and execution."""

from collections.abc import Mapping, Sequence
from pathlib import Path

import numpy as np
import onnxruntime as ort
from numpy.typing import NDArray


class RuntimeFoundationError(RuntimeError):
    """Raised when a reviewed model cannot be initialized safely."""


class ONNXModelSession:
    def __init__(self, logical_name: str, version: str, session: ort.InferenceSession) -> None:
        self.logical_name = logical_name
        self.model_version = version
        self._session = session

    @property
    def input_names(self) -> tuple[str, ...]:
        return tuple(item.name for item in self._session.get_inputs())

    @property
    def output_names(self) -> tuple[str, ...]:
        return tuple(item.name for item in self._session.get_outputs())

    def run(self, inputs: Mapping[str, NDArray[np.generic]]) -> tuple[NDArray[np.generic], ...]:
        if set(inputs) != set(self.input_names):
            raise ValueError(f"model inputs must be {sorted(self.input_names)}")
        outputs = self._session.run(list(self.output_names), dict(inputs))
        return tuple(np.asarray(output) for output in outputs)


class ONNXRuntimeFactory:
    def __init__(self, providers: Sequence[str] = ("CPUExecutionProvider",)) -> None:
        requested = tuple(dict.fromkeys(providers))
        if not requested:
            raise ValueError("at least one ONNX execution provider is required")
        available = set(ort.get_available_providers())
        unavailable = tuple(provider for provider in requested if provider not in available)
        if unavailable:
            raise RuntimeFoundationError(
                f"ONNX execution providers are unavailable: {', '.join(unavailable)}"
            )
        self.providers = requested

    def create(self, logical_name: str, version: str, path: Path) -> ONNXModelSession:
        options = ort.SessionOptions()
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        options.enable_mem_pattern = True
        options.enable_cpu_mem_arena = True
        try:
            session = ort.InferenceSession(
                str(path),
                sess_options=options,
                providers=list(self.providers),
            )
        except Exception as error:
            raise RuntimeFoundationError(
                f"failed to initialize ONNX model: {logical_name}"
            ) from error
        return ONNXModelSession(logical_name, version, session)
