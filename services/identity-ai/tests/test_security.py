import pytest

from app.core.security import valid_bearer_credential


@pytest.mark.parametrize(
    ("authorization", "expected"),
    [
        ("Bearer secret", True),
        ("bearer secret", True),
        ("Basic secret", False),
        ("Bearer wrong", False),
        ("Bearersecret", False),
        (None, False),
    ],
)
def test_valid_bearer_credential(authorization, expected):
    assert valid_bearer_credential(authorization, "secret") is expected


def test_empty_expected_credential_is_never_valid():
    assert valid_bearer_credential("Bearer ", "") is False
