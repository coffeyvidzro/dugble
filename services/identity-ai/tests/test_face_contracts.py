import math

import pytest

from app.contracts.face import BoundingBox, FaceDetection, FaceEmbedding, Point


def test_face_contracts_accept_valid_detector_and_embedding_evidence():
    detection = FaceDetection(
        bounding_box=BoundingBox(x=10, y=20, width=80, height=100),
        confidence=0.98,
        landmarks=(Point(30, 45), Point(65, 45)),
    )
    embedding = FaceEmbedding(values=(0.1, -0.2, 0.3), model_version="sface-v1")

    assert detection.confidence == 0.98
    assert embedding.model_version == "sface-v1"


@pytest.mark.parametrize(
    "values",
    [(), (math.inf,), (math.nan,)],
)
def test_face_embedding_rejects_invalid_values(values):
    with pytest.raises(ValueError):
        FaceEmbedding(values=values, model_version="sface-v1")


def test_bounding_box_rejects_non_positive_dimensions():
    with pytest.raises(ValueError, match="dimensions must be positive"):
        BoundingBox(x=0, y=0, width=0, height=20)
