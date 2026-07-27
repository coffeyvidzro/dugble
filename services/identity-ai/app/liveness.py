from dataclasses import dataclass


@dataclass(frozen=True)
class LivenessResult:
    passed: bool
    score: float


def check_liveness(_: str, __: list[str]) -> LivenessResult:
    """Placeholder for active liveness challenge evaluation."""
    raise NotImplementedError("liveness detection is not implemented")
