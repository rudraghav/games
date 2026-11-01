"""Azul's colored-wall base game. All tile locations are authoritative and conserved."""

from random import Random

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

COLORS = ("blue", "yellow", "red", "black", "white")
SYMBOLS = ("◆", "✹", "✿", "✣", "❖")
PENALTIES = (1, 1, 2, 2, 2, 3, 3)


def tile_color(tile: str) -> str:
    return tile.split("-")[0]


def face(tile: str) -> CardView:
    color = tile_color(tile)
    return CardView(id=tile, label=f"{color.title()} tile", value=SYMBOLS[COLORS.index(color)],
                    suit=color, color=color)


def wall_column(row: int, color: str) -> int:
    return (COLORS.index(color) + row) % 5


def placement_score(wall: list[list[str | None]], row: int, col: int) -> int:
    horizontal = vertical = 1
    for step in (-1, 1):
        c = col + step
        while 0 <= c < 5 and wall[row][c] is not None:
            horizontal += 1
            c += step
        r = row + step
        while 0 <= r < 5 and wall[r][col] is not None:
            vertical += 1
            r += step
    return (horizontal if horizontal > 1 else 0) + (vertical if vertical > 1 else 0) or 1


def complete_rows(wall: list[list[str | None]]) -> int:
    return sum(all(tile is not None for tile in row) for row in wall)


def end_bonus(wall: list[list[str | None]]) -> int:
    rows = complete_rows(wall)
    columns = sum(all(wall[r][c] is not None for r in range(5)) for c in range(5))
    colors = sum(all(wall[r][wall_column(r, color)] is not None for r in range(5)) for color in COLORS)
    return 2 * rows + 7 * columns + 10 * colors


class AzulEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="azul", name="Azul", subtitle="Draft tiles and complete your wall",
            family="azul", min_players=2, max_players=4, minutes="25–40", icon="grid",
            color="sky", rules_version="colored-wall-1", rules=[
                "Standard colored wall. Draft every tile of one color from one factory or the center.",
                "Put the draft in one compatible pattern line. Excess goes to your floor.",
                "Completed lines place one wall tile and score linked neighbors; unfinished lines stay.",
                "Floor costs are 1,1,2,2,2,3,3. The first center taker gets the marker and starts next round.",
                "A complete wall row ends the round and match. Bonuses: row 2, column 7, color 10. Ties favor more complete rows.",
                "Games exhaustion convention: if no tiles can form a new offer, finish with normal bonuses. Unfinished lines stay put.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        rng = Random(seed)
        bag = [f"{color}-{i}" for color in COLORS for i in range(20)]
        rng.shuffle(bag)
        s: State = {"order": players, "turn": 0, "phase": "drafting", "bag": bag,
                    "discard": [], "seed": rng.randrange(2**63), "shuffle": 0,
                    "factories": [[] for _ in range(2 * len(players) + 1)], "center": [],
                    "lines": {p: [[] for _ in range(5)] for p in players},
                    "wall": {p: [[None] * 5 for _ in range(5)] for p in players},
                    "floor": {p: [] for p in players}, "scores": dict.fromkeys(players, 0),
                    "round": 0, "starter": 0, "marker": True, "winners": [], "draft": [],
                    "last_scores": {}, "message": "Choose a color from a factory to begin."}
        self._offer(s)
        return s

    def _offer(self, s: State) -> None:
        s["round"] += 1
        s.update(phase="drafting", turn=s["starter"], marker=True, center=[], draft=[])
        for factory in s["factories"]:
            factory.clear()
            for _ in range(4):
                if not s["bag"] and s["discard"]:
                    s["shuffle"] += 1
                    Random(s["seed"] + s["shuffle"]).shuffle(s["discard"])
                    s["bag"], s["discard"] = s["discard"], []
                if s["bag"]:
                    factory.append(s["bag"].pop())
        if not any(s["factories"]):
            self._finish(s, exhausted=True)

    def _finish(self, s: State, *, exhausted: bool = False) -> None:
        for p in s["order"]:
            bonus = end_bonus(s["wall"][p])
            s["scores"][p] += bonus
            s["last_scores"].setdefault(p, {"wall": 0, "floor": 0})["bonus"] = bonus
        best = max((s["scores"][p], complete_rows(s["wall"][p])) for p in s["order"])
        s.update(phase="finished", winners=[p for p in s["order"]
                 if (s["scores"][p], complete_rows(s["wall"][p])) == best],
                 message=("No tiles remain for another offer. Games exhaustion convention: normal end bonuses counted."
                          if exhausted else "Your walls are complete. Every tile and bonus counted."))
        s["exhausted"] = exhausted

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "round_over":
            return [legal("Next round", "next_round")]
        if s["phase"] == "placing":
            color = tile_color(s["draft"][0])
            options = [legal("Place on floor", "place_tiles", choice="floor")]
            for row, line in enumerate(s["lines"][player]):
                if (len(line) < row + 1 and (not line or tile_color(line[0]) == color)
                        and s["wall"][player][row][wall_column(row, color)] is None):
                    options.append(legal(f"Pattern line {row + 1}", "place_tiles", choice=str(row)))
            return options
        options = []
        for index, factory in enumerate([*s["factories"], s["center"]]):
            source = str(index) if index < len(s["factories"]) else "center"
            for color in COLORS:
                count = sum(tile_color(t) == color for t in factory)
                if count:
                    options.append(legal(f"{count} {color} · {'center' if source == 'center' else 'factory ' + str(index + 1)}",
                                         "draft_tiles", choice=source, color=color))
        return options

    def _floor(self, s: State, player: str, tiles: list[str]) -> None:
        capacity = max(0, 7 - len(s["floor"][player]))
        s["floor"][player].extend(tiles[:capacity])
        s["discard"].extend(tiles[capacity:])

    def _score_round(self, s: State) -> None:
        for p in s["order"]:
            gained = 0
            for row, line in enumerate(s["lines"][p]):
                if len(line) == row + 1:
                    tile = line.pop()
                    col = wall_column(row, tile_color(tile))
                    s["wall"][p][row][col] = tile
                    gained += placement_score(s["wall"][p], row, col)
                    s["discard"].extend(line)
                    line.clear()
            penalty = sum(PENALTIES[:len(s["floor"][p])])
            s["discard"].extend(tile for tile in s["floor"][p] if tile != "first")
            s["floor"][p] = []
            s["scores"][p] = max(0, s["scores"][p] + gained - penalty)
            s["last_scores"][p] = {"wall": gained, "floor": penalty}
        if any(complete_rows(s["wall"][p]) for p in s["order"]):
            self._finish(s)
        elif not s["bag"] and not s["discard"]:
            self._finish(s, exhausted=True)
        else:
            s.update(phase="round_over", turn=s["starter"], message="Walls scored. A fresh offer is ready when you are.")

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_round":
            self._offer(s)
            return s
        if action.type == "draft_tiles":
            source = s["center"] if action.choice == "center" else s["factories"][int(action.choice)]
            s["draft"] = [tile for tile in source if tile_color(tile) == action.color]
            remainder = [tile for tile in source if tile_color(tile) != action.color]
            source.clear()
            s["center"].extend(remainder)
            if action.choice == "center" and s["marker"]:
                s.update(marker=False, starter=s["turn"])
                if len(s["floor"][player]) < 7:
                    s["floor"][player].append("first")
            s.update(phase="placing", message=f"Place your {len(s['draft'])} {action.color} tiles in one line.")
            return s
        if action.choice == "floor":
            self._floor(s, player, s["draft"])
        else:
            row = int(action.choice)
            line = s["lines"][player][row]
            capacity = row + 1 - len(line)
            line.extend(s["draft"][:capacity])
            self._floor(s, player, s["draft"][capacity:])
        s.update(draft=[], phase="drafting", turn=(s["turn"] + 1) % len(s["order"]),
                 message="Tiles placed. Choose the next color.")
        if not any(s["factories"]) and not s["center"]:
            self._score_round(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, score=s["scores"][p]) for p in s["order"]],
            hand=[face(tile) for tile in s["draft"]] if s["order"][s["turn"]] == player else [],
            actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            draw_count=len(s["bag"]), detail={
                "round": s["round"], "factories": [[tile_color(t) for t in f] for f in s["factories"]],
                "center": [tile_color(t) for t in s["center"]], "marker": s["marker"],
                "draft": [tile_color(t) for t in s["draft"]],
                "lines": {p: [[tile_color(t) for t in line] for line in s["lines"][p]] for p in s["order"]},
                "walls": {p: [[tile_color(t) if t else None for t in row] for row in s["wall"][p]] for p in s["order"]},
                "floors": {p: [tile_color(t) for t in s["floor"][p]] for p in s["order"]},
                "starter": s["order"][s["starter"]], "last_scores": s["last_scores"],
            },
        )
