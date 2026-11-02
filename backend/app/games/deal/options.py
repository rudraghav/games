from app.core.contracts import LegalAction, State, legal
from app.games.deal.deck import RENTS, SET_NAMES, DealCard
from app.games.deal.table import assets, complete, groups_for


def card_options(
    s: State, player: str, ident: str, cards: dict[str, DealCard], mercy: bool, gift: bool = False
) -> list[LegalAction]:
    card = cards[ident]
    options = [legal(f"Bank {card.value}M", "bank", card=ident)] if card.kind != "property" else []
    if card.kind == "property":
        return [
            legal(f"Place · {SET_NAMES[color]}", "property", card=ident, color=color, choice=key)
            for color in card.colors
            for key in groups_for(s, player, color, cards)
        ]
    if card.kind == "money" or card.action == "no" or gift and card.action in {"go_again", "shack"}:
        return options
    kind = card.action
    others = [p for p in s["order"] if p != player]
    if kind in ("pass_go", "fill", "birthday", "go_again"):
        options.append(legal(card.view().label, "play", card=ident))
    elif kind == "double":
        if s["moves"] >= 2 and any(
            cards[c].action == "rent"
            and any(
                option.action.type == "play"
                for option in card_options(s, player, c, cards, mercy)
            )
            for c in s["hands"][player]
        ):
            options.append(legal("Double next rent", "play", card=ident))
    elif kind in ("house", "hotel", "shack", "rent", "rent_double"):
        for key, group in s["properties"][player].items():
            color = key.split(":")[0]
            has = {cards[c].action for c in group}
            if not any(cards[c].kind == "property" for c in group):
                continue
            if kind in ("rent", "rent_double"):
                if color not in card.colors or not any(
                    cards[c].kind == "property" and cards[c].value for c in group
                ):
                    continue
                targets = others if not mercy and len(card.colors) == 10 else [None]
                for target in targets:
                    options.append(
                        legal(
                            f"{card.view().label} · {color}",
                            "play",
                            card=ident,
                            color=key,
                            target=target,
                        )
                    )
            elif kind == "shack" and "shack" not in has:
                options.append(legal(f"Add shack · {color}", "play", card=ident, color=key))
            elif (
                kind in ("house", "hotel")
                and color not in ("rail", "utility")
                and complete(group, cards, color)
                and kind not in has
                and (kind != "hotel" or "house" in has)
            ):
                options.append(legal(f"Add {kind} · {color}", "play", card=ident, color=key))
    elif kind == "super_sly":
        for color in RENTS:
            if any(
                color in cards[c].colors
                for p in others
                for group in s["properties"][p].values()
                for c in group
                if cards[c].kind == "property"
            ):
                options.append(legal(f"Steal all · {color}", "play", card=ident, color=color))
    else:
        for target in others:
            groups = s["properties"][target]
            if kind in ("debt", "yoink", "forced_debt", "tough"):
                for choice in ("property", "action", "money") if kind == "tough" else [None]:
                    options.append(
                        legal(
                            f"{card.view().label}" + (f" · {choice}" if choice else ""),
                            "play",
                            card=ident,
                            target=target,
                            choice=choice,
                        )
                    )
            elif (
                kind == "unfair"
                and s["banks"][player]
                or kind == "tax"
                and len(s["banks"][target]) > 1
                or kind == "repossession"
                and sum(cards[c].kind == "property" for g in groups.values() for c in g) > 1
            ):
                options.append(legal(card.view().label, "play", card=ident, target=target))
            elif kind == "breaker":
                for key, group in groups.items():
                    if complete(group, cards, key.split(":")[0]):
                        options.append(
                            legal(
                                f"Take set · {key.split(':')[0]}",
                                "play",
                                card=ident,
                                target=target,
                                color=key,
                            )
                        )
            elif kind in ("sly", "forced"):
                for key, group in groups.items():
                    if complete(group, cards, key.split(":")[0]):
                        continue
                    for take in group:
                        if cards[take].kind != "property":
                            continue
                        own = (
                            [
                                c
                                for own_key, own_group in s["properties"][player].items()
                                for c in own_group
                                if cards[c].kind == "property"
                                and not complete(
                                    own_group,
                                    cards,
                                    own_key.split(":")[0],
                                )
                            ]
                            if kind == "forced"
                            else [None]
                        )
                        for give in own:
                            options.append(
                                legal(
                                    f"{card.view().label} · {cards[take].view().label}",
                                    "play",
                                    card=ident,
                                    target=target,
                                    choice=take,
                                    cards=[give] if give else [],
                                )
                            )
        if kind in ("heist", "crash") and any(
            s["banks"][p] if kind == "heist" else any(s["properties"][p].values()) for p in others
        ):
            options.append(legal(card.view().label, "play", card=ident))
    return options


