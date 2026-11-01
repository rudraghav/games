"""Bounded search on public boards; no authoritative/private state is accepted."""

from hashlib import sha256
from typing import Any

from app.bots.context import Context
from app.core.contracts import Action
from app.games.board.checkers import moves as checker_moves
from app.games.board.reversi import captures


def _board(ctx: Context) -> list[int | None]:
    return [int(c.value) - 1 if c.value else None for c in ctx.view.community]


def _four_win(board: list[int | None], seat: int) -> bool:
    return any(
        all(board[(r + dr * n) * 7 + c + dc * n] == seat for n in range(4))
        for r in range(6)
        for c in range(7)
        for dr, dc in [(0, 1), (1, 0), (1, 1), (1, -1)]
        if 0 <= r + dr * 3 < 6 and 0 <= c + dc * 3 < 7
    )


def _four_place(board: list[int | None], col: int, seat: int) -> list[int | None]:
    result = board.copy()
    result[max(r * 7 + col for r in range(6) if result[r * 7 + col] is None)] = seat
    return result


def _four(ctx: Context) -> Action:
    board, seat = _board(ctx), ctx.seat
    nodes = 0
    wins = [
        o for o in ctx.options if _four_win(_four_place(board, int(o.action.choice), seat), seat)
    ]
    if wins:
        return ctx.action(ctx.pick(wins))
    safe = []
    for option in ctx.options:
        after = _four_place(board, int(option.action.choice), seat)
        if not any(
            _four_win(_four_place(after, c, 1 - seat), 1 - seat)
            for c in range(7)
            if after[c] is None
        ):
            safe.append(option)

    def score(b: list[int | None], turn: int, depth: int, alpha: float, beta: float) -> float:
        nonlocal nodes
        nodes += 1
        if _four_win(b, seat):
            return 10000 + depth
        if _four_win(b, 1 - seat):
            return -10000 - depth
        columns = [c for c in (3, 2, 4, 1, 5, 0, 6) if b[c] is None]
        if not depth or not columns or nodes > 1600:
            value: float = float(
                sum(2 if x == seat else -2 if x is not None else 0 for x in b[3::7])
            )
            for r in range(6):
                for c in range(7):
                    for dr, dc in [(0, 1), (1, 0), (1, 1), (1, -1)]:
                        if not (0 <= r + dr * 3 < 6 and 0 <= c + dc * 3 < 7):
                            continue
                        cells = [b[(r + dr * n) * 7 + c + dc * n] for n in range(4)]
                        own, enemy = cells.count(seat), cells.count(1 - seat)
                        if not enemy:
                            value += [0, 1, 5, 30, 10000][own]
                        if not own:
                            value -= [0, 1, 6, 36, 10000][enemy]
            return value
        best = -1e9 if turn == seat else 1e9
        for c in columns:
            value = score(_four_place(b, c, turn), 1 - turn, depth - 1, alpha, beta)
            if turn == seat:
                best, alpha = max(best, value), max(alpha, value)
            else:
                best, beta = min(best, value), min(beta, value)
            if beta <= alpha:
                break
        return best

    return ctx.action(
        ctx.best(
            safe or ctx.options,
            lambda o: score(_four_place(board, int(o.action.choice), seat), 1 - seat, 3, -1e9, 1e9),
        )
    )


