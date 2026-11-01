"""Non-LLM players operating on the same authorized views as humans."""

from app.bots.policy import BotDecision, choose_action, observe_view, supports_bots

__all__ = ["BotDecision", "choose_action", "observe_view", "supports_bots"]
