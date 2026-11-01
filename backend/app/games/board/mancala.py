"""Kalah with four seeds per pit; explicit capture and end-sweep conventions."""

from app.core.contracts import (
    Action,
    BaseEngine,
    CardView,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    State,
    legal,
    validate_action,
)


def side(seat: int) -> range:
    return range(0, 6) if seat == 0 else range(7, 13)


class MancalaEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="mancala", name="Mancala", subtitle="Sow seeds and score captures",
            family="mancala", min_players=2, max_players=2, minutes="5–15", icon="circle",
            color="ochre", rules=[
                "Kalah: four seeds in each of twelve pits, with two stores starting empty.",
                "Choose a pit on your side. Sow counterclockwise, including your store and skipping your opponent’s.",
                "Finish in your store to play again. Finish in your empty pit opposite seeds to capture both.",
                "When either side empties, sweep the other side into its own store. Most seeds wins; equal stores draw.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        return {"order": players, "turn": 0, "phase": "playing", "pits": [4] * 6 + [0] + [4] * 6 + [0],
                "winners": [], "last_move": None, "message": "Choose a pit on your side to start sowing."}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        return [legal(f"Sow pit {i % 7 + 1} · {s['pits'][i]} seeds", "sow", choice=str(i))
                for i in side(s["turn"]) if s["pits"][i]]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        pits, seat = s["pits"], s["turn"]
        own_store, other_store = (6, 13) if seat == 0 else (13, 6)
        index = int(action.choice)
        seeds, pits[index] = pits[index], 0
        while seeds:
            index = (index + 1) % 14
            if index == other_store:
                continue
            pits[index] += 1
            seeds -= 1
        s["last_move"] = index
        captured = 0
        if index in side(seat) and pits[index] == 1 and pits[12 - index]:
            captured = pits[12 - index] + 1
            pits[own_store] += captured
            pits[index] = pits[12 - index] = 0
        if any(not any(pits[i] for i in side(p)) for p in (0, 1)):
            for p, store in ((0, 6), (1, 13)):
                pits[store] += sum(pits[i] for i in side(p))
                for i in side(p):
                    pits[i] = 0
            s.update(phase="finished", winners=[] if pits[6] == pits[13] else [s["order"][0 if pits[6] > pits[13] else 1]],
                     draw=pits[6] == pits[13], message="All seeds counted. A good round!")
        elif index == own_store:
            s["message"] = "Straight into your store. Take another turn."
        else:
            s["turn"] = 1 - seat
            s["message"] = f"Captured {captured} seeds." if captured else "Your seeds are sown. Next player."
        return s

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, score=s["pits"][store]) for p, store in zip(s["order"], (6, 13), strict=True)],
            hand=[], actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            community=[CardView(id=str(i), label=f"{'Store' if i in (6, 13) else 'Pit ' + str(i % 7 + 1)}",
                                value=str(count), color="sage" if i < 7 else "ochre")
                       for i, count in enumerate(s["pits"])],
            detail={"draw": s.get("draw", False), "last_move": s["last_move"]},
        )
