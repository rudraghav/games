from pathlib import Path

import pytest
from sqlalchemy.engine import make_url

from app.cloud_config import PREVIEW_POOLER, PREVIEW_REF, PREVIEW_URL, CloudConfig


def config_file(tmp_path: Path, **overrides: str) -> Path:
    values = {"SUPABASE_PROJECT_REF": PREVIEW_REF, "SUPABASE_URL": PREVIEW_URL,
              "SUPABASE_POOLER_HOST": PREVIEW_POOLER, "SUPABASE_DB_PASSWORD": "pass:#@$ /?word",
              "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_local_configuration_test"}
    values.update(overrides)
    path = tmp_path / "cloud.env"
    path.write_text("\n".join(f"{key}={value}" for key, value in values.items()))
    path.chmod(0o600)
    return path


def test_cloud_password_is_encoded_without_changing_its_value(tmp_path):
    config = CloudConfig.read(config_file(tmp_path))
    runtime, migration = make_url(config.database_url()), make_url(config.database_url(migration=True))
    assert runtime.password == "pass:#@$ /?word" and migration.password == runtime.password
    assert runtime.port == 6543 and migration.port == 5432
    assert runtime.username == f"postgres.{PREVIEW_REF}" and runtime.host == PREVIEW_POOLER
    assert "pass:" not in repr(config) and "sb_publishable" not in repr(config)
    values = config.runtime("dedicated-preview-encryption-key-longer-than-32-characters")
    assert values["DEV_AUTH_ENABLED"] == ("false", False)
    assert values["DATABASE_URL"][1] is True and values["APP_SECRET"][1] is True
    assert all(not key.startswith("NEXT_PUBLIC_") or not secret for key, (_, secret) in values.items())


@pytest.mark.parametrize("overrides", [
    {"SUPABASE_URL": "https://another.supabase.co"},
    {"SUPABASE_PROJECT_REF": "another"},
    {"SUPABASE_POOLER_HOST": "another.pooler.supabase.com"},
    {"SUPABASE_PUBLISHABLE_KEY": "sb_secret_forbidden"},
    {"SUPABASE_DB_PASSWORD": ""},
])
def test_cloud_configuration_refuses_wrong_targets_or_private_client_keys(tmp_path, overrides):
    with pytest.raises(ValueError):
        CloudConfig.read(config_file(tmp_path, **overrides))


def test_production_configuration_preserves_invitations_and_disables_local_identity(tmp_path):
    config = CloudConfig.read(config_file(tmp_path))
    secret = "dedicated-games-encryption-key-longer-than-32-characters"
    preview = config.runtime(secret)
    production = config.runtime(secret, environment="production")
    assert production["APP_ENV"] == ("production", False)
    assert production["APP_SECRET"] == preview["APP_SECRET"]
    assert production["DATABASE_URL"] == preview["DATABASE_URL"]
    assert production["DEV_AUTH_ENABLED"] == production["NEXT_PUBLIC_DEV_AUTH"] == ("false", False)
    assert all(not key.startswith("NEXT_PUBLIC_") or not private for key, (_, private) in production.items())
