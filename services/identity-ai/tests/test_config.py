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
