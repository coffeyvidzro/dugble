"""Process health and service readiness probes."""

from fastapi import APIRouter, Request, Response, status

from app.core.config import get_settings
from app.inference.foundation import RuntimeManager, runtime_status

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def readiness(request: Request, response: Response) -> dict[str, str | bool]:
    settings = get_settings()
    manager = getattr(request.app.state, "runtime_manager", None)
    runtime_operational, model_status = runtime_status(
        manager,
        enabled=settings.identity_enabled,
    )
    models_ready = isinstance(manager, RuntimeManager) and manager.ready
    ready = not settings.identity_enabled or (
        settings.authentication_configured and runtime_operational
    )
    if not ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if ready else "not_ready",
        "enabled": settings.identity_enabled,
        "authentication_configured": settings.authentication_configured,
        "models_ready": models_ready,
        "model_status": model_status,
    }
