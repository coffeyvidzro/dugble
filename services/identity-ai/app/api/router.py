"""Top-level API router composition."""

from fastapi import APIRouter

from .routes import analysis, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(analysis.router)
