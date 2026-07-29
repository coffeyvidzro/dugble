"""Shared FastAPI dependencies for private analysis endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import Header, HTTPException, Request, status

from app.api.analysis import IdentityAnalysisOperations
from app.core.config import get_settings
from app.core.security import valid_bearer_credential


def require_identity_enabled() -> None:
    if not get_settings().identity_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="identity analysis is disabled",
        )


def require_internal_auth(
    authorization: Annotated[str | None, Header()] = None,
) -> None:
    api_key = get_settings().api_key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="identity AI authentication is not configured",
        )
    if not valid_bearer_credential(authorization, api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid internal credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_analysis_operations(request: Request) -> IdentityAnalysisOperations:
    operations = getattr(request.app.state, "analysis_operations", None)
    if operations is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="identity analysis operations are unavailable",
        )
    return operations
