"""Process health and service readiness probes."""

from fastapi import APIRouter, Response, status

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def readiness(response: Response) -> dict[str, str | bool]:
    settings = get_settings()
    ready = not settings.identity_enabled or settings.authentication_configured
    if not ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if ready else "not_ready",
        "enabled": settings.identity_enabled,
        "authentication_configured": settings.authentication_configured,
    }
