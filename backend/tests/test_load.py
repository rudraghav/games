import statistics
import time
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from uuid import uuid4

from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room

from app.main import app


def test_fifty_concurrent_rooms_record_local_action_and_snapshot_latency():
    require_isolated()

    def exercise(_):
        with TestClient(app) as client:
            room, headers = seated_room(client, "blackjack", 1)
            option = room["game"]["actions"][0]
            action = {**option["action"], "amount": 10}
            before = time.perf_counter()
            response = client.post(
                f"/v1/rooms/{room['id']}/actions",
                headers=headers[0],
                json={
                    "match_id": room["match_id"],
                    "action_id": str(uuid4()),
                    "expected_version": room["match_version"],
                    "action": action,
                },
            )
            action_ms = (time.perf_counter() - before) * 1000
            assert response.status_code == 200, response.text
            before = time.perf_counter()
            snapshot = client.get(f"/v1/rooms/{room['id']}", headers=headers[0])
            snapshot_ms = (time.perf_counter() - before) * 1000
            assert snapshot.json()["match_version"] == response.json()["match_version"]
            return action_ms, snapshot_ms

    with ThreadPoolExecutor(max_workers=50) as pool:
        samples = list(pool.map(exercise, range(50)))
    for i, label in enumerate(("action", "snapshot fetch")):
        ordered = sorted(sample[i] for sample in samples)
        print(
            f"50-room local {label}: median={statistics.median(ordered):.0f}ms p95={ordered[47]:.0f}ms max={ordered[-1]:.0f}ms"
        )
    # Broadcast/network synchronization needs a separate deployed Supabase measurement.


def test_fifty_concurrent_bot_rooms_record_paced_drive_and_private_snapshot_latency():
    require_isolated()
    ready = Barrier(50)

    def exercise(_):
        with TestClient(app) as client:
            headers = player(client)
            created = client.post(
                "/v1/rooms",
                headers=headers,
                json={
                    "name": "Bot load host",
                    "room_name": "Bot load table",
                    "game_id": "six-nimmt",
                    "capacity": 2,
                    "bots": 1,
                },
            )
            assert created.status_code == 201, created.text
            room = created.json()
            path = f"/v1/rooms/{room['id']}"
            assert (
                client.put(path + "/ready", headers=headers, json={"ready": True}).status_code
                == 200
            )
            started = client.post(path + "/start", headers=headers)
            assert started.status_code == 200, started.text
            room = started.json()
            assert room["bot_pending"] and room["bot_due_at"]
            # Honor production pacing rather than patching timing or rate limits.
            time.sleep(max(0, room["bot_due_at"] - time.time()) + 0.02)
            # All rooms must be prepared/due before the concurrent drive burst.
            ready.wait(timeout=30)
            before = time.perf_counter()
            response = client.post(
                path + "/bots/drive",
                headers=headers,
                json={
                    "match_id": room["match_id"],
                    "expected_version": room["match_version"],
                },
            )
            drive_ms = (time.perf_counter() - before) * 1000
            assert response.status_code == 200, response.text
            committed = response.json()
            assert committed["match_version"] == room["match_version"] + 1
            assert not committed["bot_pending"]
            before = time.perf_counter()
            read = client.get(path, headers=headers)
            snapshot_ms = (time.perf_counter() - before) * 1000
            assert read.status_code == 200
            snapshot = read.json()
            assert snapshot["match_version"] == committed["match_version"]
            bot = next(m for m in snapshot["members"] if m["is_bot"])
            assert snapshot["game"]["detail"]["selected_players"] == [bot["id"]]
            assert snapshot["game"]["detail"]["own_selection"] is None
            assert snapshot["game"]["community"] == []
            assert '"bot_memory"' not in read.text and '"seed"' not in read.text
            assert client.post(path + "/leave", headers=headers).status_code == 200
            assert client.get(path, headers=headers).status_code == 404
            return drive_ms, snapshot_ms

    with ThreadPoolExecutor(max_workers=50) as pool:
        samples = list(pool.map(exercise, range(50)))
    for i, label in enumerate(("bot drive", "bot private snapshot fetch")):
        ordered = sorted(sample[i] for sample in samples)
        print(
            f"50-room local {label}: median={statistics.median(ordered):.0f}ms p95={ordered[47]:.0f}ms max={ordered[-1]:.0f}ms"
        )
    # This measures one private bot decision per room, not maximum strategic CPU
    # cost or deployed Supabase Broadcast/network synchronization latency.
