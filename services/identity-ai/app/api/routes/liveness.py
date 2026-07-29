"""Private route for facial liveness session analysis."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.analysis import IdentityAnalysisOperations
from app.api.dependencies import (
    get_analysis_operations,
    require_identity_enabled,
    require_internal_auth,
)
from app.api.schemas import LivenessRequest, LivenessResponse

router = APIRouter(
    dependencies=[Depends(require_identity_enabled), Depends(require_internal_auth)],
)


@router.post("/v1/liveness/check", response_model=LivenessResponse)
def check_liveness(
    request: LivenessRequest,
    operations: Annotated[IdentityAnalysisOperations, Depends(get_analysis_operations)],
) -> LivenessResponse:
    evidence = operations.check_liveness(request)
    return LivenessResponse.model_validate(evidence)
