"""Verified process-level model bundle initialization."""

from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from types import MappingProxyType
from typing import Any

from app.inference.artifacts import verify_artifact
from app.inference.manifest import ModelRuntime, load_model_manifest
from app.inference.runtime import ONNXModelSession, ONNXRuntimeFactory, RuntimeFoundationError

SessionFactory = Callable[[str, str, Path], ONNXModelSession]
RuntimeLoader = Callable[[str, str, Path], object]


class RuntimeModelBundle:
    def __init__(
        self,
        sessions: dict[str, ONNXModelSession],
        adapters: dict[str, object],
        versions: dict[str, str],
    ) -> None:
        self._sessions = MappingProxyType(sessions.copy())
        self._adapters = MappingProxyType(adapters.copy())
        self._versions = MappingProxyType(versions.copy())

    @property
    def logical_names(self) -> tuple[str, ...]:
        return tuple(self._versions)

    def version(self, logical_name: str) -> str:
        try:
            return self._versions[logical_name]
        except KeyError as error:
            raise KeyError(f"model is not loaded: {logical_name}") from error

    def onnx_session(self, logical_name: str) -> ONNXModelSession:
        try:
            return self._sessions[logical_name]
        except KeyError as error:
            raise KeyError(f"ONNX model is not loaded: {logical_name}") from error

    def adapter(self, logical_name: str) -> object:
        try:
            return self._adapters[logical_name]
        except KeyError as error:
            raise KeyError(f"model adapter is not loaded: {logical_name}") from error

    def face_comparison_service(self):
        from app.face.detector import FaceDetector
        from app.face.embedder import FaceEmbedder
        from app.face.service import FaceComparisonService

        detector = self.adapter("face-detector")
        embedder = self.adapter("face-embedder")
        if not isinstance(detector, FaceDetector) or not isinstance(embedder, FaceEmbedder):
            raise RuntimeFoundationError("face model adapters do not satisfy their contracts")
        return FaceComparisonService(detector, embedder)

    @classmethod
    def load(
        cls,
        manifest_path: Path,
        model_dir: Path,
        *,
        required_models: Sequence[str],
        providers: Sequence[str],
        session_factory: SessionFactory | None = None,
        runtime_loaders: Mapping[ModelRuntime, RuntimeLoader] | None = None,
    ) -> RuntimeModelBundle:
        required_names = tuple(dict.fromkeys(required_models))
        if not required_names:
            raise RuntimeFoundationError("at least one required model must be configured")
        if len(required_names) != len(tuple(required_models)):
            raise RuntimeFoundationError("required model names must be unique")
        manifest = load_model_manifest(manifest_path)
        artifacts = {artifact.logical_name: artifact for artifact in manifest.models}
        missing = tuple(name for name in required_names if name not in artifacts)
        if missing:
            raise RuntimeFoundationError(f"required models are absent: {', '.join(missing)}")

        create_session = session_factory
        loaders = dict(runtime_loaders or {})
        if ModelRuntime.OPENCV not in loaders:
            from app.face.opencv_models import load_opencv_face_model

            loaders[ModelRuntime.OPENCV] = load_opencv_face_model
        sessions: dict[str, ONNXModelSession] = {}
        adapters: dict[str, object] = {}
        versions: dict[str, str] = {}
        for name in required_names:
            artifact = artifacts[name]
            verification = verify_artifact(artifact, model_dir)
            if verification["status"] != "verified":
                raise RuntimeFoundationError(
                    f"model artifact failed verification: {name} ({verification['status']})"
                )
            versions[name] = artifact.version
            if artifact.runtime is ModelRuntime.ONNX:
                if create_session is None:
                    create_session = ONNXRuntimeFactory(providers).create
                sessions[name] = create_session(
                    name,
                    artifact.version,
                    model_dir / artifact.filename,
                )
            else:
                loader = loaders.get(artifact.runtime)
                if loader is None:
                    raise RuntimeFoundationError(
                        f"runtime loader is unavailable for required model: {name}"
                    )
                try:
                    adapters[name] = loader(name, artifact.version, model_dir / artifact.filename)
                except (OSError, ValueError, RuntimeError) as error:
                    raise RuntimeFoundationError(
                        f"failed to initialize model adapter: {name}"
                    ) from error
        return cls(sessions, adapters, versions)


class RuntimeManager:
    def __init__(self) -> None:
        self.bundle: RuntimeModelBundle | None = None
        self.error_code: str | None = None
        self.initialized = False

    @property
    def ready(self) -> bool:
        return self.initialized and self.bundle is not None and self.error_code is None

    def initialize(
        self,
        *,
        enabled: bool,
        manifest_path: Path,
        model_dir: Path,
        required_models: Sequence[str],
        providers: Sequence[str],
        session_factory: SessionFactory | None = None,
        runtime_loaders: Mapping[ModelRuntime, RuntimeLoader] | None = None,
    ) -> None:
        self.initialized = True
        self.bundle = None
        self.error_code = None
        if not enabled:
            return
        try:
            self.bundle = RuntimeModelBundle.load(
                manifest_path,
                model_dir,
                required_models=required_models,
                providers=providers,
                session_factory=session_factory,
                runtime_loaders=runtime_loaders,
            )
        except OSError, ValueError, RuntimeFoundationError:
            self.error_code = "model_runtime_unavailable"

    def close(self) -> None:
        self.bundle = None
        self.error_code = None
        self.initialized = False


def runtime_status(manager: Any, *, enabled: bool) -> tuple[bool, str]:
    if not enabled:
        return True, "disabled"
    if not isinstance(manager, RuntimeManager) or not manager.initialized:
        return False, "not_initialized"
    if not manager.ready:
        return False, manager.error_code or "not_ready"
    return True, "ready"
