from pydantic import JsonValue

from app.core.cards import shuffle_saved
from app.core.contracts import RuleError, State
from app.games.deal.deck import RENTS, DealCard


def draw_cards(s: State, count: int) -> list[str]:
    """Deal discards have no active top card: recycle the entire used pile."""
    drawn = []
    for _ in range(count):
        if not s["deck"]:
            if not s["discard"]:
                break
            s["deck"], s["discard"] = s["discard"], []
            shuffle_saved(s, s["deck"])
        drawn.append(s["deck"].pop())
    return drawn


def complete(group: list[str], cards: dict[str, DealCard], color: str) -> bool:
    props = [c for c in group if cards[c].kind == "property"]
    return len(props) >= len(RENTS[color]) and any(cards[c].value for c in props)


def groups_for(s: State, player: str, color: str, cards: dict[str, DealCard]) -> list[str]:
    groups = s["properties"][player]
    # Reuse one emptied pile rather than allocating unbounded keys when a player
    # repeatedly rearranges the same card. Keep the old first-available order.
    empty = next((key for key, group in groups.items() if key.split(":")[0] == color and not group), None)
    available = [
        key
        for key, value in groups.items()
        if key.split(":")[0] == color
        and sum(cards[c].kind == "property" for c in value) < len(RENTS[color])
        and (value or key == empty)
    ]
    if empty:
        return available
    index = 0
    while f"{color}:{index}" in groups:
        index += 1
    return available + [f"{color}:{index}"]


def place(
    s: State, player: str, ident: str, cards: dict[str, DealCard], color: str | None = None,
    destination: str = "",
) -> None:
    card = cards[ident]
    if card.kind != "property":
        s["banks"][player].append(ident)
        return
    chosen = color or card.colors[0]
    available = groups_for(s, player, chosen, cards)
    if chosen not in card.colors or destination and destination not in available:
        raise RuleError("Choose an available collection for this property.")
    key = destination or available[0]
    s["properties"][player].setdefault(key, []).append(ident)


def locate(s: State, player: str, ident: str) -> str | None:
    return next((key for key, group in s["properties"][player].items() if ident in group), None)


def transfer(s: State, source: str, target: str, ident: str, cards: dict[str, DealCard]) -> None:
    if ident in s["banks"][source]:
        s["banks"][source].remove(ident)
        s["banks"][target].append(ident)
        return
    key = locate(s, source, ident)
    if key is None:
        return
    s["properties"][source][key].remove(ident)
    place(s, target, ident, cards, key.split(":")[0] if cards[ident].kind == "property" else None)
    attached = [
        c for c, prop in s["links"].items() if prop == ident and c in s["properties"][source][key]
    ]
    for building in attached:
        s["properties"][source][key].remove(building)
        destination = locate(s, target, ident)
        s["properties"][target][destination].append(building)


def assets(s: State, player: str, cards: dict[str, DealCard]) -> list[str]:
    return s["banks"][player] + [
        c for group in s["properties"][player].values() for c in group if cards[c].value
    ]


def rent(s: State, player: str, key: str, cards: dict[str, DealCard]) -> int:
    group = s["properties"][player][key]
    color = key.split(":")[0]
    # A zero-value any-colour wild cannot collect rent by itself. Buildings
    # cannot supply the missing property base, including an inactive Shack.
    if not any(cards[c].kind == "property" and cards[c].value for c in group):
        return 0
    count = sum(cards[c].kind == "property" for c in group)
    value = RENTS[color][min(count, len(RENTS[color])) - 1]
    for ident in group:
        action = cards[ident].action
        if action == "shack":
            value += 5
        elif complete(group, cards, color):
            value += 3 if action == "house" else 4 if action == "hotel" else 0
    return value


def collection_details(s: State, cards: dict[str, DealCard]) -> list[JsonValue]:
    result: list[JsonValue] = []
    for player in s["order"]:
        for key, group in s["properties"][player].items():
            if not group:
                continue
            color = key.split(":")[0]
            count = sum(cards[c].kind == "property" for c in group)
            result.append({
                "player": player, "key": key, "color": color, "count": count,
                "set_size": len(RENTS[color]), "complete": complete(group, cards, color),
                "rent": rent(s, player, key, cards) if count else 0,
            })
    return result


def finish(s: State, cards: dict[str, DealCard]) -> None:
    for player in s["order"]:
        colors = {
            key.split(":")[0]
            for key, group in s["properties"][player].items()
            if complete(group, cards, key.split(":")[0])
        }
        s["scores"][player] = len(colors)
        if len(colors) >= 3:
            s["winners"], s["phase"] = [player], "finished"
            return
