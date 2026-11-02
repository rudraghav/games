"""Synthetic astronomical/timezone references, never a person's private birth data."""

from datetime import UTC, datetime
from math import cos, degrees, radians, sin

import astronomy
import pytest
from pydantic import ValidationError

from app.astrology.chart import angles, chart_at, mean_node, nakshatra, normalize, spica_longitude
from app.astrology.models import AstrologyInput, AstrologyIssue
from app.astrology.timezones import birth_zone, resolve_birth_time

J2000 = datetime(2000, 1, 1, 12, tzinfo=UTC)


def data(day="2000-01-01", clock="12:00", **extra):
    return AstrologyInput(birth_date=day, birth_time=clock, place_id="geo:2643743", **extra)


def test_planets_match_independent_nasa_jpl_apparent_geocentric_reference():
    # NASA/JPL Horizons, Earth centre500@399, OBSERVER quantity31, UTC2000-01-01
    #12:00:00, apparent ecliptic of date. https://ssd.jpl.nasa.gov/horizons/manual.html
    references = {"sun": 280.3689092, "moon": 223.3237860, "mercury": 271.8892699,
                  "mars": 327.9632921, "jupiter": 25.2530685}
    western = chart_at(J2000, 51.4779, 0, "western").chart.charts[0]
    for point in western.placements:
        if point.id in references:
            assert point.longitude == pytest.approx(references[point.id], abs=1 / 60)


def test_angles_and_node_match_independent_test_only_swiss_reference():
    # pyswisseph2.10.3.2, houses_ex(2451545.0,51.4779,0,b'W'); Moshier only.
    # Numeric references only; no Swiss Ephemeris code/dependency is shipped.
    chart = chart_at(J2000, 51.4779, 0, "both").chart
    western, vedic = chart.charts
    assert western.ascendant.longitude == pytest.approx(24.26618920267986, abs=1 / 60)
    assert western.midheaven.longitude == pytest.approx(279.61108780028457, abs=1 / 60)
    assert [h.start_longitude for h in western.houses] == list(range(0, 360, 30))
    assert next(p.longitude for p in western.placements if p.id == "north_node") == pytest.approx(125.04064605661608, abs=1 / 60)
    assert next(p.longitude for p in vedic.placements if p.id == "sun") == pytest.approx(256.5327744933499, abs=1 / 60)
    assert next(p.longitude for p in vedic.placements if p.id == "moon") == pytest.approx(199.48763025641642, abs=1 / 60)
    assert next(p.longitude for p in vedic.placements if p.id == "north_node") == pytest.approx(101.20450087462275, abs=1 / 60)


