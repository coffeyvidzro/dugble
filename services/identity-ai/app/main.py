"""Private HTTP application factory for Dugble's identity analysis service."""

from fastapi import FastAPI

from app.api.router import api_router


def create_app() -> FastAPI:
    application = FastAPI(
        title="Dugble Identity AI",
        version="0.1.0",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    application.include_router(api_router)
    return application


app = create_app()
