"""Local application entry point. No ingestion or publication routes yet."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from sampan.config import Settings


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings if settings is not None else Settings()
    app = FastAPI(title="SAMPAN.AI", version="0.1.0", debug=config.debug)
    app.state.settings = config

    @app.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        """Process liveness only; does not check databases or external services."""
        return HealthResponse()

    return app
