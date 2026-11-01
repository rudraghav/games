from app.core.contracts import Action, RuleError, State
from app.games.deal.deck import DealCard
from app.games.deal.table import assets, transfer


def queue(s: State, actor: str, target: str, kind: str, **kwargs: object) -> None:
    s["queue"].append(
        {
            "actor": actor,
            "target": target,
            "kind": kind,
            "responder": target,
            "blocked": False,
            **kwargs,
        }
    )


def issue_debt(s: State, debtor: str, creditor: str) -> None:
    if len(s["debts"][debtor]) < 3:
        s["debts"][debtor].append(creditor)


def resolve(s: State, effect: dict, cards: dict[str, DealCard], mercy: bool) -> bool:
    actor, target, kind = effect["actor"], effect["target"], effect["kind"]
    if kind in ("bill",):
        if not assets(s, target, cards):
            if mercy:
                issue_debt(s, target, actor)
            return True
        effect["payment"] = True
        return False
    if kind in ("tax", "repossession"):
        effect["distribution"] = True
        return False
    if kind in ("sly", "forced", "crash"):
        transfer(s, target, actor, effect["take"], cards)
        if kind == "forced":
            transfer(s, actor, target, effect["give"], cards)
    elif kind == "breaker":
        for c in list(s["properties"][target].get(effect["color"], [])):
            transfer(s, target, actor, c, cards)
    elif kind == "heist":
        transfer(s, target, actor, effect["take"], cards)
    elif kind == "forced_debt":
        issue_debt(s, target, actor)
    elif kind == "super_sly":
        for group in list(s["properties"][target].values()):
            for c in list(group):
                if cards[c].kind == "property" and effect["color"] in cards[c].colors:
                    transfer(s, target, actor, c, cards)
    elif kind == "tough":
        taken = [c for c in s["hands"][target] if cards[c].kind == effect["choice"]]
        s["hands"][target] = [c for c in s["hands"][target] if c not in taken]
        s["hands"][actor].extend(taken)
    elif kind == "unfair":
        s["banks"][actor], s["banks"][target] = s["banks"][target], s["banks"][actor]
    return True


def act(s: State, player: str, action: Action, cards: dict[str, DealCard], mercy: bool) -> None:
    effect = s["queue"][0]
    actor, target = effect["actor"], effect["target"]
    if action.type == "choose":
        effect["take"] = action.card
        effect["select"] = False
        return
    if action.type == "no":
        s["hands"][player].remove(action.card)
        s["discard"].append(action.card)
        if player == s["order"][s["turn"]]:
            s["moves"] -= 1
        effect["blocked"] = not effect["blocked"]
        effect["responder"] = actor if player == target else target
        return
    if action.type == "pay":
        available = assets(s, target, cards)
        if len(set(action.cards)) != len(action.cards) or not set(action.cards) <= set(available):
            raise RuleError("Choose only payable cards in your bank or collection.")
        value = sum(cards[c].value for c in action.cards)
        if value < effect["amount"] and set(action.cards) != set(available):
            raise RuleError("Pay the full bill, or give every payable asset if you cannot.")
        for c in action.cards:
            transfer(s, target, actor, c, cards)
        if value < effect["amount"] and mercy:
            issue_debt(s, target, actor)
        s["queue"].pop(0)
        return
    if action.type == "keep":
        effect["keep"] = action.card
        return
    if action.type == "give":
        transfer(s, target, action.target, action.card, cards)
        remaining = (
            s["banks"][target]
            if effect["kind"] == "tax"
            else [
                c
                for g in s["properties"][target].values()
                for c in g
                if cards[c].kind == "property"
            ]
        )
        if len(remaining) <= 1:
            s["queue"].pop(0)
        return
    if effect["blocked"] or resolve(s, effect, cards, mercy):
        s["queue"].pop(0)
