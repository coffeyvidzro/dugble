"""Top-level API router composition."""

from fastapi import APIRouter

from .routes import face_comparison, health, liveness

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(face_comparison.router)
api_router.include_router(liveness.router)
