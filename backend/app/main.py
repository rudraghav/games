import logging
import re
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from pydantic import BaseModel
from starlette.responses import Response

from app.auth import development_session
from app.core.contracts import GameManifest
from app.games.registry import ENGINES
from app.rooms.router import router
from app.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings().check()
    yield


app = FastAPI(title="Games API", version="0.1.0", lifespan=lifespan)
app.include_router(router)

SANTA_LINK_PATH = re.compile(r"(/v1/secret-santa/)[^/?\s]+")


class HidePrivateLinks(logging.Filter):
    """A Secret Santa link is its own permission: the access log keeps the route only."""

    def filter(self, record: logging.LogRecord) -> bool:
        args = record.args
        if isinstance(args, tuple) and len(args) > 2 and isinstance(args[2], str):
            record.args = (*args[:2], SANTA_LINK_PATH.sub(r"\1[link]", args[2]), *args[3:])
        return True


logging.getLogger("uvicorn.access").addFilter(HidePrivateLinks())


@app.middleware("http")
async def private_responses(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    response = await call_next(request)
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


class Health(BaseModel):
    status: str


class SessionToken(BaseModel):
    token: str


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok")


@app.get("/v1/games", response_model=list[GameManifest])
def catalogue() -> list[GameManifest]:
    return [engine.manifest for engine in ENGINES.values()]


@app.post("/v1/dev/session", response_model=SessionToken)
def dev_session() -> SessionToken:
    return SessionToken(token=development_session())
