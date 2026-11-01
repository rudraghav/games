from types import SimpleNamespace
from uuid import uuid4

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException

from app import auth
from app.db import connection_args
from app.settings import Settings


@pytest.fixture
def config(monkeypatch):
    monkeypatch.delenv("VERCEL", raising=False)
    value = Settings(
        _env_file=None,
        app_env="development",
        dev_auth_enabled=True,
        app_secret="local-test-signing-key-of-at-least-32-characters",
        database_url="postgresql+psycopg://localhost/games_test",
        supabase_url="https://games-auth-test.supabase.co",
    )
    monkeypatch.setattr(auth, "settings", lambda: value)
    return value


@pytest.mark.parametrize("condition", ["hosted", "preview", "disabled"])
def test_local_identity_is_rejected_outside_explicit_local_development(
    config, monkeypatch, condition
):
    token = auth.development_session()
    assert auth.identity(f"Bearer {token}").anonymous
    if condition == "hosted":
        monkeypatch.setenv("VERCEL", "1")
    elif condition == "preview":
        config.app_env = "preview"
    else:
        config.dev_auth_enabled = False

    class RejectLocalKey:
        def get_signing_key_from_jwt(self, _token):
            raise jwt.InvalidAlgorithmError("A hosted identity requires an asymmetric key.")

    monkeypatch.setattr(auth, "jwks_client", lambda: RejectLocalKey())
    with pytest.raises(HTTPException) as mint:
        auth.development_session()
    assert mint.value.status_code == 404
    with pytest.raises(HTTPException) as verify:
        auth.identity(f"Bearer {token}")
    assert verify.value.status_code == 401
    if condition != "disabled":
        with pytest.raises(RuntimeError, match="Development identity is forbidden"):
            config.check()


def test_hosted_jwt_checks_signature_issuer_audience_and_subject(config, monkeypatch):
    config.dev_auth_enabled = False
    config.app_env = "preview"
    key = ec.generate_private_key(ec.SECP256R1())
    public = key.public_key()
    monkeypatch.setattr(
        auth,
        "jwks_client",
        lambda: SimpleNamespace(get_signing_key_from_jwt=lambda _: SimpleNamespace(key=public)),
    )
    user_id = str(uuid4())
    claims = {
        "sub": user_id,
        "iss": config.supabase_url + "/auth/v1",
        "aud": "authenticated",
        "exp": 4102444800,
        "is_anonymous": True,
    }
    good = jwt.encode(claims, key, algorithm="ES256")
    assert auth.identity(f"Bearer {good}") == auth.Identity(user_id, True)
    for changed in (
        {"iss": "https://another-project.supabase.co/auth/v1"},
        {"aud": "another-app"},
        {"sub": "invalid-id"},
        {"exp": 1},
    ):
        invalid = jwt.encode({**claims, **changed}, key, algorithm="ES256")
        with pytest.raises(HTTPException) as rejected:
            auth.identity(f"Bearer {invalid}")
        assert rejected.value.status_code == 401
    wrong_key = ec.generate_private_key(ec.SECP256R1())
    with pytest.raises(HTTPException) as rejected:
        auth.identity(f"Bearer {jwt.encode(claims, wrong_key, algorithm='ES256')}")
    assert rejected.value.status_code == 401


def test_pooler_connections_require_tls_and_disable_prepared_statements():
    remote = connection_args("postgresql+psycopg://user@example.pooler.supabase.com:6543/db")
    assert remote["sslmode"] == "require"
    assert remote["prepare_threshold"] is None
    assert "options" not in remote
    local = connection_args("postgresql+psycopg://localhost:55439/db")
    assert local["options"] == "-c search_path=public"
    assert "sslmode" not in local
