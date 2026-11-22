"""Secret Santa: one organiser lists the people, sets who must not draw whom, and draws.

Secrecy rule: `assignment` (who gives to whom) never leaves the saved state through
a projection, an action label, a message or history. The organiser's view names a
recipient only inside `showing`, while one person is looking at the organiser's
screen. Everyone else reads their own line through `private_draw`, which the room
service calls for the holder of that person's private link.
"""

from random import Random

from app.core.cards import rng
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    JsonValue,
    LegalAction,
    PlayerView,
    RuleError,
    State,
    legal,
    validate_action,
)

GAME_ID = "secret-santa"
MAX_PEOPLE = 30
MAX_GROUPS = 8
MIN_PEOPLE = 3
NAME_LIMIT = 30
TITLE_LIMIT = 60
LOCATION_LIMIT = 80
BUDGET_LIMIT = 30
# Days since 1 January 2020; 40000 days reaches the year 2129.
MAX_DAY = 40_000
DEFAULT_TITLE = "Secret Santa"
DETAILS = ("day", "location", "budget")
# A uniformly random order is kept only if it breaks no rule. With few rules about
# one order in three passes, so this many tries almost never run out.
UNIFORM_TRIES = 400
FIX = "Remove an exclusion or a group."
LIMITS: dict[str, JsonValue] = {
    "people": MAX_PEOPLE, "groups": MAX_GROUPS, "name": NAME_LIMIT,
    "title": TITLE_LIMIT, "location": LOCATION_LIMIT, "budget": BUDGET_LIMIT,
}
EDITS = {"set_title": ("title", TITLE_LIMIT, "The title"),
         "set_location": ("location", LOCATION_LIMIT, "The location"),
         "set_budget": ("budget", BUDGET_LIMIT, "The budget")}


def clean(text: str, limit: int, what: str) -> str:
    """One line of visible text: control characters dropped, spaces collapsed."""
    value = " ".join("".join(ch if ch.isprintable() else " " for ch in text).split())
    if not 1 <= len(value) <= limit:
        raise RuleError(f"{what} needs 1 to {limit} characters.")
    return value


def unique(value: str, taken: set[str], limit: int) -> str:
    """The typed text, or the same text numbered so no two entries read alike."""
    if value.casefold() not in taken:
        return value
    number = 2
    while True:
        suffix = f" ({number})"
        candidate = value[: limit - len(suffix)].rstrip() + suffix
        if candidate.casefold() not in taken:
            return candidate
        number += 1


def listed(names: list[str]) -> str:
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def candidates(state: State) -> dict[str, list[str]]:
    """For each person, everyone they may draw: not themselves, not an excluded
    pair, nobody who shares a group with them. Both rules cut both ways."""
    ids = [person["id"] for person in state["people"]]
    barred: dict[str, set[str]] = {ident: {ident} for ident in ids}
    for first, second in state["pairs"]:
        barred[first].add(second)
        barred[second].add(first)
    for group in state["groups"]:
        for member in group["members"]:
            barred[member].update(group["members"])
    return {ident: [other for other in ids if other not in barred[ident]] for ident in ids}


def matching(allowed: dict[str, list[str]], order: list[str]) -> dict[str, str]:
    """A largest set of giver/recipient pairs, as recipient -> giver.

    Augmenting paths (Kuhn): the result covers everyone exactly when a complete
    draw exists, so the answer to "can these names be drawn?" is never a guess.
    """
    giver_of: dict[str, str] = {}

    def place(giver: str, tried: set[str]) -> bool:
        for recipient in allowed[giver]:
            if recipient in tried:
                continue
            tried.add(recipient)
            if recipient not in giver_of or place(giver_of[recipient], tried):
                giver_of[recipient] = giver
                return True
        return False

    for giver in order:
        place(giver, set())
    return giver_of


