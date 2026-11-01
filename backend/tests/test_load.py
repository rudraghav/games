import statistics
import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

from fastapi.testclient import TestClient
from room_helpers import require_isolated, seated_room

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
