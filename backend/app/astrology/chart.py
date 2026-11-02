"""Deterministic tropical/True Chitrapaksha whole-sign charts. See README for models."""

import math
from datetime import UTC, datetime
from itertools import combinations

import astronomy  # type: ignore[import-untyped]

from app.astrology.models import (
    AstrologyAspect,
    AstrologyChart,
    AstrologyHouse,
    AstrologyInput,
    AstrologyIssue,
    AstrologyNakshatra,
    AstrologyPlace,
    AstrologyPoint,
    AstrologyPreview,
    AstrologySystemChart,
    AstrologyTimeResolution,
)
from app.astrology.timezones import birth_zone, format_utc_offset, resolve_birth_time

SIGNS = ("Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
         "Sagittarius", "Capricorn", "Aquarius", "Pisces")
NAKSHATRAS = ("Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
              "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
              "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
              "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
              "Uttara Bhadrapada", "Revati")
PLANETS = ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto")


def normalize(value: float) -> float:
    return value % 360


def difference(value: float) -> float:
    return (value + 180) % 360 - 180


def mean_node(centuries: float) -> float:
    # IERS 2003, Simon et al. 1994 fundamental argument Omega (ERFA faom03).
    coefficients = (450160.398036, -6962890.5431, 7.4722, 0.007702, -0.00005939)
    return normalize(sum(c * centuries**power for power, c in enumerate(coefficients)) / 3600)


def _node(time: astronomy.Time) -> float:
    t = time.tt / 36525
    omega = mean_node(t)
    # Four-term nutation moves mean-of-date Omega to the true equinox used here.
    sun = math.radians(280.4665 + 36000.7698 * t)
    moon = math.radians(218.3165 + 481267.8813 * t)
    node = math.radians(omega)
    dpsi = (-17.20 * math.sin(node) - 1.32 * math.sin(2 * sun)
            - 0.23 * math.sin(2 * moon) + 0.21 * math.sin(2 * node)) / 3600
    return normalize(omega + dpsi)


def _longitude(name: str, time: astronomy.Time) -> float:
    if name == "north_node":
        return _node(time)
    if name == "south_node":
        return normalize(_node(time) + 180)
    return float(astronomy.Ecliptic(astronomy.GeoVector(getattr(astronomy.Body, name), time, True)).elon)


def spica_longitude(time: astronomy.Time) -> float:
    # SIMBAD ICRS/J2000 Spica coordinates; proper motion is below one arcminute
    # over the supported dates. This is an explicitly named fixed-J2000 anchor.
    ra = math.radians(15 * (13 + 25 / 60 + 11.57937 / 3600))
    dec = math.radians(-(11 + 9 / 60 + 40.7501 / 3600))
    vector = astronomy.Vector(math.cos(dec) * math.cos(ra), math.cos(dec) * math.sin(ra),
                              math.sin(dec), time)
    return float(astronomy.Ecliptic(vector).elon)


def angles(time: astronomy.Time, latitude: float, longitude: float) -> tuple[float, float]:
    if abs(latitude) >= 89:
        raise ValueError("The horizon angle is unsupported this close to a pole.")
    theta = math.radians(15 * astronomy.SiderealTime(time) + longitude)
    phi = math.radians(latitude)
    normal = astronomy.RotateVector(astronomy.Rotation_ECT_EQD(time), astronomy.Vector(0, 0, 1, time))
    zenith = (math.cos(phi) * math.cos(theta), math.cos(phi) * math.sin(theta), math.sin(phi))
    # Intersection of the local horizon and true ecliptic. Choose the rising
    # eastern intersection, never its 180-degree setting antipode.
    rising = [normal.y * zenith[2] - normal.z * zenith[1],
              normal.z * zenith[0] - normal.x * zenith[2],
              normal.x * zenith[1] - normal.y * zenith[0]]
    east = (-math.sin(theta), math.cos(theta), 0)
    dot = sum(a * b for a, b in zip(rising, east, strict=True))
    if abs(dot) < 1e-10:
        raise ValueError("A rising ecliptic intersection is not defined for this horizon.")
    if dot < 0:
        rising = [-v for v in rising]
    eqd_to_ect = astronomy.Rotation_EQD_ECT(time)
    asc = astronomy.RotateVector(eqd_to_ect, astronomy.Vector(*rising, time))
    # The upper transit has right ascension equal to local sidereal time;
    # unlike the Ascendant this convention does not depend on latitude.
    meridian = astronomy.Vector(normal.z * math.cos(theta), normal.z * math.sin(theta),
                                 -normal.y * math.sin(theta), time)
    mc = astronomy.RotateVector(eqd_to_ect, meridian)
    return normalize(math.degrees(math.atan2(asc.y, asc.x))), normalize(math.degrees(math.atan2(mc.y, mc.x)))


