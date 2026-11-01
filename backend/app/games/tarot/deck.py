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
RANKS = [
    ("Ace", "A fresh opportunity in"),
    ("Two", "A choice or partnership involving"),
    ("Three", "Growth through collaboration in"),
    ("Four", "Stability or a needed pause in"),
    ("Five", "Friction invites a new approach to"),
    ("Six", "Restoring balance and reciprocity in"),
    ("Seven", "Reassess your position and stay discerning about"),
    ("Eight", "Focused effort and change in"),
    ("Nine", "Resilience and the results of effort in"),
    ("Ten", "A cycle reaches its limits or fulfilment in"),
    ("Page", "Approach with a beginner's curiosity:"),
    ("Knight", "Put intention into motion, mindful of haste:"),
    ("Queen", "Respond with mature care and inward confidence:"),
    ("King", "Lead responsibly and turn experience into wise action:"),
]
DECK = [
    TarotCard(f"major-{i:02}", name, meaning, rank=i) for i, (name, meaning) in enumerate(MAJOR)
] + [
    TarotCard(
        f"{suit}-{i + 1:02}",
        f"{name} of {suit.title()}",
        f"{meaning} {theme}.",
        suit=suit,
        rank=i + 1,
    )
    for suit, (theme, _) in SUITS.items()
    for i, (name, meaning) in enumerate(RANKS)
]
BY_ID = {card.id: card for card in DECK}
POSITIONS = ("Where you are", "What is shifting", "Your next move")
