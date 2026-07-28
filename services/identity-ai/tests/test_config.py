from app.core.config import Settings


def test_settings_parse_enabled_values_and_strip_api_key():
    settings = Settings.from_environment(
        {"IDENTITY_AI_ENABLED": " YES ", "IDENTITY_AI_API_KEY": " secret "}
    )

    assert settings.identity_enabled is True
    assert settings.api_key == "secret"
    assert settings.authentication_configured is True


def test_settings_default_to_disabled_and_unconfigured():
    settings = Settings.from_environment({})

    assert settings.identity_enabled is False
    assert settings.api_key == ""
    assert settings.authentication_configured is False


def test_settings_parse_model_runtime_configuration():
    settings = Settings.from_environment(
        {
            "IDENTITY_AI_MODEL_MANIFEST": "/runtime/manifest.json",
            "IDENTITY_AI_MODEL_DIR": "/runtime/models",
            "IDENTITY_AI_REQUIRED_MODELS": "detector, embedder,detector",
            "IDENTITY_AI_ONNX_PROVIDERS": "CUDAExecutionProvider,CPUExecutionProvider",
        }
    )

    assert str(settings.model_manifest) == "/runtime/manifest.json"
    assert str(settings.model_dir) == "/runtime/models"
    assert settings.required_models == ("detector", "embedder")
    assert settings.onnx_providers == ("CUDAExecutionProvider", "CPUExecutionProvider")
