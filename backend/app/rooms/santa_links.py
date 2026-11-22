"""Private Secret Santa link tokens: derived from the match, never stored.

A token names its match and person and carries a keyed signature over that pair
and the number of the draw. Drawing again changes the number, so every earlier
token stops matching. Nothing here reads a database or a game state.
"""

import base64
import hashlib
import hmac
import string
from uuid import UUID

SIGNATURE_BYTES = 16
URL_SAFE = frozenset(string.ascii_letters + string.digits + "-_")


def link_token(secret: str, match_id: str, draw_number: int, person_id: str) -> str:
    """The one token that opens this person's line of this draw."""
    key = hashlib.sha256((secret + ":secret-santa-links").encode()).digest()
    signed = f"{match_id}:{draw_number}:{person_id}".encode()
    signature = hmac.new(key, signed, hashlib.sha256).digest()[:SIGNATURE_BYTES]
    number = int(person_id[1:])
    index = number.to_bytes(max(1, (number.bit_length() + 7) // 8), "big")
    return base64.urlsafe_b64encode(UUID(match_id).bytes + index + signature).rstrip(b"=").decode()


def read_token(token: str) -> tuple[str, str] | None:
    """The match and person a token of the right shape names, or None.

    This only says where to look. Whether the token opens anything is decided by
    `opens`, against the token derived from the saved draw.
    """
    if not 44 <= len(token) <= 48 or not URL_SAFE.issuperset(token):
        return None
    try:
        raw = base64.urlsafe_b64decode(token + "=" * (-len(token) % 4))
    except ValueError:
        return None
    if not 33 <= len(raw) <= 36:
        return None
    number = int.from_bytes(raw[16:-SIGNATURE_BYTES], "big")
    return str(UUID(bytes=raw[:16])), f"p{number}"


def opens(token: str, expected: str) -> bool:
    """Compared in constant time, as whole tokens, so only the exact spelling passes."""
    return hmac.compare_digest(token.encode(), expected.encode())
