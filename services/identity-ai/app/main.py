from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Dugble Identity AI", version="0.1.0")


class DocumentRequest(BaseModel):
    verification_id: str
    object_key: str
    document_type: str
    country_code: str


class FaceRequest(BaseModel):
    verification_id: str
    document_face_key: str
    selfie_key: str


class LivenessRequest(BaseModel):
    verification_id: str
    video_object_key: str
    challenge: list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/documents/analyze")
def analyze_document(_: DocumentRequest) -> None:
    raise HTTPException(status_code=501, detail="document analyzer not implemented")


@app.post("/v1/faces/compare")
def compare_faces(_: FaceRequest) -> None:
    raise HTTPException(status_code=501, detail="face comparison not implemented")


@app.post("/v1/liveness/check")
def check_liveness(_: LivenessRequest) -> None:
    raise HTTPException(status_code=501, detail="liveness detection not implemented")
