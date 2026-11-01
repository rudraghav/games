from app.core.cards import card_view, draw, rng, standard_deck
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    State,
    legal,
    validate_action,
)
from app.games.rummy.melds import deadwood, is_joker, valid_declaration


class RummyEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="rummy",
                name="Rummy",
                subtitle="13-card Indian points rummy",
                family="rummy",
                min_players=2,
                max_players=6,
                minutes="15–30",
                icon="cards",
                color="ochre",
                rules=[
                    "Draw one, discard one, and arrange your 13 cards.",
                    "Declare with two sequences, including one pure sequence.",
                    "Points format. Jokers are wild; maximum loss is 80 points.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = standard_deck(2, 2)
        rng(seed).shuffle(cards)
        cut = cards.pop()
        return {
            "phase": "draw",
            "order": players,
            "turn": 0,
            "deck": cards,
            "cut": cut,
            "wild": "A" if cut.startswith("JK") else cut[0],
            "hands": {p: [cards.pop() for _ in range(13)] for p in players},
            "discard": [cards.pop()],
            "dropped": {},
            "played": [],
            "open_pickup": None,
            "scores": {p: 0 for p in players},
            "winners": [],
            "message": "Draw, group your cards, then discard.",
        }

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]] or player in s["dropped"]:
            return []
        if s["phase"] == "draw":
            actions = [
                legal("Draw from stock", "draw_stock"),
                legal("Drop for 20" if player not in s["played"] else "Drop for 40", "fold"),
            ]
            if not is_joker(s["discard"][-1], s["wild"]):
                actions.append(legal("Take discard", "draw_discard"))
            return actions
        return [
            option
            for c in s["hands"][player]
            if c != s.get("open_pickup")
            for option in [
                legal(f"Discard {card_view(c).label}", "discard", card=c),
                legal(f"Declare · discard {card_view(c).label}", "declare", card=c),
            ]
        ]

    def _finish(self, s: State, winner: str) -> None:
        for p in s["order"]:
            if p != winner:
                loss = s["dropped"].get(p)
                s["scores"][p] = -(loss if loss is not None else deadwood(s["hands"][p], s["wild"]))
        s["scores"][winner] = -sum(s["scores"][p] for p in s["order"] if p != winner)
        s["winners"], s["phase"] = [winner], "finished"
        s["message"] = "The deal is complete. Points settled."

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type in ("draw_stock", "draw_discard"):
            s["open_pickup"] = s["discard"][-1] if action.type == "draw_discard" else None
            s["hands"][player].extend(
                draw(s) if action.type == "draw_stock" else [s["discard"].pop()]
            )
            s["phase"] = "discard"
            return s
        if action.type == "fold":
            s["dropped"][player] = 20 if player not in s["played"] else 40
        else:
            s["hands"][player].remove(action.card)
            s["discard"].append(action.card)
            s["open_pickup"] = None
            if action.type == "declare":
                if valid_declaration(s["hands"][player], s["wild"]):
                    self._finish(s, player)
                    return s
                s["dropped"][player] = 80
                s["message"] = "Invalid declaration: 80 points."
            if player not in s["played"]:
                s["played"].append(player)
        active = [p for p in s["order"] if p not in s["dropped"]]
        if len(active) == 1:
            self._finish(s, active[0])
        else:
            s["phase"] = "draw"
            s["turn"] = (s["turn"] + 1) % len(s["order"])
            while s["order"][s["turn"]] in s["dropped"]:
                s["turn"] = (s["turn"] + 1) % len(s["order"])
        return s

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id="rummy",
            phase=s["phase"],
            current_player=s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p,
                    count=len(s["hands"][p]),
                    score=s["scores"][p],
                    folded=p in s["dropped"],
                    cards=[card_view(c) for c in s["hands"][p]] if s["phase"] == "finished" else [],
                )
                for p in s["order"]
            ],
            hand=[card_view(c) for c in s["hands"].get(player, [])],
            community=[card_view(s["cut"])],
            discard=card_view(s["discard"][-1]) if s["discard"] else None,
            draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=s["message"],
            detail={"wild_rank": s["wild"]},
        )
