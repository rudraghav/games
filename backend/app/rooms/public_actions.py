"""Small public casino cues; never copy a submitted action or private cards."""

from app.core.contracts import Action, GameView

PUBLIC_ACTIONS = {
    "holdem": {"fold", "check", "call", "raise", "all_in"},
    "teen-patti": {"fold", "peek", "bet", "show", "sideshow", "accept", "decline"},
    "blackjack": {"bet", "accept", "decline", "hit", "stand", "split", "double"},
}


def public_action(view: GameView, actor: str, action: Action, version: int) -> dict | None:
    if action.type not in PUBLIC_ACTIONS.get(view.game_id, set()):
        return None
    player = next((p for p in view.players if p.id == actor), None)
    if player is None:
        return None
    amount: int | None = None
    if action.type == "bet":
        amount = action.amount
    elif view.game_id == "holdem":
        if action.type == "call":
            current = view.detail.get("current_bet")
            if isinstance(current, int):
                amount = min(max(0, current - player.bet), player.chips or 0)
        elif action.type == "raise":
            amount = max(0, action.amount - player.bet)
        elif action.type == "all_in":
            amount = player.chips
    elif view.game_id == "teen-patti" and action.type in {"show", "sideshow"}:
        stake = view.detail.get("stake")
        if isinstance(stake, int):
            amount = stake * (1 if view.detail.get("blind") else 2)
    elif view.game_id == "blackjack":
        if view.phase == "insurance" and action.type == "accept":
            amount = player.bet // 2
        elif action.type in {"split", "double"}:
            hands, index = view.detail.get("hands"), view.detail.get("hand_index")
            if isinstance(hands, list) and isinstance(index, int) and 0 <= index < len(hands):
                hand = hands[index]
                bet = hand.get("bet") if isinstance(hand, dict) else None
                if isinstance(bet, int):
                    amount = bet
    return {"version": version, "actor_id": actor, "type": action.type, "amount": amount}
