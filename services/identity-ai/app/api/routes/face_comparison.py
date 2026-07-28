"""Placeholder route for optional one-to-one face comparison."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import require_identity_enabled, require_internal_auth
from app.api.schemas import FaceComparisonRequest

router = APIRouter(
    dependencies=[Depends(require_identity_enabled), Depends(require_internal_auth)],
)


@router.post("/v1/faces/compare", response_model=None)
def compare_faces(_: FaceComparisonRequest) -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="face comparison is not implemented",
    )
