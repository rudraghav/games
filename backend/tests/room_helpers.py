import os

from fastapi.testclient import TestClient


def require_isolated():
    if os.environ.get("GAMES_ISOLATED_TEST") != "1":
        raise RuntimeError("Use scripts/isolated_backend.py for database tests.")


def player(client: TestClient):
    token = client.post("/v1/dev/session").json()["token"]
    return {"Authorization": f"Bearer {token}"}


def create(client, headers, game="uno", capacity=2):
    response = client.post(
        "/v1/rooms",
        headers=headers,
        json={
            "name": "Host",
            "game_id": game,
            "capacity": capacity,
            "room_name": "Verification table",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def seated_room(client, game="uno", capacity=2):
    headers = [player(client) for _ in range(capacity)]
    room = create(client, headers[0], game, capacity)
    for i, header in enumerate(headers[1:], 1):
        response = client.post(
            "/v1/rooms/join", headers=header, json={"invite": room["code"], "name": f"Player {i}"}
        )
        assert response.status_code == 200
    for header in headers:
        assert (
            client.put(
                f"/v1/rooms/{room['id']}/ready", headers=header, json={"ready": True}
            ).status_code
            == 200
        )
    response = client.post(f"/v1/rooms/{room['id']}/start", headers=headers[0])
    assert response.status_code == 200, response.text
    return response.json(), headers
