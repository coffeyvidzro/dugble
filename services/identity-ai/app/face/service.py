"""Orchestration for one-to-one face comparison."""

from PIL import Image

from app.contracts.face import FaceComparisonEvidence, FaceEmbedding
from app.imaging import ImageSource, decode_image, normalize_image

from .detector import FaceDetector
from .embedder import FaceEmbedder
from .exceptions import FaceCountError
from .similarity import cosine_similarity


class FaceComparisonService:
    def __init__(self, detector: FaceDetector, embedder: FaceEmbedder) -> None:
        self._detector = detector
        self._embedder = embedder

    def _embedding(self, source: ImageSource | Image.Image, input_name: str) -> FaceEmbedding:
        image = normalize_image(source) if isinstance(source, Image.Image) else decode_image(source)
        detections = self._detector.detect(image)
        if len(detections) != 1:
            raise FaceCountError(input_name, len(detections))

        embedding = self._embedder.embed(image, detections[0])
        if embedding.model_version != self._embedder.model_version:
            raise ValueError("embedder returned an unexpected model version")
        return embedding

    def compare(
        self,
        reference: ImageSource | Image.Image,
        probe: ImageSource | Image.Image,
    ) -> FaceComparisonEvidence:
        reference_embedding = self._embedding(reference, "reference image")
        probe_embedding = self._embedding(probe, "probe image")
        return FaceComparisonEvidence(
            similarity=cosine_similarity(reference_embedding, probe_embedding),
            detector_version=self._detector.model_version,
            embedding_model_version=self._embedder.model_version,
        )
