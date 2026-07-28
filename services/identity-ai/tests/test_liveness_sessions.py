from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
from random import Random

import pytest

from app.contracts.liveness import ChallengeAction
from app.liveness.challenges import ActiveChallengeIssuer
from app.liveness.sessions import (
    InMemoryLivenessSessionStore,
    LivenessSessionBindingError,
    LivenessSessionConsumedError,
    LivenessSessionExpiredError,
    LivenessSessionService,
)


def service():
    return LivenessSessionService(
        InMemoryLivenessSessionStore(),
        ActiveChallengeIssuer(lifetime=timedelta(seconds=10), random_source=Random(7)),
    )


def test_session_is_bound_to_verification_and_consumed_once():
    sessions = service()
    now = datetime(2026, 1, 1, tzinfo=UTC)
    challenge = sessions.create(
        "verification-1",
        now=now,
        actions=(ChallengeAction.TURN_LEFT,),
        action_count=1,
    )

    with pytest.raises(LivenessSessionBindingError):
        sessions.consume(challenge.challenge_id, "verification-2", now=now)

    assert sessions.consume(challenge.challenge_id, "verification-1", now=now) == challenge
    with pytest.raises(LivenessSessionConsumedError):
        sessions.consume(challenge.challenge_id, "verification-1", now=now)


def test_expired_session_cannot_be_consumed():
    sessions = service()
    now = datetime(2026, 1, 1, tzinfo=UTC)
    challenge = sessions.create("verification-1", now=now)

    with pytest.raises(LivenessSessionExpiredError):
        sessions.consume(
            challenge.challenge_id,
            "verification-1",
            now=now + timedelta(seconds=11),
        )


def test_atomic_consumption_allows_only_one_concurrent_claim():
    sessions = service()
    now = datetime(2026, 1, 1, tzinfo=UTC)
    challenge = sessions.create("verification-1", now=now)

    def consume():
        try:
            sessions.consume(challenge.challenge_id, "verification-1", now=now)
            return "consumed"
        except LivenessSessionConsumedError:
            return "replayed"

    with ThreadPoolExecutor(max_workers=8) as executor:
        outcomes = list(executor.map(lambda _: consume(), range(8)))

    assert outcomes.count("consumed") == 1
    assert outcomes.count("replayed") == 7
