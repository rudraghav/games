from app.core.cards import rng
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
from app.games.tarot.deck import BY_ID, DECK, POSITIONS


class TarotEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="tarot",
                name="Pop Tarot",
                subtitle="Choose three cards for a personal reading",
                family="tarot",
                play_mode="solo",
                score_order="none",
                min_players=1,
                max_players=1,
                minutes="5–10",
                icon="sparkles",
                color="plum",
                rules=[
                    "Think of a question, or simply see what comes up.",
                    "Pick three cards: where you are, what is shifting, your next move.",
                    "Get an AI-written personal reading with a pop-culture twist.",
                    "A playful reflection, not a prediction or professional advice.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        deck = [c.id for c in DECK]
        rng(seed).shuffle(deck)
        return {
            "order": players,
            "turn": 0,
            "phase": "choosing",
            "deck": deck,
            "picks": [],
            "winners": [],
            "message": "Take a breath. Choose your first card.",
        }

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if player not in s["order"] or s["phase"] != "choosing":
            return []
        return [
            legal(f"Choose card {i + 1}", "pick", choice=str(i))
            for i in range(78)
            if i not in s["picks"]
        ]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        s["picks"].append(int(action.choice))
        if len(s["picks"]) == 3:
            s["phase"] = "reading"
            s["message"] = "Your spread is ready. Add a question and ask for your reading."
        else:
            s["message"] = (
                f"Choose card {len(s['picks']) + 1}: {POSITIONS[len(s['picks'])].lower()}."
            )
        return s

    def project_view(self, s: State, player: str) -> GameView:
        own = player in s["order"]
        return GameView(
            game_id="tarot",
            phase=s["phase"],
            current_player=s["order"][0] if own else None,
            players=[PlayerView(id=p) for p in s["order"]],
            hand=[],
            community=[BY_ID[s["deck"][i]].view() for i in s["picks"]] if own else [],
            actions=self.legal_actions(s, player),
            message=s["message"] if own else "",
            detail={"pickedPositions": s["picks"]} if own else {},
        )
