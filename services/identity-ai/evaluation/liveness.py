"""Metrics for genuine and controlled-attack challenge outcomes."""

import argparse
from dataclasses import dataclass

from evaluation.common import read_json_lines, require_exact_fields, write_report


@dataclass(frozen=True)
class LivenessSample:
    sample_id: str
    genuine: bool
    challenge_completed: bool

    def __post_init__(self) -> None:
        if not self.sample_id.strip():
            raise ValueError("sample ID must not be empty")


def evaluate_liveness(samples: tuple[LivenessSample, ...]) -> dict[str, object]:
    sample_ids = tuple(sample.sample_id for sample in samples)
    if len(set(sample_ids)) != len(sample_ids):
        raise ValueError("liveness evaluation sample IDs must be unique")
    genuine = tuple(sample for sample in samples if sample.genuine)
    attacks = tuple(sample for sample in samples if not sample.genuine)
    if not genuine or not attacks:
        raise ValueError("liveness evaluation requires genuine and attack samples")
    false_rejections = sum(not sample.challenge_completed for sample in genuine)
    attack_acceptances = sum(sample.challenge_completed for sample in attacks)
    return {
        "metric_version": "active-challenge-v1",
        "genuine_samples": len(genuine),
        "attack_samples": len(attacks),
        "false_rejections": false_rejections,
        "attack_acceptances": attack_acceptances,
        "false_rejection_rate": false_rejections / len(genuine),
        "attack_acceptance_rate": attack_acceptances / len(attacks),
    }


def _sample(record: dict[str, object]) -> LivenessSample:
    require_exact_fields(record, ("sample_id", "genuine", "challenge_completed"))
    if not isinstance(record["sample_id"], str):
        raise ValueError("sample_id must be a string")
    if not isinstance(record["genuine"], bool):
        raise ValueError("genuine must be a boolean")
    if not isinstance(record["challenge_completed"], bool):
        raise ValueError("challenge_completed must be a boolean")
    return LivenessSample(
        record["sample_id"],
        record["genuine"],
        record["challenge_completed"],
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="JSONL with aggregate challenge outcomes")
    parser.add_argument("--output")
    arguments = parser.parse_args()
    samples = tuple(_sample(record) for record in read_json_lines(arguments.input))
    write_report(evaluate_liveness(samples), arguments.output)


if __name__ == "__main__":
    main()
