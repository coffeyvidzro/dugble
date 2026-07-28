"""Placeholder routes for model-backed analysis operations."""

from typing import NoReturn

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import require_identity_enabled, require_internal_auth
from app.api.schemas import DocumentAnalysisRequest, FaceComparisonRequest, LivenessRequest

router = APIRouter(
    dependencies=[Depends(require_identity_enabled), Depends(require_internal_auth)],
)


def not_implemented(operation: str) -> NoReturn:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"{operation} is not implemented",
    )


@router.post("/v1/documents/analyze", response_model=None)
def analyze_document(_: DocumentAnalysisRequest) -> None:
    not_implemented("document analysis")


@router.post("/v1/faces/compare", response_model=None)
def compare_faces(_: FaceComparisonRequest) -> None:
    not_implemented("face comparison")


@router.post("/v1/liveness/check", response_model=None)
def check_liveness(_: LivenessRequest) -> None:
    not_implemented("liveness detection")
