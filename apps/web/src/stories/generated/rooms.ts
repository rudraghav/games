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
          "last_seen": 1793545466.116159,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.116163,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:2:0",
            "label": "Green 2",
            "color": "green",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:wild:3",
            "label": "Wild Wild",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Wild",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:7:0",
            "label": "Yellow 7",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "7",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:reverse:0",
            "label": "Yellow Reverse",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:6:1",
            "label": "Yellow 6",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:reverse:1",
            "label": "Red Reverse",
            "color": "red",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "red:2:0",
          "label": "Red 2",
          "color": "red",
          "subtitle": "UNO",
          "value": "2",
          "suit": "",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1173198,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117325,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1173272,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117328,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117329,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117331,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117332,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117333,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1173341,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117336,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:2:0",
            "label": "Green 2",
            "color": "green",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:wild:3",
            "label": "Wild Wild",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Wild",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:7:0",
            "label": "Yellow 7",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "7",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:reverse:0",
            "label": "Yellow Reverse",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:6:1",
            "label": "Yellow 6",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:reverse:1",
            "label": "Red Reverse",
            "color": "red",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:wild4:0",
            "label": "Wild +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "+4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:6:1",
            "label": "Red 6",
            "color": "red",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:5:0",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:reverse:1",
            "label": "Green Reverse",
            "color": "green",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:8:1",
            "label": "Red 8",
            "color": "red",
            "subtitle": "UNO",
            "value": "8",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:2:1",
            "label": "Blue 2",
            "color": "blue",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:2:1",
            "label": "Yellow 2",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:6:0",
            "label": "Red 6",
            "color": "red",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:draw2:1",
            "label": "Green +2",
            "color": "green",
            "subtitle": "UNO",
            "value": "+2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:3:0",
            "label": "Red 3",
            "color": "red",
            "subtitle": "UNO",
            "value": "3",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:2:0",
            "label": "Yellow 2",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:1:1",
            "label": "Blue 1",
            "color": "blue",
            "subtitle": "UNO",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:wild4:3",
            "label": "Wild +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "+4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:draw2:1",
            "label": "Red +2",
            "color": "red",
            "subtitle": "UNO",
            "value": "+2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:8:1",
            "label": "Yellow 8",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "8",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:1:0",
            "label": "Blue 1",
            "color": "blue",
            "subtitle": "UNO",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:3:1",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:6:1",
            "label": "Green 6",
            "color": "green",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:8:0",
            "label": "Green 8",
            "color": "green",
            "subtitle": "UNO",
            "value": "8",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:skip:1",
            "label": "Red Skip",
            "color": "red",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:skip:0",
            "label": "Blue Skip",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:2:1",
            "label": "Green 2",
            "color": "green",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:skip:1",
            "label": "Yellow Skip",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:reverse:0",
            "label": "Red Reverse",
            "color": "red",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:5:0",
            "label": "Green 5",
            "color": "green",
            "subtitle": "UNO",
            "value": "5",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:6:1",
            "label": "Blue 6",
            "color": "blue",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:3:0",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:0:0",
            "label": "Green 0",
            "color": "green",
            "subtitle": "UNO",
            "value": "0",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:5:0",
            "label": "Red 5",
            "color": "red",
            "subtitle": "UNO",
            "value": "5",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:9:0",
            "label": "Blue 9",
            "color": "blue",
            "subtitle": "UNO",
            "value": "9",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:6:0",
            "label": "Green 6",
            "color": "green",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:3:1",
            "label": "Red 3",
            "color": "red",
            "subtitle": "UNO",
            "value": "3",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:7:0",
            "label": "Green 7",
            "color": "green",
            "subtitle": "UNO",
            "value": "7",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:skip:0",
            "label": "Yellow Skip",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:1:1",
            "label": "Red 1",
            "color": "red",
            "subtitle": "UNO",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "red:2:1",
          "label": "Red 2",
          "color": "red",
          "subtitle": "UNO",
          "value": "2",
          "suit": "",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.117695,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117697,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:2:0",
            "label": "Blue 2",
            "color": "blue",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:4:1",
            "label": "Green 4",
            "color": "green",
            "subtitle": "UNO",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:reverse:2",
            "label": "Green Reverse",
            "color": "green",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:3:0",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:5:0",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:reverse4:2",
            "label": "Wild Reverse +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Reverse +4",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "green:6:1",
          "label": "Green 6",
          "color": "green",
          "subtitle": "UNO",
          "value": "6",
          "suit": "",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.117862,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117864,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1178648,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117866,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117867,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.117868,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:2:0",
            "label": "Blue 2",
            "color": "blue",
            "subtitle": "UNO",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:4:1",
            "label": "Green 4",
            "color": "green",
            "subtitle": "UNO",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:reverse:2",
            "label": "Green Reverse",
            "color": "green",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:3:0",
            "label": "Green 3",
            "color": "green",
            "subtitle": "UNO",
            "value": "3",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:5:0",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:reverse4:2",
            "label": "Wild Reverse +4",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Reverse +4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:wild10:6",
            "label": "Wild +10",
            "color": "wild",
            "subtitle": "UNO",
            "value": "+10",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:6:0",
            "label": "Blue 6",
            "color": "blue",
            "subtitle": "UNO",
            "value": "6",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:draw4:0",
            "label": "Green +4",
            "color": "green",
            "subtitle": "UNO",
            "value": "+4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:draw2:0",
            "label": "Green +2",
            "color": "green",
            "subtitle": "UNO",
            "value": "+2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:5:1",
            "label": "Yellow 5",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "5",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:skip:2",
            "label": "Blue Skip",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Skip",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:draw2:1",
            "label": "Yellow +2",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "+2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:reverse:1",
            "label": "Blue Reverse",
            "color": "blue",
            "subtitle": "UNO",
            "value": "Reverse",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:roulette:3",
            "label": "Wild Colour roulette",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Colour roulette",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "green:discard_all:1",
            "label": "Green Discard all",
            "color": "green",
            "subtitle": "UNO",
            "value": "Discard all",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:0:0",
            "label": "Red 0",
            "color": "red",
            "subtitle": "UNO",
            "value": "0",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "blue:4:1",
            "label": "Blue 4",
            "color": "blue",
            "subtitle": "UNO",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "yellow:8:1",
            "label": "Yellow 8",
            "color": "yellow",
            "subtitle": "UNO",
            "value": "8",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:discard_all:0",
            "label": "Red Discard all",
            "color": "red",
            "subtitle": "UNO",
            "value": "Discard all",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:7:0",
            "label": "Red 7",
            "color": "red",
            "subtitle": "UNO",
            "value": "7",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "wild:roulette:0",
            "label": "Wild Colour roulette",
            "color": "wild",
            "subtitle": "UNO",
            "value": "Colour roulette",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "red:draw2:1",
            "label": "Red +2",
            "color": "red",
            "subtitle": "UNO",
            "value": "+2",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": {
          "id": "green:2:1",
          "label": "Green 2",
          "color": "green",
          "subtitle": "UNO",
          "value": "2",
          "suit": "",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1180649,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118067,
          "is_bot": false
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
            "suit": "action",
            "colors": [
              "green",
              "blue"
            ],
            "effect": "rent"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property",
            "colors": [
              "green",
              "blue"
            ],
            "effect": ""
          },
          {
            "id": "d103",
            "label": "Hotel",
            "color": "neutral",
            "subtitle": "Hotel",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "hotel"
          },
          {
            "id": "d038",
            "label": "Green",
            "color": "green",
            "subtitle": "Green",
            "value": "4M",
            "suit": "property",
            "colors": [
              "green"
            ],
            "effect": ""
          },
          {
            "id": "d046",
            "label": "Utility",
            "color": "utility",
            "subtitle": "Utility",
            "value": "2M",
            "suit": "property",
            "colors": [
              "utility"
            ],
            "effect": ""
          },
          {
            "id": "d069",
            "label": "Rent",
            "color": "brown",
            "subtitle": "Rent",
            "value": "3M",
            "suit": "action",
            "colors": [
              "brown",
              "sky",
              "pink",
              "orange",
              "red",
              "yellow",
              "green",
              "blue",
              "rail",
              "utility"
            ],
            "effect": "rent"
          },
          {
            "id": "d084",
            "label": "Just say no",
            "color": "neutral",
            "subtitle": "Just say no",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "no"
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
          "pending": null,
          "payment_amount": 0
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1182091,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.11821,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118211,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118212,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1182132,
          "is_bot": false
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
            "suit": "action",
            "colors": [
              "green",
              "blue"
            ],
            "effect": "rent"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property",
            "colors": [
              "green",
              "blue"
            ],
            "effect": ""
          },
          {
            "id": "d103",
            "label": "Hotel",
            "color": "neutral",
            "subtitle": "Hotel",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "hotel"
          },
          {
            "id": "d038",
            "label": "Green",
            "color": "green",
            "subtitle": "Green",
            "value": "4M",
            "suit": "property",
            "colors": [
              "green"
            ],
            "effect": ""
          },
          {
            "id": "d046",
            "label": "Utility",
            "color": "utility",
            "subtitle": "Utility",
            "value": "2M",
            "suit": "property",
            "colors": [
              "utility"
            ],
            "effect": ""
          },
          {
            "id": "d007",
            "label": "2M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "2M",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "d082",
            "label": "Just say no",
            "color": "neutral",
            "subtitle": "Just say no",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "no"
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
          "pending": null,
          "payment_amount": 0
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1183329,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118334,
          "is_bot": false
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
            "suit": "action",
            "colors": [
              "rail",
              "utility"
            ],
            "effect": "rent_double"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property",
            "colors": [
              "green",
              "rail"
            ],
            "effect": ""
          },
          {
            "id": "d103",
            "label": "Super sly deal",
            "color": "neutral",
            "subtitle": "Super sly deal",
            "value": "3M",
            "suit": "action",
            "colors": [],
            "effect": "super_sly"
          },
          {
            "id": "d038",
            "label": "Blue",
            "color": "blue",
            "subtitle": "Blue",
            "value": "4M",
            "suit": "property",
            "colors": [
              "blue"
            ],
            "effect": ""
          },
          {
            "id": "d046",
            "label": "Wild property",
            "color": "brown",
            "subtitle": "Wild property",
            "value": "1M",
            "suit": "property",
            "colors": [
              "brown",
              "sky"
            ],
            "effect": ""
          },
          {
            "id": "d069",
            "label": "Rent",
            "color": "brown",
            "subtitle": "Rent",
            "value": "3M",
            "suit": "action",
            "colors": [
              "brown",
              "sky",
              "pink",
              "orange",
              "red",
              "yellow",
              "green",
              "blue",
              "rail",
              "utility"
            ],
            "effect": "rent"
          },
          {
            "id": "d084",
            "label": "Heist",
            "color": "neutral",
            "subtitle": "Heist",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "heist"
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
          "pending": null,
          "payment_amount": 0
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.118463,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118464,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118465,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1184661,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118467,
          "is_bot": false
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
            "suit": "action",
            "colors": [
              "rail",
              "utility"
            ],
            "effect": "rent_double"
          },
          {
            "id": "d053",
            "label": "Wild property",
            "color": "green",
            "subtitle": "Wild property",
            "value": "4M",
            "suit": "property",
            "colors": [
              "green",
              "rail"
            ],
            "effect": ""
          },
          {
            "id": "d103",
            "label": "Super sly deal",
            "color": "neutral",
            "subtitle": "Super sly deal",
            "value": "3M",
            "suit": "action",
            "colors": [],
            "effect": "super_sly"
          },
          {
            "id": "d038",
            "label": "Blue",
            "color": "blue",
            "subtitle": "Blue",
            "value": "4M",
            "suit": "property",
            "colors": [
              "blue"
            ],
            "effect": ""
          },
          {
            "id": "d046",
            "label": "Wild property",
            "color": "brown",
            "subtitle": "Wild property",
            "value": "1M",
            "suit": "property",
            "colors": [
              "brown",
              "sky"
            ],
            "effect": ""
          },
          {
            "id": "d017",
            "label": "15M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "15M",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "d070",
            "label": "Double rent",
            "color": "brown",
            "subtitle": "Double rent",
            "value": "3M",
            "suit": "action",
            "colors": [
              "brown",
              "sky",
              "pink",
              "orange",
              "red",
              "yellow",
              "green",
              "blue",
              "rail",
              "utility"
            ],
            "effect": "rent_double"
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
          "pending": null,
          "payment_amount": 0
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.118596,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118597,
          "is_bot": false
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
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2D:0",
            "label": "2 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "2",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1187,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118701,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1187022,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1187031,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118704,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1187048,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118706,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118707,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118708,
          "is_bot": false
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
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2D:0",
            "label": "2 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "2",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1187992,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1188,
          "is_bot": false
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
            "suit": "\u2660",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AC:1",
            "label": "A \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "A",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AD:0",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9C:0",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "KD:0",
            "label": "K \u2666",
            "color": "red",
            "subtitle": "",
            "value": "K",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "JH:0",
            "label": "J \u2665",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9C:1",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AD:1",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8C:1",
            "label": "8 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "8",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6H:1",
            "label": "6 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "6",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8D:1",
            "label": "8 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "8",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "JD:0",
            "label": "J \u2666",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3H:0",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [
          {
            "id": "3H:1",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          }
        ],
        "discard": {
          "id": "AH:0",
          "label": "A \u2665",
          "color": "red",
          "subtitle": "",
          "value": "A",
          "suit": "\u2665",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.118913,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1189141,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118915,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118916,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.118916,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1189172,
          "is_bot": false
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
            "suit": "\u2660",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AC:1",
            "label": "A \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "A",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AD:0",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9C:0",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "KD:0",
            "label": "K \u2666",
            "color": "red",
            "subtitle": "",
            "value": "K",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "JH:0",
            "label": "J \u2665",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9C:1",
            "label": "9 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "9",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AD:1",
            "label": "A \u2666",
            "color": "red",
            "subtitle": "",
            "value": "A",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8C:1",
            "label": "8 \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "8",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6H:1",
            "label": "6 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "6",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8D:1",
            "label": "8 \u2666",
            "color": "red",
            "subtitle": "",
            "value": "8",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "JD:0",
            "label": "J \u2666",
            "color": "red",
            "subtitle": "",
            "value": "J",
            "suit": "\u2666",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3H:0",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [
          {
            "id": "3H:1",
            "label": "3 \u2665",
            "color": "red",
            "subtitle": "",
            "value": "3",
            "suit": "\u2665",
            "colors": [],
            "effect": ""
          }
        ],
        "discard": {
          "id": "7S:0",
          "label": "7 \u2660",
          "color": "ink",
          "subtitle": "",
          "value": "7",
          "suit": "\u2660",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.119015,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119016,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.119096,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119097,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1190982,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119099,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1190999,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1191008,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.11923,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.119353,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119354,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119355,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119356,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1193569,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119358,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119359,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1194592,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.11946,
          "is_bot": false
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
          "suit": "",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.119607,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1196082,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119609,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.11961,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1196108,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119612,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119613,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.119614,
          "is_bot": false
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
          "suit": "",
          "colors": [],
          "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.119733,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.12171,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.12205,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1220522,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "Row 5, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "36",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "37",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "38",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "39",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.122188,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.12219,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "Row 5, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "36",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "37",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "38",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "39",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.122307,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1223092,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Row 1, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Row 2, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Row 3, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 4",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "Row 4, column 5",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "Row 4, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "Row 5, column 4",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "36",
            "label": "Row 5, column 5",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "37",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "38",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "39",
            "label": "Row 5, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "42",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "43",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "44",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "45",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "46",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "47",
            "label": "Row 6, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "48",
            "label": "Row 7, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "49",
            "label": "Row 7, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "50",
            "label": "Row 7, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "51",
            "label": "Row 7, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "52",
            "label": "Row 7, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "53",
            "label": "Row 7, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "54",
            "label": "Row 7, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "55",
            "label": "Row 7, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "56",
            "label": "Row 8, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "57",
            "label": "Row 8, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "58",
            "label": "Row 8, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "59",
            "label": "Row 8, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "60",
            "label": "Row 8, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "61",
            "label": "Row 8, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "62",
            "label": "Row 8, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "63",
            "label": "Row 8, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1227698,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.122771,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Row 1, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Row 1, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Row 1, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Row 1, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Row 1, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Row 1, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Row 1, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Row 2, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Row 2, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Row 2, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Row 2, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Row 2, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Row 2, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Row 2, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Row 2, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Row 3, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Row 3, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Row 3, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Row 3, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Row 3, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Row 3, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Row 3, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Row 3, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Row 4, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "Row 4, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "Row 4, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "Row 4, column 4",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "Row 4, column 5",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "Row 4, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "Row 4, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "Row 4, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "Row 5, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "Row 5, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "Row 5, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "Row 5, column 4",
            "color": "ink",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "36",
            "label": "Row 5, column 5",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "37",
            "label": "Row 5, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "38",
            "label": "Row 5, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "39",
            "label": "Row 5, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "40",
            "label": "Row 6, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "41",
            "label": "Row 6, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "42",
            "label": "Row 6, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "43",
            "label": "Row 6, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "44",
            "label": "Row 6, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "45",
            "label": "Row 6, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "46",
            "label": "Row 6, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "47",
            "label": "Row 6, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "48",
            "label": "Row 7, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "49",
            "label": "Row 7, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "50",
            "label": "Row 7, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "51",
            "label": "Row 7, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "52",
            "label": "Row 7, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "53",
            "label": "Row 7, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "54",
            "label": "Row 7, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "55",
            "label": "Row 7, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "56",
            "label": "Row 8, column 1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "57",
            "label": "Row 8, column 2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "58",
            "label": "Row 8, column 3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "59",
            "label": "Row 8, column 4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "60",
            "label": "Row 8, column 5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "61",
            "label": "Row 8, column 6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "62",
            "label": "Row 8, column 7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "63",
            "label": "Row 8, column 8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.123008,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123009,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1230102,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123011,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Puzzle",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Puzzle",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Cave",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Cave",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Tea",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tea",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Sky",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sky",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Bone",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Bone",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Honey",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Honey",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Magnet",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Magnet",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Branch",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Branch",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Pilot",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Pilot",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Paint",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Paint",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Winter",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Winter",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Sand",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sand",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Coast",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Coast",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Stone",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Stone",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Wheel",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Wheel",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Wave",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Wave",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Jazz",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Jazz",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Atlas",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Atlas",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Moon",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Moon",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Lantern",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Lantern",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Rocket",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Rocket",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Bicycle",
            "color": "assassin",
            "subtitle": "hidden",
            "value": "Bicycle",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Tomato",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tomato",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Kite",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Kite",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.123172,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123174,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123175,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1231759,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123177,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123178,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123178,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123179,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1231802,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123181,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Puzzle",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Puzzle",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Cave",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Cave",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Tea",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tea",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Sky",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sky",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Bone",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Bone",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Honey",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Honey",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Magnet",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Magnet",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Branch",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Branch",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Pilot",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Pilot",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Paint",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Paint",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Winter",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Winter",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Sand",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Sand",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Coast",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Coast",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Stone",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Stone",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Wheel",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Wheel",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Wave",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Wave",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Jazz",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Jazz",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Atlas",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Atlas",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Moon",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Moon",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Lantern",
            "color": "neutral",
            "subtitle": "hidden",
            "value": "Lantern",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Rocket",
            "color": "blue",
            "subtitle": "hidden",
            "value": "Rocket",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Bicycle",
            "color": "assassin",
            "subtitle": "hidden",
            "value": "Bicycle",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Tomato",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Tomato",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Kite",
            "color": "coral",
            "subtitle": "hidden",
            "value": "Kite",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1233332,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123335,
          "is_bot": false
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
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-1-emerald-2",
            "label": "Emerald Workshop",
            "color": "emerald",
            "subtitle": "2 onyx \u00b7 2 sapphire",
            "value": "0",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-1-ruby-3",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "1 ruby \u00b7 1 emerald \u00b7 1 onyx \u00b7 1 pearl \u00b7 1 sapphire",
            "value": "1",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-1-ruby-7",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "4 onyx",
            "value": "1",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-ruby-4",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "4 emerald \u00b7 2 onyx \u00b7 2 sapphire",
            "value": "3",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-onyx-3",
            "label": "Onyx Guild",
            "color": "onyx",
            "subtitle": "2 onyx \u00b7 2 pearl \u00b7 2 sapphire \u00b7 2 ruby",
            "value": "2",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-ruby-3",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "2 ruby \u00b7 2 emerald \u00b7 2 onyx \u00b7 2 pearl",
            "value": "2",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-emerald-2",
            "label": "Emerald Guild",
            "color": "emerald",
            "subtitle": "3 onyx \u00b7 3 sapphire \u00b7 2 ruby",
            "value": "3",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-pearl-2",
            "label": "Pearl Palace",
            "color": "pearl",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby \u00b7 3 emerald",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-ruby-0",
            "label": "Ruby Palace",
            "color": "ruby",
            "subtitle": "3 emerald \u00b7 3 onyx \u00b7 5 pearl",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-sapphire-2",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 emerald \u00b7 3 onyx",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-sapphire-0",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 ruby \u00b7 3 emerald \u00b7 5 onyx",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-4",
            "label": "Patron 5",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-7",
            "label": "Patron 8",
            "color": "gold",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-0",
            "label": "Patron 1",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
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
            "gem-1-ruby-7": {
              "tier": 1,
              "cost": {
                "onyx": 4
              },
              "bonus": "ruby",
              "points": 1
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
            "gem-1-emerald-2": {
              "tier": 1,
              "cost": {
                "onyx": 2,
                "sapphire": 2
              },
              "bonus": "emerald",
              "points": 0
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.123681,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.123683,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1236842,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1236851,
          "is_bot": false
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
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-1-emerald-2",
            "label": "Emerald Workshop",
            "color": "emerald",
            "subtitle": "2 onyx \u00b7 2 sapphire",
            "value": "0",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-1-ruby-3",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "1 ruby \u00b7 1 emerald \u00b7 1 onyx \u00b7 1 pearl \u00b7 1 sapphire",
            "value": "1",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-1-ruby-7",
            "label": "Ruby Workshop",
            "color": "ruby",
            "subtitle": "4 onyx",
            "value": "1",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-ruby-4",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "4 emerald \u00b7 2 onyx \u00b7 2 sapphire",
            "value": "3",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-onyx-3",
            "label": "Onyx Guild",
            "color": "onyx",
            "subtitle": "2 onyx \u00b7 2 pearl \u00b7 2 sapphire \u00b7 2 ruby",
            "value": "2",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-ruby-3",
            "label": "Ruby Guild",
            "color": "ruby",
            "subtitle": "2 ruby \u00b7 2 emerald \u00b7 2 onyx \u00b7 2 pearl",
            "value": "2",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-2-emerald-2",
            "label": "Emerald Guild",
            "color": "emerald",
            "subtitle": "3 onyx \u00b7 3 sapphire \u00b7 2 ruby",
            "value": "3",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-pearl-2",
            "label": "Pearl Palace",
            "color": "pearl",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby \u00b7 3 emerald",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-ruby-0",
            "label": "Ruby Palace",
            "color": "ruby",
            "subtitle": "3 emerald \u00b7 3 onyx \u00b7 5 pearl",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-sapphire-2",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 emerald \u00b7 3 onyx",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "gem-3-sapphire-0",
            "label": "Sapphire Palace",
            "color": "sapphire",
            "subtitle": "3 ruby \u00b7 3 emerald \u00b7 5 onyx",
            "value": "4",
            "suit": "development",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-4",
            "label": "Patron 5",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-7",
            "label": "Patron 8",
            "color": "gold",
            "subtitle": "3 sapphire \u00b7 3 ruby \u00b7 3 onyx",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-0",
            "label": "Patron 1",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 ruby",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-5",
            "label": "Patron 6",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 emerald \u00b7 3 onyx",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
          },
          {
            "id": "patron-1",
            "label": "Patron 2",
            "color": "gold",
            "subtitle": "3 pearl \u00b7 3 sapphire \u00b7 3 emerald",
            "value": "3",
            "suit": "patron",
            "colors": [],
            "effect": ""
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
            "gem-1-ruby-7": {
              "tier": 1,
              "cost": {
                "onyx": 4
              },
              "bonus": "ruby",
              "points": 1
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
            "gem-1-emerald-2": {
              "tier": 1,
              "cost": {
                "onyx": 2,
                "sapphire": 2
              },
              "bonus": "emerald",
              "points": 0
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1240819,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124083,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "B8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "C8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "D8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "E8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "F8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "G8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "H8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "A7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "B7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "C7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "D7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "E7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "F7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "G7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "H7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "A6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "B6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "C6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "D6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "E6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "F6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "G6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "H6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "A5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "B5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "C5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "D5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "E5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "F5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "G5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "H5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "A4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "B4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "C4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "D4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "36",
            "label": "E4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "37",
            "label": "F4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "38",
            "label": "G4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "39",
            "label": "H4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "40",
            "label": "A3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "41",
            "label": "B3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "42",
            "label": "C3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "43",
            "label": "D3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "44",
            "label": "E3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "45",
            "label": "F3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "46",
            "label": "G3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "47",
            "label": "H3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "48",
            "label": "A2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "49",
            "label": "B2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "50",
            "label": "C2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "51",
            "label": "D2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "52",
            "label": "E2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "53",
            "label": "F2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "54",
            "label": "G2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "55",
            "label": "H2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "56",
            "label": "A1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "57",
            "label": "B1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "58",
            "label": "C1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "59",
            "label": "D1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "60",
            "label": "E1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "61",
            "label": "F1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "62",
            "label": "G1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "63",
            "label": "H1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1242728,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124274,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "B8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "C8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "D8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "E8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "F8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "G8",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "H8",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "A7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "B7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "C7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "D7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "E7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "F7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "G7",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "H7",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "A6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "B6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "C6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "D6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "E6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "F6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "G6",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "H6",
            "color": "ivory",
            "subtitle": "",
            "value": "2",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "A5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "B5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "C5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "D5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "E5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "F5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "G5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "H5",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "A4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "B4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "C4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "D4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "36",
            "label": "E4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "37",
            "label": "F4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "38",
            "label": "G4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "39",
            "label": "H4",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "40",
            "label": "A3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "41",
            "label": "B3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "42",
            "label": "C3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "43",
            "label": "D3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "44",
            "label": "E3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "45",
            "label": "F3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "46",
            "label": "G3",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "47",
            "label": "H3",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "48",
            "label": "A2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "49",
            "label": "B2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "50",
            "label": "C2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "51",
            "label": "D2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "52",
            "label": "E2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "53",
            "label": "F2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "54",
            "label": "G2",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "55",
            "label": "H2",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "56",
            "label": "A1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "57",
            "label": "B1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "58",
            "label": "C1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "59",
            "label": "D1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "60",
            "label": "E1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "61",
            "label": "F1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "62",
            "label": "G1",
            "color": "coral",
            "subtitle": "",
            "value": "1",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "63",
            "label": "H1",
            "color": "empty",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.124445,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1244469,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Pit 2",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Pit 3",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Pit 4",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Pit 5",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Pit 6",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Store",
            "color": "sage",
            "subtitle": "",
            "value": "0",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Pit 1",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Pit 2",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Pit 3",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Pit 4",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Pit 5",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Pit 6",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Store",
            "color": "ochre",
            "subtitle": "",
            "value": "0",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.124521,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124523,
          "is_bot": false
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
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Pit 2",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Pit 3",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Pit 4",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Pit 5",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Pit 6",
            "color": "sage",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Store",
            "color": "sage",
            "subtitle": "",
            "value": "0",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Pit 1",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Pit 2",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Pit 3",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Pit 4",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Pit 5",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Pit 6",
            "color": "ochre",
            "subtitle": "",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Store",
            "color": "ochre",
            "subtitle": "",
            "value": "0",
            "suit": "",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.124653,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124655,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1246562,
          "is_bot": false
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.124801,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124802,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124803,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124804,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1248052,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124806,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124807,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124807,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1248078,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124809,
          "is_bot": false
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
                "suit": "\u2726",
                "colors": [],
                "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.124931,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124932,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.124933,
          "is_bot": false
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
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-7-1",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-7-0",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-8-2",
            "label": "Trio 8",
            "color": "violet",
            "subtitle": "",
            "value": "8",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-8-1",
            "label": "Trio 8",
            "color": "violet",
            "subtitle": "",
            "value": "8",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-9-2",
            "label": "Trio 9",
            "color": "violet",
            "subtitle": "",
            "value": "9",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-9-0",
            "label": "Trio 9",
            "color": "violet",
            "subtitle": "",
            "value": "9",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-10-1",
            "label": "Trio 10",
            "color": "violet",
            "subtitle": "",
            "value": "10",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-12-0",
            "label": "Trio 12",
            "color": "violet",
            "subtitle": "",
            "value": "12",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [
          {
            "id": "table-slot-0",
            "label": "Table position 1",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-1",
            "label": "Table position 2",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-2",
            "label": "Table position 3",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-3",
            "label": "Table position 4",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-4",
            "label": "Table position 5",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-5",
            "label": "Table position 6",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-6",
            "label": "Table position 7",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-7",
            "label": "Table position 8",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-8",
            "label": "Table position 9",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.125081,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125082,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125083,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125084,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1250849,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125086,
          "is_bot": false
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
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-7-0",
            "label": "Trio 7",
            "color": "yellow",
            "subtitle": "",
            "value": "7",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-8-2",
            "label": "Trio 8",
            "color": "violet",
            "subtitle": "",
            "value": "8",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-9-2",
            "label": "Trio 9",
            "color": "violet",
            "subtitle": "",
            "value": "9",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          },
          {
            "id": "trio-12-0",
            "label": "Trio 12",
            "color": "violet",
            "subtitle": "",
            "value": "12",
            "suit": "\u2726",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [
          {
            "id": "table-slot-0",
            "label": "Table position 1",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-1",
            "label": "Table position 2",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-2",
            "label": "Table position 3",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-3",
            "label": "Table position 4",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-4",
            "label": "Table position 5",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
          },
          {
            "id": "table-slot-5",
            "label": "Table position 6",
            "color": "neutral",
            "subtitle": "",
            "value": "?",
            "suit": "hidden",
            "colors": [],
            "effect": ""
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1252391,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125241,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1254442,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1254451,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1254458,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1254468,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.125708,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125709,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.12571,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.125802,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125803,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125804,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1258051,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125806,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125807,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125807,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1258082,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125809,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.12581,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.1258821,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1258829,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1258838,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.125996,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125997,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.125998,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1259992,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1260002,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126001,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1260018,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1260018,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126003,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126004,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.126105,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126106,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126107,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
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
          "last_seen": 1793545466.126233,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126234,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1262348,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126236,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1262379,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126239,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.12624,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126241,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1262422,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126243,
          "is_bot": false
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
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "The Gang \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "3e98e748-e35f-5929-a409-a05701ec699f",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "the-gang",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "950f704d-aa4d-5244-8c63-418b05c534ec",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1263418,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126343,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126344,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "the-gang",
        "phase": "chips",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "JC:0",
            "label": "J \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "J",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AC:0",
            "label": "A \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "A",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 46,
        "pot": 0,
        "message": "Estimate your pocket cards. Everyone can take a white chip.",
        "actions": [
          {
            "label": "Take 1-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 1,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 2-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 2,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 3-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 3,
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
          "heist": 1,
          "street": 0,
          "vaults": 0,
          "alarms": 0,
          "chips": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": null,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": null,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": null
          },
          "history": [],
          "revealed": [],
          "last_success": null,
          "own_hand_name": null,
          "decision_mode": "simultaneous",
          "pending_players": [
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4"
          ],
          "hand_names": {}
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "The Gang \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "9a48518c-0331-5b79-8a60-bb4c5c42b6f6",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "the-gang",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 6,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "950f704d-aa4d-5244-8c63-418b05c534ec",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126459,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126461,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126462,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126463,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126464,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126465,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "the-gang",
        "phase": "chips",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          },
          {
            "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [
              null,
              null
            ],
            "bank": [],
            "properties": {}
          }
        ],
        "hand": [
          {
            "id": "JC:0",
            "label": "J \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "J",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          },
          {
            "id": "AC:0",
            "label": "A \u2663",
            "color": "ink",
            "subtitle": "",
            "value": "A",
            "suit": "\u2663",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 40,
        "pot": 0,
        "message": "Estimate your pocket cards. Everyone can take a white chip.",
        "actions": [
          {
            "label": "Take 1-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 1,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 2-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 2,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 3-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 3,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 4-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 4,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 5-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 5,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Take 6-star chip",
            "action": {
              "type": "claim_chip",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 6,
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
          "heist": 1,
          "street": 0,
          "vaults": 0,
          "alarms": 0,
          "chips": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": null,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": null,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": null,
            "19285837-cef0-568b-9a40-febfd6a8cb39": null,
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": null,
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46": null
          },
          "history": [],
          "revealed": [],
          "last_success": null,
          "own_hand_name": null,
          "decision_mode": "simultaneous",
          "pending_players": [
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "19285837-cef0-568b-9a40-febfd6a8cb39",
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46"
          ],
          "hand_names": {}
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "6 nimmt! \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "3679dbdf-bc39-5241-a698-ee6462dd5f5c",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "six-nimmt",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "adb12bd6-ad14-5e82-b976-6db3cf1b3224",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126582,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126583,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "six-nimmt",
        "phase": "selecting",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 10,
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
            "count": 10,
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
            "id": "number-4",
            "label": "4, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-36",
            "label": "36, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "36",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-39",
            "label": "39, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "39",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-40",
            "label": "40, 3 penalty points",
            "color": "yellow",
            "subtitle": "3",
            "value": "40",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-53",
            "label": "53, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "53",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-54",
            "label": "54, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "54",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-58",
            "label": "58, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "58",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-81",
            "label": "81, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "81",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-97",
            "label": "97, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "97",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-98",
            "label": "98, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "98",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 80,
        "pot": 0,
        "message": "Everyone chooses one private card. The lowest revealed number resolves first.",
        "actions": [
          {
            "label": "Lock 4",
            "action": {
              "type": "select_number",
              "card": "number-4",
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
            "label": "Lock 36",
            "action": {
              "type": "select_number",
              "card": "number-36",
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
            "label": "Lock 39",
            "action": {
              "type": "select_number",
              "card": "number-39",
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
            "label": "Lock 40",
            "action": {
              "type": "select_number",
              "card": "number-40",
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
            "label": "Lock 53",
            "action": {
              "type": "select_number",
              "card": "number-53",
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
            "label": "Lock 54",
            "action": {
              "type": "select_number",
              "card": "number-54",
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
            "label": "Lock 58",
            "action": {
              "type": "select_number",
              "card": "number-58",
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
            "label": "Lock 81",
            "action": {
              "type": "select_number",
              "card": "number-81",
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
            "label": "Lock 97",
            "action": {
              "type": "select_number",
              "card": "number-97",
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
            "label": "Lock 98",
            "action": {
              "type": "select_number",
              "card": "number-98",
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
          "trick": 1,
          "rows": [
            [
              {
                "id": "number-5",
                "label": "5, 2 penalty points",
                "color": "blue",
                "subtitle": "2",
                "value": "5",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ],
            [
              {
                "id": "number-84",
                "label": "84, 1 penalty point",
                "color": "green",
                "subtitle": "1",
                "value": "84",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ],
            [
              {
                "id": "number-47",
                "label": "47, 1 penalty point",
                "color": "green",
                "subtitle": "1",
                "value": "47",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ],
            [
              {
                "id": "number-45",
                "label": "45, 2 penalty points",
                "color": "blue",
                "subtitle": "2",
                "value": "45",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ]
          ],
          "row_penalties": [
            2,
            1,
            1,
            2
          ],
          "selected_players": [],
          "own_selection": null,
          "revealed": [],
          "round_penalties": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 0
          },
          "total_penalties": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 0
          },
          "round_scores": {},
          "pending_player": null,
          "decision_mode": "simultaneous",
          "pending_players": [
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165"
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "6 nimmt! \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "28210144-d34b-5acc-9131-75c8fdfb2098",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "six-nimmt",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 10,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "adb12bd6-ad14-5e82-b976-6db3cf1b3224",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126852,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126854,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126854,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126855,
          "is_bot": false
        },
        {
          "id": "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
          "name": "Noor",
          "avatar": 4,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1268559,
          "is_bot": false
        },
        {
          "id": "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
          "name": "Alex",
          "avatar": 5,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126857,
          "is_bot": false
        },
        {
          "id": "d03315f3-275f-534f-915a-d668855c7de9",
          "name": "Jules",
          "avatar": 6,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126858,
          "is_bot": false
        },
        {
          "id": "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
          "name": "Kai",
          "avatar": 7,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126859,
          "is_bot": false
        },
        {
          "id": "a8e0bd43-e804-5665-9c48-c5581447c0fe",
          "name": "Robin",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1268601,
          "is_bot": false
        },
        {
          "id": "3e67b5ca-94db-57c3-b0e1-f1d5ad017207",
          "name": "Ari",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.126861,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "six-nimmt",
        "phase": "selecting",
        "current_player": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
        "players": [
          {
            "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "count": 10,
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
            "id": "number-4",
            "label": "4, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "4",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-36",
            "label": "36, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "36",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-39",
            "label": "39, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "39",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-40",
            "label": "40, 3 penalty points",
            "color": "yellow",
            "subtitle": "3",
            "value": "40",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-53",
            "label": "53, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "53",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-54",
            "label": "54, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "54",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-58",
            "label": "58, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "58",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-81",
            "label": "81, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "81",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-97",
            "label": "97, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "97",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "number-98",
            "label": "98, 1 penalty point",
            "color": "green",
            "subtitle": "1",
            "value": "98",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "Everyone chooses one private card. The lowest revealed number resolves first.",
        "actions": [
          {
            "label": "Lock 4",
            "action": {
              "type": "select_number",
              "card": "number-4",
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
            "label": "Lock 36",
            "action": {
              "type": "select_number",
              "card": "number-36",
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
            "label": "Lock 39",
            "action": {
              "type": "select_number",
              "card": "number-39",
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
            "label": "Lock 40",
            "action": {
              "type": "select_number",
              "card": "number-40",
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
            "label": "Lock 53",
            "action": {
              "type": "select_number",
              "card": "number-53",
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
            "label": "Lock 54",
            "action": {
              "type": "select_number",
              "card": "number-54",
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
            "label": "Lock 58",
            "action": {
              "type": "select_number",
              "card": "number-58",
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
            "label": "Lock 81",
            "action": {
              "type": "select_number",
              "card": "number-81",
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
            "label": "Lock 97",
            "action": {
              "type": "select_number",
              "card": "number-97",
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
            "label": "Lock 98",
            "action": {
              "type": "select_number",
              "card": "number-98",
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
          "trick": 1,
          "rows": [
            [
              {
                "id": "number-42",
                "label": "42, 1 penalty point",
                "color": "green",
                "subtitle": "1",
                "value": "42",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ],
            [
              {
                "id": "number-52",
                "label": "52, 1 penalty point",
                "color": "green",
                "subtitle": "1",
                "value": "52",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ],
            [
              {
                "id": "number-77",
                "label": "77, 5 penalty points",
                "color": "red",
                "subtitle": "5",
                "value": "77",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ],
            [
              {
                "id": "number-11",
                "label": "11, 5 penalty points",
                "color": "red",
                "subtitle": "5",
                "value": "11",
                "suit": "",
                "colors": [],
                "effect": ""
              }
            ]
          ],
          "row_penalties": [
            1,
            1,
            5,
            5
          ],
          "selected_players": [],
          "own_selection": null,
          "revealed": [],
          "round_penalties": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 0,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": 0,
            "19285837-cef0-568b-9a40-febfd6a8cb39": 0,
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": 0,
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46": 0,
            "d03315f3-275f-534f-915a-d668855c7de9": 0,
            "b99cae13-1a84-5dfe-95f8-3ec6f935de22": 0,
            "a8e0bd43-e804-5665-9c48-c5581447c0fe": 0,
            "3e67b5ca-94db-57c3-b0e1-f1d5ad017207": 0
          },
          "total_penalties": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 0,
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4": 0,
            "19285837-cef0-568b-9a40-febfd6a8cb39": 0,
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9": 0,
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46": 0,
            "d03315f3-275f-534f-915a-d668855c7de9": 0,
            "b99cae13-1a84-5dfe-95f8-3ec6f935de22": 0,
            "a8e0bd43-e804-5665-9c48-c5581447c0fe": 0,
            "3e67b5ca-94db-57c3-b0e1-f1d5ad017207": 0
          },
          "round_scores": {},
          "pending_player": null,
          "decision_mode": "simultaneous",
          "pending_players": [
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
            "b34c747c-f55f-5ca1-a9f1-9a962b463165",
            "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
            "19285837-cef0-568b-9a40-febfd6a8cb39",
            "d103ce40-287c-59d3-b3b2-8a3a8bbadaa9",
            "df3573dc-a2a9-5dc8-af2c-e2f432d3fc46",
            "d03315f3-275f-534f-915a-d668855c7de9",
            "b99cae13-1a84-5dfe-95f8-3ec6f935de22",
            "a8e0bd43-e804-5665-9c48-c5581447c0fe",
            "3e67b5ca-94db-57c3-b0e1-f1d5ad017207"
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "Sea Salt & Paper \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "d37c373f-9204-5371-8192-80e1536660fd",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "sea-salt-paper",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "562280bc-b0e1-5695-aeeb-df921c44937d",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.127032,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.127033,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "sea-salt-paper",
        "phase": "draw",
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
        "draw_count": 56,
        "pot": 0,
        "message": "A new tide. Draw from the deck or either discard.",
        "actions": [
          {
            "label": "Draw from deck",
            "action": {
              "type": "take_stock",
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
            "label": "Take discard 1",
            "action": {
              "type": "take_discard",
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
            "label": "Take discard 2",
            "action": {
              "type": "take_discard",
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
          }
        ],
        "winners": [],
        "detail": {
          "round": 1,
          "target": 40,
          "caller": null,
          "protected": [],
          "pile_counts": [
            1,
            1
          ],
          "discard_tops": [
            {
              "id": "paper-octopus-gray-0",
              "label": "Octopus \u00b7 Gray",
              "color": "gray",
              "subtitle": "Collection \u00b7 0 / 3 / 6 / 9 / 12",
              "value": "Octopus",
              "suit": "octopus",
              "colors": [],
              "effect": ""
            },
            {
              "id": "paper-captain-peach-0",
              "label": "Captain \u00b7 Peach",
              "color": "peach",
              "subtitle": "+3 per sailor",
              "value": "Captain",
              "suit": "captain",
              "colors": [],
              "effect": ""
            }
          ],
          "private_options": [],
          "own_points": 0,
          "own_bonus": 0,
          "round_result": {},
          "instant_mermaids": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "Sea Salt & Paper \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "066cc110-c293-5d4b-b42b-c0079680a107",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "sea-salt-paper",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "562280bc-b0e1-5695-aeeb-df921c44937d",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1271732,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.127174,
          "is_bot": false
        },
        {
          "id": "e7bfce63-aea4-51ae-b7c4-ecfe886962d4",
          "name": "Mira",
          "avatar": 2,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1271749,
          "is_bot": false
        },
        {
          "id": "19285837-cef0-568b-9a40-febfd6a8cb39",
          "name": "Sam",
          "avatar": 3,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.127176,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "sea-salt-paper",
        "phase": "draw",
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
        "draw_count": 56,
        "pot": 0,
        "message": "A new tide. Draw from the deck or either discard.",
        "actions": [
          {
            "label": "Draw from deck",
            "action": {
              "type": "take_stock",
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
            "label": "Take discard 1",
            "action": {
              "type": "take_discard",
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
            "label": "Take discard 2",
            "action": {
              "type": "take_discard",
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
          }
        ],
        "winners": [],
        "detail": {
          "round": 1,
          "target": 30,
          "caller": null,
          "protected": [],
          "pile_counts": [
            1,
            1
          ],
          "discard_tops": [
            {
              "id": "paper-octopus-gray-0",
              "label": "Octopus \u00b7 Gray",
              "color": "gray",
              "subtitle": "Collection \u00b7 0 / 3 / 6 / 9 / 12",
              "value": "Octopus",
              "suit": "octopus",
              "colors": [],
              "effect": ""
            },
            {
              "id": "paper-captain-peach-0",
              "label": "Captain \u00b7 Peach",
              "color": "peach",
              "subtitle": "+3 per sailor",
              "value": "Captain",
              "suit": "captain",
              "colors": [],
              "effect": ""
            }
          ],
          "private_options": [],
          "own_points": 0,
          "own_bonus": 0,
          "round_result": {},
          "instant_mermaids": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "boop. \u00b7 minimum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "874a78e4-7e23-5ce2-803d-8ec311800f4a",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "boop",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "adb1eb39-799a-5c48-a31f-34a7450d223f",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.127247,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1272478,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "boop",
        "phase": "placing",
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
            "label": "Empty A1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Empty B1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Empty C1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Empty D1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Empty E1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Empty F1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Empty A2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Empty B2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Empty C2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Empty D2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Empty E2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Empty F2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Empty A3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Empty B3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Empty C3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Empty D3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Empty E3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Empty F3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Empty A4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Empty B4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Empty C4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Empty D4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Empty E4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Empty F4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Empty A5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "Empty B5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "Empty C5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "Empty D5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "Empty E5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "Empty F5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "Empty A6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "Empty B6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "Empty C6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "Empty D6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "Empty E6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "Empty F6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "A cozy bed. Pick a square for your first kitten.",
        "actions": [
          {
            "label": "Place kitten at A1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
          }
        ],
        "winners": [],
        "detail": {
          "pools": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": {
              "kitten": 8,
              "cat": 0
            },
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": {
              "kitten": 8,
              "cat": 0
            }
          },
          "retired": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 0
          },
          "reserve": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 8,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 8
          },
          "last_move": null,
          "last_pushes": [],
          "moves": 0
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  },
  {
    "label": "boop. \u00b7 maximum seats",
    "selfId": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
    "room": {
      "id": "f063ea87-12ba-5aca-9e6d-0e3beea0cc97",
      "name": "Component preview",
      "code": "PREVIEW1",
      "game_id": "boop",
      "owner_id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
      "capacity": 2,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "adb1eb39-799a-5c48-a31f-34a7450d223f",
      "match_version": 1,
      "members": [
        {
          "id": "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.1274571,
          "is_bot": false
        },
        {
          "id": "b34c747c-f55f-5ca1-a9f1-9a962b463165",
          "name": "Dev",
          "avatar": 1,
          "ready": false,
          "seated": true,
          "connected": true,
          "last_seen": 1793545466.127458,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "boop",
        "phase": "placing",
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
            "label": "Empty A1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "1",
            "label": "Empty B1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "2",
            "label": "Empty C1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "3",
            "label": "Empty D1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "4",
            "label": "Empty E1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "5",
            "label": "Empty F1",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "6",
            "label": "Empty A2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "7",
            "label": "Empty B2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "8",
            "label": "Empty C2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "9",
            "label": "Empty D2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "10",
            "label": "Empty E2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "11",
            "label": "Empty F2",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "12",
            "label": "Empty A3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "13",
            "label": "Empty B3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "14",
            "label": "Empty C3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "15",
            "label": "Empty D3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "16",
            "label": "Empty E3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "17",
            "label": "Empty F3",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "18",
            "label": "Empty A4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "19",
            "label": "Empty B4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "20",
            "label": "Empty C4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "21",
            "label": "Empty D4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "22",
            "label": "Empty E4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "23",
            "label": "Empty F4",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "24",
            "label": "Empty A5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "25",
            "label": "Empty B5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "26",
            "label": "Empty C5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "27",
            "label": "Empty D5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "28",
            "label": "Empty E5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "29",
            "label": "Empty F5",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "30",
            "label": "Empty A6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "31",
            "label": "Empty B6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "32",
            "label": "Empty C6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "33",
            "label": "Empty D6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "34",
            "label": "Empty E6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          },
          {
            "id": "35",
            "label": "Empty F6",
            "color": "neutral",
            "subtitle": "",
            "value": "",
            "suit": "",
            "colors": [],
            "effect": ""
          }
        ],
        "discard": null,
        "drawn": null,
        "draw_count": 0,
        "pot": 0,
        "message": "A cozy bed. Pick a square for your first kitten.",
        "actions": [
          {
            "label": "Place kitten at A1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F1",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F2",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F3",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F4",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F5",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at A6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at B6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at C6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at D6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at E6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
            "label": "Place kitten at F6",
            "action": {
              "type": "place",
              "card": "",
              "target": "",
              "color": "kitten",
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
          }
        ],
        "winners": [],
        "detail": {
          "pools": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": {
              "kitten": 8,
              "cat": 0
            },
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": {
              "kitten": 8,
              "cat": 0
            }
          },
          "retired": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 0,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 0
          },
          "reserve": {
            "1bc5a28a-44c7-5d31-a2ed-aa2a4904b5d5": 8,
            "b34c747c-f55f-5ca1-a9f1-9a962b463165": 8
          },
          "last_move": null,
          "last_pushes": [],
          "moves": 0
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null
    }
  }
] satisfies { label: string; selfId: string; room: components["schemas"]["RoomView"] }[];