def blocked_reason(state: State) -> str | None:
    """Why the names cannot be drawn yet, or None when they can."""
    people = state["people"]
    if len(people) < MIN_PEOPLE:
        return f"Add at least {MIN_PEOPLE} people."
    names = {person["id"]: person["name"] for person in people}
    allowed = candidates(state)
    for ident, options in allowed.items():
        if not options:
            return f"{names[ident]} has nobody left to draw. {FIX}"
    giver_of = matching(allowed, list(allowed))
    if len(giver_of) == len(people):
        return None
    # Everyone has a candidate, yet some people compete for too few names. Follow
    # the pairs outward from someone left over to find that crowd (Hall's condition).
    placed = set(giver_of.values())
    crowd = [next(ident for ident in allowed if ident not in placed)]
    wanted: set[str] = set()
    for giver in crowd:
        for recipient in allowed[giver]:
            if recipient not in wanted:
                wanted.add(recipient)
                if giver_of[recipient] not in crowd:
                    crowd.append(giver_of[recipient])
    if len(crowd) > 4:
        return f"These exclusions leave no way for everyone to draw a name. {FIX}"
    who = listed([names[ident] for ident in allowed if ident in crowd])
    return (f"{who} can only draw {len(wanted)} {'person' if len(wanted) == 1 else 'people'} "
            f"between them. {FIX}")


def draw_names(state: State, random: Random) -> dict[str, str]:
    """A random complete draw, giver -> recipient, that breaks no rule."""
    allowed = candidates(state)
    ids = list(allowed)
    options = {ident: set(found) for ident, found in allowed.items()}
    for _ in range(UNIFORM_TRIES):
        recipients = ids.copy()
        random.shuffle(recipients)
        if all(recipient in options[giver] for giver, recipient in zip(ids, recipients, strict=True)):
            return dict(zip(ids, recipients, strict=True))
    # Heavily restricted lists: a matching built in random order always finds a
    # complete draw when one exists, without favouring the order names were typed.
    shuffled = {ident: random.sample(found, len(found)) for ident, found in allowed.items()}
    giver_of = matching(shuffled, random.sample(ids, len(ids)))
    if len(giver_of) != len(ids):
        raise RuleError("These names cannot be drawn yet.")
    recipient_of = {giver: recipient for recipient, giver in giver_of.items()}
    return {ident: recipient_of[ident] for ident in ids}


class SecretSantaEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id=GAME_ID,
                name="Secret Santa",
                subtitle="Draw names for a gift exchange",
                family="organiser",
                play_mode="solo",
                score_order="none",
                min_players=1,
                max_players=1,
                minutes="5–10",
                icon="sparkles",
                color="coral",
                rules=[
                    "Add everyone taking part, then a date, a place and a budget if you like.",
                    "Say who must not draw whom: one pair at a time, or a whole group such as a household.",
                    "Draw the names. Nobody draws themselves, an excluded person or someone in their group.",
                    "Send each person their private link, or pass the phone round and show one name at a time.",
                    "You never see the full list. Changing the people means drawing again, which replaces every link.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        state: State = {
            "order": players,
            "turn": 0,
            "phase": "setup",
            "title": DEFAULT_TITLE,
            "day": None,
            "location": "",
            "budget": "",
            "people": [],
            "next_person": 1,
            "pairs": [],
            "groups": [],
            "next_group": 1,
            "assignment": {},
            "opened": [],
            "showing": None,
            "draw_number": 0,
            # Private: every draw takes its own stream from this number.
            "seed": rng(seed).randrange(2**63),
            "winners": [],
        }
        state["message"] = self._message(state)
        return state

    @staticmethod
    def _message(s: State) -> str:
        if s["phase"] == "finished":
            return "All done. Each private link still shows that person's name."
        if s["phase"] == "drawn":
            return ("Showing one name. Hide it before you pass the phone on." if s["showing"]
                    else "Names are drawn. Share each person's link.")
        if len(s["people"]) < MIN_PEOPLE:
            return "Add the people taking part."
        return blocked_reason(s) or "Ready when you are. Draw the names."

    def _options(self, s: State, can_draw: bool) -> list[LegalAction]:
        people, groups = s["people"], s["groups"]
        ids = [person["id"] for person in people]
        details = [
            legal("Set the title", "set_title", input="text", minimum=1, maximum=TITLE_LIMIT),
            legal("Set the location", "set_location", input="text", minimum=1, maximum=LOCATION_LIMIT),
            legal("Set the budget", "set_budget", input="text", minimum=1, maximum=BUDGET_LIMIT),
            legal("Set the date", "set_day", input="amount", minimum=0, maximum=MAX_DAY),
            *(legal(f"Clear the {field}", "clear", target=field) for field in DETAILS),
        ]
        if s["phase"] == "drawn":
            return [
                *details,
                *(legal(f"Show {person['name']} their name", "reveal", target=person["id"])
                  for person in people),
                *([legal("Hide the name", "hide")] if s["showing"] else []),
                legal("Change the list and draw again", "redraw"),
                legal("Finish", "finish"),
            ]
        options = []
        if len(people) < MAX_PEOPLE:
            options.append(legal("Add a name", "add_name", input="text", minimum=1, maximum=NAME_LIMIT))
        for person in people:
            ident, name = person["id"], person["name"]
            options.append(legal(f"Rename {name}", "rename", target=ident, input="text",
                                 minimum=1, maximum=NAME_LIMIT))
            options.append(legal(f"Remove {name}", "remove_name", target=ident))
            if len(people) > 1:
                options.append(legal(f"Choose who {name} can't draw", "set_exclusions", target=ident,
                                     input="cards", eligible_cards=[other for other in ids if other != ident]))
        if len(groups) < MAX_GROUPS:
            options.append(legal("Add a group", "add_group", input="text", minimum=1, maximum=NAME_LIMIT))
        for group in groups:
            ident, label = group["id"], group["label"]
            options.append(legal(f"Rename {label}", "rename_group", target=ident, input="text",
                                 minimum=1, maximum=NAME_LIMIT))
            options.append(legal(f"Remove {label}", "remove_group", target=ident))
            if people:
                options.append(legal(f"Choose who is in {label}", "set_group", target=ident,
                                     input="cards", eligible_cards=ids))
        options.extend(details)
        if can_draw:
            options.append(legal("Draw the names", "draw"))
        return options

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if player not in s["order"] or s["phase"] == "finished":
            return []
        return self._options(s, s["phase"] == "setup" and blocked_reason(s) is None)

    @staticmethod
    def _chosen(action: Action, eligible: list[str]) -> list[str]:
        """The submitted ids in list order, refused unless each is offered once."""
        if len(set(action.cards)) != len(action.cards) or not set(action.cards) <= set(eligible):
            raise RuleError("Choose only people on this list, each once.")
        return [ident for ident in eligible if ident in action.cards]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        people, groups, kind = s["people"], s["groups"], action.type
        ids = [person["id"] for person in people]
        if kind in EDITS:
            field, limit, what = EDITS[kind]
            s[field] = clean(action.choice, limit, what)
        elif kind == "set_day":
            s["day"] = action.amount
        elif kind == "clear":
            s[action.target] = None if action.target == "day" else ""
        elif kind in {"add_name", "rename"}:
            name = clean(action.choice, NAME_LIMIT, "A name")
            taken = {person["name"].casefold() for person in people if person["id"] != action.target}
            name = unique(name, taken, NAME_LIMIT)
            if kind == "rename":
                next(person for person in people if person["id"] == action.target)["name"] = name
            else:
                people.append({"id": f"p{s['next_person']}", "name": name})
                s["next_person"] += 1
        elif kind == "remove_name":
            s["people"] = [person for person in people if person["id"] != action.target]
            s["pairs"] = [pair for pair in s["pairs"] if action.target not in pair]
            for group in groups:
                group["members"] = [member for member in group["members"] if member != action.target]
        elif kind == "set_exclusions":
            others = self._chosen(action, [ident for ident in ids if ident != action.target])
            kept = [pair for pair in s["pairs"] if action.target not in pair]
            s["pairs"] = sorted(kept + [sorted([action.target, other]) for other in others])
        elif kind in {"add_group", "rename_group"}:
            label = clean(action.choice, NAME_LIMIT, "A group name")
            taken = {group["label"].casefold() for group in groups if group["id"] != action.target}
            label = unique(label, taken, NAME_LIMIT)
            if kind == "rename_group":
                next(group for group in groups if group["id"] == action.target)["label"] = label
            else:
                groups.append({"id": f"g{s['next_group']}", "label": label, "members": []})
                s["next_group"] += 1
        elif kind == "remove_group":
            s["groups"] = [group for group in groups if group["id"] != action.target]
        elif kind == "set_group":
            members = self._chosen(action, ids)
            next(group for group in groups if group["id"] == action.target)["members"] = members
        elif kind == "draw":
            s["draw_number"] += 1
            s["assignment"] = draw_names(s, Random(s["seed"] + s["draw_number"]))
            s.update(phase="drawn", opened=[], showing=None)
        elif kind == "reveal":
            s["showing"] = action.target
            if action.target not in s["opened"]:
                s["opened"].append(action.target)
        elif kind == "hide":
            s["showing"] = None
        elif kind == "redraw":
            # Old links carry the old draw number, so none of them opens again.
            s.update(phase="setup", assignment={}, opened=[], showing=None)
        elif kind == "finish":
            s.update(phase="finished", showing=None, winners=[])
        s["message"] = self._message(s)
        return s

    @staticmethod
    def is_drawn(state: State) -> bool:
        return state.get("phase") in {"drawn", "finished"}

    @staticmethod
    def private_draw(state: State, person_id: str) -> dict[str, JsonValue] | None:
        """One person's own line and the event details, for the holder of their link."""
        if not SecretSantaEngine.is_drawn(state) or person_id not in state["assignment"]:
            return None
        names = {person["id"]: person["name"] for person in state["people"]}
        return {
            "title": state["title"], "day": state["day"], "location": state["location"],
            "budget": state["budget"], "giver_name": names[person_id],
            "recipient_name": names[state["assignment"][person_id]],
        }

    @staticmethod
    def mark_opened(state: State, person_id: str) -> State | None:
        """The state with this person's link marked as opened, or None if nothing changes."""
        if (not SecretSantaEngine.is_drawn(state) or person_id not in state["assignment"]
                or person_id in state["opened"]):
            return None
        return {**state, "opened": [*state["opened"], person_id]}

    def project_view(self, s: State, player: str) -> GameView:
        finished = s["phase"] == "finished"
        if player not in s["order"]:
            return GameView(game_id=GAME_ID, phase=s["phase"], current_player=None,
                            players=[PlayerView(id=p) for p in s["order"]], hand=[])
        blocked = blocked_reason(s) if s["phase"] == "setup" else None
        can_draw = s["phase"] == "setup" and blocked is None
        names = {person["id"]: person["name"] for person in s["people"]}
        showing: JsonValue = None
        if s["showing"]:
            # The one place a recipient is named, while that giver looks at this screen.
            showing = {"giver": s["showing"], "giver_name": names[s["showing"]],
                       "recipient_name": names[s["assignment"][s["showing"]]]}
        detail: dict[str, JsonValue] = {
            "title": s["title"], "day": s["day"], "location": s["location"], "budget": s["budget"],
            "people": [{"id": person["id"], "name": person["name"],
                        "opened": person["id"] in s["opened"]} for person in s["people"]],
            "pairs": [list(pair) for pair in s["pairs"]],
            "groups": [{"id": group["id"], "label": group["label"], "members": list(group["members"])}
                       for group in s["groups"]],
            "drawn": self.is_drawn(s), "draw_number": s["draw_number"],
            "can_draw": can_draw, "blocked": blocked,
            "showing": showing, "limits": dict(LIMITS),
        }
        return GameView(
            game_id=GAME_ID, phase=s["phase"],
            current_player=None if finished else s["order"][0],
            players=[PlayerView(id=p) for p in s["order"]], hand=[],
            actions=[] if finished else self._options(s, can_draw),
            winners=[], message=s["message"], detail=detail,
        )
