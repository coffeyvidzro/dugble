from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


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
        "/v1/documents/analyze",
        headers={"Authorization": "Bearer test-key"},
        json={
            "verification_id": "verification-1",
            "object_key": "documents/id.png",
            "document_type": "passport",
            "country_code": "GH",
        },
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "identity analysis is disabled"}


def test_enabled_endpoint_authenticates_before_not_implemented(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")

    unauthorized = client.post(
        "/v1/documents/analyze",
        json={
            "verification_id": "verification-1",
            "object_key": "documents/id.png",
            "document_type": "passport",
            "country_code": "GH",
        },
    )
    authenticated = client.post(
        "/v1/documents/analyze",
        headers={"Authorization": "Bearer test-key"},
        json={
            "verification_id": "verification-1",
            "object_key": "documents/id.png",
            "document_type": "passport",
            "country_code": "GH",
        },
    )

    assert unauthorized.status_code == 401
    assert authenticated.status_code == 501
