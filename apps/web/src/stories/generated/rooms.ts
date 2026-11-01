import type { components } from "@games/api-client/wire";
export const fixtures = [
  {
    "label": "Uno \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "d358b4e2-2b7d-5291-a62c-cab39edec323",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "uno",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "4b8c0cc6-5f5e-500a-8122-5503a1cb78e6",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3436868
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.343691
        }
      ],
      "messages": [],
      "game": {
        "game_id": "uno",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "green:8:1",
            "label": "Green 8",
            "color": "green",
            "subtitle": "UNO",
            "value": "8",
            "suit": ""
          },
          {
            "id": "green:2:0",
            "label": "Green 2",
            "color": "green",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "wild:wild:3",
            "label": "Wild Wild",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Wild",
            "suit": ""
          },
          {
            "id": "yellow:7:0",
            "label": "Yellow 7",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "7",
            "suit": ""
          },
          {
            "id": "yellow:reverse:0",
            "label": "Yellow Reverse",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "yellow:6:1",
            "label": "Yellow 6",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "red:reverse:1",
            "label": "Red Reverse",
            "color": "red",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "red:2:0",
          "label": "Red 2",
          "color": "red",
          "subtitle": "UNO",
          "value": "2",
          "suit": ""
        },
        "drawn": null,
        "draw_count": 93,
        "pot": 0,
        "message": "Match the top card.",
        "actions": [
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "green:2:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse",
            "action": {
              "type": "play",
              "card": "red:reverse:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Draw a card",
            "action": {
              "type": "draw",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "color": "red",
          "penalty": 0,
          "direction": 1
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Uno \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "c047c0c7-332a-555f-a272-1c49dd49c522",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "uno",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "4b8c0cc6-5f5e-500a-8122-5503a1cb78e6",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3441122
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3441138
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344115
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344116
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344117
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344118
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344118
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344119
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34412
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344121
        }
      ],
      "messages": [],
      "game": {
        "game_id": "uno",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 42,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d03315f3-275f-534f-915a-d668855c7de9",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "green:8:1",
            "label": "Green 8",
            "color": "green",
            "subtitle": "UNO",
            "value": "8",
            "suit": ""
          },
          {
            "id": "green:2:0",
            "label": "Green 2",
            "color": "green",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "wild:wild:3",
            "label": "Wild Wild",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Wild",
            "suit": ""
          },
          {
            "id": "yellow:7:0",
            "label": "Yellow 7",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "7",
            "suit": ""
          },
          {
            "id": "yellow:reverse:0",
            "label": "Yellow Reverse",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "yellow:6:1",
            "label": "Yellow 6",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "red:reverse:1",
            "label": "Red Reverse",
            "color": "red",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "wild:wild4:0",
            "label": "Wild +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "+4",
            "suit": ""
          },
          {
            "id": "red:6:1",
            "label": "Red 6",
            "color": "red",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "yellow:5:0",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": ""
          },
          {
            "id": "green:reverse:1",
            "label": "Green Reverse",
            "color": "green",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "red:8:1",
            "label": "Red 8",
            "color": "red",
            "subtitle": "UNO",
            "value": "8",
            "suit": ""
          },
          {
            "id": "blue:2:1",
            "label": "Blue 2",
            "color": "blue",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "yellow:2:1",
            "label": "Yellow 2",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "red:6:0",
            "label": "Red 6",
            "color": "red",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "green:draw2:1",
            "label": "Green +2",
            "color": "green",
            "subtitle": "UNO",
            "value": "+2",
            "suit": ""
          },
          {
            "id": "red:3:0",
            "label": "Red 3",
            "color": "red",
            "subtitle": "UNO",
            "value": "3",
            "suit": ""
          },
          {
            "id": "yellow:2:0",
            "label": "Yellow 2",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "blue:1:1",
            "label": "Blue 1",
            "color": "blue",
            "subtitle": "UNO",
            "value": "1",
            "suit": ""
          },
          {
            "id": "wild:wild4:3",
            "label": "Wild +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "+4",
            "suit": ""
          },
          {
            "id": "red:draw2:1",
            "label": "Red +2",
            "color": "red",
            "subtitle": "UNO",
            "value": "+2",
            "suit": ""
          },
          {
            "id": "yellow:8:1",
            "label": "Yellow 8",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "8",
            "suit": ""
          },
          {
            "id": "blue:1:0",
            "label": "Blue 1",
            "color": "blue",
            "subtitle": "UNO",
            "value": "1",
            "suit": ""
          },
          {
            "id": "green:3:1",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": ""
          },
          {
            "id": "green:6:1",
            "label": "Green 6",
            "color": "green",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "green:8:0",
            "label": "Green 8",
            "color": "green",
            "subtitle": "UNO",
            "value": "8",
            "suit": ""
          },
          {
            "id": "red:skip:1",
            "label": "Red Skip",
            "color": "red",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": ""
          },
          {
            "id": "blue:skip:0",
            "label": "Blue Skip",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": ""
          },
          {
            "id": "green:2:1",
            "label": "Green 2",
            "color": "green",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "yellow:skip:1",
            "label": "Yellow Skip",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": ""
          },
          {
            "id": "red:reverse:0",
            "label": "Red Reverse",
            "color": "red",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "green:5:0",
            "label": "Green 5",
            "color": "green",
            "subtitle": "UNO",
            "value": "5",
            "suit": ""
          },
          {
            "id": "blue:6:1",
            "label": "Blue 6",
            "color": "blue",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "green:3:0",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": ""
          },
          {
            "id": "green:0:0",
            "label": "Green 0",
            "color": "green",
            "subtitle": "UNO",
            "value": "0",
            "suit": ""
          },
          {
            "id": "red:5:0",
            "label": "Red 5",
            "color": "red",
            "subtitle": "UNO",
            "value": "5",
            "suit": ""
          },
          {
            "id": "blue:9:0",
            "label": "Blue 9",
            "color": "blue",
            "subtitle": "UNO",
            "value": "9",
            "suit": ""
          },
          {
            "id": "green:6:0",
            "label": "Green 6",
            "color": "green",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "red:3:1",
            "label": "Red 3",
            "color": "red",
            "subtitle": "UNO",
            "value": "3",
            "suit": ""
          },
          {
            "id": "green:7:0",
            "label": "Green 7",
            "color": "green",
            "subtitle": "UNO",
            "value": "7",
            "suit": ""
          },
          {
            "id": "yellow:skip:0",
            "label": "Yellow Skip",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": ""
          },
          {
            "id": "red:1:1",
            "label": "Red 1",
            "color": "red",
            "subtitle": "UNO",
            "value": "1",
            "suit": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "red:2:1",
          "label": "Red 2",
          "color": "red",
          "subtitle": "UNO",
          "value": "2",
          "suit": ""
        },
        "drawn": null,
        "draw_count": 2,
        "pot": 0,
        "message": "Match the top card.",
        "actions": [
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "green:2:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Wild \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:wild:3",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse",
            "action": {
              "type": "play",
              "card": "red:reverse:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:wild4:0",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:wild4:0",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:wild4:0",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:wild4:0",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 6",
            "action": {
              "type": "play",
              "card": "red:6:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 8",
            "action": {
              "type": "play",
              "card": "red:8:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "blue:2:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "yellow:2:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 6",
            "action": {
              "type": "play",
              "card": "red:6:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 3",
            "action": {
              "type": "play",
              "card": "red:3:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "yellow:2:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:wild4:3",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:wild4:3",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:wild4:3",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4 \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:wild4:3",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +2",
            "action": {
              "type": "play",
              "card": "red:draw2:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Skip",
            "action": {
              "type": "play",
              "card": "red:skip:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "green:2:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse",
            "action": {
              "type": "play",
              "card": "red:reverse:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 5",
            "action": {
              "type": "play",
              "card": "red:5:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 3",
            "action": {
              "type": "play",
              "card": "red:3:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 1",
            "action": {
              "type": "play",
              "card": "red:1:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Draw a card",
            "action": {
              "type": "draw",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "color": "red",
          "penalty": 0,
          "direction": 1
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Uno No Mercy \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "60807fb5-ab40-5698-a8a7-e575d3bdff14",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "uno-no-mercy",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "ee72fabb-b9e3-5717-ac45-611392110184",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3445609
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344563
        }
      ],
      "messages": [],
      "game": {
        "game_id": "uno-no-mercy",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "blue:discard_all:1",
            "label": "Blue Discard all",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Discard all",
            "suit": ""
          },
          {
            "id": "blue:2:0",
            "label": "Blue 2",
            "color": "blue",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "green:4:1",
            "label": "Green 4",
            "color": "green",
            "subtitle": "UNO",
            "value": "4",
            "suit": ""
          },
          {
            "id": "green:reverse:2",
            "label": "Green Reverse",
            "color": "green",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "green:3:0",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": ""
          },
          {
            "id": "yellow:5:0",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": ""
          },
          {
            "id": "wild:reverse4:2",
            "label": "Wild Reverse +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Reverse +4",
            "suit": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "green:6:1",
          "label": "Green 6",
          "color": "green",
          "subtitle": "UNO",
          "value": "6",
          "suit": ""
        },
        "drawn": null,
        "draw_count": 152,
        "pot": 0,
        "message": "Match the top card.",
        "actions": [
          {
            "label": "Play 4",
            "action": {
              "type": "play",
              "card": "green:4:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse",
            "action": {
              "type": "play",
              "card": "green:reverse:2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 3",
            "action": {
              "type": "play",
              "card": "green:3:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "color": "green",
          "penalty": 0,
          "direction": 1
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Uno No Mercy \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ad83cd67-497b-53b1-a233-bd5bd9474254",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "uno-no-mercy",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 6,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "ee72fabb-b9e3-5717-ac45-611392110184",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344722
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344723
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344724
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344725
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344726
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344726
        }
      ],
      "messages": [],
      "game": {
        "game_id": "uno-no-mercy",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 24,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "blue:discard_all:1",
            "label": "Blue Discard all",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Discard all",
            "suit": ""
          },
          {
            "id": "blue:2:0",
            "label": "Blue 2",
            "color": "blue",
            "subtitle": "UNO",
            "value": "2",
            "suit": ""
          },
          {
            "id": "green:4:1",
            "label": "Green 4",
            "color": "green",
            "subtitle": "UNO",
            "value": "4",
            "suit": ""
          },
          {
            "id": "green:reverse:2",
            "label": "Green Reverse",
            "color": "green",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "green:3:0",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": ""
          },
          {
            "id": "yellow:5:0",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": ""
          },
          {
            "id": "wild:reverse4:2",
            "label": "Wild Reverse +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Reverse +4",
            "suit": ""
          },
          {
            "id": "wild:wild10:6",
            "label": "Wild +10",
            "color": "wild",
            "subtitle": "UNO",
            "value": "+10",
            "suit": ""
          },
          {
            "id": "blue:6:0",
            "label": "Blue 6",
            "color": "blue",
            "subtitle": "UNO",
            "value": "6",
            "suit": ""
          },
          {
            "id": "green:draw4:0",
            "label": "Green +4",
            "color": "green",
            "subtitle": "UNO",
            "value": "+4",
            "suit": ""
          },
          {
            "id": "green:draw2:0",
            "label": "Green +2",
            "color": "green",
            "subtitle": "UNO",
            "value": "+2",
            "suit": ""
          },
          {
            "id": "yellow:5:1",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": ""
          },
          {
            "id": "blue:skip:2",
            "label": "Blue Skip",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": ""
          },
          {
            "id": "yellow:draw2:1",
            "label": "Yellow +2",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "+2",
            "suit": ""
          },
          {
            "id": "blue:reverse:1",
            "label": "Blue Reverse",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": ""
          },
          {
            "id": "wild:roulette:3",
            "label": "Wild Colour roulette",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Colour roulette",
            "suit": ""
          },
          {
            "id": "green:discard_all:1",
            "label": "Green Discard all",
            "color": "green",
            "subtitle": "UNO",
            "value": "Discard all",
            "suit": ""
          },
          {
            "id": "red:0:0",
            "label": "Red 0",
            "color": "red",
            "subtitle": "UNO",
            "value": "0",
            "suit": ""
          },
          {
            "id": "blue:4:1",
            "label": "Blue 4",
            "color": "blue",
            "subtitle": "UNO",
            "value": "4",
            "suit": ""
          },
          {
            "id": "yellow:8:1",
            "label": "Yellow 8",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "8",
            "suit": ""
          },
          {
            "id": "red:discard_all:0",
            "label": "Red Discard all",
            "color": "red",
            "subtitle": "UNO",
            "value": "Discard all",
            "suit": ""
          },
          {
            "id": "red:7:0",
            "label": "Red 7",
            "color": "red",
            "subtitle": "UNO",
            "value": "7",
            "suit": ""
          },
          {
            "id": "wild:roulette:0",
            "label": "Wild Colour roulette",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Colour roulette",
            "suit": ""
          },
          {
            "id": "red:draw2:1",
            "label": "Red +2",
            "color": "red",
            "subtitle": "UNO",
            "value": "+2",
            "suit": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "green:2:1",
          "label": "Green 2",
          "color": "green",
          "subtitle": "UNO",
          "value": "2",
          "suit": ""
        },
        "drawn": null,
        "draw_count": 108,
        "pot": 0,
        "message": "Match the top card.",
        "actions": [
          {
            "label": "Play 2",
            "action": {
              "type": "play",
              "card": "blue:2:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 4",
            "action": {
              "type": "play",
              "card": "green:4:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse",
            "action": {
              "type": "play",
              "card": "green:reverse:2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play 3",
            "action": {
              "type": "play",
              "card": "green:3:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Reverse +4 \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:reverse4:2",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +10 \u00b7 red",
            "action": {
              "type": "play",
              "card": "wild:wild10:6",
              "target": "",
              "color": "red",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +10 \u00b7 yellow",
            "action": {
              "type": "play",
              "card": "wild:wild10:6",
              "target": "",
              "color": "yellow",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +10 \u00b7 green",
            "action": {
              "type": "play",
              "card": "wild:wild10:6",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +10 \u00b7 blue",
            "action": {
              "type": "play",
              "card": "wild:wild10:6",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +4",
            "action": {
              "type": "play",
              "card": "green:draw4:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play +2",
            "action": {
              "type": "play",
              "card": "green:draw2:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Colour roulette",
            "action": {
              "type": "play",
              "card": "wild:roulette:3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Discard all",
            "action": {
              "type": "play",
              "card": "green:discard_all:1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play Colour roulette",
            "action": {
              "type": "play",
              "card": "wild:roulette:0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "color": "green",
          "penalty": 0,
          "direction": 1
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Monopoly Deal \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "1494a202-4e30-503f-a88c-d9665afc3696",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "deal",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "2b568d09-a16a-5cba-90b5-02a0072d55d6",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.344915
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3449159
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "d066",
            "label": "Rent",
            "color": "green",
            "subtitle": "Rent",
            "value": "1M",
            "suit": "action"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d103",
            "label": "Hotel",
            "color": "neutral",
            "subtitle": "Hotel",
            "value": "4M",
            "suit": "action"
          },
          {
            "id": "d038",
            "label": "Green",
            "color": "green",
            "subtitle": "Green",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d046",
            "label": "Utility",
            "color": "utility",
            "subtitle": "Utility",
            "value": "2M",
            "suit": "property"
          },
          {
            "id": "d069",
            "label": "Rent",
            "color": "brown",
            "subtitle": "Rent",
            "value": "3M",
            "suit": "action"
          },
          {
            "id": "d084",
            "label": "Just say no",
            "color": "neutral",
            "subtitle": "Just say no",
            "value": "4M",
            "suit": "action"
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 94,
        "pot": 0,
        "message": "Three sets. One winner.",
        "actions": [
          {
            "label": "End turn",
            "action": {
              "type": "end_turn",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 1M",
            "action": {
              "type": "bank",
              "card": "d066",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 green",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 blue",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 4M",
            "action": {
              "type": "bank",
              "card": "d103",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 green",
            "action": {
              "type": "property",
              "card": "d038",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 utility",
            "action": {
              "type": "property",
              "card": "d046",
              "target": "",
              "color": "utility",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 3M",
            "action": {
              "type": "bank",
              "card": "d069",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 4M",
            "action": {
              "type": "bank",
              "card": "d084",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "moves": 3,
          "debts": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": []
          },
          "pending": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Monopoly Deal \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "4e82f868-2058-5c94-809c-286f39a0806e",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "deal",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 5,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "2b568d09-a16a-5cba-90b5-02a0072d55d6",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345046
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345047
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345048
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3450491
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34505
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "d066",
            "label": "Rent",
            "color": "green",
            "subtitle": "Rent",
            "value": "1M",
            "suit": "action"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d103",
            "label": "Hotel",
            "color": "neutral",
            "subtitle": "Hotel",
            "value": "4M",
            "suit": "action"
          },
          {
            "id": "d038",
            "label": "Green",
            "color": "green",
            "subtitle": "Green",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d046",
            "label": "Utility",
            "color": "utility",
            "subtitle": "Utility",
            "value": "2M",
            "suit": "property"
          },
          {
            "id": "d007",
            "label": "2M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "2M",
            "suit": ""
          },
          {
            "id": "d082",
            "label": "Just say no",
            "color": "neutral",
            "subtitle": "Just say no",
            "value": "4M",
            "suit": "action"
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 79,
        "pot": 0,
        "message": "Three sets. One winner.",
        "actions": [
          {
            "label": "End turn",
            "action": {
              "type": "end_turn",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 1M",
            "action": {
              "type": "bank",
              "card": "d066",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 green",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 blue",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 4M",
            "action": {
              "type": "bank",
              "card": "d103",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 green",
            "action": {
              "type": "property",
              "card": "d038",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 utility",
            "action": {
              "type": "property",
              "card": "d046",
              "target": "",
              "color": "utility",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 2M",
            "action": {
              "type": "bank",
              "card": "d007",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 4M",
            "action": {
              "type": "bank",
              "card": "d082",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "moves": 3,
          "debts": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [],
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": [],
            "19285837-cef0-568b-9a40-febfd6a8cb39": [],
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": []
          },
          "pending": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Monopoly Deal No Mercy \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "f7306bb2-cf31-5898-8de8-921fb2dd35d7",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "deal-no-mercy",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "bcca6545-c3e2-513e-813c-685815372869",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3451679
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3451688
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal-no-mercy",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "d066",
            "label": "Double rent",
            "color": "rail",
            "subtitle": "Double rent",
            "value": "1M",
            "suit": "action"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d103",
            "label": "Super sly deal",
            "color": "neutral",
            "subtitle": "Super sly deal",
            "value": "3M",
            "suit": "action"
          },
          {
            "id": "d038",
            "label": "Blue",
            "color": "blue",
            "subtitle": "Blue",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d046",
            "label": "Wild property",
            "color": "brown",
            "subtitle": "Wild property",
            "value": "1M",
            "suit": "property"
          },
          {
            "id": "d069",
            "label": "Rent",
            "color": "brown",
            "subtitle": "Rent",
            "value": "3M",
            "suit": "action"
          },
          {
            "id": "d084",
            "label": "Heist",
            "color": "neutral",
            "subtitle": "Heist",
            "value": "4M",
            "suit": "action"
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 103,
        "pot": 0,
        "message": "Three sets. One winner.",
        "actions": [
          {
            "label": "End turn",
            "action": {
              "type": "end_turn",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 1M",
            "action": {
              "type": "bank",
              "card": "d066",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 green",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 rail",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "rail",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 3M",
            "action": {
              "type": "bank",
              "card": "d103",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 blue",
            "action": {
              "type": "property",
              "card": "d038",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 brown",
            "action": {
              "type": "property",
              "card": "d046",
              "target": "",
              "color": "brown",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 sky",
            "action": {
              "type": "property",
              "card": "d046",
              "target": "",
              "color": "sky",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 3M",
            "action": {
              "type": "bank",
              "card": "d069",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 4M",
            "action": {
              "type": "bank",
              "card": "d084",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "moves": 3,
          "debts": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": []
          },
          "pending": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Monopoly Deal No Mercy \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "af847e32-a55f-55f3-9eb2-2071c70ee851",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "deal-no-mercy",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 5,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "bcca6545-c3e2-513e-813c-685815372869",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345289
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345291
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345292
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345292
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345293
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal-no-mercy",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 7,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 5,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "d066",
            "label": "Double rent",
            "color": "rail",
            "subtitle": "Double rent",
            "value": "1M",
            "suit": "action"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d103",
            "label": "Super sly deal",
            "color": "neutral",
            "subtitle": "Super sly deal",
            "value": "3M",
            "suit": "action"
          },
          {
            "id": "d038",
            "label": "Blue",
            "color": "blue",
            "subtitle": "Blue",
            "value": "4M",
            "suit": "property"
          },
          {
            "id": "d046",
            "label": "Wild property",
            "color": "brown",
            "subtitle": "Wild property",
            "value": "1M",
            "suit": "property"
          },
          {
            "id": "d017",
            "label": "15M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "15M",
            "suit": ""
          },
          {
            "id": "d070",
            "label": "Double rent",
            "color": "brown",
            "subtitle": "Double rent",
            "value": "3M",
            "suit": "action"
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 88,
        "pot": 0,
        "message": "Three sets. One winner.",
        "actions": [
          {
            "label": "End turn",
            "action": {
              "type": "end_turn",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 1M",
            "action": {
              "type": "bank",
              "card": "d066",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 green",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "green",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 rail",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "rail",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 3M",
            "action": {
              "type": "bank",
              "card": "d103",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 blue",
            "action": {
              "type": "property",
              "card": "d038",
              "target": "",
              "color": "blue",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 brown",
            "action": {
              "type": "property",
              "card": "d046",
              "target": "",
              "color": "brown",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Property \u00b7 sky",
            "action": {
              "type": "property",
              "card": "d046",
              "target": "",
              "color": "sky",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 15M",
            "action": {
              "type": "bank",
              "card": "d017",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Bank 3M",
            "action": {
              "type": "bank",
              "card": "d070",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "moves": 3,
          "debts": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [],
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": [],
            "19285837-cef0-568b-9a40-febfd6a8cb39": [],
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": []
          },
          "pending": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Texas Hold\u2019em \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "f44d4612-1cdd-5e46-b304-db4c6491f7c6",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "holdem",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "493126f1-f4c4-56d8-aa27-b110ad781ad3",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345414
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3454158
        }
      ],
      "messages": [],
      "game": {
        "game_id": "holdem",
        "phase": "preflop",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 2,
            "score": -1,
            "chips": 199,
            "bet": 1,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 2,
            "score": -2,
            "chips": 198,
            "bet": 2,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "9D:0",
            "label": "9 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "9",
            "suit": "\u2666"
          },
          {
            "id": "2D:0",
            "label": "2 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "2",
            "suit": "\u2666"
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 3,
        "message": "Blinds are in. Your move.",
        "actions": [
          {
            "label": "Fold",
            "action": {
              "type": "fold",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Call 1",
            "action": {
              "type": "call",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Raise to",
            "action": {
              "type": "raise",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "amount",
            "minimum": 4,
            "maximum": 200,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "All in \u00b7 199",
            "action": {
              "type": "all_in",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "button": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "current_bet": 2,
          "pots": [],
          "refunds": {}
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Texas Hold\u2019em \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "de7c918c-a7d7-504c-8add-6e7c9f05e25b",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "holdem",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 9,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "493126f1-f4c4-56d8-aa27-b110ad781ad3",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345518
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345519
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34552
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345521
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345522
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3455229
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345524
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345525
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345525
        }
      ],
      "messages": [],
      "game": {
        "game_id": "holdem",
        "phase": "preflop",
        "current_player": "19285837-cef0-568b-9a40-febfd6a8cb39",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 2,
            "score": -1,
            "chips": 199,
            "bet": 1,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 2,
            "score": -2,
            "chips": 198,
            "bet": 2,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d03315f3-275f-534f-915a-d668855c7de9",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
            "count": 2,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "9D:0",
            "label": "9 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "9",
            "suit": "\u2666"
          },
          {
            "id": "2D:0",
            "label": "2 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "2",
            "suit": "\u2666"
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 3,
        "message": "Blinds are in. Your move.",
        "actions": [],
        "winners": [],
        "detail": {
          "button": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "current_bet": 2,
          "pots": [],
          "refunds": {}
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Rummy \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "f342aab8-f143-5522-b4b7-cf1ef55f489a",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "rummy",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "057d8309-3cd9-5da0-8af0-efd2a28329fe",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345612
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3456142
        }
      ],
      "messages": [],
      "game": {
        "game_id": "rummy",
        "phase": "draw",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "3S:1",
            "label": "3 \u2660",
            "color": "ink",
            "subtitle": "",
            "value": "3",
            "suit": "\u2660"
          },
          {
            "id": "AC:1",
            "label": "A \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "A",
            "suit": "\u2663"
          },
          {
            "id": "AD:0",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666"
          },
          {
            "id": "9C:0",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663"
          },
          {
            "id": "KD:0",
            "label": "K \u2666",
            "color": "red",
            "subtitle": "",
            "value": "K",
            "suit": "\u2666"
          },
          {
            "id": "JH:0",
            "label": "J \u2665",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2665"
          },
          {
            "id": "9C:1",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663"
          },
          {
            "id": "AD:1",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666"
          },
          {
            "id": "8C:1",
            "label": "8 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "8",
            "suit": "\u2663"
          },
          {
            "id": "6H:1",
            "label": "6 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "6",
            "suit": "\u2665"
          },
          {
            "id": "8D:1",
            "label": "8 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "8",
            "suit": "\u2666"
          },
          {
            "id": "JD:0",
            "label": "J \u2666",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2666"
          },
          {
            "id": "3H:0",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665"
          }
        ],
        "community": [
          {
            "id": "3H:1",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665"
          }
        ],
        "discard": {
          "id": "AH:0",
          "label": "A \u2665",
          "color": "red",
          "subtitle": "",
          "value": "A",
          "suit": "\u2665"
        },
        "drawn": null,
        "draw_count": 78,
        "pot": 0,
        "message": "Draw, group your cards, then discard.",
        "actions": [
          {
            "label": "Draw from stock",
            "action": {
              "type": "draw_stock",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop for 20",
            "action": {
              "type": "fold",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take discard",
            "action": {
              "type": "draw_discard",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "wild_rank": "3"
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Rummy \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ac7b73f8-b2f7-5caf-b922-daa0550325ab",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "rummy",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 6,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "057d8309-3cd9-5da0-8af0-efd2a28329fe",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3457239
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3457248
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345726
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345727
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345728
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345729
        }
      ],
      "messages": [],
      "game": {
        "game_id": "rummy",
        "phase": "draw",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 13,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "3S:1",
            "label": "3 \u2660",
            "color": "ink",
            "subtitle": "",
            "value": "3",
            "suit": "\u2660"
          },
          {
            "id": "AC:1",
            "label": "A \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "A",
            "suit": "\u2663"
          },
          {
            "id": "AD:0",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666"
          },
          {
            "id": "9C:0",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663"
          },
          {
            "id": "KD:0",
            "label": "K \u2666",
            "color": "red",
            "subtitle": "",
            "value": "K",
            "suit": "\u2666"
          },
          {
            "id": "JH:0",
            "label": "J \u2665",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2665"
          },
          {
            "id": "9C:1",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663"
          },
          {
            "id": "AD:1",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666"
          },
          {
            "id": "8C:1",
            "label": "8 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "8",
            "suit": "\u2663"
          },
          {
            "id": "6H:1",
            "label": "6 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "6",
            "suit": "\u2665"
          },
          {
            "id": "8D:1",
            "label": "8 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "8",
            "suit": "\u2666"
          },
          {
            "id": "JD:0",
            "label": "J \u2666",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2666"
          },
          {
            "id": "3H:0",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665"
          }
        ],
        "community": [
          {
            "id": "3H:1",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665"
          }
        ],
        "discard": {
          "id": "7S:0",
          "label": "7 \u2660",
          "color": "ink",
          "subtitle": "",
          "value": "7",
          "suit": "\u2660"
        },
        "drawn": null,
        "draw_count": 26,
        "pot": 0,
        "message": "Draw, group your cards, then discard.",
        "actions": [
          {
            "label": "Draw from stock",
            "action": {
              "type": "draw_stock",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop for 20",
            "action": {
              "type": "fold",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take discard",
            "action": {
              "type": "draw_discard",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "wild_rank": "3"
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Teen Patti \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "59c97823-5b75-5358-890b-cf155b65efea",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "teen-patti",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "05e23966-2735-5ac1-bc6d-4556fed840ea",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345824
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345825
        }
      ],
      "messages": [],
      "game": {
        "game_id": "teen-patti",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 2,
        "message": "The boot is in. Play blind or see your cards.",
        "actions": [
          {
            "label": "Pack / fold",
            "action": {
              "type": "fold",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "See my cards",
            "action": {
              "type": "peek",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play chips",
            "action": {
              "type": "bet",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "amount",
            "minimum": 1,
            "maximum": 2,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Show \u00b7 1",
            "action": {
              "type": "show",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "stake": 1,
          "blind": true
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Teen Patti \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ea9d4fcf-c520-52c6-ba44-621f6e69c8db",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "teen-patti",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 6,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "05e23966-2735-5ac1-bc6d-4556fed840ea",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3459032
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345904
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3459048
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3459048
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345906
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.345907
        }
      ],
      "messages": [],
      "game": {
        "game_id": "teen-patti",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 3,
            "score": -1,
            "chips": 199,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 6,
        "message": "The boot is in. Play blind or see your cards.",
        "actions": [
          {
            "label": "Pack / fold",
            "action": {
              "type": "fold",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "See my cards",
            "action": {
              "type": "peek",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Play chips",
            "action": {
              "type": "bet",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "amount",
            "minimum": 1,
            "maximum": 2,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "stake": 1,
          "blind": true
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Blackjack \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ce007523-aa37-5e39-86d9-604485ad4c89",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "blackjack",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 1,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "ea37fc10-359e-5b0c-bfa6-0ab593f98bed",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3460329
        }
      ],
      "messages": [],
      "game": {
        "game_id": "blackjack",
        "phase": "betting",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 312,
        "pot": 0,
        "message": "Place your free-chip wager.",
        "actions": [
          {
            "label": "Place bet",
            "action": {
              "type": "bet",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "amount",
            "minimum": 2,
            "maximum": 200,
            "step": 2,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "dealer_hidden": false,
          "hand_index": 0,
          "hands": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Blackjack \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "e7fdcb26-b2ce-53fa-a942-40490d27a762",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "blackjack",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 7,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "ea37fc10-359e-5b0c-bfa6-0ab593f98bed",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346164
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346165
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3461661
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346167
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346168
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346168
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346169
        }
      ],
      "messages": [],
      "game": {
        "game_id": "blackjack",
        "phase": "betting",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d03315f3-275f-534f-915a-d668855c7de9",
            "count": 0,
            "score": 0,
            "chips": 200,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 312,
        "pot": 0,
        "message": "Place your free-chip wager.",
        "actions": [
          {
            "label": "Place bet",
            "action": {
              "type": "bet",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "amount",
            "minimum": 2,
            "maximum": 200,
            "step": 2,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "dealer_hidden": false,
          "hand_index": 0,
          "hands": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Skyjo \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "3e391350-8067-5257-b0b0-7e1c4782f1ec",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "skyjo",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "968a968d-cc23-56e6-b1f2-b08d76eeeabe",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346269
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3462698
        }
      ],
      "messages": [],
      "game": {
        "game_id": "skyjo",
        "phase": "opening",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": {
          "id": "sky:4:9",
          "label": "4",
          "color": "green",
          "subtitle": "SKYJO",
          "value": "4",
          "suit": ""
        },
        "drawn": null,
        "draw_count": 125,
        "pot": 0,
        "message": "Turn over two cards to begin.",
        "actions": [
          {
            "label": "Reveal card 1",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 2",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 1,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 3",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 2,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 4",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 3,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 5",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 4,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 6",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 5,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 7",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 6,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 8",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 7,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 9",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 8,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 10",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 9,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 11",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 10,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 12",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 11,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "round": 1,
          "finisher": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Skyjo \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "d7728feb-e348-5aca-b28c-1e27112798fc",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "skyjo",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 8,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "968a968d-cc23-56e6-b1f2-b08d76eeeabe",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346414
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346415
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3464162
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346417
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346418
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3464189
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34642
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346422
        }
      ],
      "messages": [],
      "game": {
        "game_id": "skyjo",
        "phase": "opening",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d03315f3-275f-534f-915a-d668855c7de9",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null
            ],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": {
          "id": "sky:6:4",
          "label": "6",
          "color": "yellow",
          "subtitle": "SKYJO",
          "value": "6",
          "suit": ""
        },
        "drawn": null,
        "draw_count": 53,
        "pot": 0,
        "message": "Turn over two cards to begin.",
        "actions": [
          {
            "label": "Reveal card 1",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 2",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 1,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 3",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 2,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 4",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 3,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 5",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 4,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 6",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 5,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 7",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 6,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 8",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 7,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 9",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 8,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 10",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 9,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 11",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 10,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal card 12",
            "action": {
              "type": "reveal",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 11,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "round": 1,
          "finisher": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Pop Tarot \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "17426395-87ba-579a-847c-e586c9ee1926",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "tarot",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 1,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "1f07ee8d-1430-5889-902d-5cc895168fbb",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3465421
        }
      ],
      "messages": [],
      "game": {
        "game_id": "tarot",
        "phase": "choosing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Take a breath. Choose your first card.",
        "actions": [
          {
            "label": "Choose card 1",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 2",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 3",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 4",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 5",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "4",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 6",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "5",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 7",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "6",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 8",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "7",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 9",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "8",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 10",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "9",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 11",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "10",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 12",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "11",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 13",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "12",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 14",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "13",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 15",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "14",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 16",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "15",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 17",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "16",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 18",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "17",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 19",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "18",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 20",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "19",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 21",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "20",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 22",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "21",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 23",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "22",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 24",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "23",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 25",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "24",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 26",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "25",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 27",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "26",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 28",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "27",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 29",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "28",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 30",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "29",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 31",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "30",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 32",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "31",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 33",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "32",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 34",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "33",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 35",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "34",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 36",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "35",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 37",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "36",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 38",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 39",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "38",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 40",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "39",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 41",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "40",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 42",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "41",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 43",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "42",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 44",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "43",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 45",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 46",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "45",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 47",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "46",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 48",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "47",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 49",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "48",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 50",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "49",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 51",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "50",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 52",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "51",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 53",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "52",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 54",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "53",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 55",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "54",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 56",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "55",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 57",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "56",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 58",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "57",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 59",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "58",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 60",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "59",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 61",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "60",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 62",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "61",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 63",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "62",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 64",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "63",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 65",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "64",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 66",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "65",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 67",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "66",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 68",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "67",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 69",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "68",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 70",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "69",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 71",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "70",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 72",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "71",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 73",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "72",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 74",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "73",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 75",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "74",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 76",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "75",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 77",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "76",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 78",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "77",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "pickedPositions": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Pop Tarot \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "9f60e0ef-8b49-5bf3-877c-fe6321578a9f",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "tarot",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 1,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "1f07ee8d-1430-5889-902d-5cc895168fbb",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.346912
        }
      ],
      "messages": [],
      "game": {
        "game_id": "tarot",
        "phase": "choosing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Take a breath. Choose your first card.",
        "actions": [
          {
            "label": "Choose card 1",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 2",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 3",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 4",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 5",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "4",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 6",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "5",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 7",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "6",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 8",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "7",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 9",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "8",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 10",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "9",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 11",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "10",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 12",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "11",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 13",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "12",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 14",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "13",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 15",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "14",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 16",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "15",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 17",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "16",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 18",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "17",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 19",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "18",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 20",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "19",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 21",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "20",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 22",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "21",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 23",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "22",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 24",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "23",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 25",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "24",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 26",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "25",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 27",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "26",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 28",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "27",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 29",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "28",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 30",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "29",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 31",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "30",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 32",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "31",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 33",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "32",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 34",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "33",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 35",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "34",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 36",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "35",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 37",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "36",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 38",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 39",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "38",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 40",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "39",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 41",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "40",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 42",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "41",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 43",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "42",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 44",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "43",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 45",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 46",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "45",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 47",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "46",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 48",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "47",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 49",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "48",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 50",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "49",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 51",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "50",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 52",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "51",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 53",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "52",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 54",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "53",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 55",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "54",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 56",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "55",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 57",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "56",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 58",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "57",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 59",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "58",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 60",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "59",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 61",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "60",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 62",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "61",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 63",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "62",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 64",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "63",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 65",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "64",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 66",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "65",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 67",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "66",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 68",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "67",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 69",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "68",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 70",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "69",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 71",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "70",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 72",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "71",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 73",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "72",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 74",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "73",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 75",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "74",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 76",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "75",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 77",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "76",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose card 78",
            "action": {
              "type": "pick",
              "card": "",
              "target": "",
              "color": "",
              "choice": "77",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "pickedPositions": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Four in a Row \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "c2130cd0-adef-50cd-97ff-c161913655cb",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "four-in-a-row",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "6df25bb1-b852-57bb-b90d-cf73a72883de",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347182
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347183
        }
      ],
      "messages": [],
      "game": {
        "game_id": "four-in-a-row",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Row 1, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "14",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "15",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "21",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "22",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "23",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "28",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "29",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "30",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "31",
            "label": "Row 5, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "35",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "36",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "37",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "38",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "39",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Drop your first disc into a column.",
        "actions": [
          {
            "label": "Drop in column 1",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 2",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 3",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 4",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 5",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "4",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 6",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "5",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 7",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "6",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "rows": 6,
          "columns": 7,
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Four in a Row \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "a27cd928-bdaa-5546-80f2-cb7405f8e9b0",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "four-in-a-row",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "6df25bb1-b852-57bb-b90d-cf73a72883de",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347297
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3472981
        }
      ],
      "messages": [],
      "game": {
        "game_id": "four-in-a-row",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Row 1, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "14",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "15",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "21",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "22",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "23",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "28",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "29",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "30",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "31",
            "label": "Row 5, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "35",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "36",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "37",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "38",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "39",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Drop your first disc into a column.",
        "actions": [
          {
            "label": "Drop in column 1",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 2",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 3",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 4",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 5",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "4",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 6",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "5",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Drop in column 7",
            "action": {
              "type": "drop",
              "card": "",
              "target": "",
              "color": "",
              "choice": "6",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "rows": 6,
          "columns": 7,
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Reversi \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "a258629b-0631-5d10-84d7-153e81498e25",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "reversi",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "495b5ba5-1751-5c1e-934d-1449a3f96657",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3474078
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347409
        }
      ],
      "messages": [],
      "game": {
        "game_id": "reversi",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 2,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 2,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Row 1, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Row 1, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "14",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "15",
            "label": "Row 2, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "21",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "22",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "23",
            "label": "Row 3, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 4",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "28",
            "label": "Row 4, column 5",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "29",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "30",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "31",
            "label": "Row 4, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "35",
            "label": "Row 5, column 4",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "36",
            "label": "Row 5, column 5",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "37",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "38",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "39",
            "label": "Row 5, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "42",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "43",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "44",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "45",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "46",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "47",
            "label": "Row 6, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "48",
            "label": "Row 7, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "49",
            "label": "Row 7, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "50",
            "label": "Row 7, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "51",
            "label": "Row 7, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "52",
            "label": "Row 7, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "53",
            "label": "Row 7, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "54",
            "label": "Row 7, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "55",
            "label": "Row 7, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "56",
            "label": "Row 8, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "57",
            "label": "Row 8, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "58",
            "label": "Row 8, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "59",
            "label": "Row 8, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "60",
            "label": "Row 8, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "61",
            "label": "Row 8, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "62",
            "label": "Row 8, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "63",
            "label": "Row 8, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Black begins. Choose a highlighted square.",
        "actions": [
          {
            "label": "Place at D3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "19",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place at C4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "26",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place at F5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place at E6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "rows": 8,
          "columns": 8,
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Reversi \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "1827071d-9ccf-59fb-91cd-d2d4f498c977",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "reversi",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "495b5ba5-1751-5c1e-934d-1449a3f96657",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3476071
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347608
        }
      ],
      "messages": [],
      "game": {
        "game_id": "reversi",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 2,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 2,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Row 1, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Row 1, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "14",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "15",
            "label": "Row 2, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "21",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "22",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "23",
            "label": "Row 3, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 4",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "28",
            "label": "Row 4, column 5",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "29",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "30",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "31",
            "label": "Row 4, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "35",
            "label": "Row 5, column 4",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "36",
            "label": "Row 5, column 5",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "37",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "38",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "39",
            "label": "Row 5, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "42",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "43",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "44",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "45",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "46",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "47",
            "label": "Row 6, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "48",
            "label": "Row 7, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "49",
            "label": "Row 7, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "50",
            "label": "Row 7, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "51",
            "label": "Row 7, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "52",
            "label": "Row 7, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "53",
            "label": "Row 7, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "54",
            "label": "Row 7, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "55",
            "label": "Row 7, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "56",
            "label": "Row 8, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "57",
            "label": "Row 8, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "58",
            "label": "Row 8, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "59",
            "label": "Row 8, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "60",
            "label": "Row 8, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "61",
            "label": "Row 8, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "62",
            "label": "Row 8, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "63",
            "label": "Row 8, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Black begins. Choose a highlighted square.",
        "actions": [
          {
            "label": "Place at D3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "19",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place at C4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "26",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place at F5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place at E6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "rows": 8,
          "columns": 8,
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Word Agents \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ecc7b5eb-b4b2-5aa4-9d11-6d584d0e1848",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "word-agents",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "fc129b4c-6f25-5687-ba41-174ecba758fa",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347834
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3478348
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347836
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347837
        }
      ],
      "messages": [],
      "game": {
        "game_id": "word-agents",
        "phase": "clue",
        "current_player": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Island",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Island",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Puzzle",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Puzzle",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Cave",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Cave",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Tea",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tea",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Sky",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sky",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Bone",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Bone",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Honey",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Honey",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Magnet",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Magnet",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Branch",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Branch",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Pilot",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Pilot",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Paint",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Paint",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Winter",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Winter",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Sand",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sand",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Coast",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Coast",
            "suit": ""
          },
          {
            "id": "14",
            "label": "Stone",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Stone",
            "suit": ""
          },
          {
            "id": "15",
            "label": "Wheel",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Wheel",
            "suit": ""
          },
          {
            "id": "16",
            "label": "Wave",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Wave",
            "suit": ""
          },
          {
            "id": "17",
            "label": "Jazz",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Jazz",
            "suit": ""
          },
          {
            "id": "18",
            "label": "Atlas",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Atlas",
            "suit": ""
          },
          {
            "id": "19",
            "label": "Moon",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Moon",
            "suit": ""
          },
          {
            "id": "20",
            "label": "Lantern",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Lantern",
            "suit": ""
          },
          {
            "id": "21",
            "label": "Rocket",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Rocket",
            "suit": ""
          },
          {
            "id": "22",
            "label": "Bicycle",
            "color": "assassin",
            "subtitle": "hidden",
            "value": "Bicycle",
            "suit": ""
          },
          {
            "id": "23",
            "label": "Tomato",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tomato",
            "suit": ""
          },
          {
            "id": "24",
            "label": "Kite",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Kite",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Spymaster, find a connection and give your team a clue.",
        "actions": [],
        "winners": [],
        "detail": {
          "active_team": 1,
          "clue": "",
          "clue_count": 0,
          "guesses_left": 0,
          "role": "spymaster",
          "teams": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 1,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": 0,
            "19285837-cef0-568b-9a40-febfd6a8cb39": 1
          },
          "spymasters": [
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165"
          ],
          "remaining": [
            8,
            9
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Word Agents \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "424e3ee3-aa83-578d-bf11-f8eb46ecda00",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "word-agents",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "fc129b4c-6f25-5687-ba41-174ecba758fa",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347956
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347957
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347958
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.347959
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34796
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3479612
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3479621
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3479629
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3479638
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3479638
        }
      ],
      "messages": [],
      "game": {
        "game_id": "word-agents",
        "phase": "clue",
        "current_player": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d03315f3-275f-534f-915a-d668855c7de9",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Island",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Island",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Puzzle",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Puzzle",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Cave",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Cave",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Tea",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tea",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Sky",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sky",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Bone",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Bone",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Honey",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Honey",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Magnet",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Magnet",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Branch",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Branch",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Pilot",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Pilot",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Paint",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Paint",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Winter",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Winter",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Sand",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sand",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Coast",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Coast",
            "suit": ""
          },
          {
            "id": "14",
            "label": "Stone",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Stone",
            "suit": ""
          },
          {
            "id": "15",
            "label": "Wheel",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Wheel",
            "suit": ""
          },
          {
            "id": "16",
            "label": "Wave",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Wave",
            "suit": ""
          },
          {
            "id": "17",
            "label": "Jazz",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Jazz",
            "suit": ""
          },
          {
            "id": "18",
            "label": "Atlas",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Atlas",
            "suit": ""
          },
          {
            "id": "19",
            "label": "Moon",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Moon",
            "suit": ""
          },
          {
            "id": "20",
            "label": "Lantern",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Lantern",
            "suit": ""
          },
          {
            "id": "21",
            "label": "Rocket",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Rocket",
            "suit": ""
          },
          {
            "id": "22",
            "label": "Bicycle",
            "color": "assassin",
            "subtitle": "hidden",
            "value": "Bicycle",
            "suit": ""
          },
          {
            "id": "23",
            "label": "Tomato",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tomato",
            "suit": ""
          },
          {
            "id": "24",
            "label": "Kite",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Kite",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Spymaster, find a connection and give your team a clue.",
        "actions": [],
        "winners": [],
        "detail": {
          "active_team": 1,
          "clue": "",
          "clue_count": 0,
          "guesses_left": 0,
          "role": "spymaster",
          "teams": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 1,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": 0,
            "19285837-cef0-568b-9a40-febfd6a8cb39": 1,
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": 0,
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46": 1,
            "d03315f3-275f-534f-915a-d668855c7de9": 0,
            "b99cae13-1a84-5dfe-95f8-3ec6f935de22": 1,
            "a8e0bd43-e804-5665-9c48-c5581447c0fe": 0,
            "3e67b5ca-94db-57c3-b0e1-f1d5ad017207": 1
          },
          "spymasters": [
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165"
          ],
          "remaining": [
            8,
            9
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Gem Market \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "7438e232-6c49-5977-9c2e-3ad5c91ff45a",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "gem-market",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "399fd036-9104-5105-8d0b-ef68be11021f",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.348096
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.348097
        }
      ],
      "messages": [],
      "game": {
        "game_id": "gem-market",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "Developments": [],
              "Patrons": []
            }
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "Developments": [],
              "Patrons": []
            }
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "gem-1-onyx-1",
            "label": "Onyx Workshop",
            "color": "onyx",
            "subtitle": "2 sapphire \u00b7 1 ruby \u00b7 1 emerald",
            "value": "0",
            "suit": "development"
          },
          {
            "id": "gem-1-emerald-2",
            "label": "Emerald Workshop",
            "color": "emerald",
            "subtitle": "2 onyx \u00b7 2 sapphire",
            "value": "0",
            "suit": "development"
          },
          {
            "id": "gem-1-ruby-3",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "1 ruby \u00b7 1 emerald \u00b7 1 onyx \u00b7 1 pearl \u00b7 1 sapphire",
            "value": "1",
            "suit": "development"
          },
          {
            "id": "gem-1-ruby-7",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "4 onyx",
            "value": "1",
            "suit": "development"
          },
          {
            "id": "gem-2-ruby-4",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "4 emerald \u00b7 2 onyx \u00b7 2 sapphire",
            "value": "3",
            "suit": "development"
          },
          {
            "id": "gem-2-onyx-3",
            "label": "Onyx Guild",
            "color": "onyx",
            "subtitle": "2 onyx \u00b7 2 pearl \u00b7 2 sapphire \u00b7 2 ruby",
            "value": "2",
            "suit": "development"
          },
          {
            "id": "gem-2-ruby-3",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "2 ruby \u00b7 2 emerald \u00b7 2 onyx \u00b7 2 pearl",
            "value": "2",
            "suit": "development"
          },
          {
            "id": "gem-2-emerald-2",
            "label": "Emerald Guild",
            "color": "emerald",
            "subtitle": "3 onyx \u00b7 3 sapphire \u00b7 2 ruby",
            "value": "3",
            "suit": "development"
          },
          {
            "id": "gem-3-pearl-2",
            "label": "Pearl Palace",
            "color": "pearl",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby \u00b7 3 emerald",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "gem-3-ruby-0",
            "label": "Ruby Palace",
            "color": "ruby",
            "subtitle": "3 emerald \u00b7 3 onyx \u00b7 5 pearl",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "gem-3-sapphire-2",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 emerald \u00b7 3 onyx",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "gem-3-sapphire-0",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 ruby \u00b7 3 emerald \u00b7 5 onyx",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "patron-4",
            "label": "Patron 5",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron"
          },
          {
            "id": "patron-7",
            "label": "Patron 8",
            "color": "gold",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron"
          },
          {
            "id": "patron-0",
            "label": "Patron 1",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby",
            "value": "3",
            "suit": "patron"
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 78,
        "pot": 0,
        "message": "A small collection can become a brilliant engine.",
        "actions": [
          {
            "label": "Take pearl, sapphire, ruby",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,sapphire,ruby",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, sapphire, emerald",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,sapphire,emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, sapphire, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,sapphire,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, ruby, emerald",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,ruby,emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, ruby, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,ruby,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, emerald, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,emerald,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take sapphire, ruby, emerald",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire,ruby,emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take sapphire, ruby, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire,ruby,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take sapphire, emerald, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire,emerald,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take ruby, emerald, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "ruby,emerald,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two pearl",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two sapphire",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two ruby",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "ruby",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two emerald",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two onyx",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Onyx Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-onyx-1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Emerald Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-emerald-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-ruby-3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-ruby-7",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-ruby-4",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Onyx Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-onyx-3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-ruby-3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Emerald Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-emerald-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Pearl Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-pearl-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-ruby-0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Sapphire Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-sapphire-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Sapphire Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-sapphire-0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve blind from tier 1",
            "action": {
              "type": "reserve_blind",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve blind from tier 2",
            "action": {
              "type": "reserve_blind",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve blind from tier 3",
            "action": {
              "type": "reserve_blind",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "bank": {
            "pearl": 4,
            "sapphire": 4,
            "ruby": 4,
            "emerald": 4,
            "onyx": 4,
            "gold": 5
          },
          "tokens": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0,
              "gold": 0
            },
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0,
              "gold": 0
            }
          },
          "bonuses": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0
            },
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0
            }
          },
          "card_info": {
            "gem-2-ruby-4": {
              "tier": 2,
              "cost": {
                "emerald": 4,
                "onyx": 2,
                "sapphire": 2
              },
              "bonus": "ruby",
              "points": 3
            },
            "gem-1-ruby-7": {
              "tier": 1,
              "cost": {
                "onyx": 4
              },
              "bonus": "ruby",
              "points": 1
            },
            "gem-2-emerald-2": {
              "tier": 2,
              "cost": {
                "onyx": 3,
                "sapphire": 3,
                "ruby": 2
              },
              "bonus": "emerald",
              "points": 3
            },
            "gem-3-sapphire-2": {
              "tier": 3,
              "cost": {
                "sapphire": 3,
                "ruby": 3,
                "emerald": 3,
                "onyx": 3
              },
              "bonus": "sapphire",
              "points": 4
            },
            "gem-1-ruby-3": {
              "tier": 1,
              "cost": {
                "ruby": 1,
                "emerald": 1,
                "onyx": 1,
                "pearl": 1,
                "sapphire": 1
              },
              "bonus": "ruby",
              "points": 1
            },
            "gem-1-onyx-1": {
              "tier": 1,
              "cost": {
                "sapphire": 2,
                "ruby": 1,
                "emerald": 1
              },
              "bonus": "onyx",
              "points": 0
            },
            "gem-2-ruby-3": {
              "tier": 2,
              "cost": {
                "ruby": 2,
                "emerald": 2,
                "onyx": 2,
                "pearl": 2
              },
              "bonus": "ruby",
              "points": 2
            },
            "gem-2-onyx-3": {
              "tier": 2,
              "cost": {
                "onyx": 2,
                "pearl": 2,
                "sapphire": 2,
                "ruby": 2
              },
              "bonus": "onyx",
              "points": 2
            },
            "gem-1-emerald-2": {
              "tier": 1,
              "cost": {
                "onyx": 2,
                "sapphire": 2
              },
              "bonus": "emerald",
              "points": 0
            },
            "gem-3-pearl-2": {
              "tier": 3,
              "cost": {
                "pearl": 3,
                "sapphire": 3,
                "ruby": 3,
                "emerald": 3
              },
              "bonus": "pearl",
              "points": 4
            },
            "gem-3-sapphire-0": {
              "tier": 3,
              "cost": {
                "ruby": 3,
                "emerald": 3,
                "onyx": 5
              },
              "bonus": "sapphire",
              "points": 4
            },
            "gem-3-ruby-0": {
              "tier": 3,
              "cost": {
                "emerald": 3,
                "onyx": 3,
                "pearl": 5
              },
              "bonus": "ruby",
              "points": 4
            }
          },
          "patron_costs": {
            "patron-4": {
              "pearl": 3,
              "ruby": 3,
              "onyx": 3
            },
            "patron-7": {
              "sapphire": 3,
              "ruby": 3,
              "onyx": 3
            },
            "patron-0": {
              "pearl": 3,
              "sapphire": 3,
              "ruby": 3
            }
          },
          "final_round": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Gem Market \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "e90db2a3-b5c1-506a-b320-32de43732a3c",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "gem-market",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "399fd036-9104-5105-8d0b-ef68be11021f",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.348487
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.348489
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34849
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.348491
        }
      ],
      "messages": [],
      "game": {
        "game_id": "gem-market",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "Developments": [],
              "Patrons": []
            }
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "Developments": [],
              "Patrons": []
            }
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "Developments": [],
              "Patrons": []
            }
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "Developments": [],
              "Patrons": []
            }
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "gem-1-onyx-1",
            "label": "Onyx Workshop",
            "color": "onyx",
            "subtitle": "2 sapphire \u00b7 1 ruby \u00b7 1 emerald",
            "value": "0",
            "suit": "development"
          },
          {
            "id": "gem-1-emerald-2",
            "label": "Emerald Workshop",
            "color": "emerald",
            "subtitle": "2 onyx \u00b7 2 sapphire",
            "value": "0",
            "suit": "development"
          },
          {
            "id": "gem-1-ruby-3",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "1 ruby \u00b7 1 emerald \u00b7 1 onyx \u00b7 1 pearl \u00b7 1 sapphire",
            "value": "1",
            "suit": "development"
          },
          {
            "id": "gem-1-ruby-7",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "4 onyx",
            "value": "1",
            "suit": "development"
          },
          {
            "id": "gem-2-ruby-4",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "4 emerald \u00b7 2 onyx \u00b7 2 sapphire",
            "value": "3",
            "suit": "development"
          },
          {
            "id": "gem-2-onyx-3",
            "label": "Onyx Guild",
            "color": "onyx",
            "subtitle": "2 onyx \u00b7 2 pearl \u00b7 2 sapphire \u00b7 2 ruby",
            "value": "2",
            "suit": "development"
          },
          {
            "id": "gem-2-ruby-3",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "2 ruby \u00b7 2 emerald \u00b7 2 onyx \u00b7 2 pearl",
            "value": "2",
            "suit": "development"
          },
          {
            "id": "gem-2-emerald-2",
            "label": "Emerald Guild",
            "color": "emerald",
            "subtitle": "3 onyx \u00b7 3 sapphire \u00b7 2 ruby",
            "value": "3",
            "suit": "development"
          },
          {
            "id": "gem-3-pearl-2",
            "label": "Pearl Palace",
            "color": "pearl",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby \u00b7 3 emerald",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "gem-3-ruby-0",
            "label": "Ruby Palace",
            "color": "ruby",
            "subtitle": "3 emerald \u00b7 3 onyx \u00b7 5 pearl",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "gem-3-sapphire-2",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 emerald \u00b7 3 onyx",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "gem-3-sapphire-0",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 ruby \u00b7 3 emerald \u00b7 5 onyx",
            "value": "4",
            "suit": "development"
          },
          {
            "id": "patron-4",
            "label": "Patron 5",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron"
          },
          {
            "id": "patron-7",
            "label": "Patron 8",
            "color": "gold",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron"
          },
          {
            "id": "patron-0",
            "label": "Patron 1",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby",
            "value": "3",
            "suit": "patron"
          },
          {
            "id": "patron-5",
            "label": "Patron 6",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 emerald \u00b7 3 onyx",
            "value": "3",
            "suit": "patron"
          },
          {
            "id": "patron-1",
            "label": "Patron 2",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 emerald",
            "value": "3",
            "suit": "patron"
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 78,
        "pot": 0,
        "message": "A small collection can become a brilliant engine.",
        "actions": [
          {
            "label": "Take pearl, sapphire, ruby",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,sapphire,ruby",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, sapphire, emerald",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,sapphire,emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, sapphire, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,sapphire,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, ruby, emerald",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,ruby,emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, ruby, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,ruby,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take pearl, emerald, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl,emerald,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take sapphire, ruby, emerald",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire,ruby,emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take sapphire, ruby, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire,ruby,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take sapphire, emerald, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire,emerald,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take ruby, emerald, onyx",
            "action": {
              "type": "take",
              "card": "",
              "target": "",
              "color": "",
              "choice": "ruby,emerald,onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two pearl",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pearl",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two sapphire",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "sapphire",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two ruby",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "ruby",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two emerald",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "emerald",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take two onyx",
            "action": {
              "type": "take_pair",
              "card": "",
              "target": "",
              "color": "",
              "choice": "onyx",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Onyx Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-onyx-1",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Emerald Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-emerald-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-ruby-3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Workshop",
            "action": {
              "type": "reserve",
              "card": "gem-1-ruby-7",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-ruby-4",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Onyx Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-onyx-3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-ruby-3",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Emerald Guild",
            "action": {
              "type": "reserve",
              "card": "gem-2-emerald-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Pearl Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-pearl-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Ruby Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-ruby-0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Sapphire Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-sapphire-2",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve Sapphire Palace",
            "action": {
              "type": "reserve",
              "card": "gem-3-sapphire-0",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve blind from tier 1",
            "action": {
              "type": "reserve_blind",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve blind from tier 2",
            "action": {
              "type": "reserve_blind",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reserve blind from tier 3",
            "action": {
              "type": "reserve_blind",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "bank": {
            "pearl": 7,
            "sapphire": 7,
            "ruby": 7,
            "emerald": 7,
            "onyx": 7,
            "gold": 5
          },
          "tokens": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0,
              "gold": 0
            },
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0,
              "gold": 0
            },
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0,
              "gold": 0
            },
            "19285837-cef0-568b-9a40-febfd6a8cb39": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0,
              "gold": 0
            }
          },
          "bonuses": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0
            },
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0
            },
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0
            },
            "19285837-cef0-568b-9a40-febfd6a8cb39": {
              "pearl": 0,
              "sapphire": 0,
              "ruby": 0,
              "emerald": 0,
              "onyx": 0
            }
          },
          "card_info": {
            "gem-2-ruby-4": {
              "tier": 2,
              "cost": {
                "emerald": 4,
                "onyx": 2,
                "sapphire": 2
              },
              "bonus": "ruby",
              "points": 3
            },
            "gem-1-ruby-7": {
              "tier": 1,
              "cost": {
                "onyx": 4
              },
              "bonus": "ruby",
              "points": 1
            },
            "gem-2-emerald-2": {
              "tier": 2,
              "cost": {
                "onyx": 3,
                "sapphire": 3,
                "ruby": 2
              },
              "bonus": "emerald",
              "points": 3
            },
            "gem-3-sapphire-2": {
              "tier": 3,
              "cost": {
                "sapphire": 3,
                "ruby": 3,
                "emerald": 3,
                "onyx": 3
              },
              "bonus": "sapphire",
              "points": 4
            },
            "gem-1-ruby-3": {
              "tier": 1,
              "cost": {
                "ruby": 1,
                "emerald": 1,
                "onyx": 1,
                "pearl": 1,
                "sapphire": 1
              },
              "bonus": "ruby",
              "points": 1
            },
            "gem-1-onyx-1": {
              "tier": 1,
              "cost": {
                "sapphire": 2,
                "ruby": 1,
                "emerald": 1
              },
              "bonus": "onyx",
              "points": 0
            },
            "gem-2-ruby-3": {
              "tier": 2,
              "cost": {
                "ruby": 2,
                "emerald": 2,
                "onyx": 2,
                "pearl": 2
              },
              "bonus": "ruby",
              "points": 2
            },
            "gem-2-onyx-3": {
              "tier": 2,
              "cost": {
                "onyx": 2,
                "pearl": 2,
                "sapphire": 2,
                "ruby": 2
              },
              "bonus": "onyx",
              "points": 2
            },
            "gem-1-emerald-2": {
              "tier": 1,
              "cost": {
                "onyx": 2,
                "sapphire": 2
              },
              "bonus": "emerald",
              "points": 0
            },
            "gem-3-pearl-2": {
              "tier": 3,
              "cost": {
                "pearl": 3,
                "sapphire": 3,
                "ruby": 3,
                "emerald": 3
              },
              "bonus": "pearl",
              "points": 4
            },
            "gem-3-sapphire-0": {
              "tier": 3,
              "cost": {
                "ruby": 3,
                "emerald": 3,
                "onyx": 5
              },
              "bonus": "sapphire",
              "points": 4
            },
            "gem-3-ruby-0": {
              "tier": 3,
              "cost": {
                "emerald": 3,
                "onyx": 3,
                "pearl": 5
              },
              "bonus": "ruby",
              "points": 4
            }
          },
          "patron_costs": {
            "patron-4": {
              "pearl": 3,
              "ruby": 3,
              "onyx": 3
            },
            "patron-7": {
              "sapphire": 3,
              "ruby": 3,
              "onyx": 3
            },
            "patron-0": {
              "pearl": 3,
              "sapphire": 3,
              "ruby": 3
            },
            "patron-5": {
              "pearl": 3,
              "emerald": 3,
              "onyx": 3
            },
            "patron-1": {
              "pearl": 3,
              "sapphire": 3,
              "emerald": 3
            }
          },
          "final_round": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Checkers \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "69122409-2057-5035-8e61-d71968af2bc0",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "checkers",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "6cad4e1a-87be-50f0-88b9-04d7ea7568bc",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.348795
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3487968
        }
      ],
      "messages": [],
      "game": {
        "game_id": "checkers",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "A8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "1",
            "label": "B8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "2",
            "label": "C8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "3",
            "label": "D8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "4",
            "label": "E8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "5",
            "label": "F8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "6",
            "label": "G8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "7",
            "label": "H8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "8",
            "label": "A7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "9",
            "label": "B7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "10",
            "label": "C7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "11",
            "label": "D7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "12",
            "label": "E7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "13",
            "label": "F7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "14",
            "label": "G7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "15",
            "label": "H7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "16",
            "label": "A6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "17",
            "label": "B6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "18",
            "label": "C6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "19",
            "label": "D6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "20",
            "label": "E6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "21",
            "label": "F6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "22",
            "label": "G6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "23",
            "label": "H6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "24",
            "label": "A5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "25",
            "label": "B5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "26",
            "label": "C5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "27",
            "label": "D5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "28",
            "label": "E5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "29",
            "label": "F5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "30",
            "label": "G5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "31",
            "label": "H5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "32",
            "label": "A4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "33",
            "label": "B4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "34",
            "label": "C4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "35",
            "label": "D4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "36",
            "label": "E4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "37",
            "label": "F4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "38",
            "label": "G4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "39",
            "label": "H4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "40",
            "label": "A3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "41",
            "label": "B3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "42",
            "label": "C3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "43",
            "label": "D3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "44",
            "label": "E3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "45",
            "label": "F3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "46",
            "label": "G3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "47",
            "label": "H3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "48",
            "label": "A2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "49",
            "label": "B2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "50",
            "label": "C2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "51",
            "label": "D2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "52",
            "label": "E2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "53",
            "label": "F2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "54",
            "label": "G2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "55",
            "label": "H2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "56",
            "label": "A1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "57",
            "label": "B1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "58",
            "label": "C1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "59",
            "label": "D1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "60",
            "label": "E1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "61",
            "label": "F1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "62",
            "label": "G1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "63",
            "label": "H1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Coral moves first. Choose a piece.",
        "actions": [
          {
            "label": "Move A3 to B4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "40:33",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move C3 to B4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "42:33",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move C3 to D4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "42:35",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move E3 to D4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44:35",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move E3 to F4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44:37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move G3 to F4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "46:37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move G3 to H4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "46:39",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "rows": 8,
          "columns": 8,
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Checkers \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "79f69fbc-ea53-584d-822c-26f3aa0df8a4",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "checkers",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "6cad4e1a-87be-50f0-88b9-04d7ea7568bc",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3489642
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3489652
        }
      ],
      "messages": [],
      "game": {
        "game_id": "checkers",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "A8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "1",
            "label": "B8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "2",
            "label": "C8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "3",
            "label": "D8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "4",
            "label": "E8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "5",
            "label": "F8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "6",
            "label": "G8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "7",
            "label": "H8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "8",
            "label": "A7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "9",
            "label": "B7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "10",
            "label": "C7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "11",
            "label": "D7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "12",
            "label": "E7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "13",
            "label": "F7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "14",
            "label": "G7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "15",
            "label": "H7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "16",
            "label": "A6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "17",
            "label": "B6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "18",
            "label": "C6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "19",
            "label": "D6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "20",
            "label": "E6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "21",
            "label": "F6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "22",
            "label": "G6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "23",
            "label": "H6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": ""
          },
          {
            "id": "24",
            "label": "A5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "25",
            "label": "B5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "26",
            "label": "C5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "27",
            "label": "D5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "28",
            "label": "E5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "29",
            "label": "F5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "30",
            "label": "G5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "31",
            "label": "H5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "32",
            "label": "A4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "33",
            "label": "B4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "34",
            "label": "C4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "35",
            "label": "D4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "36",
            "label": "E4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "37",
            "label": "F4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "38",
            "label": "G4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "39",
            "label": "H4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "40",
            "label": "A3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "41",
            "label": "B3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "42",
            "label": "C3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "43",
            "label": "D3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "44",
            "label": "E3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "45",
            "label": "F3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "46",
            "label": "G3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "47",
            "label": "H3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "48",
            "label": "A2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "49",
            "label": "B2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "50",
            "label": "C2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "51",
            "label": "D2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "52",
            "label": "E2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "53",
            "label": "F2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "54",
            "label": "G2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "55",
            "label": "H2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "56",
            "label": "A1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "57",
            "label": "B1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "58",
            "label": "C1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "59",
            "label": "D1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "60",
            "label": "E1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "61",
            "label": "F1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          },
          {
            "id": "62",
            "label": "G1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": ""
          },
          {
            "id": "63",
            "label": "H1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Coral moves first. Choose a piece.",
        "actions": [
          {
            "label": "Move A3 to B4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "40:33",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move C3 to B4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "42:33",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move C3 to D4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "42:35",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move E3 to D4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44:35",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move E3 to F4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "44:37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move G3 to F4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "46:37",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move G3 to H4",
            "action": {
              "type": "move",
              "card": "",
              "target": "",
              "color": "",
              "choice": "46:39",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "rows": 8,
          "columns": 8,
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Mancala \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ed5d89bb-a1c0-5967-a6d2-c1239ec3ea0b",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "mancala",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "3e04dbc1-7e86-5117-97c4-ad2a33ba4d25",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.3491158
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.349117
        }
      ],
      "messages": [],
      "game": {
        "game_id": "mancala",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Pit 1",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Pit 2",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Pit 3",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Pit 4",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Pit 5",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Pit 6",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Store",
            "color": "sage",
            "subtitle": "",
            "value": "0",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Pit 1",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Pit 2",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Pit 3",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Pit 4",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Pit 5",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Pit 6",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Store",
            "color": "ochre",
            "subtitle": "",
            "value": "0",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Choose a pit on your side to start sowing.",
        "actions": [
          {
            "label": "Sow pit 1 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 2 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 3 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 4 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 5 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "4",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 6 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "5",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Mancala \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "6136d9ff-6f60-5f3a-bc27-80c7bc1ef929",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "mancala",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "3e04dbc1-7e86-5117-97c4-ad2a33ba4d25",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.34919
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793515038.349191
        }
      ],
      "messages": [],
      "game": {
        "game_id": "mancala",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 0,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [
          {
            "id": "0",
            "label": "Pit 1",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "1",
            "label": "Pit 2",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "2",
            "label": "Pit 3",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "3",
            "label": "Pit 4",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "4",
            "label": "Pit 5",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "5",
            "label": "Pit 6",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "6",
            "label": "Store",
            "color": "sage",
            "subtitle": "",
            "value": "0",
            "suit": ""
          },
          {
            "id": "7",
            "label": "Pit 1",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "8",
            "label": "Pit 2",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "9",
            "label": "Pit 3",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "10",
            "label": "Pit 4",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "11",
            "label": "Pit 5",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "12",
            "label": "Pit 6",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": ""
          },
          {
            "id": "13",
            "label": "Store",
            "color": "ochre",
            "subtitle": "",
            "value": "0",
            "suit": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Choose a pit on your side to start sowing.",
        "actions": [
          {
            "label": "Sow pit 1 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 2 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 3 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 4 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "3",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 5 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "4",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Sow pit 6 \u00b7 4 seeds",
            "action": {
              "type": "sow",
              "card": "",
              "target": "",
              "color": "",
              "choice": "5",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          }
        ],
        "winners": [],
        "detail": {
          "draw": false,
          "last_move": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  }
] satisfies { label: string; selfId: string; room: components["schemas"]["RoomView"] }[];
