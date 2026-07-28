import pytest

from app.contracts.biometric_quality import (
    BiometricQualityEvidence,
    BiometricQualityMeasurement,
)
from app.contracts.presentation_attack import (
    PresentationAttackEvidence,
    PresentationAttackSignal,
    PresentationAttackType,
)


def test_biometric_quality_evidence_requires_unique_bounded_measurements():
    evidence = BiometricQualityEvidence(
        suitable_for_analysis=True,
        measurements=(
            BiometricQualityMeasurement("face_size", 0.9),
            BiometricQualityMeasurement("pose", 0.8),
        ),
        reasons=(),
        analyzer_version="biometric-quality-test-v1",
    )

    assert evidence.suitable_for_analysis is True


def test_biometric_quality_rejects_success_with_failure_reasons():
    with pytest.raises(ValueError, match="agree with its reasons"):
        BiometricQualityEvidence(
            suitable_for_analysis=True,
            measurements=(BiometricQualityMeasurement("pose", 0.2),),
            reasons=("pose_unsuitable",),
            analyzer_version="biometric-quality-test-v1",
        )


def test_presentation_attack_evidence_rejects_duplicate_attack_types():
    signal = PresentationAttackSignal(PresentationAttackType.PRINT, 0.8)

    with pytest.raises(ValueError, match="duplicates"):
        PresentationAttackEvidence(
            signals=(signal, signal),
            model_version="presentation-attack-test-v1",
        )
