import hashlib
import json

import cv2
import numpy as np
import onnxruntime as ort
import pytest

from app.inference.foundation import RuntimeManager, RuntimeModelBundle
from app.inference.manifest import ModelRuntime
from app.inference.runtime import ONNXRuntimeFactory, RuntimeFoundationError


def write_bundle(tmp_path, *, runtime: str = "onnx"):
    content = b"reviewed-model-placeholder"
    model_path = tmp_path / "face-detector.onnx"
    model_path.write_bytes(content)
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "models": [
                    {
                        "logical_name": "face-detector",
                        "version": "test-v1",
                        "filename": model_path.name,
                        "sha256": hashlib.sha256(content).hexdigest(),
                        "size_bytes": len(content),
                        "source_url": "https://models.example.test/face-detector.onnx",
                        "license_name": "Reviewed License",
                        "license_url": "https://models.example.test/license",
                        "runtime": runtime,
                    }
                ],
            }
        ),
        encoding="utf-8",
    )
    return manifest_path


def test_runtime_dependencies_import_with_expected_major_versions():
    assert int(np.__version__.split(".", 1)[0]) == 2
    assert int(cv2.__version__.split(".", 1)[0]) == 5
    assert int(ort.__version__.split(".", 1)[0]) == 1


def test_bundle_verifies_artifact_before_creating_onnx_session(tmp_path):
    manifest_path = write_bundle(tmp_path)
    created = []
    fake_session = object()

    def create_session(logical_name, version, path):
        created.append((logical_name, version, path))
        return fake_session

    bundle = RuntimeModelBundle.load(
        manifest_path,
        tmp_path,
        required_models=("face-detector",),
        providers=("CPUExecutionProvider",),
        session_factory=create_session,
    )

    assert bundle.version("face-detector") == "test-v1"
    assert bundle.onnx_session("face-detector") is fake_session
    assert created == [("face-detector", "test-v1", tmp_path / "face-detector.onnx")]


def test_external_artifact_cannot_report_ready_without_a_runtime_loader(tmp_path):
    manifest_path = write_bundle(tmp_path, runtime="external")

    with pytest.raises(RuntimeFoundationError, match="runtime loader is unavailable"):
        RuntimeModelBundle.load(
            manifest_path,
            tmp_path,
            required_models=("face-detector",),
            providers=("CPUExecutionProvider",),
            session_factory=lambda *_: pytest.fail("external model must not create ONNX session"),
        )


def test_bundle_initializes_registered_non_onnx_adapter(tmp_path):
    manifest_path = write_bundle(tmp_path, runtime="opencv")
    adapter = object()
    loaded = []

    def load_adapter(logical_name, version, path):
        loaded.append((logical_name, version, path))
        return adapter

    bundle = RuntimeModelBundle.load(
        manifest_path,
        tmp_path,
        required_models=("face-detector",),
        providers=("CPUExecutionProvider",),
        runtime_loaders={ModelRuntime.OPENCV: load_adapter},
    )

    assert bundle.adapter("face-detector") is adapter
    assert loaded == [("face-detector", "test-v1", tmp_path / "face-detector.onnx")]


def test_bundle_closes_initialized_adapters_when_a_later_runtime_is_unavailable(tmp_path):
    artifacts = []
    for logical_name, runtime in (
        ("face-detector", "opencv"),
        ("presentation-attack", "external"),
    ):
        content = f"{logical_name}-model".encode()
        model_path = tmp_path / f"{logical_name}.bin"
        model_path.write_bytes(content)
        artifacts.append(
            {
                "logical_name": logical_name,
                "version": "test-v1",
                "filename": model_path.name,
                "sha256": hashlib.sha256(content).hexdigest(),
                "size_bytes": len(content),
                "source_url": f"https://models.example.test/{model_path.name}",
                "license_name": "Reviewed License",
                "license_url": "https://models.example.test/license",
                "runtime": runtime,
            }
        )
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(
        json.dumps({"schema_version": 1, "models": artifacts}), encoding="utf-8"
    )

    class Adapter:
        closed = False

        def close(self):
            self.closed = True

    adapter = Adapter()

    with pytest.raises(RuntimeFoundationError, match="runtime loader is unavailable"):
        RuntimeModelBundle.load(
            manifest_path,
            tmp_path,
            required_models=("face-detector", "presentation-attack"),
            providers=("CPUExecutionProvider",),
            runtime_loaders={ModelRuntime.OPENCV: lambda *_: adapter},
        )

    assert adapter.closed is True


def test_bundle_closes_loaded_adapters():
    class Adapter:
        closed = False

        def close(self):
            self.closed = True

    adapter = Adapter()
    bundle = RuntimeModelBundle({}, {"face-landmarks": adapter}, {"face-landmarks": "v1"})

    bundle.close()

    assert adapter.closed is True


def test_bundle_composes_liveness_analyzer_from_runtime_adapters():
    class Tracker:
        model_version = "landmarks-v1"

        def observe(self, frames):
            return ()

    class AttackDetector:
        model_version = "pad-v1"

        def analyze(self, frames):
            raise AssertionError("not invoked while composing the service")

    bundle = RuntimeModelBundle(
        {},
        {"face-landmarks": Tracker(), "presentation-attack": AttackDetector()},
        {"face-landmarks": "landmarks-v1", "presentation-attack": "pad-v1"},
    )

    assert bundle.liveness_analysis_service(attack_threshold=0.5) is not None


def test_bundle_composes_minifas_from_onnx_session_and_face_detector():
    class Tracker:
        model_version = "landmarks-v1"

        def observe(self, frames):
            return ()

    class Detector:
        model_version = "detector-v1"

        def detect(self, image):
            return ()

    class PadSession:
        logical_name = "presentation-attack"
        model_version = "pad-v1"
        input_names = ("input",)
        output_names = ("output",)

        def run(self, inputs):
            return ()

    bundle = RuntimeModelBundle(
        {"presentation-attack": PadSession()},
        {"face-landmarks": Tracker(), "face-detector": Detector()},
        {
            "face-landmarks": "landmarks-v1",
            "face-detector": "detector-v1",
            "presentation-attack": "pad-v1",
        },
    )

    assert bundle.liveness_analysis_service(attack_threshold=0.5) is not None


def test_runtime_manager_reports_safe_error_when_required_models_are_absent(tmp_path):
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text('{"schema_version": 1, "models": []}', encoding="utf-8")
    manager = RuntimeManager()

    manager.initialize(
        enabled=True,
        manifest_path=manifest_path,
        model_dir=tmp_path,
        required_models=("face-detector",),
        providers=("CPUExecutionProvider",),
    )

    assert manager.ready is False
    assert manager.error_code == "model_runtime_unavailable"


def test_onnx_factory_rejects_unavailable_execution_provider():
    with pytest.raises(RuntimeFoundationError, match="unavailable"):
        ONNXRuntimeFactory(("ProviderThatDoesNotExist",))
