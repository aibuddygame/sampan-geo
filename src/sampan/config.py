"""Local configuration; no credentials or external services are required."""

from typing import Literal
from pydantic import SecretStr

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="SAMPAN_", env_file=".env", extra="forbid"
    )

    environment: Literal["local", "test"] = "local"
    debug: bool = False
    kimi_api_key: SecretStr = SecretStr("")
    kimi_model: Literal["kimi-k3.1-pro", "kimi-k2.6"] = "kimi-k3.1-pro"
    marksix_portal_password: SecretStr = SecretStr("")
