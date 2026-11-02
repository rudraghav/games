import io
import json
import logging
from urllib.parse import parse_qs, urlsplit

import pytest

from app.astrology import geocoder

CITY = {"id": 2643743, "name": "London", "admin1": "England", "country": "United Kingdom",
        "country_code": "GB", "latitude": 51.50853, "longitude": -0.12574,
        "timezone": "Europe/London", "feature_code": "PPLC"}


@pytest.fixture(autouse=True)
def clear_city_cache():
    geocoder._cache.clear()
    yield
    geocoder._cache.clear()


def test_search_sends_only_city_query_and_resolves_canonical_id_without_logging(monkeypatch, caplog):
    requests = []

    def request(req, timeout):
        requests.append(req.full_url)
        assert timeout == 6
        return io.BytesIO(json.dumps({"results": [CITY]} if "/search?" in req.full_url else CITY).encode())

    monkeypatch.setattr(geocoder, "urlopen", request)
    with caplog.at_level(logging.DEBUG):
        result = geocoder.search_places("London")
        same = geocoder.search_places("London")
        place = geocoder.resolve_place(result.places[0].id)
    assert result == same and place == result.places[0]
    assert len(requests) == 2
    assert parse_qs(urlsplit(requests[0]).query) == {"name": ["London"], "count": ["6"], "language": ["en"], "format": ["json"]}
    assert parse_qs(urlsplit(requests[1]).query) == {"id": ["2643743"]}
    assert "London" not in caplog.text and "2643743" not in caplog.text
    assert "GeoNames" in result.attribution


@pytest.mark.parametrize("patch", [{"timezone": "MadeUp/Zone"}, {"latitude": 99},
                                    {"longitude": float("nan")}, {"feature_code": "ADM1"},
                                    {"id": -1}, {"country_code": "INVALID"}])
def test_invalid_provider_candidates_are_not_offered(monkeypatch, patch):
    monkeypatch.setattr(geocoder, "_fetch", lambda *args: {"results": [{**CITY, **patch}]})
    assert geocoder.search_places("test").places == []


def test_canonical_resolution_never_trusts_a_different_provider_id(monkeypatch):
    monkeypatch.setattr(geocoder, "_fetch", lambda *args: CITY)
    with pytest.raises(geocoder.GeocoderUnavailable):
        geocoder.resolve_place("geo:1")


def test_network_failures_and_oversized_responses_do_not_expose_query(monkeypatch):
    def fail(*args, **kwargs):
        raise RuntimeError("private-city-canary in transport detail")

    monkeypatch.setattr(geocoder, "urlopen", fail)
    with pytest.raises(geocoder.GeocoderUnavailable) as error:
        geocoder.search_places("private-city-canary")
    assert "private-city-canary" not in str(error.value)
    monkeypatch.setattr(geocoder, "urlopen", lambda *args, **kwargs: io.BytesIO(b"x" * 131073))
    with pytest.raises(geocoder.GeocoderUnavailable):
        geocoder.search_places("another-city")
