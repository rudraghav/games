"""Pop Tarot: a private shuffled deck, three picks, and each pick's orientation.

Secrecy rule: the deck order and the orientation of every card still in the deck
stay in the saved state. A projection, action label, message or history entry
only ever carries a card that has been drawn, with its orientation.
"""

from app.core.cards import rng
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    Setting,
    State,
    legal,
    validate_action,
)
from app.games.tarot.deck import BY_ID, DECK, POSITIONS
from app.games.tarot.style import DEFAULT_READING_STYLE

REVERSALS = "reversals"
# Each card is reversed independently, one time in three.
REVERSED_ONE_IN = 3


def drawn_orientations(state: State) -> dict[str, str]:
    """Card id to orientation for the DRAWN cards only, in draw order.

    A state saved before reversals has no "reversed" list: every card is upright.
    """
    turned = set(state.get("reversed", ()))
    return {
        card: "reversed" if card in turned else "upright"
        for card in (state["deck"][index] for index in state["picks"])
    }


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
                settings=[Setting(key=REVERSALS, label="Include reversed cards", default=True)],
                rules=[
                    "Think of a question, or simply see what comes up.",
                    "Pick three cards: where you are, what is shifting, your next move.",
                    "A card can land upright or reversed; reversed turns its theme inward or blocks it.",
                    "Get an AI-written personal reading with a pop-culture twist.",
                    "A playful reflection, not a prediction or professional advice.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        random = rng(seed)
        deck = [c.id for c in DECK]
        random.shuffle(deck)
        # Decided with the shuffle, by the same private generator, and saved with it.
        # Drawing after the shuffle keeps every earlier seeded deck order unchanged.
        turned = (
            [card for card in deck if random.randrange(REVERSED_ONE_IN) == 0]
            if settings.get(REVERSALS, True)
            else []
        )
        return {
            "order": players,
            "turn": 0,
            "phase": "choosing",
            "reading_style": DEFAULT_READING_STYLE,
            "deck": deck,
            "reversed": turned,
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
            # Only drawn cards are read from the deck, each with its own orientation.
            community=[
                BY_ID[card].view(orientation)
                for card, orientation in drawn_orientations(s).items()
            ] if own else [],
            actions=self.legal_actions(s, player),
            message=s["message"] if own else "",
            detail={"pickedPositions": s["picks"]} if own else {},
        )
