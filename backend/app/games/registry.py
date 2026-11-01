from app.core.contracts import Engine
from app.games.blackjack.engine import BlackjackEngine
from app.games.board.checkers import CheckersEngine
from app.games.board.four import FourEngine
from app.games.board.mancala import MancalaEngine
from app.games.board.reversi import ReversiEngine
from app.games.deal.engine import DealEngine
from app.games.gem_market.engine import GemMarketEngine
from app.games.holdem.engine import HoldemEngine
from app.games.rummy.engine import RummyEngine
from app.games.skyjo.engine import SkyjoEngine
from app.games.tarot.engine import TarotEngine
from app.games.teen_patti.engine import TeenPattiEngine
from app.games.uno.engine import UnoEngine
from app.games.word_agents.engine import WordAgentsEngine

ALL_ENGINES: list[Engine] = [
    UnoEngine(),
    UnoEngine(True),
    DealEngine(),
    DealEngine(True),
    HoldemEngine(),
    RummyEngine(),
    TeenPattiEngine(),
    BlackjackEngine(),
    SkyjoEngine(),
    TarotEngine(),
    FourEngine(),
    ReversiEngine(),
    WordAgentsEngine(),
    GemMarketEngine(),
    CheckersEngine(),
    MancalaEngine(),
]
ENGINES: dict[str, Engine] = {engine.manifest.id: engine for engine in ALL_ENGINES}
