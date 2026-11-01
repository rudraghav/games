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
          "last_seen": 1793523158.435692
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4356961
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
          "last_seen": 1793523158.4358988
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435901
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4359019
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435903
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435904
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435905
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435905
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435906
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.435908
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.43591
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
          "last_seen": 1793523158.436221
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4362218
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
          "last_seen": 1793523158.43638
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4363809
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436382
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436383
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436384
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436384
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
          "last_seen": 1793523158.436558
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4365592
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
          "last_seen": 1793523158.436686
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436688
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436689
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436689
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4366899
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
          "last_seen": 1793523158.436804
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436805
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
          "last_seen": 1793523158.436926
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436927
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436928
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436929
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.436929
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
          "last_seen": 1793523158.437042
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437043
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
          "last_seen": 1793523158.4371378
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.43714
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437141
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437141
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4371421
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437143
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437144
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437145
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437145
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
          "last_seen": 1793523158.43723
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437231
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
          "last_seen": 1793523158.437336
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437338
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437338
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4373388
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.43734
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437341
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
          "last_seen": 1793523158.43743
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437431
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
          "last_seen": 1793523158.437505
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437506
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4375072
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437508
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437508
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437509
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
          "last_seen": 1793523158.437634
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
          "last_seen": 1793523158.4377658
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437767
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437768
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437768
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437769
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.43777
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.437771
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
          "last_seen": 1793523158.4378712
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4378722
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
          "last_seen": 1793523158.4380102
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438011
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438012
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4380128
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438014
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438014
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438015
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438016
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
          "last_seen": 1793523158.438129
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
          "last_seen": 1793523158.4384818
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
          "last_seen": 1793523158.438747
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438748
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
          "last_seen": 1793523158.438863
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4388638
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
          "last_seen": 1793523158.438963
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.438964
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
          "last_seen": 1793523158.439169
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4391701
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
          "last_seen": 1793523158.43941
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439411
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4394119
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439413
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
          "last_seen": 1793523158.4395258
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439528
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439528
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439529
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.43953
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439531
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439532
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439532
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439533
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4395342
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
          "last_seen": 1793523158.439671
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.439672
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
          "last_seen": 1793523158.440005
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.440007
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.440008
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.440008
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
          "last_seen": 1793523158.441622
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4416242
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
          "last_seen": 1793523158.4417942
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.441795
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
          "last_seen": 1793523158.441955
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4419572
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
          "last_seen": 1793523158.442034
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442035
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
    "label": "Flip 7 \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "8387eff7-0293-51fe-adb7-d933fd9eb3da",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "flip-7",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "e32fbdbd-6cc2-516d-9bd5-32b56be4d9d4",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442156
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442157
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442158
        }
      ],
      "messages": [],
      "game": {
        "game_id": "flip-7",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-11-10",
                "label": "11",
                "color": "yellow",
                "subtitle": "",
                "value": "11",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-10-7",
                "label": "10",
                "color": "yellow",
                "subtitle": "",
                "value": "10",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-9-1",
                "label": "9",
                "color": "yellow",
                "subtitle": "",
                "value": "9",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 91,
        "pot": 0,
        "message": "Flipped 9.",
        "actions": [
          {
            "label": "Hit \u00b7 flip a card",
            "action": {
              "type": "hit",
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
            "label": "Stay \u00b7 bank 11",
            "action": {
              "type": "stay",
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
          "round": 1,
          "status": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": "active",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": "active",
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": "active"
          },
          "round_scores": {},
          "at_risk": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 11,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 10,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": 9
          },
          "pending_card": "",
          "dealer": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5"
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Flip 7 \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "e60b42c8-e230-5824-a8cf-8a88032513b9",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "flip-7",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "e32fbdbd-6cc2-516d-9bd5-32b56be4d9d4",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442299
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4422998
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442301
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442302
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442303
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442304
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442304
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442305
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442306
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442307
        }
      ],
      "messages": [],
      "game": {
        "game_id": "flip-7",
        "phase": "playing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-11-10",
                "label": "11",
                "color": "yellow",
                "subtitle": "",
                "value": "11",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-10-7",
                "label": "10",
                "color": "yellow",
                "subtitle": "",
                "value": "10",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-9-1",
                "label": "9",
                "color": "yellow",
                "subtitle": "",
                "value": "9",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-10-0",
                "label": "10",
                "color": "yellow",
                "subtitle": "",
                "value": "10",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-9-0",
                "label": "9",
                "color": "yellow",
                "subtitle": "",
                "value": "9",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-7-0",
                "label": "7",
                "color": "yellow",
                "subtitle": "",
                "value": "7",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d03315f3-275f-534f-915a-d668855c7de9",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-12-2",
                "label": "12",
                "color": "yellow",
                "subtitle": "",
                "value": "12",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "times-2",
                "label": "\u00d72",
                "color": "blue",
                "subtitle": "",
                "value": "\u00d72",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-8-6",
                "label": "8",
                "color": "yellow",
                "subtitle": "",
                "value": "8",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              {
                "id": "n-5-3",
                "label": "5",
                "color": "yellow",
                "subtitle": "",
                "value": "5",
                "suit": "\u2726"
              }
            ],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 84,
        "pot": 0,
        "message": "Flipped 5.",
        "actions": [
          {
            "label": "Hit \u00b7 flip a card",
            "action": {
              "type": "hit",
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
            "label": "Stay \u00b7 bank 11",
            "action": {
              "type": "stay",
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
          "round": 1,
          "status": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": "active",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": "active",
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": "active",
            "19285837-cef0-568b-9a40-febfd6a8cb39": "active",
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": "active",
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46": "active",
            "d03315f3-275f-534f-915a-d668855c7de9": "active",
            "b99cae13-1a84-5dfe-95f8-3ec6f935de22": "active",
            "a8e0bd43-e804-5665-9c48-c5581447c0fe": "active",
            "3e67b5ca-94db-57c3-b0e1-f1d5ad017207": "active"
          },
          "round_scores": {},
          "at_risk": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 11,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 10,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": 9,
            "19285837-cef0-568b-9a40-febfd6a8cb39": 10,
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": 9,
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46": 7,
            "d03315f3-275f-534f-915a-d668855c7de9": 12,
            "b99cae13-1a84-5dfe-95f8-3ec6f935de22": 0,
            "a8e0bd43-e804-5665-9c48-c5581447c0fe": 8,
            "3e67b5ca-94db-57c3-b0e1-f1d5ad017207": 5
          },
          "pending_card": "",
          "dealer": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5"
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Trio \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "2a55ce19-5388-5877-bcff-2174fb24d84c",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "trio",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "b32556ce-cd88-53a7-8666-2cdf24c23c99",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4424279
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4424288
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.44243
        }
      ],
      "messages": [],
      "game": {
        "game_id": "trio",
        "phase": "revealing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 9,
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
            "count": 9,
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
            "count": 9,
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
            "id": "trio-2-2",
            "label": "Trio 2",
            "color": "violet",
            "subtitle": "",
            "value": "2",
            "suit": "\u2726"
          },
          {
            "id": "trio-7-1",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726"
          },
          {
            "id": "trio-7-0",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726"
          },
          {
            "id": "trio-8-2",
            "label": "Trio 8",
            "color": "violet",
            "subtitle": "",
            "value": "8",
            "suit": "\u2726"
          },
          {
            "id": "trio-8-1",
            "label": "Trio 8",
            "color": "violet",
            "subtitle": "",
            "value": "8",
            "suit": "\u2726"
          },
          {
            "id": "trio-9-2",
            "label": "Trio 9",
            "color": "violet",
            "subtitle": "",
            "value": "9",
            "suit": "\u2726"
          },
          {
            "id": "trio-9-0",
            "label": "Trio 9",
            "color": "violet",
            "subtitle": "",
            "value": "9",
            "suit": "\u2726"
          },
          {
            "id": "trio-10-1",
            "label": "Trio 10",
            "color": "violet",
            "subtitle": "",
            "value": "10",
            "suit": "\u2726"
          },
          {
            "id": "trio-12-0",
            "label": "Trio 12",
            "color": "violet",
            "subtitle": "",
            "value": "12",
            "suit": "\u2726"
          }
        ],
        "community": [
          {
            "id": "table-slot-0",
            "label": "Table position 1",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-1",
            "label": "Table position 2",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-2",
            "label": "Table position 3",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-3",
            "label": "Table position 4",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-4",
            "label": "Table position 5",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-5",
            "label": "Table position 6",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-6",
            "label": "Table position 7",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-7",
            "label": "Table position 8",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-8",
            "label": "Table position 9",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Find three matching numbers. Reveal a card to begin.",
        "actions": [
          {
            "label": "Reveal table card 1",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 2",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 3",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 4",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 5",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 6",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 7",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 8",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 9",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
              "color": "",
              "choice": "high",
              "amount": 0,
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
          "revealed": [],
          "failed": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Trio \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "1c544f8e-5673-5d17-b14b-63a1c09d95fc",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "trio",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 6,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "b32556ce-cd88-53a7-8666-2cdf24c23c99",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442571
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442572
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442573
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442574
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442574
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4425752
        }
      ],
      "messages": [],
      "game": {
        "game_id": "trio",
        "phase": "revealing",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
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
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
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
            "id": "trio-7-1",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726"
          },
          {
            "id": "trio-7-0",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726"
          },
          {
            "id": "trio-8-2",
            "label": "Trio 8",
            "color": "violet",
            "subtitle": "",
            "value": "8",
            "suit": "\u2726"
          },
          {
            "id": "trio-9-2",
            "label": "Trio 9",
            "color": "violet",
            "subtitle": "",
            "value": "9",
            "suit": "\u2726"
          },
          {
            "id": "trio-12-0",
            "label": "Trio 12",
            "color": "violet",
            "subtitle": "",
            "value": "12",
            "suit": "\u2726"
          }
        ],
        "community": [
          {
            "id": "table-slot-0",
            "label": "Table position 1",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-1",
            "label": "Table position 2",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-2",
            "label": "Table position 3",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-3",
            "label": "Table position 4",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-4",
            "label": "Table position 5",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          },
          {
            "id": "table-slot-5",
            "label": "Table position 6",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden"
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Find three matching numbers. Reveal a card to begin.",
        "actions": [
          {
            "label": "Reveal table card 1",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 2",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 3",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 4",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 5",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal table card 6",
            "action": {
              "type": "reveal_table",
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
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "19285837-cef0-568b-9a40-febfd6a8cb39",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "19285837-cef0-568b-9a40-febfd6a8cb39",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
              "color": "",
              "choice": "high",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal lowest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
              "color": "",
              "choice": "low",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Reveal highest",
            "action": {
              "type": "reveal_hand",
              "card": "",
              "target": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
              "color": "",
              "choice": "high",
              "amount": 0,
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
          "revealed": [],
          "failed": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Azul \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "edb4d42e-42c5-5f51-849b-f8fd4a3482dd",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "azul",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "402552ff-8932-567f-83ee-8272e4539bff",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442724
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4427252
        }
      ],
      "messages": [],
      "game": {
        "game_id": "azul",
        "phase": "drafting",
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
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 80,
        "pot": 0,
        "message": "Choose a color from a factory to begin.",
        "actions": [
          {
            "label": "1 yellow \u00b7 factory 1",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 red \u00b7 factory 1",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 black \u00b7 factory 1",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "2 yellow \u00b7 factory 2",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 white \u00b7 factory 2",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "1 blue \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "1 black \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "1 white \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "1 blue \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "1 red \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 white \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "1 yellow \u00b7 factory 5",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 red \u00b7 factory 5",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 black \u00b7 factory 5",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
          }
        ],
        "winners": [],
        "detail": {
          "round": 1,
          "factories": [
            [
              "black",
              "red",
              "yellow",
              "red"
            ],
            [
              "yellow",
              "yellow",
              "white",
              "white"
            ],
            [
              "black",
              "white",
              "yellow",
              "blue"
            ],
            [
              "blue",
              "yellow",
              "red",
              "white"
            ],
            [
              "yellow",
              "black",
              "red",
              "red"
            ]
          ],
          "center": [],
          "marker": true,
          "draft": [],
          "lines": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [
              [],
              [],
              [],
              [],
              []
            ],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [
              [],
              [],
              [],
              [],
              []
            ]
          },
          "walls": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ]
            ],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ]
            ]
          },
          "floors": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": []
          },
          "starter": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "last_scores": {}
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Azul \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ff1a1b28-e604-56c1-9835-a834fc12ef4e",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "azul",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "402552ff-8932-567f-83ee-8272e4539bff",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442912
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442913
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442914
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.442915
        }
      ],
      "messages": [],
      "game": {
        "game_id": "azul",
        "phase": "drafting",
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
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 64,
        "pot": 0,
        "message": "Choose a color from a factory to begin.",
        "actions": [
          {
            "label": "1 yellow \u00b7 factory 1",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 red \u00b7 factory 1",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 black \u00b7 factory 1",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "2 yellow \u00b7 factory 2",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 white \u00b7 factory 2",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "1 blue \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "1 black \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "1 white \u00b7 factory 3",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "1 blue \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "1 red \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 white \u00b7 factory 4",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "1 yellow \u00b7 factory 5",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 red \u00b7 factory 5",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 black \u00b7 factory 5",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "2 blue \u00b7 factory 6",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "2 black \u00b7 factory 6",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "1 blue \u00b7 factory 7",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 7",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "2 black \u00b7 factory 7",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "black",
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
            "label": "1 blue \u00b7 factory 8",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 8",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "1 red \u00b7 factory 8",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
            "label": "1 white \u00b7 factory 8",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "white",
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
            "label": "2 blue \u00b7 factory 9",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "blue",
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
            "label": "1 yellow \u00b7 factory 9",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "yellow",
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
            "label": "1 red \u00b7 factory 9",
            "action": {
              "type": "draft_tiles",
              "card": "",
              "target": "",
              "color": "red",
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
          }
        ],
        "winners": [],
        "detail": {
          "round": 1,
          "factories": [
            [
              "black",
              "red",
              "yellow",
              "red"
            ],
            [
              "yellow",
              "yellow",
              "white",
              "white"
            ],
            [
              "black",
              "white",
              "yellow",
              "blue"
            ],
            [
              "blue",
              "yellow",
              "red",
              "white"
            ],
            [
              "yellow",
              "black",
              "red",
              "red"
            ],
            [
              "blue",
              "black",
              "blue",
              "black"
            ],
            [
              "yellow",
              "blue",
              "black",
              "black"
            ],
            [
              "yellow",
              "red",
              "white",
              "blue"
            ],
            [
              "blue",
              "yellow",
              "red",
              "blue"
            ]
          ],
          "center": [],
          "marker": true,
          "draft": [],
          "lines": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [
              [],
              [],
              [],
              [],
              []
            ],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [
              [],
              [],
              [],
              [],
              []
            ],
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": [
              [],
              [],
              [],
              [],
              []
            ],
            "19285837-cef0-568b-9a40-febfd6a8cb39": [
              [],
              [],
              [],
              [],
              []
            ]
          },
          "walls": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ]
            ],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ]
            ],
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": [
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ]
            ],
            "19285837-cef0-568b-9a40-febfd6a8cb39": [
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ],
              [
                null,
                null,
                null,
                null,
                null
              ]
            ]
          },
          "floors": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": [],
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": [],
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": [],
            "19285837-cef0-568b-9a40-febfd6a8cb39": []
          },
          "starter": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "last_scores": {}
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Spill or Chill \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "056c58c5-f283-5889-9db0-848ef1d3a4c5",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "spill-or-chill",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "69f17af6-6cb7-5c0b-872c-79093c30fd7e",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4431481
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443149
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.44315
        }
      ],
      "messages": [],
      "game": {
        "game_id": "spill-or-chill",
        "phase": "answer",
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
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Spotlight player, share a story or keep it chill. Passing is always welcome.",
        "actions": [
          {
            "label": "Share \u00b7 I answered aloud",
            "action": {
              "type": "respond",
              "card": "",
              "target": "",
              "color": "",
              "choice": "share",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Chill \u00b7 keep this one to myself",
            "action": {
              "type": "respond",
              "card": "",
              "target": "",
              "color": "",
              "choice": "chill",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Pass",
            "action": {
              "type": "respond",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pass",
              "amount": 0,
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
          "mode": "spill-or-chill",
          "round": 1,
          "rounds": 6,
          "spotlight": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "prompt": "Which fictional vehicle would create the most chaos in your life?",
          "options": [],
          "submitted": [],
          "own_choice": null,
          "result": null,
          "sip_prompts": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Spill or Chill \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "ceab7d59-b2c0-5720-8c62-c0d119eca21f",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "spill-or-chill",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "69f17af6-6cb7-5c0b-872c-79093c30fd7e",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443232
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443233
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443234
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4432352
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443236
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443237
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4432378
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4432378
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443239
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.44324
        }
      ],
      "messages": [],
      "game": {
        "game_id": "spill-or-chill",
        "phase": "answer",
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
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Spotlight player, share a story or keep it chill. Passing is always welcome.",
        "actions": [
          {
            "label": "Share \u00b7 I answered aloud",
            "action": {
              "type": "respond",
              "card": "",
              "target": "",
              "color": "",
              "choice": "share",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Chill \u00b7 keep this one to myself",
            "action": {
              "type": "respond",
              "card": "",
              "target": "",
              "color": "",
              "choice": "chill",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Pass",
            "action": {
              "type": "respond",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pass",
              "amount": 0,
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
          "mode": "spill-or-chill",
          "round": 1,
          "rounds": 20,
          "spotlight": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "prompt": "Which fictional vehicle would create the most chaos in your life?",
          "options": [],
          "submitted": [],
          "own_choice": null,
          "result": null,
          "sip_prompts": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Most Likely \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "16bb70a0-86d5-5920-ae4e-ce06c6df3c6a",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "most-likely",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "a06b6529-bff2-5f63-9149-f287c993ac0c",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4433138
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443315
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443316
        }
      ],
      "messages": [],
      "game": {
        "game_id": "most-likely",
        "phase": "vote",
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
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Make your secret vote. Everyone reveals together.",
        "actions": [
          {
            "label": "Vote for seat 2",
            "action": {
              "type": "vote",
              "card": "",
              "target": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
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
            "label": "Vote for seat 3",
            "action": {
              "type": "vote",
              "card": "",
              "target": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
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
            "label": "Pass",
            "action": {
              "type": "vote",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pass",
              "amount": 0,
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
          "mode": "most-likely",
          "round": 1,
          "rounds": 6,
          "spotlight": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "prompt": "Who is most likely to save a screenshot and find it again when it matters?",
          "options": [],
          "submitted": [],
          "own_choice": null,
          "result": null,
          "sip_prompts": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Most Likely \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "169e58a4-0615-546b-b6bd-48c6f9f89bd5",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "most-likely",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "a06b6529-bff2-5f63-9149-f287c993ac0c",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443399
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4434
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4434009
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443402
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443403
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443403
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443404
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4434052
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443406
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443407
        }
      ],
      "messages": [],
      "game": {
        "game_id": "most-likely",
        "phase": "vote",
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
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Make your secret vote. Everyone reveals together.",
        "actions": [
          {
            "label": "Vote for seat 2",
            "action": {
              "type": "vote",
              "card": "",
              "target": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
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
            "label": "Vote for seat 3",
            "action": {
              "type": "vote",
              "card": "",
              "target": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
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
            "label": "Vote for seat 4",
            "action": {
              "type": "vote",
              "card": "",
              "target": "19285837-cef0-568b-9a40-febfd6a8cb39",
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
            "label": "Vote for seat 5",
            "action": {
              "type": "vote",
              "card": "",
              "target": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
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
            "label": "Vote for seat 6",
            "action": {
              "type": "vote",
              "card": "",
              "target": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
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
            "label": "Vote for seat 7",
            "action": {
              "type": "vote",
              "card": "",
              "target": "d03315f3-275f-534f-915a-d668855c7de9",
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
            "label": "Vote for seat 8",
            "action": {
              "type": "vote",
              "card": "",
              "target": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
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
            "label": "Vote for seat 9",
            "action": {
              "type": "vote",
              "card": "",
              "target": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
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
            "label": "Vote for seat 10",
            "action": {
              "type": "vote",
              "card": "",
              "target": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
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
            "label": "Pass",
            "action": {
              "type": "vote",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pass",
              "amount": 0,
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
          "mode": "most-likely",
          "round": 1,
          "rounds": 20,
          "spotlight": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "prompt": "Who is most likely to save a screenshot and find it again when it matters?",
          "options": [],
          "submitted": [],
          "own_choice": null,
          "result": null,
          "sip_prompts": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Hot Seat \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "a7a225ae-14ab-565f-81cf-df459a26e1cf",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "hot-seat",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "b228b9e0-2ab1-5484-9b02-201b20be71c9",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4435
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443501
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4435022
        }
      ],
      "messages": [],
      "game": {
        "game_id": "hot-seat",
        "phase": "predict",
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
          }
        ],
        "hand": [],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "One secret preference. A room full of predictions. Lock yours in.",
        "actions": [
          {
            "label": "Choose A",
            "action": {
              "type": "choose",
              "card": "",
              "target": "",
              "color": "",
              "choice": "a",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose B",
            "action": {
              "type": "choose",
              "card": "",
              "target": "",
              "color": "",
              "choice": "b",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Pass",
            "action": {
              "type": "choose",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pass",
              "amount": 0,
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
          "mode": "hot-seat",
          "round": 1,
          "rounds": 6,
          "spotlight": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "prompt": "A creative project should begin with:",
          "options": [
            "A beautiful plan",
            "An exciting first experiment"
          ],
          "submitted": [],
          "own_choice": null,
          "result": null,
          "sip_prompts": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  },
  {
    "label": "Hot Seat \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "185c2fb6-5b23-5219-b22b-a3ae307f4538",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "hot-seat",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "b228b9e0-2ab1-5484-9b02-201b20be71c9",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443577
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443578
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.44358
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.4435809
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443582
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443583
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443583
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443584
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443585
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793523158.443586
        }
      ],
      "messages": [],
      "game": {
        "game_id": "hot-seat",
        "phase": "predict",
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
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "One secret preference. A room full of predictions. Lock yours in.",
        "actions": [
          {
            "label": "Choose A",
            "action": {
              "type": "choose",
              "card": "",
              "target": "",
              "color": "",
              "choice": "a",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Choose B",
            "action": {
              "type": "choose",
              "card": "",
              "target": "",
              "color": "",
              "choice": "b",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Pass",
            "action": {
              "type": "choose",
              "card": "",
              "target": "",
              "color": "",
              "choice": "pass",
              "amount": 0,
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
          "mode": "hot-seat",
          "round": 1,
          "rounds": 20,
          "spotlight": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "prompt": "A creative project should begin with:",
          "options": [
            "A beautiful plan",
            "An exciting first experiment"
          ],
          "submitted": [],
          "own_choice": null,
          "result": null,
          "sip_prompts": false
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null
    }
  }
] satisfies { label: string; selfId: string; room: components["schemas"]["RoomView"] }[];
