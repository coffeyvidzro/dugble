from fastapi.testclient import TestClient

from app.contracts.face import FaceComparisonEvidence
from app.contracts.liveness import (
    ActiveChallengeEvidence,
    ChallengeAction,
    ChallengeStepEvidence,
    LivenessSessionEvidence,
)
from app.contracts.presentation_attack import (
    PresentationAttackEvidence,
    PresentationAttackSignal,
    PresentationAttackType,
)
from app.inference.foundation import RuntimeManager, RuntimeModelBundle
from app.main import create_app

client = TestClient(create_app())


class StubAnalysisOperations:
    def __init__(self) -> None:
        self.face_request = None
        self.liveness_request = None

    def compare_faces(self, request):
        self.face_request = request
        return FaceComparisonEvidence(0.75, "detector-v1", "embedder-v1")

    def check_liveness(self, request):
        self.liveness_request = request
        challenge = ActiveChallengeEvidence(
            challenge_id=request.session_id,
            verification_id=request.verification_id,
            challenge_completed=True,
            completion_ratio=1.0,
            steps=(ChallengeStepEvidence(ChallengeAction.TURN_LEFT, True, 2),),
            reasons=(),
            landmark_model_version="landmarks-v1",
        )
        attack = PresentationAttackEvidence(
            signals=(
                PresentationAttackSignal(PresentationAttackType.TWO_DIMENSIONAL, 0.1),
            ),
            model_version="attack-v1",
        )
        return LivenessSessionEvidence(challenge, attack, 0.5, False, ())


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
        "models_ready": False,
        "model_status": "disabled",
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
        "models_ready": False,
        "model_status": "not_initialized",
    }


def test_readiness_fails_when_enabled_and_models_are_not_initialized(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")

    response = client.get("/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "not_ready",
        "enabled": True,
        "authentication_configured": True,
        "models_ready": False,
        "model_status": "not_initialized",
    }


def test_readiness_succeeds_when_authentication_and_models_are_ready(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")
    manager = RuntimeManager()
    manager.initialized = True
    manager.bundle = RuntimeModelBundle({}, {}, {"face-detector": "test-v1"})
    ready_client = TestClient(create_app(manager))

    response = ready_client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "enabled": True,
        "authentication_configured": True,
        "models_ready": True,
        "model_status": "ready",
    }


def test_lifespan_reports_runtime_unavailable_for_empty_reviewed_manifest(monkeypatch, tmp_path):
    manifest = tmp_path / "manifest.json"
    manifest.write_text('{"schema_version": 1, "models": []}', encoding="utf-8")
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")
    monkeypatch.setenv("IDENTITY_AI_MODEL_MANIFEST", str(manifest))
    monkeypatch.setenv("IDENTITY_AI_MODEL_DIR", str(tmp_path))

    with TestClient(create_app()) as lifespan_client:
        response = lifespan_client.get("/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "not_ready",
        "enabled": True,
        "authentication_configured": True,
        "models_ready": False,
        "model_status": "model_runtime_unavailable",
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


def test_enabled_endpoint_authenticates_before_resolving_operations(monkeypatch):
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
    assert authenticated.status_code == 503
    assert authenticated.json() == {"detail": "identity analysis operations are unavailable"}


def test_analysis_endpoints_return_versioned_evidence(monkeypatch):
    monkeypatch.setenv("IDENTITY_AI_ENABLED", "true")
    monkeypatch.setenv("IDENTITY_AI_API_KEY", "test-key")
    operations = StubAnalysisOperations()
    analysis_client = TestClient(create_app(analysis_operations=operations))
    headers = {"Authorization": "Bearer test-key"}

    face_response = analysis_client.post(
        "/v1/faces/compare",
        headers=headers,
        json={
            "verification_id": "verification-1",
            "reference_face_key": "faces/reference.jpg",
            "probe_face_key": "faces/probe.jpg",
        },
    )
    liveness_response = analysis_client.post(
        "/v1/liveness/check",
        headers=headers,
        json={
            "verification_id": "verification-1",
            "session_id": "session-1",
            "video_object_key": "captures/session.mp4",
        },
    )

    assert face_response.status_code == 200
    assert face_response.json() == {
        "similarity": 0.75,
        "detector_version": "detector-v1",
        "embedding_model_version": "embedder-v1",
    }
    assert operations.face_request.reference_face_key == "faces/reference.jpg"
    assert liveness_response.status_code == 200
    assert liveness_response.json() == {
        "challenge": {
            "challenge_id": "session-1",
            "verification_id": "verification-1",
            "challenge_completed": True,
            "completion_ratio": 1.0,
            "steps": [
                {"action": "turn_left", "observed": True, "matching_observations": 2}
            ],
            "reasons": [],
            "landmark_model_version": "landmarks-v1",
        },
        "presentation_attack": {
            "signals": [{"attack_type": "two_dimensional", "score": 0.1}],
            "model_version": "attack-v1",
        },
        "attack_threshold": 0.5,
        "attack_suspected": False,
        "reasons": [],
    }
    assert operations.liveness_request.video_object_key == "captures/session.mp4"


def test_country_specific_document_endpoint_is_not_exposed():
    response = client.post("/v1/documents/analyze", json={})

    assert response.status_code == 404
