"""Safe public move descriptions from authorized projections, not engine state.

The exact same card face must exist in an allowlisted public zone for every
participant before it can enter durable history. Private hands, arbitrary detail,
engine messages and submitted text are never copied. Hidden choices receive a
fixed description. Current viewers cannot use history to read a private face.
"""

from collections.abc import Mapping
from typing import Any

from pydantic import ValidationError

from app.core.contracts import Action, CardView, GameView
from app.rooms.public_actions import public_action
from app.rooms.schemas import PublicMoveView

HISTORY_LIMIT = 80
CARD_LIMIT = 12

LABELS: dict[str, dict[str, str]] = {
    "uno": {"play": "Played a card", "draw": "Drew cards", "choose": "Chose a colour",
            "uno": "Called UNO", "catch_uno": "Caught an unannounced UNO",
            "accept": "Accepted the draw", "challenge": "Challenged a Wild Draw Four",
            "end_turn": "Passed the turn"},
    "deal": {"bank": "Banked a card", "property": "Placed a property", "play": "Played an action",
             "rearrange": "Moved a property", "pay": "Paid a bill", "no": "Played Just Say No",
             "accept": "Accepted the action", "choose": "Chose a public card",
             "keep": "Kept a public card", "give": "Gave a public card",
             "discard": "Discarded a card", "settle_debt": "Settled a debt with a private card",
             "end_turn": "Ended the turn"},
    "holdem": {"fold": "Folded", "check": "Checked", "call": "Called", "raise": "Raised",
               "all_in": "Went all in"},
    "teen-patti": {"fold": "Folded", "peek": "Looked at their cards", "bet": "Bet",
                   "show": "Requested a show", "sideshow": "Requested a sideshow",
                   "accept": "Accepted the sideshow", "decline": "Declined the sideshow"},
    "blackjack": {"bet": "Placed a bet", "accept": "Took insurance", "decline": "Declined insurance",
                  "hit": "Drew a card", "stand": "Stood", "split": "Split their hand",
                  "double": "Doubled down"},
    "rummy": {"draw_stock": "Drew from the stock", "draw_discard": "Took the discard",
              "discard": "Discarded a card", "declare": "Declared a hand", "fold": "Dropped"},
    "skyjo": {"draw_stock": "Drew a private card", "draw_discard": "Took the discard",
              "swap": "Replaced a grid card", "discard": "Discarded the drawn card",
              "reveal": "Revealed a grid card", "next_round": "Started the next round"},
    "tarot": {"pick": "Chose a Tarot card"},
    "four-in-a-row": {"drop": "Dropped a disc"},
    "reversi": {"place": "Placed a disc"},
    "checkers": {"move": "Moved a checker"},
    "mancala": {"sow": "Sowed seeds"},
    "word-agents": {"clue": "Gave a clue", "guess": "Chose a word", "end_guesses": "Ended guessing"},
    "gem-market": {"buy": "Bought a development", "reserve": "Reserved a market card",
                   "reserve_blind": "Reserved a hidden card", "take": "Took gems",
                   "take_pair": "Took a matching pair of gems", "return": "Returned a gem",
                   "patron": "Welcomed a patron", "pass": "Passed"},
    "flip-7": {"hit": "Drew a card", "stay": "Stayed", "target_effect": "Played an effect",
               "next_round": "Started the next round"},
    "trio": {"reveal_hand": "Revealed a hand-end card", "reveal_table": "Revealed a table card",
             "continue": "Continued after the reveal"},
    "azul": {"draft_tiles": "Drafted tiles", "place_tiles": "Placed tiles",
             "next_round": "Started the next round"},
    "party": {"respond": "Locked a response", "vote": "Locked a choice", "choose": "Locked a choice",
              "predict": "Locked a prediction", "next_prompt": "Started the next prompt"},
    "the-gang": {"claim_chip": "Claimed a ranking chip", "return_chip": "Returned their chip",
                 "reveal_hand": "Revealed a poker hand", "next_heist": "Started the next heist"},
    "six-nimmt": {"select_number": "Locked a number", "take_row": "Took a row",
                  "next_selection": "Continued to the next selection", "next_round": "Started the next round"},
    "sea-salt-paper": {"take_stock": "Drew two private cards", "keep": "Kept a private card and discarded the other",
                       "take_discard": "Took a discard", "pair": "Played a duo",
                       "inspect": "Inspected a discard pile", "take_inspected": "Took a discard",
                       "steal": "Took a random private card", "stop": "Stopped the round",
                       "last_chance": "Called Last Chance", "reveal_mermaids": "Revealed four mermaids",
                       "end_turn": "Finished the turn", "next_round": "Started the next round"},
    "boop": {"place": "Placed a piece", "graduate": "Graduated kittens", "return_piece": "Returned a piece"},
    "shithead": {"arrange": "Chose three face-up cards", "play": "Played cards",
                 "flip": "Flipped a table card", "pickup": "Picked up the pile"},
}

