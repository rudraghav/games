"""Canonical city lookup. Only a city query/GeoNames ID reaches this provider."""

import json
import threading
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfoNotFoundError

from pydantic import ValidationError

from app.astrology.models import AstrologyPlace, AstrologyPlaces
from app.astrology.timezones import birth_zone

_BASE = "https://geocoding-api.open-meteo.com/v1/"
_cache: dict[str, tuple[float, object]] = {}
_lock = threading.RLock()


class GeocoderUnavailable(RuntimeError):
    """Safe provider classification without a query, URL or response body."""


def _fetch(endpoint: str, params: dict[str, str | int]) -> object:
    key = endpoint + "?" + urlencode(params)
    with _lock:
        cached = _cache.get(key)
        if cached and cached[0] > time.monotonic():
            return cached[1]
    try:
        # urllib emits no automatic request/URL logs (httpx INFO logs include queries).
        request = Request(_BASE + key, headers={"User-Agent": "Games/1.0 city-search"})
        with urlopen(request, timeout=6) as response:
            payload = response.read(131073)
        if len(payload) > 131072:
            raise ValueError
        data: object = json.loads(payload)
    except Exception:
        raise GeocoderUnavailable("City lookup is temporarily unavailable.") from None
    with _lock:
        if len(_cache) >= 256:
            _cache.pop(next(iter(_cache)))
        _cache[key] = (time.monotonic() + 600, data)
    return data


def _place(value: object) -> AstrologyPlace | None:
    if not isinstance(value, dict):
        return None
    try:
        ident = int(value["id"])
        if not 0 < ident < 2**31 or value.get("feature_code", "")[:1] != "P":
            return None
        label = ", ".join(dict.fromkeys(str(value[k]) for k in ("name", "admin1", "country")
                                       if value.get(k)))
        result = AstrologyPlace(id=f"geo:{ident}", label=label,
                                latitude=value["latitude"], longitude=value["longitude"],
                                timezone=value["timezone"], country_code=value["country_code"])
        birth_zone(result.timezone)
        return result
    except (ValueError, KeyError, TypeError, ValidationError, ZoneInfoNotFoundError):
        return None


def search_places(query: str) -> AstrologyPlaces:
    data = _fetch("search", {"name": query, "count": 6, "language": "en", "format": "json"})
    values = data.get("results", []) if isinstance(data, dict) else []
    if not isinstance(values, list):
        raise GeocoderUnavailable("City lookup is temporarily unavailable.")
    return AstrologyPlaces(places=[place for item in values if (place := _place(item))])


def resolve_place(place_id: str) -> AstrologyPlace:
    data = _fetch("get", {"id": int(place_id.removeprefix("geo:"))})
    result = _place(data)
    if result is None or result.id != place_id:
        raise GeocoderUnavailable("Choose a city from the location results.")
    return result