def _reversi(ctx: Context) -> Action:
    board, seat = _board(ctx), ctx.seat
    weights = [
        100,
        -20,
        12,
        7,
        7,
        12,
        -20,
        100,
        -20,
        -35,
        -4,
        -3,
        -3,
        -4,
        -35,
        -20,
        12,
        -4,
        5,
        2,
        2,
        5,
        -4,
        12,
        7,
        -3,
        2,
        1,
        1,
        2,
        -3,
        7,
    ] * 2
    # Mirror the lower half rather than favouring one end of the board.
    weights[32:] = list(reversed(weights[:32]))
    nodes = 0

    def search(b: list[int | None], turn: int, depth: int, alpha: float, beta: float) -> float:
        nonlocal nodes
        nodes += 1
        choices = [(i, captures(b, i, turn)) for i in range(64) if b[i] is None]
        choices = [(i, flips) for i, flips in choices if flips]
        if not depth or nodes > 900:
            positional = sum(
                weights[i] * (1 if x == seat else -1) for i, x in enumerate(b) if x is not None
            )
            return positional + (b.count(seat) - b.count(1 - seat)) * (
                4 if b.count(None) < 12 else 0.1
            )
        if not choices:
            if not any(captures(b, i, 1 - turn) for i in range(64)):
                return (b.count(seat) - b.count(1 - seat)) * 1000
            return search(b, 1 - turn, depth - 1, alpha, beta)
        best = -1e9 if turn == seat else 1e9
        for i, flips in sorted(choices, key=lambda p: weights[p[0]], reverse=True):
            child = b.copy()
            for square in [i, *flips]:
                child[square] = turn
            value = search(child, 1 - turn, depth - 1, alpha, beta)
            if turn == seat:
                best, alpha = max(best, value), max(alpha, value)
            else:
                best, beta = min(best, value), min(beta, value)
            if beta <= alpha:
                break
        return best

    def candidate(o: Any) -> float:
        child = board.copy()
        cell = int(o.action.choice)
        for i in [cell, *captures(board, cell, seat)]:
            child[i] = seat
        return search(child, 1 - seat, 2, -1e9, 1e9)

    return ctx.action(ctx.best(ctx.options, candidate))


def _checker_step(
    b: list[int | None], turn: int, move: tuple[int, int, int | None]
) -> tuple[list[int | None], int, int | None]:
    start, end, captured = move
    board = b.copy()
    piece = board[start]
    assert piece is not None
    board[start], board[end] = None, piece
    if captured is not None:
        board[captured] = None
    crowned = piece < 2 and end // 8 == (0 if turn == 0 else 7)
    if crowned:
        board[end] = piece + 2
    forced = end if captured is not None and not crowned else None
    if forced is not None and checker_moves({"board": board, "forced": forced}, turn):
        return board, turn, forced
    return board, 1 - turn, None


