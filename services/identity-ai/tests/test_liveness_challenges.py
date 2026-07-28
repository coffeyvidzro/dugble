import random
from datetime import UTC, datetime, timedelta

import pytest

from app.contracts.liveness import ChallengeAction
from app.liveness.challenges import ActiveChallengeIssuer


def test_issuer_creates_short_lived_unique_action_challenge():
    now = datetime(2026, 7, 28, 12, tzinfo=UTC)
    issuer = ActiveChallengeIssuer(
        lifetime=timedelta(seconds=30),
        random_source=random.Random(7),
    )

    challenge = issuer.issue("verification-1", now=now)

    assert challenge.challenge_id
    assert challenge.verification_id == "verification-1"
    assert len(challenge.actions) == 2
    assert len(set(challenge.actions)) == 2
    assert challenge.issued_at == now
    assert challenge.expires_at == now + timedelta(seconds=30)


def test_issuer_rejects_more_actions_than_are_available():
    issuer = ActiveChallengeIssuer()

    with pytest.raises(ValueError, match="available unique actions"):
        issuer.issue(
            "verification-1",
            actions=(ChallengeAction.TURN_LEFT,),
            action_count=2,
        )


def test_challenge_rejects_naive_issue_timestamp():
    issuer = ActiveChallengeIssuer()

    with pytest.raises(ValueError, match="timezone-aware"):
        issuer.issue("verification-1", now=datetime(2026, 7, 28))


def test_challenge_requires_verification_binding():
    issuer = ActiveChallengeIssuer()

    with pytest.raises(ValueError, match="verification ID"):
        issuer.issue(" ")
