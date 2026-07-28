"""Authentication primitives for internal service requests."""

import secrets


def valid_bearer_credential(authorization: str | None, expected_key: str) -> bool:
    if not expected_key:
        return False
    scheme, separator, supplied_key = (authorization or "").partition(" ")
    return (
        separator == " "
        and scheme.lower() == "bearer"
        and secrets.compare_digest(supplied_key, expected_key)
    )
