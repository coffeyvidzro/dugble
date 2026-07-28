"""Private HTTP entrypoint for Dugble's identity analysis service."""

from __future__ import annotations

import os
import secrets
from typing import Annotated, NoReturn

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from pydantic import BaseModel, Field

app = FastAPI(
    title="Dugble Identity AI",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


class DocumentAnalysisRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    object_key: str = Field(min_length=1)
    document_type: str = Field(min_length=1)
    country_code: str = Field(min_length=2, max_length=2)


class FaceComparisonRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    document_face_key: str = Field(min_length=1)
    selfie_key: str = Field(min_length=1)


class LivenessRequest(BaseModel):
    verification_id: str = Field(min_length=1)
    video_object_key: str = Field(min_length=1)
    challenge: list[str] = Field(min_length=1)


def identity_enabled() -> bool:
    return os.getenv("IDENTITY_AI_ENABLED", "false").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def configured_api_key() -> str:
    return os.getenv("IDENTITY_AI_API_KEY", "").strip()


def require_identity_enabled() -> None:
    if not identity_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="identity analysis is disabled",
        )


def require_internal_auth(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    configured_key = configured_api_key()
    if not configured_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="identity AI authentication is not configured",
        )

    scheme, separator, supplied_key = (authorization or "").partition(" ")
    authenticated = (
        separator == " "
        and scheme.lower() == "bearer"
        and secrets.compare_digest(supplied_key, configured_key)
    )
    if not authenticated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid internal credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def not_implemented(operation: str) -> NoReturn:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"{operation} is not implemented",
    )


analysis_dependencies = [
    Depends(require_identity_enabled),
    Depends(require_internal_auth),
]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
def readiness(response: Response) -> dict[str, str | bool]:
    enabled = identity_enabled()
    authenticated = bool(configured_api_key())
    ready = not enabled or authenticated
    if not ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if ready else "not_ready",
        "enabled": enabled,
        "authentication_configured": authenticated,
    }


@app.post(
    "/v1/documents/analyze",
    dependencies=analysis_dependencies,
    response_model=None,
)
def analyze_document(_: DocumentAnalysisRequest) -> None:
    not_implemented("document analysis")


@app.post(
    "/v1/faces/compare",
    dependencies=analysis_dependencies,
    response_model=None,
)
def compare_faces(_: FaceComparisonRequest) -> None:
    not_implemented("face comparison")


@app.post(
    "/v1/liveness/check",
    dependencies=analysis_dependencies,
    response_model=None,
)
def check_liveness(_: LivenessRequest) -> None:
    not_implemented("liveness detection")
