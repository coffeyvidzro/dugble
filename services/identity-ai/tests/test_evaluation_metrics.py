import pytest

from evaluation.face_verification import FaceScoreSample, evaluate_face_scores
from evaluation.liveness import LivenessSample, evaluate_liveness
from evaluation.ocr import OCRSample, evaluate_ocr


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


def test_ocr_metrics_normalize_case_and_whitespace_without_exposing_values():
    report = evaluate_ocr(
        (
            OCRSample(
                "sample-1",
                expected={"surname": "Mensah", "given_names": "Ama Serwaa"},
                observed={"surname": " MENSAH ", "given_names": "Ama   Serwaa"},
            ),
            OCRSample(
                "sample-2",
                expected={"surname": "Owusu"},
                observed={},
            ),
        )
    )

    assert report["expected_fields"] == 3
    assert report["exact_matches"] == 2
    assert report["missing_fields"] == 1
    assert "Mensah" not in repr(report)


def test_metrics_reject_duplicate_sample_ids():
    with pytest.raises(ValueError, match="unique"):
        evaluate_liveness(
            (
                LivenessSample("duplicate", True, True),
                LivenessSample("duplicate", False, False),
            )
        )
