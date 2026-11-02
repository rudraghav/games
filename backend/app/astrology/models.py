"""Bounded private wire contracts shared by preview and saved Tarot readings."""

from datetime import UTC, date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

AstrologySystem = Literal["western", "vedic", "both"]


class PrivateModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class AstrologyInput(PrivateModel):
    system: AstrologySystem = "both"
    birth_date: date
    birth_time: str = Field(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$", max_length=5)
    place_id: str = Field(pattern=r"^geo:[1-9]\d{0,9}$", max_length=14)
    fold: Literal[0, 1] | None = None

    @field_validator("birth_date")
    @classmethod
    def supported_birth_date(cls, value: date) -> date:
        if not date(1900, 1, 1) <= value <= datetime.now(UTC).date():
            raise ValueError("Use a birth date from 1900 through today.")
        return value


class AstrologyPlace(PrivateModel):
    id: str
    label: str = Field(min_length=1, max_length=180)
    latitude: float = Field(ge=-90, le=90, allow_inf_nan=False)
    longitude: float = Field(ge=-180, le=180, allow_inf_nan=False)
    timezone: str = Field(min_length=1, max_length=80)
    country_code: str = Field(pattern=r"^[A-Z]{2}$")


class AstrologyPlaceSearch(PrivateModel):
    match_id: str = Field(min_length=36, max_length=36)
    query: str = Field(min_length=3, max_length=80)


class AstrologyPlaces(PrivateModel):
    places: list[AstrologyPlace] = Field(max_length=6)
    attribution: str = "Location data: GeoNames via Open-Meteo (CC BY 4.0)."


class AstrologyPreviewInput(PrivateModel):
    match_id: str = Field(min_length=36, max_length=36)
    astrology: AstrologyInput


class AstrologyTimeChoice(PrivateModel):
    fold: Literal[0, 1]
    label: str
    utc_offset: str


class AstrologyIssue(PrivateModel):
    code: Literal["ambiguous_local_time", "nonexistent_local_time", "unsupported_location"]
    message: str
    choices: list[AstrologyTimeChoice] = Field(default_factory=list, max_length=2)


class AstrologyPoint(PrivateModel):
    id: str
    name: str
    longitude: float = Field(ge=0, lt=360, allow_inf_nan=False)
    sign: str
    sign_index: int = Field(ge=0, le=11)
    degree: float = Field(ge=0, lt=30, allow_inf_nan=False)
    house: int = Field(ge=1, le=12)
    retrograde: bool = False


class AstrologyHouse(PrivateModel):
    number: int = Field(ge=1, le=12)
    sign: str
    sign_index: int = Field(ge=0, le=11)
    start_longitude: float = Field(ge=0, lt=360)


class AstrologyAspect(PrivateModel):
    from_id: str
    to_id: str
    name: Literal["conjunction", "sextile", "square", "trine", "opposition"]
    angle: int
    orb: float = Field(ge=0, le=8)


class AstrologyNakshatra(PrivateModel):
    name: str
    index: int = Field(ge=0, le=26)
    pada: int = Field(ge=1, le=4)


class AstrologySystemChart(PrivateModel):
    system: Literal["western", "vedic"]
    label: str
    zodiac: Literal["tropical", "sidereal"]
    ayanamsa_name: str | None = None
    ayanamsa_degrees: float | None = None
    house_system: Literal["whole_sign"] = "whole_sign"
    ascendant: AstrologyPoint
    midheaven: AstrologyPoint
    placements: list[AstrologyPoint] = Field(min_length=9, max_length=12)
    houses: list[AstrologyHouse] = Field(min_length=12, max_length=12)
    aspects: list[AstrologyAspect] = Field(max_length=70)
    aspect_model: str = "Geometric major aspects; not classical Jyotish graha drishti."
    moon_nakshatra: AstrologyNakshatra | None = None


class AstrologyChart(PrivateModel):
    charts: list[AstrologySystemChart] = Field(min_length=1, max_length=2)
    calculation_version: str = "games-astro-1"
    source: str = "Astronomy Engine 2.1.19"
    precision_note: str = (
        "Geocentric positions; city-centre horizon, whole-sign houses. "
        "Vedic uses a fixed-J2000 Spica True Chitrapaksha anchor, not Lahiri; "
        "arcminute precision, not identical to every ephemeris convention. "
        "Birth-time accuracy matters. Astrology is a reflection, not a prediction."
    )


class AstrologyTimeResolution(PrivateModel):
    timezone: str = Field(min_length=1, max_length=80)
    utc_offset: str = Field(pattern=r"^[+-]\d{2}:\d{2}(?::\d{2})?$", max_length=9)


class AstrologyPreview(PrivateModel):
    status: Literal["ready", "needs_time_choice", "invalid_time"]
    chart: AstrologyChart | None = None
    issue: AstrologyIssue | None = None
    time_resolution: AstrologyTimeResolution | None = Field(
        default=None, description="Ephemeral resolved civil-time context; never saved with the chart."
    )


class AstrologyInterpretationSection(PrivateModel):
    focus_points: list[str] = Field(min_length=2, max_length=3)
    normal: str = Field(min_length=40, max_length=650)
    quirky: str = Field(min_length=40, max_length=500)


class AstrologyInterpretation(PrivateModel):
    western: AstrologyInterpretationSection | None = None
    vedic: AstrologyInterpretationSection | None = None
    tarot_connection: str = Field(min_length=40, max_length=650)
    next_step: str = Field(min_length=15, max_length=300)


class AstrologyReading(PrivateModel):
    chart: AstrologyChart
    interpretation: AstrologyInterpretation