def nakshatra(longitude: float) -> AstrologyNakshatra:
    position = normalize(longitude) * 27 / 360
    index = min(26, int(position))
    return AstrologyNakshatra(name=NAKSHATRAS[index], index=index,
                              pada=min(4, int((position - index) * 4) + 1))


def _point(ident: str, name: str, longitude: float, asc_sign: int, retrograde: bool = False) -> AstrologyPoint:
    longitude = normalize(longitude)
    sign = int(longitude // 30)
    return AstrologyPoint(id=ident, name=name, longitude=longitude, sign=SIGNS[sign],
                          sign_index=sign, degree=longitude % 30, house=(sign - asc_sign) % 12 + 1,
                          retrograde=retrograde)


def _aspects(points: list[AstrologyPoint]) -> list[AstrologyAspect]:
    values: list[AstrologyAspect] = []
    for a, b in combinations(points, 2):
        separation = abs(difference(a.longitude - b.longitude))
        for angle, name in [(0, "conjunction"), (60, "sextile"), (90, "square"),
                            (120, "trine"), (180, "opposition")]:
            orb = abs(separation - angle)
            limit = 8 if {a.id, b.id} & {"sun", "moon"} else 6
            if orb <= limit:
                values.append(AstrologyAspect(from_id=a.id, to_id=b.id, name=name, angle=angle, orb=round(orb, 4)))  # type: ignore[arg-type]
    return sorted(values, key=lambda a: (a.orb, a.from_id, a.to_id))


def calculate_chart(data: AstrologyInput, place: AstrologyPlace) -> AstrologyPreview:
    instant = resolve_birth_time(data, place.timezone)
    if isinstance(instant, AstrologyIssue):
        return AstrologyPreview(status="needs_time_choice" if instant.choices else "invalid_time", issue=instant)
    preview = chart_at(instant, place.latitude, place.longitude, data.system)
    if preview.status == "ready":
        preview.time_resolution = AstrologyTimeResolution(
            timezone=place.timezone,
            utc_offset=format_utc_offset(instant.astimezone(birth_zone(place.timezone))),
        )
    return preview


def chart_at(instant: datetime, latitude: float, longitude: float, system: str) -> AstrologyPreview:
    if instant.tzinfo is None or instant.utcoffset() is None:
        raise ValueError("A resolved timezone-aware instant is required.")
    utc = instant.astimezone(UTC)
    time = astronomy.Time.Make(utc.year, utc.month, utc.day, utc.hour, utc.minute,
                               utc.second + utc.microsecond / 1_000_000)
    try:
        asc, mc = angles(time, latitude, longitude)
    except ValueError:
        return AstrologyPreview(status="invalid_time", issue=AstrologyIssue(
            code="unsupported_location", message="This location/time has an undefined rising angle. Choose another recorded location."
        ))
    names = list(PLANETS) + ["north_node", "south_node"]
    longs = {name: _longitude(name, time) for name in names}
    retro = {name: difference(_longitude(name, time.AddDays(0.25)) - _longitude(name, time.AddDays(-0.25))) < 0 for name in names}
    ayanamsa = normalize(spica_longitude(time) - 180)
    charts = []
    for kind in ("western", "vedic"):
        if system not in {"both", kind}:
            continue
        offset = ayanamsa if kind == "vedic" else 0
        asc_sign = int(normalize(asc - offset) // 30)
        placements = []
        for name in names:
            if kind == "vedic" and name in {"Uranus", "Neptune", "Pluto"}:
                continue
            label = ("Rahu (mean node)" if name == "north_node" else "Ketu (mean node)") if kind == "vedic" and name.endswith("_node") else name.replace("_", " ").title()
            placements.append(_point(name.lower(), label, longs[name] - offset, asc_sign, retro[name]))
        houses = [AstrologyHouse(number=i + 1, sign=SIGNS[(asc_sign + i) % 12],
                                  sign_index=(asc_sign + i) % 12,
                                  start_longitude=((asc_sign + i) % 12) * 30) for i in range(12)]
        charts.append(AstrologySystemChart(
            system=kind, label="Western · tropical" if kind == "western" else "Vedic · True Chitrapaksha",
            zodiac="tropical" if kind == "western" else "sidereal",
            ayanamsa_name="True Chitrapaksha (Spica at 180°)" if kind == "vedic" else None,
            ayanamsa_degrees=ayanamsa if kind == "vedic" else None,
            ascendant=_point("ascendant", "Ascendant", asc - offset, asc_sign),
            midheaven=_point("midheaven", "Midheaven", mc - offset, asc_sign), placements=placements,
            houses=houses, aspects=_aspects(placements),
            moon_nakshatra=nakshatra(longs["Moon"] - offset) if kind == "vedic" else None,
        ))  # type: ignore[arg-type]
    return AstrologyPreview(status="ready", chart=AstrologyChart(charts=charts))
