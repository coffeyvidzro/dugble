"""Pure similarity calculations for facial embeddings."""

from math import fsum, sqrt

from app.contracts.face import FaceEmbedding

from .exceptions import IncompatibleEmbeddingError


def cosine_similarity(first: FaceEmbedding, second: FaceEmbedding) -> float:
    if first.model_version != second.model_version:
        raise IncompatibleEmbeddingError("face embeddings use different model versions")
    if len(first.values) != len(second.values):
        raise IncompatibleEmbeddingError("face embeddings use different dimensions")

    first_norm = sqrt(fsum(value * value for value in first.values))
    second_norm = sqrt(fsum(value * value for value in second.values))
    if first_norm == 0 or second_norm == 0:
        raise IncompatibleEmbeddingError("face embeddings must have non-zero magnitude")

    dot_product = fsum(a * b for a, b in zip(first.values, second.values, strict=True))
    return max(-1.0, min(1.0, dot_product / (first_norm * second_norm)))
