"""Private generation milestones and explicitly estimated progress, without I/O."""

from dataclasses import dataclass
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ProgressStage = Literal["preparing", "matching", "writing", "retrying", "checking", "saving"]
Provider = Literal["gemini", "groq", "cloudflare"]
ProviderName = Literal["Gemini", "Groq", "Cloudflare"]


@dataclass(frozen=True)
class ProgressEvent:
    stage: ProgressStage
    provider: Provider | None = None
    attempt: int = 0
    max_attempts: int = 3


class ReadingProgress(BaseModel):
    model_config = ConfigDict(extra="forbid")

    stage: ProgressStage
    provider: ProviderName | None = None
    attempt: int = Field(ge=0, le=12)
    max_attempts: int = Field(ge=1, le=12)
    started_at: float = Field(ge=0, allow_inf_nan=False)
    updated_at: float = Field(ge=0, allow_inf_nan=False)
    estimated_percent: int = Field(ge=1, le=99)
    estimated_seconds_remaining: int | None = Field(default=None, ge=1)


# These are rough duration priors, not measurements of a provider's hidden work.
# They are deliberately visible as estimates and expire instead of promising 0s.
ESTIMATED_SECONDS = {
    "Gemini": {"ordinary": 45, "western": 60, "vedic": 65, "both": 80},
    "Groq": {"ordinary": 12, "western": 18, "vedic": 18, "both": 25},
    "Cloudflare": {"ordinary": 30, "western": 40, "vedic": 40, "both": 50},
}
NAMES: dict[Provider, ProviderName] = {
    "gemini": "Gemini", "groq": "Groq", "cloudflare": "Cloudflare",
}
FLOORS: dict[ProgressStage, int] = {
    "preparing": 2, "matching": 8, "writing": 18,
    "retrying": 18, "checking": 88, "saving": 97,
}
CEILINGS: dict[ProgressStage, int] = {
    "preparing": 7, "matching": 17, "writing": 84,
    "retrying": 90, "checking": 96, "saving": 99,
}


class ProgressState(BaseModel):
    """Lease-owned state stored in the existing private reading JSON payload."""

    model_config = ConfigDict(extra="forbid")

    stage: ProgressStage = "preparing"
    provider: ProviderName | None = None
    mode: Literal["ordinary", "western", "vedic", "both"] = "ordinary"
    attempt: int = 0
    max_attempts: int = 3
    started_at: float
    updated_at: float
    expected_finish_at: float
    percent_floor: int = 2

    @classmethod
    def begin(cls, now: float, mode: str = "ordinary") -> "ProgressState":
        return cls.model_validate({
            "mode": mode, "started_at": now, "updated_at": now,
            "expected_finish_at": now + ESTIMATED_SECONDS["Gemini"][mode],
        })

    def view(self, now: float) -> ReadingProgress:
        duration = max(1, self.expected_finish_at - self.updated_at)
        elapsed = max(0, now - self.updated_at)
        ceiling = max(self.percent_floor, CEILINGS[self.stage])
        percent = self.percent_floor + int(
            (ceiling - self.percent_floor) * min(1, elapsed / duration)
        )
        remaining = self.expected_finish_at - now
        return ReadingProgress(
            stage=self.stage, provider=self.provider, attempt=self.attempt,
            max_attempts=self.max_attempts, started_at=self.started_at,
            updated_at=self.updated_at, estimated_percent=min(99, percent),
            estimated_seconds_remaining=max(1, round(remaining)) if remaining > 0 else None,
        )

    def advance(self, event: ProgressEvent, now: float) -> "ProgressState":
        stage = "retrying" if event.stage == "writing" and event.attempt > 1 else event.stage
        provider = NAMES[event.provider] if event.provider else self.provider
        finish = self.expected_finish_at
        if event.stage == "writing" and provider:
            finish = now + ESTIMATED_SECONDS[provider][self.mode]
        elif stage in {"checking", "saving"}:
            finish = now + (3 if stage == "checking" else 2)
        return self.model_copy(update={
            "stage": stage, "provider": provider,
            "attempt": event.attempt, "max_attempts": event.max_attempts,
            "updated_at": now, "expected_finish_at": finish,
            "percent_floor": max(self.view(now).estimated_percent, FLOORS[stage]),
        })
