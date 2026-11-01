import os
import time
from dataclasses import dataclass
from functools import lru_cache
from uuid import UUID, uuid4

import jwt
from fastapi import Header, HTTPException

from app.settings import settings


@dataclass(frozen=True)
class Identity:
    id: str
    anonymous: bool


@lru_cache
def jwks_client() -> jwt.PyJWKClient:
    return jwt.PyJWKClient(
        settings().supabase_url.rstrip("/") + "/auth/v1/.well-known/jwks.json", cache_keys=True
    )


def identity(authorization: str | None = Header(default=None)) -> Identity:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "A player session is required.")
    token = authorization[7:]
    config = settings()
    try:
        if (
            config.dev_auth_enabled
            and config.app_env == "development"
            and not os.environ.get("VERCEL")
        ):
            claims = jwt.decode(
                token,
                config.app_secret,
                algorithms=["HS256"],
                audience="games-dev",
                issuer="games-local",
            )
        else:
            key = jwks_client().get_signing_key_from_jwt(token).key
            claims = jwt.decode(
                token,
                key,
                algorithms=["ES256", "RS256"],
                audience="authenticated",
                issuer=config.supabase_url.rstrip("/") + "/auth/v1",
            )
        user_id = str(UUID(claims["sub"]))
        return Identity(user_id, bool(claims.get("is_anonymous", False)))
    except (jwt.PyJWTError, ValueError, KeyError) as error:
        raise HTTPException(401, "Your session expired. Please reconnect.") from error


def development_session() -> str:
    config = settings()
    if not config.dev_auth_enabled or config.app_env != "development" or os.environ.get("VERCEL"):
        raise HTTPException(404, "Not found.")
    return jwt.encode(
        {
            "sub": str(uuid4()),
            "aud": "games-dev",
            "iss": "games-local",
            "exp": int(time.time()) + 86400 * 7,
            "is_anonymous": True,
        },
        config.app_secret,
        algorithm="HS256",
    )
