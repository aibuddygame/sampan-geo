import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from sampan.config import Settings
from sampan.main import create_app


def test_local_app_starts_and_serves_health():
    app = create_app(Settings(_env_file=None, environment="test", debug=False))
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        assert client.get("/api/v1/companies/vx-real").status_code == 404


def test_environment_overrides_dotenv(tmp_path, monkeypatch):
    dotenv = tmp_path / ".env"
    dotenv.write_text("SAMPAN_ENVIRONMENT=local\nSAMPAN_DEBUG=true\n")
    monkeypatch.setenv("SAMPAN_ENVIRONMENT", "test")
    monkeypatch.setenv("SAMPAN_DEBUG", "false")
    settings = Settings(_env_file=dotenv)
    assert settings.environment == "test"
    assert settings.debug is False


def test_invalid_configuration_fails_at_startup(monkeypatch):
    monkeypatch.setenv("SAMPAN_ENVIRONMENT", "invalid")
    with pytest.raises(ValidationError):
        create_app()


def test_example_configuration_loads(monkeypatch):
    monkeypatch.delenv("SAMPAN_ENVIRONMENT", raising=False)
    monkeypatch.delenv("SAMPAN_DEBUG", raising=False)
    settings = Settings(_env_file=".env.example")
    assert settings.environment == "local"
    assert settings.debug is False
