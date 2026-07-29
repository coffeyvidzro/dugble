"""Private HTTP application factory for Dugble's identity analysis service."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.analysis import IdentityAnalysisOperations
from app.api.router import api_router
from app.core.config import get_settings
from app.inference.foundation import RuntimeManager


def create_app(
    runtime_manager: RuntimeManager | None = None,
    analysis_operations: IdentityAnalysisOperations | None = None,
) -> FastAPI:
    manager = runtime_manager or RuntimeManager()

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        settings = get_settings()
        manager.initialize(
            enabled=settings.identity_enabled,
            manifest_path=settings.model_manifest,
            model_dir=settings.model_dir,
            required_models=settings.required_models,
            providers=settings.onnx_providers,
        )
        try:
            yield
        finally:
            manager.close()

    application = FastAPI(
        title="Dugble Identity AI",
        version="0.1.0",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=lifespan,
    )
    application.state.runtime_manager = manager
    application.state.analysis_operations = analysis_operations
    application.include_router(api_router)
    return application


app = create_app()