def effect_options(s: State, player: str, cards: dict[str, DealCard], mercy: bool) -> list[LegalAction]:
    effect = s["queue"][0]
    actor, target = effect["actor"], effect["target"]
    if effect.get("select"):
        if player != actor:
            return []
        candidates = (
            s["banks"][target]
            if effect["kind"] == "heist"
            else [
                c
                for group in s["properties"][target].values()
                for c in group
                if cards[c].kind == "property"
            ]
        )
        return [legal(f"Take {cards[c].view().label}", "choose", card=c) for c in candidates]
    if effect.get("payment"):
        return (
            [
                legal(
                    f"Pay {effect['amount']}M · select bank/property cards",
                    "pay",
                    input="cards",
                    eligible_cards=assets(s, player, cards),
                )
            ]
            if player == target
            else []
        )
    if effect.get("distribution"):
        if player != target:
            return []
        available = (
            s["banks"][target]
            if effect["kind"] == "tax"
            else [
                c
                for group in s["properties"][target].values()
                for c in group
                if cards[c].kind == "property"
            ]
        )
        if "keep" not in effect:
            return [legal(f"Keep {cards[c].view().label}", "keep", card=c) for c in available]
        return [
            legal(f"Give {cards[c].view().label}", "give", card=c, target=p)
            for c in available
            if c != effect["keep"]
            for p in s["order"]
            if p != target
        ]
    if effect["responder"] != player:
        return []
    options = [legal("Let it stand" if effect["blocked"] else "Continue", "accept")]
    if not mercy or player != s["order"][s["turn"]] or s["moves"] > 0:
        options += [
            legal("Just say no", "no", card=c)
            for c in s["hands"][player]
            if cards[c].action == "no"
        ]
    return options


def legal_actions(
    s: State, player: str, cards: dict[str, DealCard], mercy: bool
) -> list[LegalAction]:
    if s["phase"] == "finished":
        return []
    if s["queue"]:
        return effect_options(s, player, cards, mercy)
    if s["gift"]:
        return (
            card_options(s, player, s["gift"]["card"], cards, mercy, gift=True)
            if s["gift"]["recipient"] == player
            else []
        )
    if s["order"][s["turn"]] != player:
        return []
    if s["phase"] == "discard":
        return [
            legal(f"Discard {cards[c].view().label}", "discard", card=c) for c in s["hands"][player]
        ]
    if mercy and s["debts"][player] and s["hands"][player]:
        return [
            legal(f"Settle debt · {cards[c].view().label}", "settle_debt", card=c, target=p)
            for p in sorted(set(s["debts"][player]))
            for c in s["hands"][player]
        ]
    actions = []
    if s["boost"] == 1:
        actions.append(legal("End turn", "end_turn"))
    if s["moves"] > 0:
        for ident in s["hands"][player]:
            options = card_options(s, player, ident, cards, mercy)
            actions += [
                o
                for o in options
                if s["boost"] == 1
                or cards[ident].action == "rent"
                and o.action.type == "play"
                or cards[ident].action == "double"
                and o.action.type == "play"
            ]
    # A Double the Rent is committed together with its following Rent card.
    # Moving a wild away meanwhile could otherwise leave no legal rent or end.
    for key, group in s["properties"][player].items() if s["boost"] == 1 else []:
        for c in group:
            if cards[c].kind == "property":
                for color in cards[c].colors:
                    for destination in groups_for(s, player, color, cards):
                        if destination == key:
                            continue
                        actions.append(
                            legal(f"Move · {SET_NAMES[color]}", "rearrange", card=c,
                                  color=color, choice=destination)
                        )
    return actions
