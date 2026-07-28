from fastapi.testclient import TestClient

from app.main import create_app

client = TestClient(create_app())


def test_application_disables_public_api_documentation():
    application = create_app()

    assert application.docs_url is None
    assert application.redoc_url is None
    assert application.openapi_url is None


def test_health_is_liveness_probe(monkeypatch):
    monkeypatch.delenv("IDENTITY_AI_ENABLED", raising=False)
    monkeypatch.delenv("IDENTITY_AI_API_KEY", raising=False)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_succeeds_when_service_is_disabled(monkeypatch):
    monkeypatch.delenv("IDENTITY_AI_ENABLED", raising=False)
    monkeypatch.delenv("IDENTITY_AI_API_KEY", raising=False)

    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "enabled": False,
        "authentication_configured": False,
    }


def test_readiness_fails_when_enabled_without_api_key(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.delenv("IDENTITY_AI_API_KEY", raising=False)

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "not_ready",
        "enabled": True,
        "authentication_configured": False,
    }


def test_readiness_succeeds_when_enabled_and_configured(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")

    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "enabled": True,
        "authentication_configured": True,
    }


def test_analysis_endpoint_is_unavailable_when_disabled(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "false")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")

    response = client.post(
        "/v1/liveness/check",
        headers={"Authorization": "Bearer test-key"},
        json={
            "verification_id": "verification-1",
            "session_id": "session-1",
            "video_object_key": "captures/session.mp4",
        },
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "identity analysis is disabled"}


def test_enabled_endpoint_authenticates_before_not_implemented(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")

    unauthorized = client.post(
        "/v1/liveness/check",
        json={
            "verification_id": "verification-1",
            "session_id": "session-1",
            "video_object_key": "captures/session.mp4",
        },
    )
    authenticated = client.post(
        "/v1/liveness/check",
        headers={"Authorization": "Bearer test-key"},
        json={
            "verification_id": "verification-1",
            "session_id": "session-1",
            "video_object_key": "captures/session.mp4",
        },
    )

    assert unauthorized.status_code == 401
    assert authenticated.status_code == 501


def test_country_specific_document_endpoint_is_not_exposed():
    response = client.post("/v1/documents/analyze", json={})

    assert response.status_code == 404
