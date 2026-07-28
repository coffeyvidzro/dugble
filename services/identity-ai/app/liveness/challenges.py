"""Unpredictable, short-lived active-challenge issuance."""

import secrets
from collections.abc import Sequence
from datetime import UTC, datetime, timedelta
from random import Random, SystemRandom

from app.contracts.liveness import ActiveChallenge, ChallengeAction


class ActiveChallengeIssuer:
    def __init__(
        self,
        lifetime: timedelta = timedelta(seconds=45),
        random_source: Random | None = None,
    ) -> None:
        if lifetime <= timedelta(0):
            raise ValueError("challenge lifetime must be positive")
        self._lifetime = lifetime
        self._random = random_source or SystemRandom()

    def issue(
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
        issued_at = now or datetime.now(UTC)
        if not verification_id.strip():
            raise ValueError("verification ID must not be empty")
        if issued_at.tzinfo is None or issued_at.utcoffset() is None:
            raise ValueError("challenge issue timestamp must be timezone-aware")
        available_actions = tuple(dict.fromkeys(actions))
        if action_count <= 0 or action_count > len(available_actions):
            raise ValueError("action count must fit the available unique actions")

        selected = tuple(self._random.sample(available_actions, action_count))
        return ActiveChallenge(
            challenge_id=secrets.token_urlsafe(24),
            verification_id=verification_id,
            actions=selected,
            issued_at=issued_at,
            expires_at=issued_at + self._lifetime,
        )