def _checkers(ctx: Context) -> Action:
    board = [
        None if not c.value else int(c.value) - 1 + (2 if c.subtitle == "King" else 0)
        for c in ctx.view.community
    ]
    seat, nodes = ctx.seat, 0

    def search(
        b: list[int | None], turn: int, forced: int | None, depth: int, alpha: float, beta: float
    ) -> float:
        nonlocal nodes
        nodes += 1
        choices = checker_moves({"board": b, "forced": forced}, turn)
        if not choices:
            return -10000 if turn == seat else 10000
        if not depth or nodes > 1200:
            value = 0.0
            for i, p in enumerate(b):
                if p is not None:
                    worth = 175 if p >= 2 else 100 + (7 - i // 8 if p % 2 == 0 else i // 8) * 5
                    value += worth if p % 2 == seat else -worth
            return value
        best = -1e9 if turn == seat else 1e9
        for move in choices:
            child, next_turn, force = _checker_step(b, turn, move)
            value = search(child, next_turn, force, depth - 1, alpha, beta)
            if turn == seat:
                best, alpha = max(best, value), max(alpha, value)
            else:
                best, beta = min(best, value), min(beta, value)
            if beta <= alpha:
                break
        return best

    def score(o: Any) -> float:
        a, b = map(int, o.action.choice.split(":"))
        capture = (a + b) // 2 if abs(a // 8 - b // 8) == 2 else None
        child, turn, forced = _checker_step(board, seat, (a, b, capture))
        return search(child, turn, forced, 3, -1e9, 1e9)

    return ctx.action(ctx.best(ctx.options, score))


def _sow(pits: list[int], turn: int, start: int) -> tuple[list[int], int]:
    result = pits.copy()
    amount, result[start] = result[start], 0
    own, other, cell = (6, 13, start) if turn == 0 else (13, 6, start)
    while amount:
        cell = (cell + 1) % 14
        if cell != other:
            result[cell] += 1
            amount -= 1
    side = range(0, 6) if turn == 0 else range(7, 13)
    if cell in side and result[cell] == 1 and result[12 - cell]:
        result[own] += result[12 - cell] + 1
        result[cell] = result[12 - cell] = 0
    if not any(result[:6]) or not any(result[7:13]):
        result[6] += sum(result[:6])
        result[13] += sum(result[7:13])
        for i in [*range(6), *range(7, 13)]:
            result[i] = 0
    return result, turn if cell == own else 1 - turn


def _mancala(ctx: Context) -> Action:
    pits, seat = [int(c.value) for c in ctx.view.community], ctx.seat

    def search(p: list[int], turn: int, depth: int) -> float:
        side = range(0, 6) if turn == 0 else range(7, 13)
        choices = [i for i in side if p[i]]
        value = (p[6] - p[13]) * (1 if seat == 0 else -1)
        if not depth or not choices:
            return value * 20 + (sum(p[:6]) - sum(p[7:13])) * (0.1 if seat == 0 else -0.1)
        values = [search(*_sow(p, turn, i), depth - 1) for i in choices]
        return max(values) if turn == seat else min(values)

    return ctx.action(
        ctx.best(ctx.options, lambda o: search(*_sow(pits, seat, int(o.action.choice)), 3))
    )


def _boop_place(board: list[Any], player: str, kind: str, slot: int) -> list[Any]:
    result = board.copy()
    result[slot] = (player, kind)
    r, c = divmod(slot, 6)
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if not (dr or dc) or not (0 <= r + dr < 6 and 0 <= c + dc < 6):
                continue
            near = (r + dr) * 6 + c + dc
            piece = board[near]
            if piece is None or kind == "kitten" and piece[1] == "cat":
                continue
            rr, cc = r + dr * 2, c + dc * 2
            if not (0 <= rr < 6 and 0 <= cc < 6):
                result[near] = None
            elif board[rr * 6 + cc] is None:
                result[near], result[rr * 6 + cc] = None, piece
    return result


def _boop_lines(board: list[Any], player: str, adults: bool = False) -> int:
    return sum(
        all(
            board[(r + dr * n) * 6 + c + dc * n]
            and board[(r + dr * n) * 6 + c + dc * n][0] == player
            and (not adults or board[(r + dr * n) * 6 + c + dc * n][1] == "cat")
            for n in range(3)
        )
        for r in range(6)
        for c in range(6)
        for dr, dc in [(0, 1), (1, 0), (1, 1), (1, -1)]
        if 0 <= r + dr * 2 < 6 and 0 <= c + dc * 2 < 6
    )


def _boop_win(board: list[Any], player: str) -> bool:
    return bool(_boop_lines(board, player, True) or board.count((player, "cat")) == 8)


def _boop(ctx: Context) -> Action:
    board = [(c.suit, c.value) if c.value else None for c in ctx.view.community]
    player = ctx.player
    enemy = next(p.id for p in ctx.view.players if p.id != player)
    if ctx.view.phase == "graduating":
        return ctx.action(
            ctx.best(
                ctx.options,
                lambda o: (
                    sum(
                        piece is not None and piece[1] == "kitten"
                        for i in o.action.choice.split(",")
                        for piece in [board[int(i)]]
                    )
                    * 20
                    + (5 if o.action.type == "graduate" else 0)
                ),
            )
        )
    recent = ctx.memory.get("boop_recent", [])
    enemy_pool = ctx.detail.get("pools", {}).get(enemy, {})

    def value(o: Any) -> float:
        b = _boop_place(board, player, o.action.color, int(o.action.choice))
        if _boop_win(b, player):
            return 100000
        # A kitten cannot move an adult, so it can only preserve an adult line
        # already present. New adult threats need at least two existing adults.
        threat = _boop_win(b, enemy)
        if not threat and enemy_pool.get("cat", 0) > 0 and b.count((enemy, "cat")) >= 2:
            threat = any(
                _boop_win(_boop_place(b, enemy, "cat", i), enemy)
                for i, piece in enumerate(b)
                if piece is None
            )
        center = sum(
            5 - abs(i // 6 - 2.5) - abs(i % 6 - 2.5)
            for i, p in enumerate(b)
            if p and p[0] == player
        )
        identity = sha256(str(b).encode()).hexdigest()[:16]
        return (
            (-10000 if threat else 0)
            + _boop_lines(b, player) * 50
            + b.count((player, "cat")) * 8
            + center
            - recent.count(identity) * 40
        )

    option = ctx.best(ctx.options, value)
    after = _boop_place(board, player, option.action.color, int(option.action.choice))
    ctx.memory["boop_recent"] = [*recent[-9:], sha256(str(after).encode()).hexdigest()[:16]]
    return ctx.action(option)


def board_action(ctx: Context) -> Action | None:
    policy = {
        "four-in-a-row": _four,
        "reversi": _reversi,
        "checkers": _checkers,
        "mancala": _mancala,
        "boop": _boop,
    }.get(ctx.view.game_id)
    return policy(ctx) if policy else None
