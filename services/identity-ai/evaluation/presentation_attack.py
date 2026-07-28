"""Metrics for bona fide and presentation-attack detector outcomes."""

import argparse
from dataclasses import dataclass

from evaluation.common import read_json_lines, require_exact_fields, write_report


@dataclass(frozen=True)
class PresentationAttackSample:
    sample_id: str
    attack_type: str | None
    attack_detected: bool

    def __post_init__(self) -> None:
        if not self.sample_id.strip():
            raise ValueError("sample ID must not be empty")
        if self.attack_type is not None and not self.attack_type.strip():
            raise ValueError("attack type must not be blank")


def evaluate_presentation_attacks(
    samples: tuple[PresentationAttackSample, ...],
) -> dict[str, object]:
    sample_ids = tuple(sample.sample_id for sample in samples)
    if len(set(sample_ids)) != len(sample_ids):
        raise ValueError("presentation-attack sample IDs must be unique")
    bona_fide = tuple(sample for sample in samples if sample.attack_type is None)
    attacks = tuple(sample for sample in samples if sample.attack_type is not None)
    if not bona_fide or not attacks:
        raise ValueError("evaluation requires bona fide and presentation-attack samples")

    false_rejections = sum(sample.attack_detected for sample in bona_fide)
    attack_acceptances = sum(not sample.attack_detected for sample in attacks)
    by_attack_type: dict[str, dict[str, int]] = {}
    for sample in attacks:
        assert sample.attack_type is not None
        metrics = by_attack_type.setdefault(sample.attack_type, {"samples": 0, "accepted": 0})
        metrics["samples"] += 1
        metrics["accepted"] += int(not sample.attack_detected)
    return {
        "metric_version": "presentation-attack-v1",
        "bona_fide_samples": len(bona_fide),
        "attack_samples": len(attacks),
        "false_rejection_rate": false_rejections / len(bona_fide),
        "attack_acceptance_rate": attack_acceptances / len(attacks),
        "by_attack_type": by_attack_type,
    }


def _sample(record: dict[str, object]) -> PresentationAttackSample:
    require_exact_fields(record, ("sample_id", "attack_type", "attack_detected"))
    sample_id = record["sample_id"]
    attack_type = record["attack_type"]
    attack_detected = record["attack_detected"]
    if not isinstance(sample_id, str):
        raise ValueError("sample_id must be a string")
    if attack_type is not None and not isinstance(attack_type, str):
        raise ValueError("attack_type must be a string or null")
    if not isinstance(attack_detected, bool):
        raise ValueError("attack_detected must be a boolean")
    return PresentationAttackSample(sample_id, attack_type, attack_detected)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="JSONL with aggregate presentation-attack outcomes")
    parser.add_argument("--output")
    arguments = parser.parse_args()
    samples = tuple(_sample(record) for record in read_json_lines(arguments.input))
    write_report(evaluate_presentation_attacks(samples), arguments.output)


if __name__ == "__main__":
    main()