PRIVATE_CARD_MOVES = {
    ("deal", "settle_debt"), ("tarot", "pick"), ("six-nimmt", "select_number"),
    ("gem-market", "reserve_blind"), ("sea-salt-paper", "steal"),
}
TARGET_MOVES = {
    "deal": {"play", "give", "settle_debt"}, "uno": {"play", "choose", "catch_uno"},
    "teen-patti": {"show", "sideshow", "accept", "decline"},
    "trio": {"reveal_hand"}, "flip-7": {"target_effect"}, "sea-salt-paper": {"steal"},
}
BOARD_GAMES = {"four-in-a-row", "reversi", "checkers", "mancala", "boop"}
GEM_RESOURCES = {"pearl", "sapphire", "ruby", "emerald", "onyx", "gold"}


def family(game: str) -> str:
    if game in {"uno", "uno-no-mercy"}:
        return "uno"
    if game in {"deal", "deal-no-mercy"}:
        return "deal"
    return "party" if game in {"hot-seat", "most-likely", "spill-or-chill"} else game


def _detail_cards(view: GameView) -> list[CardView]:
    """Only documented universally public detail paths; no recursive traversal."""
    raw: list[Any] = []
    if view.game_id in {"trio", "six-nimmt"}:
        reveals = view.detail.get("revealed")
        if isinstance(reveals, list):
            raw.extend(item.get("card") for item in reveals if isinstance(item, dict))
    if view.game_id == "six-nimmt":
        rows = view.detail.get("rows")
        if isinstance(rows, list):
            raw.extend(card for row in rows if isinstance(row, list) for card in row)
    if view.game_id == "sea-salt-paper":
        tops = view.detail.get("discard_tops")
        if isinstance(tops, list):
            raw.extend(tops)
    if view.game_id == "shithead":
        last_play = view.detail.get("last_play")
        if isinstance(last_play, dict):
            raw.append(last_play.get("card"))
            cards = last_play.get("cards")
            if isinstance(cards, list):
                raw.extend(cards)
    result = []
    for value in raw:
        try:
            result.append(CardView.model_validate(value))
        except ValidationError:
            continue
    return result


def public_cards(views: Mapping[str, GameView]) -> dict[str, CardView]:
    """Exact common faces, ignoring private hands, arbitrary detail and text."""
    common: dict[str, CardView] | None = None
    for view in views.values():
        cards = [*view.community, *_detail_cards(view)]
        cards.extend(card for card in [view.discard, view.drawn] if card is not None)
        for player in view.players:
            cards.extend(player.bank)
            cards.extend(card for group in player.properties.values() for card in group)
            cards.extend(card for card in player.cards if card is not None)
        found = {card.id: card for card in cards if card.suit not in {"hidden", "empty"}}
        common = found if common is None else {
            key: value for key, value in common.items() if found.get(key) == value
        }
    return common or {}


