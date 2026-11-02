from app.core.contracts import Action, RuleError, State
from app.games.deal.deck import DealCard
from app.games.deal.payments import combine_payment_bundles, payment_bundles
from app.games.deal.table import assets, locate, transfer, transfer_cards


def public_transfers(s: State, effect: dict, cards: dict[str, DealCard]) -> list[dict]:
    """Preview only committed, public assets; never copy private event payloads."""
    actor, target, kind = effect["actor"], effect["target"], effect["kind"]
    transfers = []

    def add(source: str, recipient: str, selected: list[str]) -> None:
        public = set(s["banks"][source]) | {
            c for group in s["properties"][source].values() for c in group
        }
        ids = list(dict.fromkeys(
            carried for ident in selected if ident in public
            for carried in transfer_cards(s, source, ident)
        ))
        if ids:
            transfers.append({"source": source, "target": recipient, "cards": ids})

    if kind in ("sly", "forced", "crash", "heist") and not effect.get("select"):
        add(target, actor, [effect.get("take", "")])
        if kind == "forced":
            add(actor, target, [effect.get("give", "")])
    elif kind == "breaker":
        add(target, actor, s["properties"][target].get(effect.get("color"), []))
    elif kind == "super_sly":
        add(target, actor, [
            c for group in s["properties"][target].values() for c in group
            if cards[c].kind == "property" and effect.get("color") in cards[c].colors
        ])
    elif kind == "unfair":
        add(actor, target, s["banks"][actor])
        add(target, actor, s["banks"][target])
    return transfers


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
        if mercy and player == s["order"][s["turn"]]:
            s["moves"] -= 1
        effect["blocked"] = not effect["blocked"]
        effect["responder"] = actor if player == target else target
        return
    if action.type == "pay":
        available = assets(s, target, cards)
        quoted = combine_payment_bundles(payment_bundles(s, target, cards), action.cards)
        value = sum(quoted.values())
        if value < effect["amount"] and set(quoted) != set(available):
            raise RuleError("Pay the full bill, or give every payable asset if you cannot.")
        # Properties carry their buildings before an explicitly selected copy of
        # the same building is visited. Selection order cannot change its zone.
        for c in sorted(action.cards, key=lambda ident: cards[ident].kind != "property"):
            transfer(s, target, actor, c, cards)
        if value < effect["amount"] and mercy:
            issue_debt(s, target, actor)
        s["queue"].pop(0)
        return
    if action.type == "keep":
        effect["keep"] = action.card
        return
    if action.type == "give":
        if effect["kind"] == "repossession":
            key = locate(s, target, action.card)
            if key is not None:
                # A Shack on a partially repossessed set leaves with a given
                # property, even when its original anchor is the kept card.
                for card in s["properties"][target][key]:
                    if cards[card].action == "shack":
                        s["links"][card] = action.card
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
