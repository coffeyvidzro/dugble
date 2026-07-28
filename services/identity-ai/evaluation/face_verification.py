"""Threshold metrics for labeled one-to-one face-comparison scores."""

import argparse
from dataclasses import dataclass
from math import isfinite

from evaluation.common import read_json_lines, require_exact_fields, write_report


@dataclass(frozen=True)
class FaceScoreSample:
    sample_id: str
    genuine: bool
    similarity: float

    def __post_init__(self) -> None:
        if not self.sample_id.strip():
            raise ValueError("sample ID must not be empty")
        if not isfinite(self.similarity) or not -1 <= self.similarity <= 1:
            raise ValueError("face similarity must be within -1..1")


def evaluate_face_scores(
    samples: tuple[FaceScoreSample, ...],
    threshold: float,
) -> dict[str, object]:
    if not isfinite(threshold) or not -1 <= threshold <= 1:
        raise ValueError("face threshold must be within -1..1")
    sample_ids = tuple(sample.sample_id for sample in samples)
    if len(set(sample_ids)) != len(sample_ids):
        raise ValueError("face evaluation sample IDs must be unique")
    genuine = tuple(sample for sample in samples if sample.genuine)
    impostor = tuple(sample for sample in samples if not sample.genuine)
    if not genuine or not impostor:
        raise ValueError("face evaluation requires genuine and impostor samples")
    false_rejections = sum(sample.similarity < threshold for sample in genuine)
    false_acceptances = sum(sample.similarity >= threshold for sample in impostor)
    return {
        "metric_version": "face-verification-v1",
        "threshold": threshold,
        "genuine_samples": len(genuine),
        "impostor_samples": len(impostor),
        "false_rejections": false_rejections,
        "false_acceptances": false_acceptances,
        "false_rejection_rate": false_rejections / len(genuine),
        "false_acceptance_rate": false_acceptances / len(impostor),
    }


def _sample(record: dict[str, object]) -> FaceScoreSample:
    require_exact_fields(record, ("sample_id", "genuine", "similarity"))
    if not isinstance(record["sample_id"], str):
        raise ValueError("sample_id must be a string")
    if not isinstance(record["genuine"], bool):
        raise ValueError("genuine must be a boolean")
    if isinstance(record["similarity"], bool) or not isinstance(record["similarity"], int | float):
        raise ValueError("similarity must be numeric")
    return FaceScoreSample(record["sample_id"], record["genuine"], float(record["similarity"]))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="JSONL with sample_id, genuine, and similarity")
    parser.add_argument("--threshold", type=float, required=True)
    parser.add_argument("--output")
    arguments = parser.parse_args()
    samples = tuple(_sample(record) for record in read_json_lines(arguments.input))
    write_report(evaluate_face_scores(samples, arguments.threshold), arguments.output)


if __name__ == "__main__":
    main()
