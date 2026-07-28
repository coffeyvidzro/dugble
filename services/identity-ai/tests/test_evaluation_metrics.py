import pytest

from evaluation.face_verification import FaceScoreSample, evaluate_face_scores
from evaluation.liveness import LivenessSample, evaluate_liveness
from evaluation.presentation_attack import (
    PresentationAttackSample,
    evaluate_presentation_attacks,
)


def test_face_metrics_report_false_acceptance_and_rejection_rates():
    report = evaluate_face_scores(
        (
            FaceScoreSample("genuine-1", True, 0.9),
            FaceScoreSample("genuine-2", True, 0.4),
            FaceScoreSample("impostor-1", False, 0.7),
            FaceScoreSample("impostor-2", False, 0.2),
        ),
        threshold=0.6,
    )

    assert report["false_rejection_rate"] == 0.5
    assert report["false_acceptance_rate"] == 0.5


def test_face_metrics_require_both_comparison_classes():
    with pytest.raises(ValueError, match="genuine and impostor"):
        evaluate_face_scores((FaceScoreSample("genuine-1", True, 0.9),), threshold=0.6)


def test_liveness_metrics_keep_attack_acceptance_separate():
    report = evaluate_liveness(
        (
            LivenessSample("genuine-1", True, True),
            LivenessSample("genuine-2", True, False),
            LivenessSample("attack-1", False, True),
            LivenessSample("attack-2", False, False),
        )
    )

    assert report["false_rejection_rate"] == 0.5
    assert report["attack_acceptance_rate"] == 0.5


def test_presentation_attack_metrics_report_by_attack_type():
    report = evaluate_presentation_attacks(
        (
            PresentationAttackSample("real-1", None, False),
            PresentationAttackSample("real-2", None, True),
            PresentationAttackSample("print-1", "print", True),
            PresentationAttackSample("screen-1", "screen_replay", False),
        )
    )

    assert report["false_rejection_rate"] == 0.5
    assert report["attack_acceptance_rate"] == 0.5
    assert report["by_attack_type"]["print"] == {"samples": 1, "accepted": 0}


def test_metrics_reject_duplicate_sample_ids():
    with pytest.raises(ValueError, match="unique"):
        evaluate_liveness(
            (
                LivenessSample("duplicate", True, True),
                LivenessSample("duplicate", False, False),
            )
        )
