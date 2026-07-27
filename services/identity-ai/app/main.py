"""Private HTTP entrypoint for Dugble's identity analysis service."""

from __future__ import annotations

import os
import secrets
from typing import Annotated, NoReturn

from fastapi import Depends, FastAPI, Header, HTTPException, status
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


def require_internal_auth(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    configured_key = os.getenv("IDENTITY_API_KEY", "").strip()
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/v1/documents/analyze",
    dependencies=[Depends(require_internal_auth)],
    response_model=None,
)
def analyze_document(_: DocumentAnalysisRequest) -> None:
    not_implemented("document analysis")


@app.post(
    "/v1/faces/compare",
    dependencies=[Depends(require_internal_auth)],
    response_model=None,
)
def compare_faces(_: FaceComparisonRequest) -> None:
    not_implemented("face comparison")


@app.post(
    "/v1/liveness/check",
    dependencies=[Depends(require_internal_auth)],
    response_model=None,
)
def check_liveness(_: LivenessRequest) -> None:
    not_implemented("liveness detection")