def _destination(group: str, action: Action, before: GameView, after: GameView) -> str | None:
    if group == "uno" and action.type in {"play", "choose"} and action.color in {"red", "yellow", "green", "blue"}:
        return action.color.title()
    if group == "deal" and action.type in {"property", "rearrange", "play"}:
        key = action.choice if action.type in {"property", "rearrange"} else action.color
        groups = after.detail.get("property_groups")
        reference = next((item for item in groups if isinstance(item, dict)
                          and item.get("color") == key.split(":")[0]), None) if isinstance(groups, list) else None
        if reference and isinstance(reference.get("name"), str):
            pile = key.split(":")
            return str(reference["name"]) + (f" · set {int(pile[1]) + 1}" if len(pile) == 2 and pile[1].isdigit() else "")
    if group == "skyjo" and action.type in {"swap", "reveal"}:
        return f"Row {action.slot // 4 + 1}, column {action.slot % 4 + 1}"
    if group == "azul":
        if action.type == "draft_tiles":
            source = "centre" if action.choice == "center" else f"factory {int(action.choice) + 1}" if action.choice.isdigit() else None
            return f"{action.color.title()} · {source}" if source and action.color in {"blue", "red", "yellow", "black", "white"} else None
        if action.type == "place_tiles":
            return "Floor" if action.choice == "floor" else f"Pattern line {int(action.choice) + 1}" if action.choice in {"0", "1", "2", "3", "4"} else None
    if group == "six-nimmt" and action.type == "take_row" and action.choice in {"0", "1", "2", "3"}:
        return f"Row {int(action.choice) + 1}"
    if group in BOARD_GAMES:
        if group == "boop" and action.type == "graduate":
            cells = action.choice.split(",")
            if len(cells) == 3 and all(cell.isdigit() and int(cell) < 36 for cell in cells):
                return ", ".join(f"{chr(65 + int(cell) % 6)}{int(cell) // 6 + 1}" for cell in cells)
        if group == "mancala" and action.choice.isdigit():
            return f"Pit {int(action.choice) % 7 + 1}"
        if group == "four-in-a-row" and action.choice.isdigit():
            return f"Column {int(action.choice) + 1}"
        if group == "checkers" and ":" in action.choice:
            cells = action.choice.split(":")
            if len(cells) == 2 and all(cell.isdigit() and int(cell) < 64 for cell in cells):
                return " → ".join(f"{chr(65 + int(cell) % 8)}{8 - int(cell) // 8}" for cell in cells)
        if action.choice.isdigit() and int(action.choice) < (36 if group == "boop" else 64):
            columns = 6 if group == "boop" else 8
            return f"{chr(65 + int(action.choice) % columns)}{int(action.choice) // columns + 1}"
    if group == "trio" and action.type == "reveal_hand" and action.choice in {"low", "high"}:
        return "Lowest card" if action.choice == "low" else "Highest card"
    if group == "trio" and action.type == "reveal_table" and action.choice.isdigit():
        return f"Table position {int(action.choice) + 1}"
    if group == "the-gang" and action.type == "claim_chip" and 1 <= action.amount <= 6:
        return f"{action.amount}-star chip"
    return None