def test_both_chart_systems_preserve_deterministic_positions_and_real_house_angles():
    chart = chart_at(J2000, 51.4779, 0, "both").chart
    assert chart == chart_at(J2000, 51.4779, 0, "both").chart
    west, vedic = chart.charts
    assert len(west.placements) == 12 and len(vedic.placements) == 9
    assert "Lahiri" not in vedic.ayanamsa_name
    assert "True Chitrapaksha" in vedic.ayanamsa_name
    assert normalize(spica_longitude(astronomy.Time.Make(2000, 1, 1, 12, 0, 0)) - vedic.ayanamsa_degrees) == pytest.approx(180)
    by_id = {p.id: p for p in west.placements}
    for p in vedic.placements:
        assert p.longitude == pytest.approx(normalize(by_id[p.id].longitude - vedic.ayanamsa_degrees))
        assert p.sign_index == int(p.longitude // 30)
        assert p.house == (p.sign_index - vedic.ascendant.sign_index) % 12 + 1
    assert all(a.from_id in by_id and a.to_id in by_id and a.orb <= 8 for a in west.aspects)
    assert vedic.moon_nakshatra == nakshatra(next(p.longitude for p in vedic.placements if p.id == "moon"))
    assert western_only().chart.charts[0].system == "western"


def western_only():
    return chart_at(J2000, 0, 0, "western")


@pytest.mark.parametrize("latitude", [-65, -33, 0, 28, 65])
@pytest.mark.parametrize("longitude", [-122, 151])
def test_ascendant_is_the_physical_rising_horizon_intersection_in_both_hemispheres(latitude, longitude):
    time = astronomy.Time.Make(2000, 1, 1, 12, 0, 0)
    ascendant, _ = angles(time, latitude, longitude)
    longitude_rad = radians(ascendant)
    ecliptic = astronomy.Vector(cos(longitude_rad), sin(longitude_rad), 0, time)
    equatorial = astronomy.EquatorFromVector(astronomy.RotateVector(astronomy.Rotation_ECT_EQD(time), ecliptic))
    observer = astronomy.Observer(latitude, longitude)
    at_horizon = astronomy.Horizon(time, observer, equatorial.ra, equatorial.dec, astronomy.Refraction.Airless)
    a_minute_later = astronomy.Horizon(time.AddDays(1 / 1440), observer, equatorial.ra, equatorial.dec, astronomy.Refraction.Airless)
    assert at_horizon.altitude == pytest.approx(0, abs=1e-7)
    assert 0 < at_horizon.azimuth < 180
    assert a_minute_later.altitude > 0


@pytest.mark.parametrize("longitude,index,pada", [(0, 0, 1), (10, 0, 4), (40 / 3, 1, 1),
                                                   (180, 13, 3), (359.999, 26, 4), (360, 0, 1)])
def test_nakshatra_and_pada_boundaries(longitude, index, pada):
    result = nakshatra(longitude)
    assert (result.index, result.pada) == (index, pada)


def test_mean_node_uses_published_iers_fundamental_argument():
    # ERFA/SOFA faom03(0.8) reference; https://github.com/liberfa/erfa/blob/master/src/t_erfa_c.c
    assert mean_node(0.8) == pytest.approx(degrees(-5.973618440951302183) % 360, abs=1e-10)


@pytest.mark.parametrize("zone,day,clock", [("America/New_York", "2000-04-02", "02:30"),
                                           ("Pacific/Apia", "2011-12-30", "12:00")])
def test_nonexistent_local_times_are_rejected_without_guessing(zone, day, clock):
    issue = resolve_birth_time(data(day, clock), zone)
    assert isinstance(issue, AstrologyIssue) and issue.code == "nonexistent_local_time"
    assert issue.choices == []


@pytest.mark.parametrize("zone,day,clock,minutes", [("America/New_York", "2000-10-29", "01:30", 60),
                                                  ("Australia/Lord_Howe", "2021-04-04", "01:45", 30)])
def test_ambiguous_times_require_explicit_occurrence(zone, day, clock, minutes):
    issue = resolve_birth_time(data(day, clock), zone)
    assert isinstance(issue, AstrologyIssue) and issue.code == "ambiguous_local_time"
    assert [c.fold for c in issue.choices] == [0, 1]
    first = resolve_birth_time(data(day, clock, fold=0), zone)
    second = resolve_birth_time(data(day, clock, fold=1), zone)
    assert (second - first).total_seconds() == minutes * 60


def test_historical_iana_offsets_are_used_including_seconds_and_wartime():
    assert resolve_birth_time(data("1943-01-01"), "Asia/Kolkata").hour == 5
    historic = datetime(1900, 1, 1, 12, tzinfo=birth_zone("Asia/Kolkata"))
    assert historic.utcoffset().total_seconds() == 19270
    assert resolve_birth_time(data("1900-01-01"), "Asia/Kolkata").second == 50
    with pytest.raises(ValueError):
        chart_at(datetime(2000, 1, 1), 0, 0, "both")


@pytest.mark.parametrize("extra", [{"birth_date": "1899-12-31"}, {"birth_date": "2500-01-01"},
                                    {"birth_date": "2000-02-30"}, {"birth_time": "24:00"},
                                    {"birth_time": "12:60"}, {"birth_time": "12:00Z"},
                                    {"place_id": "../secret"}, {"system": "lahiri"}, {"fold": 2}])
def test_birth_input_is_bounded_and_never_accepts_arbitrary_timezones_or_coordinates(extra):
    base = {"birth_date": "2000-01-01", "birth_time": "12:00", "place_id": "geo:2643743"}
    with pytest.raises(ValidationError):
        AstrologyInput.model_validate({**base, **extra})
    with pytest.raises(ValidationError):
        AstrologyInput.model_validate({**base, "longitude": 0})
