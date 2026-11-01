"""A small original semantic lexicon, shared as vocabulary rather than secret keys.

Spymasters inspect only their legitimately visible key. Operatives use only the
published clue, public words and this lexicon; no target IDs are communicated.
"""

from difflib import SequenceMatcher
from typing import Any

from app.bots.context import Context
from app.core.contracts import Action

GROUPS = {
    "nautical": "ANCHOR BOAT CAPTAIN COAST COMPASS CORAL HARBOR LIGHTHOUSE OCEAN PEARL SAIL SALT SAND SEAL SHELL SHIP SUBMARINE WATER WAVE WHALE",
    "fruit": "APPLE CHERRY LEMON OLIVE ORANGE STRAWBERRY TOMATO WALNUT",
    "garment": "APRON BOOT BUTTON GLOVE HAT JACKET POCKET SHOE SOCK VELVET",
    "cartography": "ATLAS MAP EARTH COMPASS ISLAND COAST MOUNTAIN RIVER",
    "celebration": "BALLOON BELL CANDLE DANCE FLAG KITE JAZZ",
    "botany": "BAMBOO BRANCH TREE LEAF WOOD PINE FOREST JUNGLE FLOWER ROSE GRASS GARDEN MEADOW FIELD YARD",
    "container": "BASKET BOTTLE BUCKET SUITCASE POCKET GLASS",
    "comfort": "BLANKET PILLOW VELVET CABIN TENT CHAIR TEA",
    "mammal": "BEAR CAT DOG FOX HORSE LION MOUSE RABBIT TIGER WHALE WOLF ZEBRA",
    "avian": "BIRD EAGLE FEATHER NEST OWL PARROT SWAN WING",
    "anatomy": "BONE HEART WING FEATHER",
    "medicine": "DOCTOR HOSPITAL BONE HEART NEEDLE",
    "furnishing": "CHAIR DOOR TABLE LAMP MIRROR WINDOW ROOF WALL PILLOW BLANKET",
    "dwelling": "CABIN CASTLE DOOR GATE HOTEL PALACE ROOF TENT TOWER WALL WINDOW",
    "landscape": "BEACH CANYON CAVE DESERT FIELD HILL ISLAND LAKE MEADOW MOUNTAIN POND RIVER ROCK SAND STONE VALLEY VOLCANO",
    "astronomy": "COMET EARTH MOON NIGHT PLANET ROCKET SATELLITE SKY STAR SUN",
    "jewellery": "DIAMOND GOLD PEARL CRYSTAL RING SILVER MARBLE CROWN",
    "fantasy": "DRAGON GHOST PRINCE CROWN SWORD CASTLE PALACE",
    "mechanics": "BICYCLE ENGINE MACHINE MAGNET ROBOT TELEPHONE TRAIN WHEEL",
    "transport": "BICYCLE BOAT ENGINE PILOT ROCKET SHIP SUBMARINE TRAIN STATION WHEEL",
    "workshop": "BRUSH HAMMER LADDER MAGNET NEEDLE PAINT PENCIL ROPE SCISSORS TORCH WOOD",
    "cuisine": "COFFEE HONEY JELLY LEMON OLIVE ORANGE PLATE POTATO SALT STRAWBERRY TEA TOAST TOMATO WALNUT",
    "weather": "CLOUD ICE RAIN RAINBOW SNOW SPRING STORM THUNDER WATER WAVE WINTER SKY",
    "calendar": "CLOCK NIGHT SPRING WATCH WINTER SUN",
    "study": "ATLAS LIBRARY MUSEUM PAPER PENCIL POSTER SCHOOL LETTER PUZZLE",
    "security": "GATE KEY LOCK BADGE MASK WALL",
    "illumination": "BEACON CANDLE FIRE LAMP LANTERN LIGHTHOUSE SPARK SUN TORCH",
    "holiday": "BEACH COAST HOTEL ISLAND SUITCASE TENT UMBRELLA",
    "pondlife": "FROG FISH SNAIL TURTLE WATER POND",
    "communication": "BEACON BELL FLAG LETTER POSTER TELEPHONE SATELLITE",
    "fastener": "BUTTON KEY LOCK NEEDLE RING ROPE",
    "hygiene": "BRUSH SOAP WATER",
    "equestrian": "HORSE SADDLE BOOT FIELD",
    "footwear": "BOOT SHOE SOCK",
    "melody": "DRUM FLUTE GUITAR JAZZ PIANO VIOLIN DANCE BELL",
    "cutlery": "FORK KNIFE SPOON PLATE",
    "royalty": "PRINCE CROWN PALACE CASTLE SWORD",
    "crossing": "BRIDGE GATE TUNNEL DOOR LADDER RIVER",
    "mineral": "CRYSTAL DIAMOND GOLD MAGNET MARBLE PEARL ROCK SALT SILVER STONE",
    "arachnid": "SPIDER",
    "wildcat": "CAT LION TIGER",
    "canine": "DOG FOX WOLF",
    "citrus": "LEMON ORANGE",
    "beverage": "COFFEE TEA WATER BOTTLE GLASS",
    "camping": "TENT BLANKET FIRE LANTERN ROPE TORCH FOREST MOUNTAIN",
    "maritime": "ANCHOR CAPTAIN HARBOR LIGHTHOUSE SAIL SHIP SUBMARINE",
    "sweets": "HONEY JELLY STRAWBERRY CHERRY",
    "reptile": "TURTLE DRAGON",
    "instrument": "DRUM FLUTE GUITAR PIANO VIOLIN",
    "reflection": "MIRROR GLASS WATER SHADOW",
    "flying": "BIRD EAGLE KITE OWL PARROT PILOT ROCKET SWAN WING",
    "forestry": "BAMBOO BRANCH FOREST LEAF PINE TREE WOOD",
    "folklore": "DRAGON GHOST CASTLE SWORD PRINCE",
    "decoration": "BALLOON FLOWER MARBLE PAINT POSTER ROSE VELVET",
    "illumined": "BEACON CANDLE LAMP LANTERN LIGHTHOUSE TORCH",
    "climbing": "HILL LADDER MOUNTAIN ROPE ROCK TOWER WALL",
    "construction": "BRICK BRIDGE DOOR ENGINE HAMMER LADDER ROOF TOWER TUNNEL WALL WINDOW WOOD",
    "coastal": "BEACH COAST CORAL HARBOR ISLAND LIGHTHOUSE OCEAN SAND SEAL SHELL WAVE WHALE",
    "chronology": "CLOCK NIGHT SPRING WATCH WINTER",
    "portable": "BASKET BOTTLE BUCKET HAT JACKET SUITCASE UMBRELLA",
    "waterworks": "FOUNTAIN LAKE POND RIVER WATER WAVE",
    "blaze": "CANDLE FIRE SPARK TORCH VOLCANO",
    "springtime": "BIRD FLOWER GARDEN GRASS LEAF MEADOW NEST RAIN ROSE SPRING",
    "arctic": "ICE SNOW WINTER BEAR SEAL WHALE",
    "emblem": "BADGE CROWN FLAG HEART RING STAR",
    "archery": "ARROW ROPE WOOD",
    "pet": "BIRD CAT DOG FISH MOUSE PARROT RABBIT TURTLE",
}
LEXICON = {name: frozenset(words.split()) for name, words in GROUPS.items()}
ALIASES = {
    "music": "melody",
    "animals": "mammal",
    "animal": "mammal",
    "birds": "avian",
    "clothes": "garment",
    "clothing": "garment",
    "ocean": "nautical",
    "sea": "nautical",
    "space": "astronomy",
    "travel": "transport",
    "plants": "botany",
    "green": "botany",
    "food": "cuisine",
    "drink": "beverage",
    "weapons": "royalty",
    "magic": "fantasy",
    "galaxy": "astronomy",
    "cosmos": "astronomy",
    "stars": "astronomy",
    "trees": "forestry",
    "nature": "botany",
    "flowers": "botany",
    "house": "dwelling",
    "home": "dwelling",
    "buildings": "dwelling",
    "tools": "workshop",
    "cutting": "cutlery",
    "metal": "mineral",
    "winter": "arctic",
    "cold": "arctic",
    "warm": "blaze",
    "fire": "blaze",
    "sailing": "maritime",
    "oceanic": "nautical",
    "pets": "pet",
    "hiking": "climbing",
    "school": "study",
    "learning": "study",
}


