"""Single-use, server-owned liveness challenge sessions."""

from collections.abc import Sequence
from datetime import UTC, datetime
from threading import Lock
from typing import Protocol

from app.contracts.liveness import ActiveChallenge, ChallengeAction

from .challenges import ActiveChallengeIssuer


class LivenessSessionError(RuntimeError):
    """Base error for safe liveness-session failures."""


class LivenessSessionNotFoundError(LivenessSessionError):
    pass


class LivenessSessionExpiredError(LivenessSessionError):
    pass


class LivenessSessionConsumedError(LivenessSessionError):
    pass


class LivenessSessionBindingError(LivenessSessionError):
    pass


class LivenessSessionStore(Protocol):
    def create(self, challenge: ActiveChallenge) -> None: ...

    def consume(
        self,
        challenge_id: str,
        verification_id: str,
        *,
        now: datetime,
    ) -> ActiveChallenge: ...


class InMemoryLivenessSessionStore:
    """Process-local store for tests and development, with atomic consumption."""

    def __init__(self) -> None:
        self._challenges: dict[str, ActiveChallenge] = {}
        self._consumed: set[str] = set()
        self._lock = Lock()

    def create(self, challenge: ActiveChallenge) -> None:
        with self._lock:
            if challenge.challenge_id in self._challenges:
                raise LivenessSessionError("liveness session already exists")
            self._challenges[challenge.challenge_id] = challenge

    def consume(
        self,
        challenge_id: str,
        verification_id: str,
        *,
        now: datetime,
    ) -> ActiveChallenge:
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("session consumption time must be timezone-aware")
        with self._lock:
            challenge = self._challenges.get(challenge_id)
            if challenge is None:
                raise LivenessSessionNotFoundError("liveness session was not found")
            if challenge.verification_id != verification_id:
                raise LivenessSessionBindingError("liveness session binding does not match")
            if challenge_id in self._consumed:
                raise LivenessSessionConsumedError("liveness session was already consumed")
            if now > challenge.expires_at:
                raise LivenessSessionExpiredError("liveness session has expired")
            self._consumed.add(challenge_id)
            return challenge


class LivenessSessionService:
    def __init__(
        self,
        store: LivenessSessionStore,
        issuer: ActiveChallengeIssuer | None = None,
    ) -> None:
        self._store = store
        self._issuer = issuer or ActiveChallengeIssuer()

    def create(
        self,
        verification_id: str,
        *,
        now: datetime | None = None,
        actions: Sequence[ChallengeAction] = (
            ChallengeAction.TURN_LEFT,
            ChallengeAction.TURN_RIGHT,
            ChallengeAction.LOOK_FORWARD,
        ),
        action_count: int = 2,
    ) -> ActiveChallenge:
        challenge = self._issuer.issue(
            verification_id,
            now=now,
            actions=actions,
            action_count=action_count,
        )
        self._store.create(challenge)
        return challenge

    def consume(
        self,
        challenge_id: str,
        verification_id: str,
        *,
        now: datetime | None = None,
    ) -> ActiveChallenge:
        return self._store.consume(
            challenge_id,
            verification_id,
            now=now or datetime.now(UTC),
        )
