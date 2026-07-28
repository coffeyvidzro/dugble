"""Face-specific biometric quality assessor boundary."""

from typing import Protocol

from PIL import Image

from app.contracts.biometric_quality import BiometricQualityEvidence
from app.contracts.face import FaceDetection


class BiometricQualityAssessor(Protocol):
    @property
    def analyzer_version(self) -> str: ...

    def assess(
        self,
        image: Image.Image,
        detection: FaceDetection,
    ) -> BiometricQualityEvidence: ...