def _association(clue: str, word: str) -> float:
    clue = ALIASES.get(clue.lower(), clue.lower())
    if word.upper() in LEXICON.get(clue, frozenset()):
        return 10
    # A human can supply clues outside the finite lexicon. Spelling similarity
    # is an honest weak fallback, not access to the spymaster's hidden key.
    return SequenceMatcher(None, clue, word.lower()).ratio()


def word_action(ctx: Context) -> Action | None:
    if ctx.view.game_id != "word-agents":
        return None
    board = [c for c in ctx.view.community if c.subtitle == "hidden"]
    if ctx.detail.get("role") == "spymaster":
        team = "coral" if ctx.detail["active_team"] == 0 else "blue"
        visible = {c.value.upper() for c in board}
        candidates: list[tuple[float, str, int]] = []
        for clue, words in LEXICON.items():
            if clue.upper() in visible:
                continue
            targets = [c for c in board if c.value.upper() in words]
            own = sum(c.color == team for c in targets)
            wrong = sum(c.color != team for c in targets)
            assassin = any(c.color == "assassin" for c in targets)
            if own:
                candidates.append((own * 5 - wrong * 9 - (100 if assassin else 0), clue, own))
        if candidates:
            best = max(item[0] for item in candidates)
            _, clue, count = ctx.random.choice([item for item in candidates if item[0] == best])
        else:
            clue, count = "thought", 1
        option = next(o for o in ctx.options if o.action.amount == min(9, count))
        action = ctx.action(option)
        action.choice = clue
        return action
    clue = str(ctx.detail.get("clue", ""))
    guesses = ctx.of("guess")
    best = max(
        (_association(clue, ctx.view.community[int(o.action.choice)].value) for o in guesses),
        default=0,
    )
    if ctx.of("end_guesses") and best < 1:
        return ctx.action(ctx.of("end_guesses")[0])

    def score(o: Any) -> float:
        return _association(clue, ctx.view.community[int(o.action.choice)].value)

    return ctx.action(ctx.best(guesses, score))
