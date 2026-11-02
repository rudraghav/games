"""Pinned IANA history, with round-trip validation of gaps and repeated times."""

from datetime import UTC, datetime
from functools import lru_cache
from importlib.resources import files
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.astrology.models import AstrologyInput, AstrologyIssue, AstrologyTimeChoice


@lru_cache(maxsize=256)
def birth_zone(name: str) -> ZoneInfo:
    if any(part in {"", ".", ".."} for part in name.split("/")) or "\\" in name:
        raise ZoneInfoNotFoundError
    try:
        with files("tzdata.zoneinfo").joinpath(*name.split("/")).open("rb") as source:
            return ZoneInfo.from_file(source, key=name)
    except (FileNotFoundError, IsADirectoryError, ValueError):
        raise ZoneInfoNotFoundError from None


def resolve_birth_time(data: AstrologyInput, zone_name: str) -> datetime | AstrologyIssue:
    naive = datetime.fromisoformat(f"{data.birth_date.isoformat()}T{data.birth_time}")
    zone = birth_zone(zone_name)
    candidates: list[tuple[int, datetime]] = []
    for fold in (0, 1):
        local = naive.replace(tzinfo=zone, fold=fold)
        utc = local.astimezone(UTC)
        if utc.astimezone(zone).replace(tzinfo=None) == naive and all(
            existing != utc for _, existing in candidates
        ):
            candidates.append((fold, utc))
    if not candidates:
        return AstrologyIssue(code="nonexistent_local_time", message=(
            "This local time did not occur because the clocks changed. Check the recorded time."
        ))
    if len(candidates) == 2 and data.fold is None:
        choices = []
        for fold, utc in candidates:
            offset = utc.astimezone(zone).strftime("%z")
            formatted = offset[:3] + ":" + offset[3:5] + (
                ":" + offset[5:] if len(offset) > 5 else ""
            )
            choices.append(AstrologyTimeChoice(fold=0 if fold == 0 else 1, utc_offset=formatted,
                                               label=f"{'First' if fold == 0 else 'Second'} occurrence (UTC{formatted})"))
        return AstrologyIssue(code="ambiguous_local_time",
                              message="This local time occurred twice. Choose the recorded occurrence.",
                              choices=choices)
    return next((utc for fold, utc in candidates if fold == data.fold), candidates[0][1])
