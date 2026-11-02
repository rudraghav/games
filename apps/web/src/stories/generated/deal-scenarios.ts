import type { components } from "@games/api-client/wire";
export interface DealScenario { id: string; label: string; selfId: string; focusCard: string | null; room: components["schemas"]["RoomView"]; transitions: { label: string; action: components["schemas"]["Action"]; room: components["schemas"]["RoomView"] }[] }
export const dealScenarios: DealScenario[] = [
  {
    "id": "placement",
    "label": "Deal \u00b7 choose a property destination",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": "d021",
    "room": {
      "id": "c8ce2066-10a7-5f53-a6a9-d97a55a30d51",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "4e4b6ab4-0cb4-512b-baeb-ce26e034f47a",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "brown:0": [
                {
                  "id": "d020",
                  "label": "Mediterranean Avenue",
                  "color": "brown",
                  "subtitle": "Mediterranean Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ]
            }
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
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
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d021",
            "label": "Baltic Avenue",
            "color": "brown",
            "subtitle": "Baltic Avenue",
            "value": "1M",
            "suit": "property",
            "colors": [
              "brown"
            ],
            "effect": "",
            "set_name": "Brown",
            "set_size": 2,
            "rent_ladder": [
              1,
              2
            ]
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
            "effect": "",
            "set_name": "Green",
            "set_size": 3,
            "rent_ladder": [
              2,
              4,
              7
            ]
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 100,
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
            "label": "Place \u00b7 Brown",
            "action": {
              "type": "property",
              "card": "d021",
              "target": "",
              "color": "brown",
              "choice": "brown:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Brown",
            "action": {
              "type": "property",
              "card": "d021",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Green",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "green",
              "choice": "green:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Dark blue",
            "action": {
              "type": "property",
              "card": "d053",
              "target": "",
              "color": "blue",
              "choice": "blue:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d020",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
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
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": null,
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "brown:0",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 1
            }
          ],
          "pending_action": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Complete existing set",
        "action": {
          "type": "property",
          "card": "d021",
          "target": "",
          "color": "brown",
          "choice": "brown:0",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "c8ce2066-10a7-5f53-a6a9-d97a55a30d51",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "4e4b6ab4-0cb4-512b-baeb-ce26e034f47a",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 1,
                "score": 1,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    },
                    {
                      "id": "d021",
                      "label": "Baltic Avenue",
                      "color": "brown",
                      "subtitle": "Baltic Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
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
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "effect": "",
                "set_name": "Green",
                "set_size": 3,
                "rent_ladder": [
                  2,
                  4,
                  7
                ]
              }
            ],
            "community": [],
            "discard": null,
            "drawn": null,
            "draw_count": 100,
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
                "label": "Place \u00b7 Green",
                "action": {
                  "type": "property",
                  "card": "d053",
                  "target": "",
                  "color": "green",
                  "choice": "green:0",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Place \u00b7 Dark blue",
                "action": {
                  "type": "property",
                  "card": "d053",
                  "target": "",
                  "color": "blue",
                  "choice": "blue:0",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d020",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:1",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d021",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:1",
                  "amount": 0,
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
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 2
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Start separate set",
        "action": {
          "type": "property",
          "card": "d021",
          "target": "",
          "color": "brown",
          "choice": "brown:1",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "c8ce2066-10a7-5f53-a6a9-d97a55a30d51",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "4e4b6ab4-0cb4-512b-baeb-ce26e034f47a",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ],
                  "brown:1": [
                    {
                      "id": "d021",
                      "label": "Baltic Avenue",
                      "color": "brown",
                      "subtitle": "Baltic Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
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
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "effect": "",
                "set_name": "Green",
                "set_size": 3,
                "rent_ladder": [
                  2,
                  4,
                  7
                ]
              }
            ],
            "community": [],
            "discard": null,
            "drawn": null,
            "draw_count": 100,
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
                "label": "Place \u00b7 Green",
                "action": {
                  "type": "property",
                  "card": "d053",
                  "target": "",
                  "color": "green",
                  "choice": "green:0",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Place \u00b7 Dark blue",
                "action": {
                  "type": "property",
                  "card": "d053",
                  "target": "",
                  "color": "blue",
                  "choice": "blue:0",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d020",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:1",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d020",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:2",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d021",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:0",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d021",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:2",
                  "amount": 0,
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
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:1",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "rearrange",
    "label": "Deal \u00b7 move between same-color sets",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": "d021",
    "room": {
      "id": "507a886b-d274-57e9-9c37-76c19ad035d5",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "f208f989-d37f-511c-801f-0bf43bab798c",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
              "brown:0": [
                {
                  "id": "d020",
                  "label": "Mediterranean Avenue",
                  "color": "brown",
                  "subtitle": "Mediterranean Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ],
              "brown:1": [
                {
                  "id": "d021",
                  "label": "Baltic Avenue",
                  "color": "brown",
                  "subtitle": "Baltic Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ]
            }
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
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
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
        "draw_count": 101,
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
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d020",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d020",
              "target": "",
              "color": "brown",
              "choice": "brown:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d021",
              "target": "",
              "color": "brown",
              "choice": "brown:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d021",
              "target": "",
              "color": "brown",
              "choice": "brown:2",
              "amount": 0,
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
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": null,
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "brown:0",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "brown:1",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 1
            }
          ],
          "pending_action": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Complete existing set",
        "action": {
          "type": "rearrange",
          "card": "d021",
          "target": "",
          "color": "brown",
          "choice": "brown:0",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "507a886b-d274-57e9-9c37-76c19ad035d5",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "f208f989-d37f-511c-801f-0bf43bab798c",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 0,
                "score": 1,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    },
                    {
                      "id": "d021",
                      "label": "Baltic Avenue",
                      "color": "brown",
                      "subtitle": "Baltic Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
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
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
            "draw_count": 101,
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
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d020",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:1",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": null,
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": []
              },
              {
                "label": "Move \u00b7 Brown",
                "action": {
                  "type": "rearrange",
                  "card": "d021",
                  "target": "",
                  "color": "brown",
                  "choice": "brown:1",
                  "amount": 0,
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
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 2
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "forced",
    "label": "Deal \u00b7 targeted property swap",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": "d094",
    "room": {
      "id": "28e5c769-a180-5cc9-8e8e-976490a0cc58",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "70f06760-5613-50dc-bd6b-363e436bc573",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "brown:0": [
                {
                  "id": "d020",
                  "label": "Mediterranean Avenue",
                  "color": "brown",
                  "subtitle": "Mediterranean Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ],
              "sky:0": [
                {
                  "id": "d022",
                  "label": "Oriental Avenue",
                  "color": "sky",
                  "subtitle": "Oriental Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "sky"
                  ],
                  "effect": "",
                  "set_name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ]
                }
              ]
            }
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "red:0": [
                {
                  "id": "d031",
                  "label": "Kentucky Avenue",
                  "color": "red",
                  "subtitle": "Kentucky Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "red"
                  ],
                  "effect": "",
                  "set_name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ]
                }
              ]
            }
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "green:0": [
                {
                  "id": "d037",
                  "label": "Pacific Avenue",
                  "color": "green",
                  "subtitle": "Pacific Avenue",
                  "value": "4M",
                  "suit": "property",
                  "colors": [
                    "green"
                  ],
                  "effect": "",
                  "set_name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ]
                }
              ]
            }
          },
          {
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d094",
            "label": "Forced deal",
            "color": "neutral",
            "subtitle": "Forced deal",
            "value": "3M",
            "suit": "action",
            "colors": [],
            "effect": "forced",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": null,
        "drawn": null,
        "draw_count": 98,
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
            "label": "Bank 3M",
            "action": {
              "type": "bank",
              "card": "d094",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Forced deal \u00b7 Kentucky Avenue",
            "action": {
              "type": "play",
              "card": "d094",
              "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "color": "",
              "choice": "d031",
              "amount": 0,
              "slot": 0,
              "cards": [
                "d020"
              ],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Forced deal \u00b7 Kentucky Avenue",
            "action": {
              "type": "play",
              "card": "d094",
              "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "color": "",
              "choice": "d031",
              "amount": 0,
              "slot": 0,
              "cards": [
                "d022"
              ],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Forced deal \u00b7 Pacific Avenue",
            "action": {
              "type": "play",
              "card": "d094",
              "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "color": "",
              "choice": "d037",
              "amount": 0,
              "slot": 0,
              "cards": [
                "d020"
              ],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Forced deal \u00b7 Pacific Avenue",
            "action": {
              "type": "play",
              "card": "d094",
              "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "color": "",
              "choice": "d037",
              "amount": 0,
              "slot": 0,
              "cards": [
                "d022"
              ],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d020",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Light blue",
            "action": {
              "type": "rearrange",
              "card": "d022",
              "target": "",
              "color": "sky",
              "choice": "sky:1",
              "amount": 0,
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
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": null,
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "brown:0",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "sky:0",
              "color": "sky",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "green:0",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            }
          ],
          "pending_action": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Swap 2",
        "action": {
          "type": "play",
          "card": "d094",
          "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "color": "",
          "choice": "d031",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d020"
          ],
          "groups": []
        },
        "room": {
          "id": "28e5c769-a180-5cc9-8e8e-976490a0cc58",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "70f06760-5613-50dc-bd6b-363e436bc573",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ],
                  "sky:0": [
                    {
                      "id": "d022",
                      "label": "Oriental Avenue",
                      "color": "sky",
                      "subtitle": "Oriental Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "sky"
                      ],
                      "effect": "",
                      "set_name": "Light blue",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        3
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "red:0": [
                    {
                      "id": "d031",
                      "label": "Kentucky Avenue",
                      "color": "red",
                      "subtitle": "Kentucky Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "red"
                      ],
                      "effect": "",
                      "set_name": "Red",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        3,
                        6
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "green:0": [
                    {
                      "id": "d037",
                      "label": "Pacific Avenue",
                      "color": "green",
                      "subtitle": "Pacific Avenue",
                      "value": "4M",
                      "suit": "property",
                      "colors": [
                        "green"
                      ],
                      "effect": "",
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    }
                  ]
                }
              },
              {
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
            "discard": {
              "id": "d094",
              "label": "Forced deal",
              "color": "neutral",
              "subtitle": "Forced deal",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "forced",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Forced deal.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "forced",
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "sky:0",
                  "color": "sky",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                }
              ],
              "pending_action": {
                "kind": "forced",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "amount": null,
                "blocked": false,
                "stage": "counter"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Swap 3",
        "action": {
          "type": "play",
          "card": "d094",
          "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "color": "",
          "choice": "d031",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d022"
          ],
          "groups": []
        },
        "room": {
          "id": "28e5c769-a180-5cc9-8e8e-976490a0cc58",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "70f06760-5613-50dc-bd6b-363e436bc573",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ],
                  "sky:0": [
                    {
                      "id": "d022",
                      "label": "Oriental Avenue",
                      "color": "sky",
                      "subtitle": "Oriental Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "sky"
                      ],
                      "effect": "",
                      "set_name": "Light blue",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        3
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "red:0": [
                    {
                      "id": "d031",
                      "label": "Kentucky Avenue",
                      "color": "red",
                      "subtitle": "Kentucky Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "red"
                      ],
                      "effect": "",
                      "set_name": "Red",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        3,
                        6
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "green:0": [
                    {
                      "id": "d037",
                      "label": "Pacific Avenue",
                      "color": "green",
                      "subtitle": "Pacific Avenue",
                      "value": "4M",
                      "suit": "property",
                      "colors": [
                        "green"
                      ],
                      "effect": "",
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    }
                  ]
                }
              },
              {
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
            "discard": {
              "id": "d094",
              "label": "Forced deal",
              "color": "neutral",
              "subtitle": "Forced deal",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "forced",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Forced deal.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "forced",
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "sky:0",
                  "color": "sky",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                }
              ],
              "pending_action": {
                "kind": "forced",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "amount": null,
                "blocked": false,
                "stage": "counter"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Swap 4",
        "action": {
          "type": "play",
          "card": "d094",
          "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "color": "",
          "choice": "d037",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d020"
          ],
          "groups": []
        },
        "room": {
          "id": "28e5c769-a180-5cc9-8e8e-976490a0cc58",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "70f06760-5613-50dc-bd6b-363e436bc573",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ],
                  "sky:0": [
                    {
                      "id": "d022",
                      "label": "Oriental Avenue",
                      "color": "sky",
                      "subtitle": "Oriental Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "sky"
                      ],
                      "effect": "",
                      "set_name": "Light blue",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        3
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "red:0": [
                    {
                      "id": "d031",
                      "label": "Kentucky Avenue",
                      "color": "red",
                      "subtitle": "Kentucky Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "red"
                      ],
                      "effect": "",
                      "set_name": "Red",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        3,
                        6
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "green:0": [
                    {
                      "id": "d037",
                      "label": "Pacific Avenue",
                      "color": "green",
                      "subtitle": "Pacific Avenue",
                      "value": "4M",
                      "suit": "property",
                      "colors": [
                        "green"
                      ],
                      "effect": "",
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    }
                  ]
                }
              },
              {
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
            "discard": {
              "id": "d094",
              "label": "Forced deal",
              "color": "neutral",
              "subtitle": "Forced deal",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "forced",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Forced deal.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "forced",
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "sky:0",
                  "color": "sky",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                }
              ],
              "pending_action": {
                "kind": "forced",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "responder": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "amount": null,
                "blocked": false,
                "stage": "counter"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Swap 5",
        "action": {
          "type": "play",
          "card": "d094",
          "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "color": "",
          "choice": "d037",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d022"
          ],
          "groups": []
        },
        "room": {
          "id": "28e5c769-a180-5cc9-8e8e-976490a0cc58",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "70f06760-5613-50dc-bd6b-363e436bc573",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ],
                  "sky:0": [
                    {
                      "id": "d022",
                      "label": "Oriental Avenue",
                      "color": "sky",
                      "subtitle": "Oriental Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "sky"
                      ],
                      "effect": "",
                      "set_name": "Light blue",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        3
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "red:0": [
                    {
                      "id": "d031",
                      "label": "Kentucky Avenue",
                      "color": "red",
                      "subtitle": "Kentucky Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "red"
                      ],
                      "effect": "",
                      "set_name": "Red",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        3,
                        6
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "green:0": [
                    {
                      "id": "d037",
                      "label": "Pacific Avenue",
                      "color": "green",
                      "subtitle": "Pacific Avenue",
                      "value": "4M",
                      "suit": "property",
                      "colors": [
                        "green"
                      ],
                      "effect": "",
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    }
                  ]
                }
              },
              {
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
            "discard": {
              "id": "d094",
              "label": "Forced deal",
              "color": "neutral",
              "subtitle": "Forced deal",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "forced",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Forced deal.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "forced",
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "sky:0",
                  "color": "sky",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                }
              ],
              "pending_action": {
                "kind": "forced",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "responder": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "amount": null,
                "blocked": false,
                "stage": "counter"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "counter",
    "label": "Deal \u00b7 counter an action",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "9feecc8f-ad32-59fe-ac5e-259ff277ab9b",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "df70fb78-cc4c-5725-be5f-22e41d51594a",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "count": 1,
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 2,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d003",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {}
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d000",
            "label": "1M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "1M",
            "suit": "",
            "colors": [],
            "effect": "",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          },
          {
            "id": "d083",
            "label": "Just say no",
            "color": "neutral",
            "subtitle": "Just say no",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "no",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": {
          "id": "d085",
          "label": "Debt collector",
          "color": "neutral",
          "subtitle": "Debt collector",
          "value": "3M",
          "suit": "action",
          "colors": [],
          "effect": "debt",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 99,
        "pot": 0,
        "message": "Played Debt collector.",
        "actions": [
          {
            "label": "Continue",
            "action": {
              "type": "accept",
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
            "label": "Just say no",
            "action": {
              "type": "no",
              "card": "d083",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
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
          "moves": 2,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": "bill",
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [],
          "pending_action": {
            "kind": "bill",
            "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "amount": 5,
            "blocked": false,
            "stage": "counter"
          }
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Block the bill",
        "action": {
          "type": "no",
          "card": "d083",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "9feecc8f-ad32-59fe-ac5e-259ff277ab9b",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "df70fb78-cc4c-5725-be5f-22e41d51594a",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 1,
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
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d083",
              "label": "Just say no",
              "color": "neutral",
              "subtitle": "Just say no",
              "value": "4M",
              "suit": "action",
              "colors": [],
              "effect": "no",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 99,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "bill",
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [],
              "pending_action": {
                "kind": "bill",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "responder": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "amount": 5,
                "blocked": true,
                "stage": "counter"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Accept the bill",
        "action": {
          "type": "accept",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "9feecc8f-ad32-59fe-ac5e-259ff277ab9b",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "df70fb78-cc4c-5725-be5f-22e41d51594a",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 1,
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
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 2,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d083",
                "label": "Just say no",
                "color": "neutral",
                "subtitle": "Just say no",
                "value": "4M",
                "suit": "action",
                "colors": [],
                "effect": "no",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d085",
              "label": "Debt collector",
              "color": "neutral",
              "subtitle": "Debt collector",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "debt",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 99,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [
              {
                "label": "Pay 5M \u00b7 select bank/property cards",
                "action": {
                  "type": "pay",
                  "card": "",
                  "target": "",
                  "color": "",
                  "choice": "",
                  "amount": 0,
                  "slot": 0,
                  "cards": [],
                  "groups": []
                },
                "input": "cards",
                "minimum": null,
                "maximum": null,
                "step": 1,
                "eligible_cards": [
                  "d003"
                ]
              }
            ],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "bill",
              "payment_amount": 5,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [],
              "pending_action": {
                "kind": "bill",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "amount": 5,
                "blocked": false,
                "stage": "payment"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "counter-chain",
    "label": "Deal \u00b7 counter a counter",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "ad95d6d1-9731-57b6-b422-8aa1beab13e6",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "73e184dd-ac6e-5455-90b1-663df8b93f42",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "count": 1,
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d003",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {}
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d082",
            "label": "Just say no",
            "color": "neutral",
            "subtitle": "Just say no",
            "value": "4M",
            "suit": "action",
            "colors": [],
            "effect": "no",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": {
          "id": "d083",
          "label": "Just say no",
          "color": "neutral",
          "subtitle": "Just say no",
          "value": "4M",
          "suit": "action",
          "colors": [],
          "effect": "no",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 99,
        "pot": 0,
        "message": "Played Debt collector.",
        "actions": [
          {
            "label": "Let it stand",
            "action": {
              "type": "accept",
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
            "label": "Just say no",
            "action": {
              "type": "no",
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
          "moves": 2,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": "bill",
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [],
          "pending_action": {
            "kind": "bill",
            "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "amount": 5,
            "blocked": true,
            "stage": "counter"
          }
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Restore the bill",
        "action": {
          "type": "no",
          "card": "d082",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "ad95d6d1-9731-57b6-b422-8aa1beab13e6",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "73e184dd-ac6e-5455-90b1-663df8b93f42",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
            "discard": {
              "id": "d082",
              "label": "Just say no",
              "color": "neutral",
              "subtitle": "Just say no",
              "value": "4M",
              "suit": "action",
              "colors": [],
              "effect": "no",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 99,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 1,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "bill",
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [],
              "pending_action": {
                "kind": "bill",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "amount": 5,
                "blocked": false,
                "stage": "counter"
              }
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Let the block stand",
        "action": {
          "type": "accept",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "ad95d6d1-9731-57b6-b422-8aa1beab13e6",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "73e184dd-ac6e-5455-90b1-663df8b93f42",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 1,
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
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d082",
                "label": "Just say no",
                "color": "neutral",
                "subtitle": "Just say no",
                "value": "4M",
                "suit": "action",
                "colors": [],
                "effect": "no",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d083",
              "label": "Just say no",
              "color": "neutral",
              "subtitle": "Just say no",
              "value": "4M",
              "suit": "action",
              "colors": [],
              "effect": "no",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 99,
            "pot": 0,
            "message": "Played Debt collector.",
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
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "payment-bank",
    "label": "Deal \u00b7 pay from the bank",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "ec0c8444-9bea-5640-8068-1ee2d8886bcc",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "3a101348-43a8-50ff-8aca-cc31f920c6a4",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d006",
                "label": "2M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "2M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d014",
                "label": "4M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "4M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {
              "brown:0": [
                {
                  "id": "d057",
                  "label": "Wild property",
                  "color": "brown",
                  "subtitle": "Wild property",
                  "value": "\u2727",
                  "suit": "property",
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
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ]
            }
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d000",
            "label": "1M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "1M",
            "suit": "",
            "colors": [],
            "effect": "",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": {
          "id": "d085",
          "label": "Debt collector",
          "color": "neutral",
          "subtitle": "Debt collector",
          "value": "3M",
          "suit": "action",
          "colors": [],
          "effect": "debt",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 99,
        "pot": 0,
        "message": "Played Debt collector.",
        "actions": [
          {
            "label": "Pay 5M \u00b7 select bank/property cards",
            "action": {
              "type": "pay",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "cards",
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": [
              "d006",
              "d014"
            ]
          }
        ],
        "winners": [],
        "detail": {
          "moves": 2,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": "bill",
          "payment_amount": 5,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "brown:0",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 0
            }
          ],
          "pending_action": {
            "kind": "bill",
            "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "amount": 5,
            "blocked": false,
            "stage": "payment"
          }
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Pay every available asset",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d006",
            "d014"
          ],
          "groups": []
        },
        "room": {
          "id": "ec0c8444-9bea-5640-8068-1ee2d8886bcc",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "3a101348-43a8-50ff-8aca-cc31f920c6a4",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 0,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d006",
                    "label": "2M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "2M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d014",
                    "label": "4M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "4M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d057",
                      "label": "Wild property",
                      "color": "brown",
                      "subtitle": "Wild property",
                      "value": "\u2727",
                      "suit": "property",
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
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d085",
              "label": "Debt collector",
              "color": "neutral",
              "subtitle": "Debt collector",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "debt",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 99,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 0
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "payment-exact",
    "label": "Deal \u00b7 exact payment or overpayment",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "9fcda149-8b77-559f-ab3b-5e46bdf608ea",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "13a35275-1d4d-5511-b06c-52f996d5a611",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d003",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d014",
                "label": "4M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "4M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d019",
                "label": "10M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "10M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {
              "brown:0": [
                {
                  "id": "d057",
                  "label": "Wild property",
                  "color": "brown",
                  "subtitle": "Wild property",
                  "value": "\u2727",
                  "suit": "property",
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
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ]
            }
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d000",
            "label": "1M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "1M",
            "suit": "",
            "colors": [],
            "effect": "",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": {
          "id": "d085",
          "label": "Debt collector",
          "color": "neutral",
          "subtitle": "Debt collector",
          "value": "3M",
          "suit": "action",
          "colors": [],
          "effect": "debt",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 98,
        "pot": 0,
        "message": "Played Debt collector.",
        "actions": [
          {
            "label": "Pay 5M \u00b7 select bank/property cards",
            "action": {
              "type": "pay",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "cards",
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": [
              "d003",
              "d014",
              "d019"
            ]
          }
        ],
        "winners": [],
        "detail": {
          "moves": 2,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": "bill",
          "payment_amount": 5,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "brown:0",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 0
            }
          ],
          "pending_action": {
            "kind": "bill",
            "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "amount": 5,
            "blocked": false,
            "stage": "payment"
          }
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Pay every available asset",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d003",
            "d014",
            "d019"
          ],
          "groups": []
        },
        "room": {
          "id": "9fcda149-8b77-559f-ab3b-5e46bdf608ea",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "13a35275-1d4d-5511-b06c-52f996d5a611",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 0,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d014",
                    "label": "4M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "4M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d019",
                    "label": "10M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "10M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d057",
                      "label": "Wild property",
                      "color": "brown",
                      "subtitle": "Wild property",
                      "value": "\u2727",
                      "suit": "property",
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
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d085",
              "label": "Debt collector",
              "color": "neutral",
              "subtitle": "Debt collector",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "debt",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 0
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Pay exactly",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d003",
            "d014"
          ],
          "groups": []
        },
        "room": {
          "id": "9fcda149-8b77-559f-ab3b-5e46bdf608ea",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "13a35275-1d4d-5511-b06c-52f996d5a611",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 0,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d014",
                    "label": "4M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "4M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d019",
                    "label": "10M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "10M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d057",
                      "label": "Wild property",
                      "color": "brown",
                      "subtitle": "Wild property",
                      "value": "\u2727",
                      "suit": "property",
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
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d085",
              "label": "Debt collector",
              "color": "neutral",
              "subtitle": "Debt collector",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "debt",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 0
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      },
      {
        "label": "Overpay",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d019"
          ],
          "groups": []
        },
        "room": {
          "id": "9fcda149-8b77-559f-ab3b-5e46bdf608ea",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "13a35275-1d4d-5511-b06c-52f996d5a611",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 0,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d019",
                    "label": "10M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "10M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d014",
                    "label": "4M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "4M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d057",
                      "label": "Wild property",
                      "color": "brown",
                      "subtitle": "Wild property",
                      "value": "\u2727",
                      "suit": "property",
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
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d085",
              "label": "Debt collector",
              "color": "neutral",
              "subtitle": "Debt collector",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "debt",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 98,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 0
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "payment-insolvent",
    "label": "Deal \u00b7 pay every available asset",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "2018b51a-5664-5ce2-8f8c-4d10dd4de1a0",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "462f34f2-db6a-53e8-9038-c7b97d50c571",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
            "score": 1,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d003",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {
              "brown:0": [
                {
                  "id": "d020",
                  "label": "Mediterranean Avenue",
                  "color": "brown",
                  "subtitle": "Mediterranean Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                },
                {
                  "id": "d057",
                  "label": "Wild property",
                  "color": "brown",
                  "subtitle": "Wild property",
                  "value": "\u2727",
                  "suit": "property",
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
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ]
            }
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
            "id": "d000",
            "label": "1M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "1M",
            "suit": "",
            "colors": [],
            "effect": "",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": {
          "id": "d085",
          "label": "Debt collector",
          "color": "neutral",
          "subtitle": "Debt collector",
          "value": "3M",
          "suit": "action",
          "colors": [],
          "effect": "debt",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 99,
        "pot": 0,
        "message": "Played Debt collector.",
        "actions": [
          {
            "label": "Pay 5M \u00b7 select bank/property cards",
            "action": {
              "type": "pay",
              "card": "",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": "cards",
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": [
              "d003",
              "d020"
            ]
          }
        ],
        "winners": [],
        "detail": {
          "moves": 2,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": "bill",
          "payment_amount": 5,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "brown:0",
              "color": "brown",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 2
            }
          ],
          "pending_action": {
            "kind": "bill",
            "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "amount": 5,
            "blocked": false,
            "stage": "payment"
          }
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": [
      {
        "label": "Pay every available asset",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d003",
            "d020"
          ],
          "groups": []
        },
        "room": {
          "id": "2018b51a-5664-5ce2-8f8c-4d10dd4de1a0",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "462f34f2-db6a-53e8-9038-c7b97d50c571",
          "match_version": 2,
          "members": [
            {
              "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "name": "Alexandra with a rather long name",
              "avatar": 0,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "name": "Dev",
              "avatar": 1,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "name": "Mira",
              "avatar": 2,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            },
            {
              "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
              "name": "Sam",
              "avatar": 3,
              "ready": true,
              "seated": true,
              "connected": true,
              "last_seen": 0.0,
              "is_bot": false
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal",
            "phase": "playing",
            "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "players": [
              {
                "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "count": 0,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d003",
                    "label": "1M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "1M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d020",
                      "label": "Mediterranean Avenue",
                      "color": "brown",
                      "subtitle": "Mediterranean Avenue",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown"
                      ],
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 1,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "brown:0": [
                    {
                      "id": "d057",
                      "label": "Wild property",
                      "color": "brown",
                      "subtitle": "Wild property",
                      "value": "\u2727",
                      "suit": "property",
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
                      "effect": "",
                      "set_name": "Brown",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 1,
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
                "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
                "count": 1,
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
                "id": "d000",
                "label": "1M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "1M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d085",
              "label": "Debt collector",
              "color": "neutral",
              "subtitle": "Debt collector",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "debt",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 99,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": null,
              "payment_amount": 0,
              "property_groups": [
                {
                  "color": "brown",
                  "name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Mediterranean Avenue",
                    "Baltic Avenue"
                  ]
                },
                {
                  "color": "sky",
                  "name": "Light blue",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    3
                  ],
                  "properties": [
                    "Oriental Avenue",
                    "Vermont Avenue",
                    "Connecticut Avenue"
                  ]
                },
                {
                  "color": "pink",
                  "name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ],
                  "properties": [
                    "St. Charles Place",
                    "States Avenue",
                    "Virginia Avenue"
                  ]
                },
                {
                  "color": "orange",
                  "name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ],
                  "properties": [
                    "St. James Place",
                    "Tennessee Avenue",
                    "New York Avenue"
                  ]
                },
                {
                  "color": "red",
                  "name": "Red",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    3,
                    6
                  ],
                  "properties": [
                    "Kentucky Avenue",
                    "Indiana Avenue",
                    "Illinois Avenue"
                  ]
                },
                {
                  "color": "yellow",
                  "name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ],
                  "properties": [
                    "Atlantic Avenue",
                    "Ventnor Avenue",
                    "Marvin Gardens"
                  ]
                },
                {
                  "color": "green",
                  "name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ],
                  "properties": [
                    "Pacific Avenue",
                    "North Carolina Avenue",
                    "Pennsylvania Avenue"
                  ]
                },
                {
                  "color": "blue",
                  "name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ],
                  "properties": [
                    "Park Place",
                    "Boardwalk"
                  ]
                },
                {
                  "color": "rail",
                  "name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ],
                  "properties": [
                    "Reading Railroad",
                    "Pennsylvania Railroad",
                    "B&O Railroad",
                    "Short Line"
                  ]
                },
                {
                  "color": "utility",
                  "name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ],
                  "properties": [
                    "Electric Company",
                    "Water Works"
                  ]
                }
              ],
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 0
                }
              ],
              "pending_action": null
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null
        }
      }
    ]
  },
  {
    "id": "collections",
    "label": "Deal \u00b7 named properties and rent",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "2b75e891-ac33-53c4-a3d3-94a753a9c95a",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "df035744-0bf1-50ac-b092-54a9ac5ea144",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal",
        "phase": "playing",
        "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "count": 0,
            "score": 1,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "brown:0": [
                {
                  "id": "d020",
                  "label": "Mediterranean Avenue",
                  "color": "brown",
                  "subtitle": "Mediterranean Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                },
                {
                  "id": "d021",
                  "label": "Baltic Avenue",
                  "color": "brown",
                  "subtitle": "Baltic Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                },
                {
                  "id": "d099",
                  "label": "House",
                  "color": "brown",
                  "subtitle": "House",
                  "value": "3M",
                  "suit": "action",
                  "colors": [],
                  "effect": "house",
                  "set_name": null,
                  "set_size": null,
                  "rent_ladder": []
                },
                {
                  "id": "d102",
                  "label": "Hotel",
                  "color": "brown",
                  "subtitle": "Hotel",
                  "value": "4M",
                  "suit": "action",
                  "colors": [],
                  "effect": "hotel",
                  "set_name": null,
                  "set_size": null,
                  "rent_ladder": []
                }
              ],
              "blue:0": [
                {
                  "id": "d041",
                  "label": "Boardwalk",
                  "color": "blue",
                  "subtitle": "Boardwalk",
                  "value": "4M",
                  "suit": "property",
                  "colors": [
                    "blue"
                  ],
                  "effect": "",
                  "set_name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ]
                }
              ]
            }
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
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
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
        "draw_count": 98,
        "pot": 0,
        "message": "Played Hotel.",
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
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d020",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d021",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d041",
              "target": "",
              "color": "blue",
              "choice": "blue:1",
              "amount": 0,
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
          "moves": 1,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": null,
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "brown:0",
              "color": "brown",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 9
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:0",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            }
          ],
          "pending_action": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": []
  },
  {
    "id": "no-mercy",
    "label": "No Mercy \u00b7 house deck",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "7e13b460-210d-5f48-ad01-ba7b4901e0a1",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal-no-mercy",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "469229fa-0638-54ef-99d8-97a8f6df548a",
      "match_version": 1,
      "members": [
        {
          "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "name": "Alexandra with a rather long name",
          "avatar": 0,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
          "name": "Dev",
          "avatar": 1,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
          "name": "Mira",
          "avatar": 2,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        },
        {
          "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
          "name": "Sam",
          "avatar": 3,
          "ready": true,
          "seated": true,
          "connected": true,
          "last_seen": 0.0,
          "is_bot": false
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal-no-mercy",
        "phase": "playing",
        "current_player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
        "players": [
          {
            "id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
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
              "brown:0": [
                {
                  "id": "d018",
                  "label": "Mediterranean Avenue",
                  "color": "brown",
                  "subtitle": "Mediterranean Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                },
                {
                  "id": "d019",
                  "label": "Baltic Avenue",
                  "color": "brown",
                  "subtitle": "Baltic Avenue",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown"
                  ],
                  "effect": "",
                  "set_name": "Brown",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ],
              "blue:0": [
                {
                  "id": "d039",
                  "label": "Boardwalk",
                  "color": "blue",
                  "subtitle": "Boardwalk",
                  "value": "4M",
                  "suit": "property",
                  "colors": [
                    "blue"
                  ],
                  "effect": "",
                  "set_name": "Dark blue",
                  "set_size": 2,
                  "rent_ladder": [
                    3,
                    8
                  ]
                }
              ]
            }
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 1,
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
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 1,
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
            "count": 1,
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
        "draw_count": 109,
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
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d018",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Brown",
            "action": {
              "type": "rearrange",
              "card": "d019",
              "target": "",
              "color": "brown",
              "choice": "brown:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d039",
              "target": "",
              "color": "blue",
              "choice": "blue:1",
              "amount": 0,
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
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": null,
          "payment_amount": 0,
          "property_groups": [
            {
              "color": "brown",
              "name": "Brown",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Mediterranean Avenue",
                "Baltic Avenue"
              ]
            },
            {
              "color": "sky",
              "name": "Light blue",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                3
              ],
              "properties": [
                "Oriental Avenue",
                "Vermont Avenue",
                "Connecticut Avenue"
              ]
            },
            {
              "color": "pink",
              "name": "Pink",
              "set_size": 3,
              "rent_ladder": [
                1,
                2,
                4
              ],
              "properties": [
                "St. Charles Place",
                "States Avenue",
                "Virginia Avenue"
              ]
            },
            {
              "color": "orange",
              "name": "Orange",
              "set_size": 3,
              "rent_ladder": [
                1,
                3,
                5
              ],
              "properties": [
                "St. James Place",
                "Tennessee Avenue",
                "New York Avenue"
              ]
            },
            {
              "color": "red",
              "name": "Red",
              "set_size": 3,
              "rent_ladder": [
                2,
                3,
                6
              ],
              "properties": [
                "Kentucky Avenue",
                "Indiana Avenue",
                "Illinois Avenue"
              ]
            },
            {
              "color": "yellow",
              "name": "Yellow",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                6
              ],
              "properties": [
                "Atlantic Avenue",
                "Ventnor Avenue",
                "Marvin Gardens"
              ]
            },
            {
              "color": "green",
              "name": "Green",
              "set_size": 3,
              "rent_ladder": [
                2,
                4,
                7
              ],
              "properties": [
                "Pacific Avenue",
                "North Carolina Avenue",
                "Pennsylvania Avenue"
              ]
            },
            {
              "color": "blue",
              "name": "Dark blue",
              "set_size": 2,
              "rent_ladder": [
                3,
                8
              ],
              "properties": [
                "Park Place",
                "Boardwalk"
              ]
            },
            {
              "color": "rail",
              "name": "Railroads",
              "set_size": 4,
              "rent_ladder": [
                1,
                2,
                3,
                4
              ],
              "properties": [
                "Reading Railroad",
                "Pennsylvania Railroad",
                "B&O Railroad",
                "Short Line"
              ]
            },
            {
              "color": "utility",
              "name": "Utilities",
              "set_size": 2,
              "rent_ladder": [
                1,
                2
              ],
              "properties": [
                "Electric Company",
                "Water Works"
              ]
            }
          ],
          "collections": [
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "brown:0",
              "color": "brown",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:0",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            }
          ],
          "pending_action": null
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null
    },
    "transitions": []
  }
];
