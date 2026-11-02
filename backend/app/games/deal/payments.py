"""Exact public transfer consequences, shared by payment validation and bots.

One bundle per payable asset keeps projections linear in the physical inventory.
Combining bundles never needs private state or enumerates all possible payments.
"""

from app.core.contracts import RuleError, State
from app.games.deal.deck import DealCard
from app.games.deal.table import assets, transfer_cards


def payment_bundles(s: State, player: str, cards: dict[str, DealCard]) -> list[dict]:
    return [
        {"card": ident, "transfers": [
            {"id": carried, "value": cards[carried].value}
            for carried in transfer_cards(s, player, ident)
        ]}
        for ident in assets(s, player, cards)
    ]


def combine_payment_bundles(bundles: list[dict], selected: list[str]) -> dict[str, int]:
    """Union a selection's server-authored public consequences without duplicates."""
    available = {bundle["card"]: bundle for bundle in bundles}
    if len(set(selected)) != len(selected) or not set(selected) <= available.keys():
        raise RuleError("Choose only payable cards in your bank or collection.")
    return {
        card["id"]: card["value"]
        for ident in selected
        for card in available[ident]["transfers"]
    }
