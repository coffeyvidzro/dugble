"""Placeholder route for facial liveness session analysis."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import require_identity_enabled, require_internal_auth
from app.api.schemas import LivenessRequest

router = APIRouter(
    dependencies=[Depends(require_identity_enabled), Depends(require_internal_auth)],
)


@router.post("/v1/liveness/check", response_model=None)
def check_liveness(_: LivenessRequest) -> None:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="liveness detection is not implemented",
    )
