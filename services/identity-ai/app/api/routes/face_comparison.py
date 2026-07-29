"""Private route for optional one-to-one face comparison."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.analysis import IdentityAnalysisOperations
from app.api.dependencies import (
    get_analysis_operations,
    require_identity_enabled,
    require_internal_auth,
)
from app.api.schemas import FaceComparisonRequest, FaceComparisonResponse

router = APIRouter(
    dependencies=[Depends(require_identity_enabled), Depends(require_internal_auth)],
)


@router.post("/v1/faces/compare", response_model=FaceComparisonResponse)
def compare_faces(
    request: FaceComparisonRequest,
    operations: Annotated[IdentityAnalysisOperations, Depends(get_analysis_operations)],
) -> FaceComparisonResponse:
    evidence = operations.compare_faces(request)
    return FaceComparisonResponse.model_validate(evidence)
