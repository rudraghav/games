import re

from app.core.cards import rng
from app.core.contracts import (
    Action,
    BaseEngine,
    CardView,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    RuleError,
    State,
    legal,
    validate_action,
)

WORDS = """ANCHOR APPLE APRON ARROW ATLAS BADGE BALLOON BAMBOO BASKET BEACH BEACON
BEAR BELL BICYCLE BIRD BLANKET BOAT BONE BOOT BOTTLE BRANCH BRIDGE BRUSH BUCKET
BUTTON CABIN CANDLE CANYON CAPTAIN CASTLE CAT CAVE CHAIR CHERRY CLOCK CLOUD COAST
COFFEE COMET COMPASS CORAL CROWN CRYSTAL DANCE DESERT DIAMOND DOCTOR DOG DOOR DRAGON
DRUM EAGLE EARTH ENGINE FEATHER FIELD FIRE FISH FLAG FLOWER FLUTE FOREST FORK FOUNTAIN
FOX FROG GARDEN GATE GHOST GLASS GLOVE GOLD GRASS GUITAR HAMMER HARBOR HAT HEART
HILL HONEY HORSE HOSPITAL HOTEL ICE ISLAND JACKET JAZZ JELLY JUNGLE KEY KITE KNIFE
LADDER LAKE LAMP LANTERN LEAF LEMON LETTER LIBRARY LIGHTHOUSE LION LOCK MACHINE
MAGNET MAP MARBLE MASK MEADOW MIRROR MOON MOUNTAIN MOUSE MUSEUM NEEDLE NEST NIGHT
OCEAN OLIVE ORANGE OWL PAINT PALACE PAPER PARROT PEARL PENCIL PIANO PILLOW PILOT
PINE PLANET PLATE POCKET POND POSTER POTATO PRINCE PUZZLE RABBIT RAIN RAINBOW RING
RIVER ROBOT ROCK ROCKET ROOF ROPE ROSE SADDLE SAIL SALT SAND SATELLITE SCHOOL
SCISSORS SEAL SHADOW SHELL SHIP SHOE SILVER SKY SNAIL SNOW SOAP SOCK SPARK SPIDER
SPOON SPRING STAR STATION STONE STORM STRAWBERRY SUBMARINE SUITCASE SUN SWAN SWORD
TABLE TEA TELEPHONE TENT THUNDER TIGER TOAST TOMATO TORCH TOWER TRAIN TREE TUNNEL
TURTLE UMBRELLA VALLEY VELVET VIOLIN VOLCANO WALL WALNUT WATCH WATER WAVE WHALE
WHEEL WINDOW WING WINTER WOLF WOOD YARD ZEBRA""".split()
TEAM_COLORS = ["coral", "blue"]


class WordAgentsEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="word-agents", name="Word Agents", subtitle="Give clues and find your team’s words",
            family="words", min_players=4, max_players=10, minutes="15–30", icon="type",
            color="coral", rules=["Two spymasters know the key. Their teams see only the words.",
                "Give a one-word clue and a number; your team gets up to one extra guess.",
                "Find all your agents and avoid the assassin."],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        randomizer = rng(seed)
        active = randomizer.randrange(2)
        key = [active] * 9 + [1 - active] * 8 + [2] * 7 + [3]
        randomizer.shuffle(key)
        return {"order": players, "turn": active, "active_team": active, "phase": "clue",
                "words": randomizer.sample(WORDS, 25), "key": key, "revealed": [False] * 25,
                "clue": "", "clue_count": 0, "guesses": 0, "guesses_left": 0,
                "winners": [], "message": "Spymaster, find a connection and give your team a clue."}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player not in s["order"]:
            return []
        seat, active = s["order"].index(player), s["active_team"]
        if s["phase"] == "clue" and seat == active:
            return [legal(f"Clue for {n} {'word' if n == 1 else 'words'}", "clue", amount=n,
                          input="text", maximum=32) for n in range(1, 10)]
        if s["phase"] != "guess" or seat < 2 or seat % 2 != active:
            return []
        options = [legal(f"Choose {word.title()}", "guess", choice=str(i))
                   for i, word in enumerate(s["words"]) if not s["revealed"][i]]
        if s["guesses"]:
            options.append(legal("End guesses", "end_guesses"))
        return options

    def _next_team(self, s: State) -> None:
        s["active_team"] = 1 - s["active_team"]
        s.update(turn=s["active_team"], phase="clue", guesses=0, guesses_left=0,
                 message="The next spymaster can give a new clue.")

    def _finish(self, s: State, team: int, message: str) -> None:
        s.update(phase="finished", winners=[p for i, p in enumerate(s["order"]) if i % 2 == team],
                 message=message)

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "clue":
            clue = action.choice.strip()
            if not re.fullmatch(r"[A-Za-z][A-Za-z'-]{0,31}", clue):
                raise RuleError("Give one word using letters, an apostrophe or a hyphen.")
            if clue.upper() in [word for i, word in enumerate(s["words"]) if not s["revealed"][i]]:
                raise RuleError("Your clue cannot be a word still visible on the board.")
            s.update(clue=clue, clue_count=action.amount, guesses=0, guesses_left=action.amount + 1,
                     phase="guess", turn=2 + s["active_team"],
                     message="Discuss the clue, then choose a word together.")
        elif action.type == "end_guesses":
            self._next_team(s)
        else:
            cell, active = int(action.choice), s["active_team"]
            role = s["key"][cell]
            s["revealed"][cell] = True
            s["guesses"] += 1
            s["guesses_left"] -= 1
            if role == 3:
                self._finish(s, 1 - active, "The assassin was found. The other team wins.")
            else:
                for team in (0, 1):
                    if all(s["revealed"][i] for i, identity in enumerate(s["key"]) if identity == team):
                        self._finish(s, team, "Every agent is home. A brilliant connection!")
                        return s
                if role != active or not s["guesses_left"]:
                    self._next_team(s)
                else:
                    s["message"] = "An agent found. Continue or end your guesses."
        return s

    def project_view(self, s: State, player: str) -> GameView:
        known_key = player in s["order"][:2] or s["phase"] == "finished"
        found = [sum(revealed and role == team for revealed, role in zip(s["revealed"], s["key"], strict=True))
                 for team in (0, 1)]
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=s["order"][s["turn"]] if s["phase"] != "finished" else None,
            players=[PlayerView(id=p, score=found[i % 2]) for i, p in enumerate(s["order"])],
            hand=[], actions=self.legal_actions(s, player), message=s["message"], winners=s["winners"],
            community=[CardView(id=str(i), label=word.title(), value=word.title(),
                       color=([*TEAM_COLORS, "neutral", "assassin"][s["key"][i]]
                              if known_key or s["revealed"][i] else "unknown"),
                       subtitle="revealed" if s["revealed"][i] else "hidden")
                       for i, word in enumerate(s["words"])],
            detail={"active_team": s["active_team"], "clue": s["clue"],
                    "clue_count": s["clue_count"], "guesses_left": s["guesses_left"],
                    "role": "spymaster" if player in s["order"][:2] else "operative",
                    "teams": {p: i % 2 for i, p in enumerate(s["order"])},
                    "spymasters": s["order"][:2],
                    "remaining": [s["key"].count(team) - found[team] for team in (0, 1)]},
        )