def public_move(
    before_views: Mapping[str, GameView], after_views: Mapping[str, GameView],
    actor: str, action: Action, version: int,
) -> PublicMoveView | None:
    if actor not in before_views or actor not in after_views:
        return None
    before, after = before_views[actor], after_views[actor]
    group = family(before.game_id)
    known = action.type in LABELS.get(group, {})
    kind = action.type if known else "move"
    label = LABELS.get(group, {}).get(kind, "Made a move")
    targets = [action.target] if action.type in TARGET_MOVES.get(group, set()) and action.target in before_views else []
    if group == "deal" and kind in {"pay", "no", "accept"}:
        effect = before.detail.get("pending_action")
        if isinstance(effect, dict) and all(view.detail.get("pending_action") == effect for view in before_views.values()):
            other = effect.get("actor") if effect.get("actor") != actor else effect.get("target")
            targets = [other] if isinstance(other, str) and other in before_views else []
    if group == "teen-patti" and kind == "sideshow" and isinstance(after.current_player, str) and after.current_player in after_views:
        targets = [after.current_player]
    cue = public_action(before, actor, action, version)
    amount = cue["amount"] if cue else None
    if group == "deal":
        source = after if kind == "play" else before
        effect = source.detail.get("pending_action")
        views = after_views if kind == "play" else before_views
        if kind in {"play", "pay", "no", "accept"} and isinstance(effect, dict) and all(v.detail.get("pending_action") == effect for v in views.values()):
            value = effect.get("amount")
            if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
                amount = value
            if kind == "play" and not targets and isinstance(effect.get("target"), str) and effect["target"] in before_views:
                targets = [str(effect["target"])]
    count: int | None = None
    cards: list[CardView] = []
    if known and group not in BOARD_GAMES and group not in {"party", "tarot"} and (group, kind) not in PRIVATE_CARD_MOVES:
        old, new = public_cards(before_views), public_cards(after_views)
        chosen = [action.card, *action.cards]
        if group == "deal" and action.choice in old:
            chosen.append(action.choice)
        if group == "word-agents" and kind == "guess":
            chosen.append(action.choice)
        if kind == "draw_discard" and before.discard is not None:
            chosen.append(before.discard.id)
        if group == "sea-salt-paper" and kind == "take_discard" and action.choice in {"0", "1"}:
            tops = before.detail.get("discard_tops")
            if isinstance(tops, list) and len(tops) > int(action.choice):
                top = tops[int(action.choice)]
                ident = top.get("id") if isinstance(top, dict) else None
                if isinstance(ident, str):
                    chosen.append(ident)
        cards_by_id = {key: (new.get(key) or old[key]) for key in chosen if key in new or key in old}
        if group != "gem-market":
            cards_by_id.update({key: card for key, card in new.items() if old.get(key) != card})
        cards = list(cards_by_id.values())
        count = len(cards) or None
        if group == "deal" and kind in {"bank", "pay"}:
            amount = sum(int(card.value[:-1]) for card in cards if card.value.endswith("M") and card.value[:-1].isdigit())
        if group == "deal" and kind == "play" and not action.target:
            played = next((card for card in cards if card.id == action.card), None)
            if played and played.effect in {"birthday", "heist", "crash", "super_sly"} or played and played.effect in {"rent", "rent_double"} and (before.game_id == "deal-no-mercy" or len(played.colors) == 2):
                targets = [p for p in before_views if p != actor]
    if group in {"uno", "rummy", "skyjo", "sea-salt-paper"} and kind in {"draw", "draw_stock", "take_stock"}:
        old_count = next((p.count for p in before.players if p.id == actor), 0)
        new_count = next((p.count for p in after.players if p.id == actor), old_count)
        count = 2 if group == "sea-salt-paper" else max(1, new_count - old_count)
    if group == "tarot" and kind == "pick" or group == "six-nimmt" and kind == "select_number":
        count = 1
    if group == "six-nimmt" and kind == "select_number" and after.phase != "selecting":
        old, new = public_cards(before_views), public_cards(after_views)
        cards = [card for key, card in new.items() if old.get(key) != card]
        count = len(cards)
        label = "Everyone’s numbers were revealed"
    if group == "azul" and kind == "draft_tiles":
        draft = after.detail.get("draft")
        if isinstance(draft, list) and all(view.detail.get("draft") == draft for view in after_views.values()):
            label = f"Drafted {len(draft)} tiles"
    if group == "gem-market":
        colors = action.choice.split(",")
        if kind == "take" and colors and all(color in GEM_RESOURCES for color in colors):
            label = "Took " + ", ".join(colors)
        elif kind == "take_pair" and action.choice in GEM_RESOURCES:
            label = f"Took two {action.choice} gems"
        elif kind == "return" and action.choice in GEM_RESOURCES:
            label = f"Returned one {action.choice} gem"
    if group == "the-gang" and kind == "claim_chip":
        label = f"Claimed a {action.amount}-star chip"
    if group == "boop" and kind == "place" and action.color in {"cat", "kitten"}:
        label = f"Placed a {action.color}"
    if group == "shithead":
        last = after.detail.get("last_play")
        if isinstance(last, dict) and all(view.detail.get("last_play") == last for view in after_views.values()):
            if kind == "flip" and last.get("type") == "failed_flip":
                label = "Flipped a card and took the pile"
            elif kind == "play" and last.get("type") == "burn":
                label = "Played cards and burned the pile"
            if kind == "pickup":
                picked = last.get("count")
                count = picked if isinstance(picked, int) and picked >= 0 else count
    if group == "word-agents" and kind == "clue":
        clue = after.detail.get("clue")
        if isinstance(clue, str) and all(v.detail.get("clue") == clue for v in after_views.values()):
            label = f'Gave clue “{clue}” for {action.amount}'
    return PublicMoveView(
        version=version, actor_id=actor, type=kind, label=label, targets=targets,
        amount=amount, cards=cards[:CARD_LIMIT], destination=_destination(group, action, before, after) if known else None,
        count=count,
    )
