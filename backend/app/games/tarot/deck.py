"""Original concise meanings; 22 major + four suits of fourteen cards."""

from dataclasses import dataclass

from app.core.contracts import CardView


@dataclass(frozen=True)
class TarotCard:
    id: str
    name: str
    meaning: str
    suit: str = "major"
    rank: int = 0

    def view(self) -> CardView:
        return CardView(
            id=self.id,
            label=self.name,
            subtitle=self.meaning,
            value=str(self.rank),
            color=self.suit,
            suit=self.suit,
        )


MAJOR = [
    ("The Fool", "Beginnings, curiosity and taking a thoughtful leap."),
    ("The Magician", "Resourcefulness: turn the skills you already have into action."),
    ("The High Priestess", "Listen closely to intuition and what remains unsaid."),
    ("The Empress", "Nurture creativity, care and the things that need time to grow."),
    ("The Emperor", "Give your ambition structure, boundaries and steady leadership."),
    ("The Hierophant", "Consider tradition, trusted guidance and which rules serve you."),
    ("The Lovers", "Choose in alignment with your values and communicate honestly."),
    ("The Chariot", "Bring competing impulses together and choose a clear direction."),
    ("Strength", "Meet difficulty with patient courage rather than force."),
    ("The Hermit", "Step back from noise to find your own considered answer."),
    ("Wheel of Fortune", "Circumstances shift; respond to change without assuming control of it."),
    ("Justice", "Look at consequences, fairness and your responsibility in a choice."),
    ("The Hanged Man", "Pause, loosen your grip and try another perspective."),
    ("Death", "An ending makes space for change; release a pattern that has run its course."),
    ("Temperance", "Blend differences, pace yourself and seek a sustainable middle ground."),
    ("The Devil", "Notice attachments and habits that limit your freedom to choose."),
    ("The Tower", "Question an unstable assumption and rebuild on something honest."),
    ("The Star", "Make space for renewal, hope and small acts of restoration."),
    ("The Moon", "Uncertainty calls for curiosity; separate fear from evidence."),
    ("The Sun", "Welcome clarity, playfulness and the simple pleasure of being present."),
    ("Judgement", "Reflect honestly and answer a call to grow beyond an old story."),
    ("The World", "Recognise a completed cycle and carry its lessons into what follows."),
]
SUITS = {
    "wands": ("energy, creativity and ambition", "✦"),
    "cups": ("relationships, feelings and connection", "♡"),
    "swords": ("ideas, communication and difficult truths", "✧"),
    "pentacles": ("resources, daily work and practical care", "◎"),
}
RANKS = (
    "Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Page", "Knight", "Queen", "King",
)
# Each minor card has its own archetype. Suit/rank templates flatten important
# differences such as Five of Cups (loss) versus Five of Pentacles (exclusion).
MINOR_MEANINGS = {
    "wands": (
        "A creative spark asks for a small first experiment; enthusiasm needs an outlet.",
        "Look beyond the familiar and make a plan before expanding your ambitions.",
        "An effort is taking shape; consider the wider horizon and what comes next.",
        "Celebrate a shared milestone and the people who make a place feel welcoming.",
        "Competing ideas create friction; distinguish useful challenge from needless rivalry.",
        "Accept recognition for progress while remembering the people who helped you get here.",
        "Hold a meaningful boundary when challenged; choose what is worth defending.",
        "Momentum and messages gather speed; coordinate your response before rushing ahead.",
        "Past effort has made you cautious; protect your energy without shutting everything out.",
        "Too much responsibility obscures the goal; share a burden or put one task down.",
        "Explore a bold idea with beginner's curiosity before deciding where it will lead.",
        "Move with adventurous energy, giving your excitement enough direction to last.",
        "Express yourself with warm confidence and make room for other people's brilliance.",
        "Turn a broad creative vision into generous, accountable leadership.",
    ),
    "cups": (
        "Make space for a new feeling, creative connection or act of emotional openness.",
        "Meet another person with mutual respect; connection grows through honest exchange.",
        "Friendship and shared joy offer support; let yourself belong to a community.",
        "Pause with a feeling of disinterest and notice an offer you may be overlooking.",
        "Acknowledge disappointment without letting what was lost hide what still remains.",
        "A memory or familiar kindness can nourish you; bring its lesson into the present.",
        "Many appealing possibilities compete for attention; separate a wish from a workable choice.",
        "Consider leaving an unfulfilling pattern even when it is familiar and hard to release.",
        "Savour a personal satisfaction and ask what enough feels like on your own terms.",
        "Shared emotional fulfilment grows through everyday care, belonging and chosen family.",
        "Be curious about a tender feeling or surprising idea without dismissing it as naive.",
        "Express an invitation or ideal with sincerity, checking that action supports the romance.",
        "Listen compassionately to feelings while maintaining a boundary that protects your energy.",
        "Respond to strong emotions with steadiness; care and clear judgement can work together.",
    ),
    "swords": (
        "A clear idea cuts through confusion; use honesty precisely and with care.",
        "A difficult choice needs information as well as quiet; postponing it also has a cost.",
        "Name a painful truth and allow yourself care rather than explaining the hurt away.",
        "Rest and mental distance are part of recovery; leave space before your next response.",
        "Winning an argument can damage connection; consider the price of being right.",
        "A gradual transition carries lessons from a difficult place toward a calmer one.",
        "Consider discretion and strategy while checking where avoidance becomes dishonesty.",
        "A limiting story can make choices feel invisible; examine one constraint you can test.",
        "Anxious thoughts can grow in isolation; separate what is known from what is feared.",
        "An exhausting chapter has reached its limit; acknowledge the ending and begin recovery.",
        "Ask careful questions and test an intriguing idea before treating it as a fact.",
        "Pursue a clear argument with courage, pausing long enough to notice who may be affected.",
        "Speak with discerning honesty and firm boundaries without losing your compassion.",
        "Use knowledge and fair principles to make a clear, responsible decision.",
    ),
    "pentacles": (
        "A practical opportunity needs tending; begin with a concrete, manageable investment of effort.",
        "Balance changing demands flexibly and check what your time and energy can actually hold.",
        "Different skills strengthen shared work; ask for useful feedback and give others credit.",
        "Security matters, but holding too tightly can limit generosity and room to grow.",
        "A sense of scarcity or exclusion invites practical support; you do not have to manage alone.",
        "Notice the balance of giving and receiving, including the power attached to an offer.",
        "Pause to review a slow-growing effort; decide what deserves continued care or adjustment.",
        "Patient practice builds skill; improve one small detail rather than chasing instant mastery.",
        "Enjoy a hard-earned measure of independence and the everyday pleasures it makes possible.",
        "Consider the lasting structures, shared resources and traditions you want to pass on.",
        "Approach a practical skill with curiosity and turn an intention into a learnable first task.",
        "Steady, dependable action can carry a plan forward; watch for routine becoming rigidity.",
        "Make care tangible through comfort, resourcefulness and a sustainable daily rhythm.",
        "Steward resources responsibly and use stability to support people as well as achievement.",
    ),
}
DECK = [
    TarotCard(f"major-{i:02}", name, meaning, rank=i) for i, (name, meaning) in enumerate(MAJOR)
] + [
    TarotCard(
        f"{suit}-{i + 1:02}",
        f"{name} of {suit.title()}",
        MINOR_MEANINGS[suit][i],
        suit=suit,
        rank=i + 1,
    )
    for suit in SUITS
    for i, name in enumerate(RANKS)
]
BY_ID = {card.id: card for card in DECK}
POSITIONS = ("Where you are", "What is shifting", "Your next move")
