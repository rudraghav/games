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
          "rent_multiplier": 1,
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
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
                "stage": "counter",
                "transfers": [
                  {
                    "source": "baf691ac-60ab-5cf4-b394-02f24342044e",
                    "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "cards": [
                      "d031"
                    ]
                  },
                  {
                    "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                    "cards": [
                      "d020"
                    ]
                  }
                ],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
                "stage": "counter",
                "transfers": [
                  {
                    "source": "baf691ac-60ab-5cf4-b394-02f24342044e",
                    "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "cards": [
                      "d031"
                    ]
                  },
                  {
                    "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                    "cards": [
                      "d022"
                    ]
                  }
                ],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
                "stage": "counter",
                "transfers": [
                  {
                    "source": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                    "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "cards": [
                      "d037"
                    ]
                  },
                  {
                    "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                    "cards": [
                      "d020"
                    ]
                  }
                ],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
                "stage": "counter",
                "transfers": [
                  {
                    "source": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                    "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "cards": [
                      "d037"
                    ]
                  },
                  {
                    "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                    "cards": [
                      "d022"
                    ]
                  }
                ],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
      }
    ]
  },
  {
    "id": "forced-pending",
    "label": "Deal \u00b7 review both sides of a pending swap",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "5fab2e81-07d7-591d-9ff2-7f1d09db1f0c",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "42347493-1cf4-5721-b3ad-5ec5351d09ff",
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
          }
        ],
        "winners": [],
        "detail": {
          "moves": 2,
          "rent_multiplier": 1,
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
            "stage": "counter",
            "transfers": [
              {
                "source": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "cards": [
                  "d031"
                ]
              },
              {
                "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "cards": [
                  "d020"
                ]
              }
            ],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": [
      {
        "label": "Accept the exchange",
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
          "id": "5fab2e81-07d7-591d-9ff2-7f1d09db1f0c",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "42347493-1cf4-5721-b3ad-5ec5351d09ff",
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
                "bank": [],
                "properties": {
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
                  ],
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
              "rent_multiplier": 1,
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
                  "key": "sky:0",
                  "color": "sky",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
            "stage": "counter",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
                "stage": "counter",
                "transfers": [],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
                "stage": "payment",
                "transfers": [],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": [
                {
                  "card": "d003",
                  "transfers": [
                    {
                      "id": "d003",
                      "value": 1
                    }
                  ]
                }
              ]
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
            "stage": "counter",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "moves": 2,
              "rent_multiplier": 1,
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
                "stage": "counter",
                "transfers": [],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
            "stage": "payment",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": [
            {
              "card": "d006",
              "transfers": [
                {
                  "id": "d006",
                  "value": 2
                }
              ]
            },
            {
              "card": "d014",
              "transfers": [
                {
                  "id": "d014",
                  "value": 4
                }
              ]
            }
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
            "stage": "payment",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": [
            {
              "card": "d003",
              "transfers": [
                {
                  "id": "d003",
                  "value": 1
                }
              ]
            },
            {
              "card": "d014",
              "transfers": [
                {
                  "id": "d014",
                  "value": 4
                }
              ]
            },
            {
              "card": "d019",
              "transfers": [
                {
                  "id": "d019",
                  "value": 10
                }
              ]
            }
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
            "stage": "payment",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": [
            {
              "card": "d003",
              "transfers": [
                {
                  "id": "d003",
                  "value": 1
                }
              ]
            },
            {
              "card": "d020",
              "transfers": [
                {
                  "id": "d020",
                  "value": 1
                }
              ]
            }
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
              "rent_multiplier": 1,
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
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
          "rent_multiplier": 1,
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
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
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
          "rent_multiplier": 1,
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
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": []
  },
  {
    "id": "doubled-rent",
    "label": "Deal \u00b7 preview doubled rent",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": "d059",
    "room": {
      "id": "7f69d8a6-4f66-57ee-a689-a16ccc3750c5",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "d3391333-a308-5af1-a83e-4dd79452c690",
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
            "count": 3,
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
              ]
            }
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 3,
            "score": 0,
            "chips": null,
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
            "count": 3,
            "score": 0,
            "chips": null,
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
            "count": 3,
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
            "id": "d059",
            "label": "Rent",
            "color": "brown",
            "subtitle": "Rent",
            "value": "1M",
            "suit": "action",
            "colors": [
              "brown",
              "sky"
            ],
            "effect": "rent",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          },
          {
            "id": "d096",
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
          {
            "id": "d095",
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
        "discard": {
          "id": "d104",
          "label": "Double the rent",
          "color": "neutral",
          "subtitle": "Double the rent",
          "value": "1M",
          "suit": "action",
          "colors": [],
          "effect": "double",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 89,
        "pot": 0,
        "message": "Played Double the rent.",
        "actions": [
          {
            "label": "Rent \u00b7 brown",
            "action": {
              "type": "play",
              "card": "d059",
              "target": "",
              "color": "brown:0",
              "choice": "",
              "amount": 0,
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
          "rent_multiplier": 2,
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
            }
          ],
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": [
      {
        "label": "Charge doubled Brown rent",
        "action": {
          "type": "play",
          "card": "d059",
          "target": "",
          "color": "brown:0",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "7f69d8a6-4f66-57ee-a689-a16ccc3750c5",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "d3391333-a308-5af1-a83e-4dd79452c690",
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
                "count": 2,
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
                  ]
                }
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "count": 3,
                "score": 0,
                "chips": null,
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
                "count": 3,
                "score": 0,
                "chips": null,
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
                "count": 3,
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
                "id": "d096",
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
              {
                "id": "d095",
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
            "discard": {
              "id": "d059",
              "label": "Rent",
              "color": "brown",
              "subtitle": "Rent",
              "value": "1M",
              "suit": "action",
              "colors": [
                "brown",
                "sky"
              ],
              "effect": "rent",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 89,
            "pot": 0,
            "message": "Played Rent.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 1,
              "rent_multiplier": 1,
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
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 9
                }
              ],
              "pending_action": {
                "kind": "bill",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "amount": 18,
                "blocked": false,
                "stage": "counter",
                "transfers": [],
                "collection": null,
                "category": null,
                "source_collection": "brown:0",
                "multiplier": 2
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
      }
    ]
  },
  {
    "id": "information-hand",
    "label": "Deal \u00b7 inspect a natural large hand",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "e812695f-9242-5ab4-8fca-648d25757a90",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "fb556d55-20ed-5fc0-9075-415709feea85",
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
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
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
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
            "id": "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117",
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
            "id": "d017",
            "label": "5M",
            "color": "neutral",
            "subtitle": "MONEY",
            "value": "5M",
            "suit": "",
            "colors": [],
            "effect": "",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          },
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
          },
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
          },
          {
            "id": "d091",
            "label": "Sly deal",
            "color": "neutral",
            "subtitle": "Sly deal",
            "value": "3M",
            "suit": "action",
            "colors": [],
            "effect": "sly",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          },
          {
            "id": "d002",
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
            "id": "d075",
            "label": "Pass Go",
            "color": "neutral",
            "subtitle": "Pass Go",
            "value": "1M",
            "suit": "action",
            "colors": [],
            "effect": "pass_go",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          },
          {
            "id": "d033",
            "label": "Illinois Avenue",
            "color": "red",
            "subtitle": "Illinois Avenue",
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
          },
          {
            "id": "d039",
            "label": "Pennsylvania Avenue",
            "color": "green",
            "subtitle": "Pennsylvania Avenue",
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
        ],
        "community": [],
        "discard": {
          "id": "d073",
          "label": "Pass Go",
          "color": "neutral",
          "subtitle": "Pass Go",
          "value": "1M",
          "suit": "action",
          "colors": [],
          "effect": "pass_go",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 80,
        "pot": 0,
        "message": "Played Pass Go.",
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
            "label": "Bank 5M",
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
            "label": "Place \u00b7 Red",
            "action": {
              "type": "property",
              "card": "d031",
              "target": "",
              "color": "red",
              "choice": "red:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d003",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d057",
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
            "label": "Place \u00b7 Light blue",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "sky",
              "choice": "sky:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Pink",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "pink",
              "choice": "pink:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Orange",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "orange",
              "choice": "orange:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Red",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "red",
              "choice": "red:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Yellow",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "yellow",
              "choice": "yellow:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d057",
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
              "card": "d057",
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
            "label": "Place \u00b7 Railroads",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "rail",
              "choice": "rail:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Utilities",
            "action": {
              "type": "property",
              "card": "d057",
              "target": "",
              "color": "utility",
              "choice": "utility:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d091",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d002",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d075",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Pass Go",
            "action": {
              "type": "play",
              "card": "d075",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Place \u00b7 Red",
            "action": {
              "type": "property",
              "card": "d033",
              "target": "",
              "color": "red",
              "choice": "red:0",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d039",
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
          }
        ],
        "winners": [],
        "detail": {
          "moves": 1,
          "rent_multiplier": 1,
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
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": []
  },
  {
    "id": "third-play-counter",
    "label": "Deal \u00b7 counter after your third ordinary play",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "449a1825-bd49-57c7-8abd-cdc755ab98ec",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "e35478d3-b7f3-5d2f-977e-a157cd63434e",
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
            "count": 4,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d060",
                "label": "Rent",
                "color": "brown",
                "subtitle": "Rent",
                "value": "1M",
                "suit": "action",
                "colors": [
                  "brown",
                  "sky"
                ],
                "effect": "rent",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d067",
                "label": "Rent",
                "color": "rail",
                "subtitle": "Rent",
                "value": "1M",
                "suit": "action",
                "colors": [
                  "rail",
                  "utility"
                ],
                "effect": "rent",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {}
          },
          {
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
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
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 4,
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
            "id": "d034",
            "label": "Atlantic Avenue",
            "color": "yellow",
            "subtitle": "Atlantic Avenue",
            "value": "3M",
            "suit": "property",
            "colors": [
              "yellow"
            ],
            "effect": "",
            "set_name": "Yellow",
            "set_size": 3,
            "rent_ladder": [
              2,
              4,
              6
            ]
          },
          {
            "id": "d084",
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
          {
            "id": "d076",
            "label": "Pass Go",
            "color": "neutral",
            "subtitle": "Pass Go",
            "value": "1M",
            "suit": "action",
            "colors": [],
            "effect": "pass_go",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          },
          {
            "id": "d029",
            "label": "Tennessee Avenue",
            "color": "orange",
            "subtitle": "Tennessee Avenue",
            "value": "2M",
            "suit": "property",
            "colors": [
              "orange"
            ],
            "effect": "",
            "set_name": "Orange",
            "set_size": 3,
            "rent_ladder": [
              1,
              3,
              5
            ]
          }
        ],
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
        "draw_count": 89,
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
          "moves": 0,
          "rent_multiplier": 1,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": []
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
            "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "responder": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "amount": 5,
            "blocked": true,
            "stage": "counter",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": [
      {
        "label": "Counter for no ordinary play",
        "action": {
          "type": "no",
          "card": "d084",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [],
          "groups": []
        },
        "room": {
          "id": "449a1825-bd49-57c7-8abd-cdc755ab98ec",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 3,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "e35478d3-b7f3-5d2f-977e-a157cd63434e",
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
                "count": 3,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d060",
                    "label": "Rent",
                    "color": "brown",
                    "subtitle": "Rent",
                    "value": "1M",
                    "suit": "action",
                    "colors": [
                      "brown",
                      "sky"
                    ],
                    "effect": "rent",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d067",
                    "label": "Rent",
                    "color": "rail",
                    "subtitle": "Rent",
                    "value": "1M",
                    "suit": "action",
                    "colors": [
                      "rail",
                      "utility"
                    ],
                    "effect": "rent",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {}
              },
              {
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
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
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 4,
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
                "id": "d034",
                "label": "Atlantic Avenue",
                "color": "yellow",
                "subtitle": "Atlantic Avenue",
                "value": "3M",
                "suit": "property",
                "colors": [
                  "yellow"
                ],
                "effect": "",
                "set_name": "Yellow",
                "set_size": 3,
                "rent_ladder": [
                  2,
                  4,
                  6
                ]
              },
              {
                "id": "d076",
                "label": "Pass Go",
                "color": "neutral",
                "subtitle": "Pass Go",
                "value": "1M",
                "suit": "action",
                "colors": [],
                "effect": "pass_go",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d029",
                "label": "Tennessee Avenue",
                "color": "orange",
                "subtitle": "Tennessee Avenue",
                "value": "2M",
                "suit": "property",
                "colors": [
                  "orange"
                ],
                "effect": "",
                "set_name": "Orange",
                "set_size": 3,
                "rent_ladder": [
                  1,
                  3,
                  5
                ]
              }
            ],
            "community": [],
            "discard": {
              "id": "d084",
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
            "draw_count": 89,
            "pot": 0,
            "message": "Played Debt collector.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 0,
              "rent_multiplier": 1,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": []
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
                "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "responder": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "amount": 5,
                "blocked": false,
                "stage": "counter",
                "transfers": [],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
      }
    ]
  },
  {
    "id": "linked-payment-classic",
    "label": "Monopoly Deal \u00b7 payment carries buildings",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": "d020",
    "room": {
      "id": "82d2789e-b356-512f-bc01-b4488535162a",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "94ef85c2-c10a-5265-8a43-42c960fa64e9",
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
            "count": 2,
            "score": 2,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [],
            "properties": {
              "utility:0": [
                {
                  "id": "d047",
                  "label": "Water Works",
                  "color": "utility",
                  "subtitle": "Water Works",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                },
                {
                  "id": "d056",
                  "label": "Wild property",
                  "color": "utility",
                  "subtitle": "Wild property",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail",
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ],
              "green:0": [
                {
                  "id": "d055",
                  "label": "Wild property",
                  "color": "green",
                  "subtitle": "Wild property",
                  "value": "4M",
                  "suit": "property",
                  "colors": [
                    "green",
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ]
                },
                {
                  "id": "d039",
                  "label": "Pennsylvania Avenue",
                  "color": "green",
                  "subtitle": "Pennsylvania Avenue",
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
                },
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
              ],
              "sky:0": [
                {
                  "id": "d054",
                  "label": "Wild property",
                  "color": "sky",
                  "subtitle": "Wild property",
                  "value": "4M",
                  "suit": "property",
                  "colors": [
                    "sky",
                    "rail"
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
              ],
              "orange:0": [
                {
                  "id": "d049",
                  "label": "Wild property",
                  "color": "orange",
                  "subtitle": "Wild property",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink",
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
              "yellow:0": [
                {
                  "id": "d034",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
              "red:0": [
                {
                  "id": "d051",
                  "label": "Wild property",
                  "color": "red",
                  "subtitle": "Wild property",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "red",
                    "yellow"
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
            "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "count": 2,
            "score": 1,
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
              ],
              "orange:0": [
                {
                  "id": "d028",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                },
                {
                  "id": "d050",
                  "label": "Wild property",
                  "color": "orange",
                  "subtitle": "Wild property",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink",
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
              "pink:0": [
                {
                  "id": "d027",
                  "label": "Virginia Avenue",
                  "color": "pink",
                  "subtitle": "Virginia Avenue",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
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
              ],
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
                  "id": "d101",
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
                  "id": "d103",
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
              ]
            }
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "count": 3,
            "score": 1,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d010",
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
                "id": "d017",
                "label": "5M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "5M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d011",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d007",
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
              }
            ],
            "properties": {
              "pink:0": [
                {
                  "id": "d026",
                  "label": "States Avenue",
                  "color": "pink",
                  "subtitle": "States Avenue",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                },
                {
                  "id": "d025",
                  "label": "St. Charles Place",
                  "color": "pink",
                  "subtitle": "St. Charles Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "utility:0": [
                {
                  "id": "d046",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
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
                },
                {
                  "id": "d040",
                  "label": "Park Place",
                  "color": "blue",
                  "subtitle": "Park Place",
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
              ],
              "brown:0": [
                {
                  "id": "d048",
                  "label": "Wild property",
                  "color": "brown",
                  "subtitle": "Wild property",
                  "value": "1M",
                  "suit": "property",
                  "colors": [
                    "brown",
                    "sky"
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
              "orange:0": [
                {
                  "id": "d029",
                  "label": "Tennessee Avenue",
                  "color": "orange",
                  "subtitle": "Tennessee Avenue",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                },
                {
                  "id": "d030",
                  "label": "New York Avenue",
                  "color": "orange",
                  "subtitle": "New York Avenue",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
              "sky:0": [
                {
                  "id": "d023",
                  "label": "Vermont Avenue",
                  "color": "sky",
                  "subtitle": "Vermont Avenue",
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
              ],
              "red:0": [
                {
                  "id": "d032",
                  "label": "Indiana Avenue",
                  "color": "red",
                  "subtitle": "Indiana Avenue",
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
                },
                {
                  "id": "d033",
                  "label": "Illinois Avenue",
                  "color": "red",
                  "subtitle": "Illinois Avenue",
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
              ],
              "yellow:0": [
                {
                  "id": "d035",
                  "label": "Ventnor Avenue",
                  "color": "yellow",
                  "subtitle": "Ventnor Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
              "rail:0": [
                {
                  "id": "d043",
                  "label": "Pennsylvania Railroad",
                  "color": "rail",
                  "subtitle": "Pennsylvania Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "green:0": [
                {
                  "id": "d038",
                  "label": "North Carolina Avenue",
                  "color": "green",
                  "subtitle": "North Carolina Avenue",
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
          }
        ],
        "hand": [
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
            "id": "d015",
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
        "community": [],
        "discard": {
          "id": "d063",
          "label": "Rent",
          "color": "red",
          "subtitle": "Rent",
          "value": "1M",
          "suit": "action",
          "colors": [
            "red",
            "yellow"
          ],
          "effect": "rent",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 36,
        "pot": 0,
        "message": "Played Rent.",
        "actions": [
          {
            "label": "Pay 2M \u00b7 select bank/property cards",
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
              "d031",
              "d028",
              "d050",
              "d027",
              "d022",
              "d020",
              "d021",
              "d101",
              "d103"
            ]
          }
        ],
        "winners": [],
        "detail": {
          "moves": 1,
          "rent_multiplier": 1,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": []
          },
          "pending": "bill",
          "payment_amount": 2,
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
              "key": "utility:0",
              "color": "utility",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 3,
              "set_size": 3,
              "complete": true,
              "rent": 7
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
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
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
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "orange:0",
              "color": "orange",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 3
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "sky:0",
              "color": "sky",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "brown:0",
              "color": "brown",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 9
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "pink:0",
              "color": "pink",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "utility:0",
              "color": "utility",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 1
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "blue:0",
              "color": "blue",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 8
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "brown:0",
              "color": "brown",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 1
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "orange:0",
              "color": "orange",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 3
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "sky:0",
              "color": "sky",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "red:0",
              "color": "red",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 3
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "rail:0",
              "color": "rail",
              "count": 1,
              "set_size": 4,
              "complete": false,
              "rent": 1
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
            "kind": "bill",
            "actor": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "amount": 2,
            "blocked": false,
            "stage": "payment",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": "yellow:0",
            "multiplier": 1
          },
          "payment_bundles": [
            {
              "card": "d031",
              "transfers": [
                {
                  "id": "d031",
                  "value": 3
                }
              ]
            },
            {
              "card": "d028",
              "transfers": [
                {
                  "id": "d028",
                  "value": 2
                }
              ]
            },
            {
              "card": "d050",
              "transfers": [
                {
                  "id": "d050",
                  "value": 2
                }
              ]
            },
            {
              "card": "d027",
              "transfers": [
                {
                  "id": "d027",
                  "value": 2
                }
              ]
            },
            {
              "card": "d022",
              "transfers": [
                {
                  "id": "d022",
                  "value": 1
                }
              ]
            },
            {
              "card": "d020",
              "transfers": [
                {
                  "id": "d020",
                  "value": 1
                },
                {
                  "id": "d101",
                  "value": 3
                },
                {
                  "id": "d103",
                  "value": 4
                }
              ]
            },
            {
              "card": "d021",
              "transfers": [
                {
                  "id": "d021",
                  "value": 1
                }
              ]
            },
            {
              "card": "d101",
              "transfers": [
                {
                  "id": "d101",
                  "value": 3
                }
              ]
            },
            {
              "card": "d103",
              "transfers": [
                {
                  "id": "d103",
                  "value": 4
                }
              ]
            }
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": [
      {
        "label": "Pay with linked assets",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d020",
            "d022"
          ],
          "groups": []
        },
        "room": {
          "id": "82d2789e-b356-512f-bc01-b4488535162a",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 3,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "94ef85c2-c10a-5265-8a43-42c960fa64e9",
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
                "count": 2,
                "score": 2,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [],
                "properties": {
                  "utility:0": [
                    {
                      "id": "d047",
                      "label": "Water Works",
                      "color": "utility",
                      "subtitle": "Water Works",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    },
                    {
                      "id": "d056",
                      "label": "Wild property",
                      "color": "utility",
                      "subtitle": "Wild property",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "rail",
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    }
                  ],
                  "green:0": [
                    {
                      "id": "d055",
                      "label": "Wild property",
                      "color": "green",
                      "subtitle": "Wild property",
                      "value": "4M",
                      "suit": "property",
                      "colors": [
                        "green",
                        "rail"
                      ],
                      "effect": "",
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    },
                    {
                      "id": "d039",
                      "label": "Pennsylvania Avenue",
                      "color": "green",
                      "subtitle": "Pennsylvania Avenue",
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
                    },
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
                  ],
                  "sky:0": [
                    {
                      "id": "d054",
                      "label": "Wild property",
                      "color": "sky",
                      "subtitle": "Wild property",
                      "value": "4M",
                      "suit": "property",
                      "colors": [
                        "sky",
                        "rail"
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
                  ],
                  "orange:0": [
                    {
                      "id": "d049",
                      "label": "Wild property",
                      "color": "orange",
                      "subtitle": "Wild property",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink",
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ],
                  "yellow:0": [
                    {
                      "id": "d034",
                      "label": "Atlantic Avenue",
                      "color": "yellow",
                      "subtitle": "Atlantic Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "yellow"
                      ],
                      "effect": "",
                      "set_name": "Yellow",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        6
                      ]
                    }
                  ],
                  "red:0": [
                    {
                      "id": "d051",
                      "label": "Wild property",
                      "color": "red",
                      "subtitle": "Wild property",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "red",
                        "yellow"
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
                "id": "baf691ac-60ab-5cf4-b394-02f24342044e",
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
                  ],
                  "orange:0": [
                    {
                      "id": "d028",
                      "label": "St. James Place",
                      "color": "orange",
                      "subtitle": "St. James Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    },
                    {
                      "id": "d050",
                      "label": "Wild property",
                      "color": "orange",
                      "subtitle": "Wild property",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink",
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ],
                  "pink:0": [
                    {
                      "id": "d027",
                      "label": "Virginia Avenue",
                      "color": "pink",
                      "subtitle": "Virginia Avenue",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink"
                      ],
                      "effect": "",
                      "set_name": "Pink",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        4
                      ]
                    }
                  ],
                  "brown:0": [
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
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "count": 3,
                "score": 2,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d010",
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
                    "id": "d017",
                    "label": "5M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "5M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d011",
                    "label": "3M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "3M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d007",
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
                  }
                ],
                "properties": {
                  "pink:0": [
                    {
                      "id": "d026",
                      "label": "States Avenue",
                      "color": "pink",
                      "subtitle": "States Avenue",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink"
                      ],
                      "effect": "",
                      "set_name": "Pink",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        4
                      ]
                    },
                    {
                      "id": "d025",
                      "label": "St. Charles Place",
                      "color": "pink",
                      "subtitle": "St. Charles Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink"
                      ],
                      "effect": "",
                      "set_name": "Pink",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        4
                      ]
                    }
                  ],
                  "utility:0": [
                    {
                      "id": "d046",
                      "label": "Electric Company",
                      "color": "utility",
                      "subtitle": "Electric Company",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
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
                    },
                    {
                      "id": "d040",
                      "label": "Park Place",
                      "color": "blue",
                      "subtitle": "Park Place",
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
                  ],
                  "brown:0": [
                    {
                      "id": "d048",
                      "label": "Wild property",
                      "color": "brown",
                      "subtitle": "Wild property",
                      "value": "1M",
                      "suit": "property",
                      "colors": [
                        "brown",
                        "sky"
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
                      "id": "d101",
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
                      "id": "d103",
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
                  "orange:0": [
                    {
                      "id": "d029",
                      "label": "Tennessee Avenue",
                      "color": "orange",
                      "subtitle": "Tennessee Avenue",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    },
                    {
                      "id": "d030",
                      "label": "New York Avenue",
                      "color": "orange",
                      "subtitle": "New York Avenue",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ],
                  "sky:0": [
                    {
                      "id": "d023",
                      "label": "Vermont Avenue",
                      "color": "sky",
                      "subtitle": "Vermont Avenue",
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
                    },
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
                  ],
                  "red:0": [
                    {
                      "id": "d032",
                      "label": "Indiana Avenue",
                      "color": "red",
                      "subtitle": "Indiana Avenue",
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
                    },
                    {
                      "id": "d033",
                      "label": "Illinois Avenue",
                      "color": "red",
                      "subtitle": "Illinois Avenue",
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
                  ],
                  "yellow:0": [
                    {
                      "id": "d035",
                      "label": "Ventnor Avenue",
                      "color": "yellow",
                      "subtitle": "Ventnor Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "yellow"
                      ],
                      "effect": "",
                      "set_name": "Yellow",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        6
                      ]
                    }
                  ],
                  "rail:0": [
                    {
                      "id": "d043",
                      "label": "Pennsylvania Railroad",
                      "color": "rail",
                      "subtitle": "Pennsylvania Railroad",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "rail"
                      ],
                      "effect": "",
                      "set_name": "Railroads",
                      "set_size": 4,
                      "rent_ladder": [
                        1,
                        2,
                        3,
                        4
                      ]
                    }
                  ],
                  "green:0": [
                    {
                      "id": "d038",
                      "label": "North Carolina Avenue",
                      "color": "green",
                      "subtitle": "North Carolina Avenue",
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
              }
            ],
            "hand": [
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
                "id": "d015",
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
            "community": [],
            "discard": {
              "id": "d063",
              "label": "Rent",
              "color": "red",
              "subtitle": "Rent",
              "value": "1M",
              "suit": "action",
              "colors": [
                "red",
                "yellow"
              ],
              "effect": "rent",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 36,
            "pot": 0,
            "message": "Played Rent.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 1,
              "rent_multiplier": 1,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": []
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
                  "key": "utility:0",
                  "color": "utility",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 2
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "green:0",
                  "color": "green",
                  "count": 3,
                  "set_size": 3,
                  "complete": true,
                  "rent": 7
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
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "yellow:0",
                  "color": "yellow",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
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
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 3
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "pink:0",
                  "color": "pink",
                  "count": 1,
                  "set_size": 3,
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
                  "rent": 1
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "pink:0",
                  "color": "pink",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "utility:0",
                  "color": "utility",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "blue:0",
                  "color": "blue",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 8
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "brown:0",
                  "color": "brown",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 9
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 3
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "sky:0",
                  "color": "sky",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "red:0",
                  "color": "red",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 3
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "yellow:0",
                  "color": "yellow",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "rail:0",
                  "color": "rail",
                  "count": 1,
                  "set_size": 4,
                  "complete": false,
                  "rent": 1
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
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
      }
    ]
  },
  {
    "id": "linked-payment-no-mercy",
    "label": "Monopoly Deal No Mercy \u00b7 payment carries buildings",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": "d032",
    "room": {
      "id": "f0aa7c04-1b6e-584c-9d67-2cb419d6ceed",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal-no-mercy",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 3,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "9dfa1ffd-ebb9-57bf-8830-b8d18ee9b3da",
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
        }
      ],
      "messages": [],
      "game": {
        "game_id": "deal-no-mercy",
        "phase": "playing",
        "current_player": "baf691ac-60ab-5cf4-b394-02f24342044e",
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
            "bank": [
              {
                "id": "d062",
                "label": "Double rent",
                "color": "red",
                "subtitle": "Double rent",
                "value": "1M",
                "suit": "action",
                "colors": [
                  "red",
                  "yellow"
                ],
                "effect": "rent_double",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d057",
                "label": "Rent",
                "color": "brown",
                "subtitle": "Rent",
                "value": "1M",
                "suit": "action",
                "colors": [
                  "brown",
                  "sky"
                ],
                "effect": "rent",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {
              "pink:0": [
                {
                  "id": "d048",
                  "label": "Wild property",
                  "color": "pink",
                  "subtitle": "Wild property",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink",
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "green:0": [
                {
                  "id": "d055",
                  "label": "Wild property",
                  "color": "green",
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
                  "set_name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ]
                },
                {
                  "id": "d035",
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
              ],
              "utility:0": [
                {
                  "id": "d054",
                  "label": "Wild property",
                  "color": "utility",
                  "subtitle": "Wild property",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail",
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                },
                {
                  "id": "d044",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
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
            "count": 3,
            "score": 0,
            "chips": null,
            "bet": 0,
            "folded": false,
            "eliminated": false,
            "removed_slots": [],
            "cards": [],
            "bank": [
              {
                "id": "d013",
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
                "id": "d012",
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
                "id": "d015",
                "label": "5M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "5M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {
              "yellow:0": [
                {
                  "id": "d032",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                },
                {
                  "id": "d101",
                  "label": "Shack",
                  "color": "yellow",
                  "subtitle": "Shack",
                  "value": "3M",
                  "suit": "action",
                  "colors": [],
                  "effect": "shack",
                  "set_name": null,
                  "set_size": null,
                  "rent_ladder": []
                }
              ],
              "rail:0": [
                {
                  "id": "d040",
                  "label": "Reading Railroad",
                  "color": "rail",
                  "subtitle": "Reading Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                },
                {
                  "id": "d056",
                  "label": "Wild property",
                  "color": "rail",
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
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d027",
                  "label": "Tennessee Avenue",
                  "color": "orange",
                  "subtitle": "Tennessee Avenue",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ]
            }
          },
          {
            "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
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
                "id": "d063",
                "label": "Rent",
                "color": "green",
                "subtitle": "Rent",
                "value": "1M",
                "suit": "action",
                "colors": [
                  "green",
                  "blue"
                ],
                "effect": "rent",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
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
                "id": "d100",
                "label": "Shack",
                "color": "neutral",
                "subtitle": "Shack",
                "value": "3M",
                "suit": "action",
                "colors": [],
                "effect": "shack",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d008",
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
                "id": "d017",
                "label": "15M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "15M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "properties": {
              "green:0": [
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
                  "effect": "",
                  "set_name": "Green",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    7
                  ]
                },
                {
                  "id": "d037",
                  "label": "Pennsylvania Avenue",
                  "color": "green",
                  "subtitle": "Pennsylvania Avenue",
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
              ],
              "red:0": [
                {
                  "id": "d029",
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
                },
                {
                  "id": "d049",
                  "label": "Wild property",
                  "color": "red",
                  "subtitle": "Wild property",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "red",
                    "yellow"
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
              ],
              "yellow:0": [
                {
                  "id": "d034",
                  "label": "Marvin Gardens",
                  "color": "yellow",
                  "subtitle": "Marvin Gardens",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d026",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                },
                {
                  "id": "d028",
                  "label": "New York Avenue",
                  "color": "orange",
                  "subtitle": "New York Avenue",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ]
            }
          }
        ],
        "hand": [
          {
            "id": "d002",
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
            "id": "d001",
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
            "id": "d058",
            "label": "Double rent",
            "color": "brown",
            "subtitle": "Double rent",
            "value": "1M",
            "suit": "action",
            "colors": [
              "brown",
              "sky"
            ],
            "effect": "rent_double",
            "set_name": null,
            "set_size": null,
            "rent_ladder": []
          }
        ],
        "community": [],
        "discard": {
          "id": "d059",
          "label": "Rent",
          "color": "pink",
          "subtitle": "Rent",
          "value": "1M",
          "suit": "action",
          "colors": [
            "pink",
            "orange"
          ],
          "effect": "rent",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 59,
        "pot": 0,
        "message": "Played Rent.",
        "actions": [
          {
            "label": "Pay 1M \u00b7 select bank/property cards",
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
              "d013",
              "d012",
              "d015",
              "d032",
              "d101",
              "d040",
              "d027"
            ]
          }
        ],
        "winners": [],
        "detail": {
          "moves": 0,
          "rent_multiplier": 1,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": []
          },
          "pending": "bill",
          "payment_amount": 1,
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
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 4
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "utility:0",
              "color": "utility",
              "count": 2,
              "set_size": 2,
              "complete": true,
              "rent": 2
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 7
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "rail:0",
              "color": "rail",
              "count": 2,
              "set_size": 4,
              "complete": false,
              "rent": 2
            },
            {
              "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "green:0",
              "color": "green",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 4
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "red:0",
              "color": "red",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 3
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
              "key": "orange:0",
              "color": "orange",
              "count": 2,
              "set_size": 3,
              "complete": false,
              "rent": 3
            }
          ],
          "pending_action": {
            "kind": "bill",
            "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "amount": 1,
            "blocked": false,
            "stage": "payment",
            "transfers": [],
            "collection": null,
            "category": null,
            "source_collection": "pink:0",
            "multiplier": 1
          },
          "payment_bundles": [
            {
              "card": "d013",
              "transfers": [
                {
                  "id": "d013",
                  "value": 4
                }
              ]
            },
            {
              "card": "d012",
              "transfers": [
                {
                  "id": "d012",
                  "value": 4
                }
              ]
            },
            {
              "card": "d015",
              "transfers": [
                {
                  "id": "d015",
                  "value": 5
                }
              ]
            },
            {
              "card": "d032",
              "transfers": [
                {
                  "id": "d032",
                  "value": 3
                },
                {
                  "id": "d101",
                  "value": 3
                }
              ]
            },
            {
              "card": "d101",
              "transfers": [
                {
                  "id": "d101",
                  "value": 3
                }
              ]
            },
            {
              "card": "d040",
              "transfers": [
                {
                  "id": "d040",
                  "value": 2
                }
              ]
            },
            {
              "card": "d027",
              "transfers": [
                {
                  "id": "d027",
                  "value": 2
                }
              ]
            }
          ]
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": [
      {
        "label": "Pay with linked assets",
        "action": {
          "type": "pay",
          "card": "",
          "target": "",
          "color": "",
          "choice": "",
          "amount": 0,
          "slot": 0,
          "cards": [
            "d032"
          ],
          "groups": []
        },
        "room": {
          "id": "f0aa7c04-1b6e-584c-9d67-2cb419d6ceed",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal-no-mercy",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 3,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "9dfa1ffd-ebb9-57bf-8830-b8d18ee9b3da",
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
            }
          ],
          "messages": [],
          "game": {
            "game_id": "deal-no-mercy",
            "phase": "playing",
            "current_player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
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
                "bank": [
                  {
                    "id": "d062",
                    "label": "Double rent",
                    "color": "red",
                    "subtitle": "Double rent",
                    "value": "1M",
                    "suit": "action",
                    "colors": [
                      "red",
                      "yellow"
                    ],
                    "effect": "rent_double",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d057",
                    "label": "Rent",
                    "color": "brown",
                    "subtitle": "Rent",
                    "value": "1M",
                    "suit": "action",
                    "colors": [
                      "brown",
                      "sky"
                    ],
                    "effect": "rent",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {
                  "yellow:0": [
                    {
                      "id": "d032",
                      "label": "Atlantic Avenue",
                      "color": "yellow",
                      "subtitle": "Atlantic Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "yellow"
                      ],
                      "effect": "",
                      "set_name": "Yellow",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        6
                      ]
                    },
                    {
                      "id": "d101",
                      "label": "Shack",
                      "color": "yellow",
                      "subtitle": "Shack",
                      "value": "3M",
                      "suit": "action",
                      "colors": [],
                      "effect": "shack",
                      "set_name": null,
                      "set_size": null,
                      "rent_ladder": []
                    }
                  ],
                  "pink:0": [
                    {
                      "id": "d048",
                      "label": "Wild property",
                      "color": "pink",
                      "subtitle": "Wild property",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink",
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Pink",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        4
                      ]
                    }
                  ],
                  "green:0": [
                    {
                      "id": "d055",
                      "label": "Wild property",
                      "color": "green",
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
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    },
                    {
                      "id": "d035",
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
                  ],
                  "utility:0": [
                    {
                      "id": "d054",
                      "label": "Wild property",
                      "color": "utility",
                      "subtitle": "Wild property",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "rail",
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
                      "set_size": 2,
                      "rent_ladder": [
                        1,
                        2
                      ]
                    },
                    {
                      "id": "d044",
                      "label": "Electric Company",
                      "color": "utility",
                      "subtitle": "Electric Company",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
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
                "count": 3,
                "score": 0,
                "chips": null,
                "bet": 0,
                "folded": false,
                "eliminated": false,
                "removed_slots": [],
                "cards": [],
                "bank": [
                  {
                    "id": "d013",
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
                    "id": "d012",
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
                    "id": "d015",
                    "label": "5M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "5M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {
                  "rail:0": [
                    {
                      "id": "d040",
                      "label": "Reading Railroad",
                      "color": "rail",
                      "subtitle": "Reading Railroad",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "rail"
                      ],
                      "effect": "",
                      "set_name": "Railroads",
                      "set_size": 4,
                      "rent_ladder": [
                        1,
                        2,
                        3,
                        4
                      ]
                    },
                    {
                      "id": "d056",
                      "label": "Wild property",
                      "color": "rail",
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
                      "set_name": "Railroads",
                      "set_size": 4,
                      "rent_ladder": [
                        1,
                        2,
                        3,
                        4
                      ]
                    }
                  ],
                  "orange:0": [
                    {
                      "id": "d027",
                      "label": "Tennessee Avenue",
                      "color": "orange",
                      "subtitle": "Tennessee Avenue",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ]
                }
              },
              {
                "id": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
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
                    "id": "d063",
                    "label": "Rent",
                    "color": "green",
                    "subtitle": "Rent",
                    "value": "1M",
                    "suit": "action",
                    "colors": [
                      "green",
                      "blue"
                    ],
                    "effect": "rent",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
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
                    "id": "d100",
                    "label": "Shack",
                    "color": "neutral",
                    "subtitle": "Shack",
                    "value": "3M",
                    "suit": "action",
                    "colors": [],
                    "effect": "shack",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d008",
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
                    "id": "d017",
                    "label": "15M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "15M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  }
                ],
                "properties": {
                  "green:0": [
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
                      "effect": "",
                      "set_name": "Green",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        7
                      ]
                    },
                    {
                      "id": "d037",
                      "label": "Pennsylvania Avenue",
                      "color": "green",
                      "subtitle": "Pennsylvania Avenue",
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
                  ],
                  "red:0": [
                    {
                      "id": "d029",
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
                    },
                    {
                      "id": "d049",
                      "label": "Wild property",
                      "color": "red",
                      "subtitle": "Wild property",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "red",
                        "yellow"
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
                  ],
                  "yellow:0": [
                    {
                      "id": "d034",
                      "label": "Marvin Gardens",
                      "color": "yellow",
                      "subtitle": "Marvin Gardens",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "yellow"
                      ],
                      "effect": "",
                      "set_name": "Yellow",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        6
                      ]
                    }
                  ],
                  "orange:0": [
                    {
                      "id": "d026",
                      "label": "St. James Place",
                      "color": "orange",
                      "subtitle": "St. James Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    },
                    {
                      "id": "d028",
                      "label": "New York Avenue",
                      "color": "orange",
                      "subtitle": "New York Avenue",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ]
                }
              }
            ],
            "hand": [
              {
                "id": "d002",
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
                "id": "d001",
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
                "id": "d058",
                "label": "Double rent",
                "color": "brown",
                "subtitle": "Double rent",
                "value": "1M",
                "suit": "action",
                "colors": [
                  "brown",
                  "sky"
                ],
                "effect": "rent_double",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              }
            ],
            "community": [],
            "discard": {
              "id": "d059",
              "label": "Rent",
              "color": "pink",
              "subtitle": "Rent",
              "value": "1M",
              "suit": "action",
              "colors": [
                "pink",
                "orange"
              ],
              "effect": "rent",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 59,
            "pot": 0,
            "message": "Played Rent.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 0,
              "rent_multiplier": 1,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": []
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
              "collections": [
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "yellow:0",
                  "color": "yellow",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 7
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "pink:0",
                  "color": "pink",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "green:0",
                  "color": "green",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 4
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "utility:0",
                  "color": "utility",
                  "count": 2,
                  "set_size": 2,
                  "complete": true,
                  "rent": 2
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "rail:0",
                  "color": "rail",
                  "count": 2,
                  "set_size": 4,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "green:0",
                  "color": "green",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 4
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "red:0",
                  "color": "red",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 3
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "yellow:0",
                  "color": "yellow",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 2,
                  "set_size": 3,
                  "complete": false,
                  "rent": 3
                }
              ],
              "pending_action": {
                "kind": "bill",
                "actor": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "responder": "29420896-d26f-5a05-9f4c-8daf0c6adb27",
                "amount": 1,
                "blocked": false,
                "stage": "counter",
                "transfers": [],
                "collection": null,
                "category": null,
                "source_collection": "pink:0",
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
      }
    ]
  },
  {
    "id": "crowded-classic",
    "label": "Monopoly Deal \u00b7 13 sets and ten bank cards",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "2c7394a6-d6c3-5dda-b568-ffdcc1c0c3b8",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "92df4224-ab65-58e7-a659-f053d261b594",
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
                "id": "d004",
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
                "id": "d005",
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
                "id": "d007",
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
                "id": "d008",
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
                "id": "d009",
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
                "id": "d010",
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
                "id": "d011",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d012",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
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
              ],
              "pink:0": [
                {
                  "id": "d025",
                  "label": "St. Charles Place",
                  "color": "pink",
                  "subtitle": "St. Charles Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d028",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
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
              ],
              "yellow:0": [
                {
                  "id": "d034",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
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
              ],
              "blue:0": [
                {
                  "id": "d040",
                  "label": "Park Place",
                  "color": "blue",
                  "subtitle": "Park Place",
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
              ],
              "rail:0": [
                {
                  "id": "d042",
                  "label": "Reading Railroad",
                  "color": "rail",
                  "subtitle": "Reading Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "utility:0": [
                {
                  "id": "d046",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
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
              ],
              "blue:1": [
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
              ],
              "green:1": [
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
          },
          {
            "label": "Move \u00b7 Pink",
            "action": {
              "type": "rearrange",
              "card": "d025",
              "target": "",
              "color": "pink",
              "choice": "pink:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Orange",
            "action": {
              "type": "rearrange",
              "card": "d028",
              "target": "",
              "color": "orange",
              "choice": "orange:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Red",
            "action": {
              "type": "rearrange",
              "card": "d031",
              "target": "",
              "color": "red",
              "choice": "red:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Yellow",
            "action": {
              "type": "rearrange",
              "card": "d034",
              "target": "",
              "color": "yellow",
              "choice": "yellow:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d037",
              "target": "",
              "color": "green",
              "choice": "green:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d037",
              "target": "",
              "color": "green",
              "choice": "green:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d040",
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
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d040",
              "target": "",
              "color": "blue",
              "choice": "blue:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Railroads",
            "action": {
              "type": "rearrange",
              "card": "d042",
              "target": "",
              "color": "rail",
              "choice": "rail:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Utilities",
            "action": {
              "type": "rearrange",
              "card": "d046",
              "target": "",
              "color": "utility",
              "choice": "utility:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d041",
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
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d041",
              "target": "",
              "color": "blue",
              "choice": "blue:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
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
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d053",
              "target": "",
              "color": "green",
              "choice": "green:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d053",
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
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d053",
              "target": "",
              "color": "blue",
              "choice": "blue:2",
              "amount": 0,
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
          "rent_multiplier": 1,
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
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "rail:0",
              "color": "rail",
              "count": 1,
              "set_size": 4,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "utility:0",
              "color": "utility",
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:1",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:1",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            }
          ],
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": []
  },
  {
    "id": "crowded-opponent-classic",
    "label": "Monopoly Deal \u00b7 inspect 13 public sets",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "09ca5abe-db72-5cbf-90ca-6f393cbddb1c",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "e0ee3e96-075d-5d41-8b1d-bed5cd845e6e",
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
                "id": "d004",
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
                "id": "d005",
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
                "id": "d007",
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
                "id": "d008",
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
                "id": "d009",
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
                "id": "d010",
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
                "id": "d011",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d012",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
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
              ],
              "pink:0": [
                {
                  "id": "d025",
                  "label": "St. Charles Place",
                  "color": "pink",
                  "subtitle": "St. Charles Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d028",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
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
              ],
              "yellow:0": [
                {
                  "id": "d034",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
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
              ],
              "blue:0": [
                {
                  "id": "d040",
                  "label": "Park Place",
                  "color": "blue",
                  "subtitle": "Park Place",
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
              ],
              "rail:0": [
                {
                  "id": "d042",
                  "label": "Reading Railroad",
                  "color": "rail",
                  "subtitle": "Reading Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "utility:0": [
                {
                  "id": "d046",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
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
              ],
              "blue:1": [
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
              ],
              "green:1": [
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
        "discard": null,
        "drawn": null,
        "draw_count": 79,
        "pot": 0,
        "message": "Three sets. One winner.",
        "actions": [],
        "winners": [],
        "detail": {
          "moves": 3,
          "rent_multiplier": 1,
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
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "rail:0",
              "color": "rail",
              "count": 1,
              "set_size": 4,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "utility:0",
              "color": "utility",
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:1",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:1",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            }
          ],
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": []
  },
  {
    "id": "crowded-sly-response",
    "label": "Deal \u00b7 review a wild-card steal on a crowded board",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "c7071c81-baa4-56f9-ba7e-cb646133f177",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "bfec48f9-7880-5a62-9b87-b5e6944237cf",
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
                "id": "d004",
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
                "id": "d005",
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
                "id": "d007",
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
                "id": "d008",
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
                "id": "d009",
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
                "id": "d010",
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
                "id": "d011",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d012",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
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
              ],
              "pink:0": [
                {
                  "id": "d025",
                  "label": "St. Charles Place",
                  "color": "pink",
                  "subtitle": "St. Charles Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d028",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
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
              ],
              "yellow:0": [
                {
                  "id": "d034",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
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
              ],
              "blue:0": [
                {
                  "id": "d040",
                  "label": "Park Place",
                  "color": "blue",
                  "subtitle": "Park Place",
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
              ],
              "rail:0": [
                {
                  "id": "d042",
                  "label": "Reading Railroad",
                  "color": "rail",
                  "subtitle": "Reading Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "utility:0": [
                {
                  "id": "d046",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
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
              ],
              "blue:1": [
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
              ],
              "green:1": [
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
          "id": "d091",
          "label": "Sly deal",
          "color": "neutral",
          "subtitle": "Sly deal",
          "value": "3M",
          "suit": "action",
          "colors": [],
          "effect": "sly",
          "set_name": null,
          "set_size": null,
          "rent_ladder": []
        },
        "drawn": null,
        "draw_count": 78,
        "pot": 0,
        "message": "Played Sly deal.",
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
          "rent_multiplier": 1,
          "debts": {
            "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
            "baf691ac-60ab-5cf4-b394-02f24342044e": [],
            "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
            "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
          },
          "pending": "sly",
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
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "rail:0",
              "color": "rail",
              "count": 1,
              "set_size": 4,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "utility:0",
              "color": "utility",
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:1",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:1",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            }
          ],
          "pending_action": {
            "kind": "sly",
            "actor": "baf691ac-60ab-5cf4-b394-02f24342044e",
            "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "responder": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
            "amount": null,
            "blocked": false,
            "stage": "counter",
            "transfers": [
              {
                "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "cards": [
                  "d053"
                ]
              }
            ],
            "collection": null,
            "category": null,
            "source_collection": null,
            "multiplier": 1
          },
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": [
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
        "room": {
          "id": "c7071c81-baa4-56f9-ba7e-cb646133f177",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "bfec48f9-7880-5a62-9b87-b5e6944237cf",
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
                    "id": "d004",
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
                    "id": "d005",
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
                    "id": "d007",
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
                    "id": "d008",
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
                    "id": "d009",
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
                    "id": "d010",
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
                    "id": "d011",
                    "label": "3M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "3M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d012",
                    "label": "3M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "3M",
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
                  ],
                  "pink:0": [
                    {
                      "id": "d025",
                      "label": "St. Charles Place",
                      "color": "pink",
                      "subtitle": "St. Charles Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink"
                      ],
                      "effect": "",
                      "set_name": "Pink",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        4
                      ]
                    }
                  ],
                  "orange:0": [
                    {
                      "id": "d028",
                      "label": "St. James Place",
                      "color": "orange",
                      "subtitle": "St. James Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ],
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
                  ],
                  "yellow:0": [
                    {
                      "id": "d034",
                      "label": "Atlantic Avenue",
                      "color": "yellow",
                      "subtitle": "Atlantic Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "yellow"
                      ],
                      "effect": "",
                      "set_name": "Yellow",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        6
                      ]
                    }
                  ],
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
                  ],
                  "blue:0": [
                    {
                      "id": "d040",
                      "label": "Park Place",
                      "color": "blue",
                      "subtitle": "Park Place",
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
                  ],
                  "rail:0": [
                    {
                      "id": "d042",
                      "label": "Reading Railroad",
                      "color": "rail",
                      "subtitle": "Reading Railroad",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "rail"
                      ],
                      "effect": "",
                      "set_name": "Railroads",
                      "set_size": 4,
                      "rent_ladder": [
                        1,
                        2,
                        3,
                        4
                      ]
                    }
                  ],
                  "utility:0": [
                    {
                      "id": "d046",
                      "label": "Electric Company",
                      "color": "utility",
                      "subtitle": "Electric Company",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
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
                  ],
                  "blue:1": [
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
                "properties": {
                  "green:0": [
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
              "id": "d091",
              "label": "Sly deal",
              "color": "neutral",
              "subtitle": "Sly deal",
              "value": "3M",
              "suit": "action",
              "colors": [],
              "effect": "sly",
              "set_name": null,
              "set_size": null,
              "rent_ladder": []
            },
            "drawn": null,
            "draw_count": 78,
            "pot": 0,
            "message": "Played Sly deal.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "rent_multiplier": 1,
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
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "pink:0",
                  "color": "pink",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "yellow:0",
                  "color": "yellow",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
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
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "rail:0",
                  "color": "rail",
                  "count": 1,
                  "set_size": 4,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "utility:0",
                  "color": "utility",
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
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "blue:1",
                  "color": "blue",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 3
                },
                {
                  "player": "baf691ac-60ab-5cf4-b394-02f24342044e",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                }
              ],
              "pending_action": null,
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
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
        "room": {
          "id": "c7071c81-baa4-56f9-ba7e-cb646133f177",
          "name": "Synthetic Deal workspace",
          "code": "DESIGN1",
          "game_id": "deal",
          "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
          "capacity": 4,
          "settings": {},
          "status": "playing",
          "revision": 2,
          "match_id": "bfec48f9-7880-5a62-9b87-b5e6944237cf",
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
                    "id": "d004",
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
                    "id": "d005",
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
                    "id": "d007",
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
                    "id": "d008",
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
                    "id": "d009",
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
                    "id": "d010",
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
                    "id": "d011",
                    "label": "3M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "3M",
                    "suit": "",
                    "colors": [],
                    "effect": "",
                    "set_name": null,
                    "set_size": null,
                    "rent_ladder": []
                  },
                  {
                    "id": "d012",
                    "label": "3M",
                    "color": "neutral",
                    "subtitle": "MONEY",
                    "value": "3M",
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
                  ],
                  "pink:0": [
                    {
                      "id": "d025",
                      "label": "St. Charles Place",
                      "color": "pink",
                      "subtitle": "St. Charles Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "pink"
                      ],
                      "effect": "",
                      "set_name": "Pink",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        2,
                        4
                      ]
                    }
                  ],
                  "orange:0": [
                    {
                      "id": "d028",
                      "label": "St. James Place",
                      "color": "orange",
                      "subtitle": "St. James Place",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "orange"
                      ],
                      "effect": "",
                      "set_name": "Orange",
                      "set_size": 3,
                      "rent_ladder": [
                        1,
                        3,
                        5
                      ]
                    }
                  ],
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
                  ],
                  "yellow:0": [
                    {
                      "id": "d034",
                      "label": "Atlantic Avenue",
                      "color": "yellow",
                      "subtitle": "Atlantic Avenue",
                      "value": "3M",
                      "suit": "property",
                      "colors": [
                        "yellow"
                      ],
                      "effect": "",
                      "set_name": "Yellow",
                      "set_size": 3,
                      "rent_ladder": [
                        2,
                        4,
                        6
                      ]
                    }
                  ],
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
                  ],
                  "blue:0": [
                    {
                      "id": "d040",
                      "label": "Park Place",
                      "color": "blue",
                      "subtitle": "Park Place",
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
                  ],
                  "rail:0": [
                    {
                      "id": "d042",
                      "label": "Reading Railroad",
                      "color": "rail",
                      "subtitle": "Reading Railroad",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "rail"
                      ],
                      "effect": "",
                      "set_name": "Railroads",
                      "set_size": 4,
                      "rent_ladder": [
                        1,
                        2,
                        3,
                        4
                      ]
                    }
                  ],
                  "utility:0": [
                    {
                      "id": "d046",
                      "label": "Electric Company",
                      "color": "utility",
                      "subtitle": "Electric Company",
                      "value": "2M",
                      "suit": "property",
                      "colors": [
                        "utility"
                      ],
                      "effect": "",
                      "set_name": "Utilities",
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
                  ],
                  "blue:1": [
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
                  ],
                  "green:1": [
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
            "draw_count": 78,
            "pot": 0,
            "message": "Played Sly deal.",
            "actions": [],
            "winners": [],
            "detail": {
              "moves": 2,
              "rent_multiplier": 1,
              "debts": {
                "c0326a78-e994-5c4e-a0d9-a0a575f279e2": [],
                "baf691ac-60ab-5cf4-b394-02f24342044e": [],
                "29420896-d26f-5a05-9f4c-8daf0c6adb27": [],
                "c96f7e8a-ae0d-5d93-bd8b-69a15d5ac117": []
              },
              "pending": "sly",
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
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "pink:0",
                  "color": "pink",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "orange:0",
                  "color": "orange",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "red:0",
                  "color": "red",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "yellow:0",
                  "color": "yellow",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "green:0",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
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
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "rail:0",
                  "color": "rail",
                  "count": 1,
                  "set_size": 4,
                  "complete": false,
                  "rent": 1
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "utility:0",
                  "color": "utility",
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
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "blue:1",
                  "color": "blue",
                  "count": 1,
                  "set_size": 2,
                  "complete": false,
                  "rent": 3
                },
                {
                  "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                  "key": "green:1",
                  "color": "green",
                  "count": 1,
                  "set_size": 3,
                  "complete": false,
                  "rent": 2
                }
              ],
              "pending_action": {
                "kind": "sly",
                "actor": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "target": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                "responder": "baf691ac-60ab-5cf4-b394-02f24342044e",
                "amount": null,
                "blocked": true,
                "stage": "counter",
                "transfers": [
                  {
                    "source": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
                    "target": "baf691ac-60ab-5cf4-b394-02f24342044e",
                    "cards": [
                      "d053"
                    ]
                  }
                ],
                "collection": null,
                "category": null,
                "source_collection": null,
                "multiplier": 1
              },
              "payment_bundles": []
            }
          },
          "paused": false,
          "missing_players": [],
          "invite_token": null,
          "bot_pending": false,
          "bot_due_at": null,
          "last_action": null,
          "activity": []
        }
      }
    ]
  },
  {
    "id": "crowded-no-mercy",
    "label": "Monopoly Deal No Mercy \u00b7 13 sets and ten bank cards",
    "selfId": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
    "focusCard": null,
    "room": {
      "id": "7aff5887-9d66-510a-ac79-bc2b89f409a5",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal-no-mercy",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "740e188d-90f1-5839-9a8b-35a66a5cdee8",
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
                "id": "d004",
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
                "id": "d005",
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
                "id": "d007",
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
                "id": "d008",
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
                "id": "d009",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d010",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d011",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d012",
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
                }
              ],
              "sky:0": [
                {
                  "id": "d020",
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
              ],
              "pink:0": [
                {
                  "id": "d023",
                  "label": "St. Charles Place",
                  "color": "pink",
                  "subtitle": "St. Charles Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d026",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
              "red:0": [
                {
                  "id": "d029",
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
              ],
              "yellow:0": [
                {
                  "id": "d032",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
              "green:0": [
                {
                  "id": "d035",
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
              ],
              "blue:0": [
                {
                  "id": "d038",
                  "label": "Park Place",
                  "color": "blue",
                  "subtitle": "Park Place",
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
              ],
              "rail:0": [
                {
                  "id": "d040",
                  "label": "Reading Railroad",
                  "color": "rail",
                  "subtitle": "Reading Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "utility:0": [
                {
                  "id": "d044",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ],
              "brown:1": [
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
              "blue:1": [
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
              ],
              "green:1": [
                {
                  "id": "d051",
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
            "id": "d085",
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
            "label": "Bank 4M",
            "action": {
              "type": "bank",
              "card": "d085",
              "target": "",
              "color": "",
              "choice": "",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d018",
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
            "label": "Move \u00b7 Light blue",
            "action": {
              "type": "rearrange",
              "card": "d020",
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
          },
          {
            "label": "Move \u00b7 Pink",
            "action": {
              "type": "rearrange",
              "card": "d023",
              "target": "",
              "color": "pink",
              "choice": "pink:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Orange",
            "action": {
              "type": "rearrange",
              "card": "d026",
              "target": "",
              "color": "orange",
              "choice": "orange:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Red",
            "action": {
              "type": "rearrange",
              "card": "d029",
              "target": "",
              "color": "red",
              "choice": "red:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Yellow",
            "action": {
              "type": "rearrange",
              "card": "d032",
              "target": "",
              "color": "yellow",
              "choice": "yellow:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d035",
              "target": "",
              "color": "green",
              "choice": "green:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d035",
              "target": "",
              "color": "green",
              "choice": "green:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d038",
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
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d038",
              "target": "",
              "color": "blue",
              "choice": "blue:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Railroads",
            "action": {
              "type": "rearrange",
              "card": "d040",
              "target": "",
              "color": "rail",
              "choice": "rail:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Utilities",
            "action": {
              "type": "rearrange",
              "card": "d044",
              "target": "",
              "color": "utility",
              "choice": "utility:1",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d019",
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
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d039",
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
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d039",
              "target": "",
              "color": "blue",
              "choice": "blue:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
              "groups": []
            },
            "input": null,
            "minimum": null,
            "maximum": null,
            "step": 1,
            "eligible_cards": []
          },
          {
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d051",
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
            "label": "Move \u00b7 Green",
            "action": {
              "type": "rearrange",
              "card": "d051",
              "target": "",
              "color": "green",
              "choice": "green:2",
              "amount": 0,
              "slot": 0,
              "cards": [],
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
              "card": "d051",
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
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d051",
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
          },
          {
            "label": "Move \u00b7 Dark blue",
            "action": {
              "type": "rearrange",
              "card": "d051",
              "target": "",
              "color": "blue",
              "choice": "blue:2",
              "amount": 0,
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
          "rent_multiplier": 1,
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
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "rail:0",
              "color": "rail",
              "count": 1,
              "set_size": 4,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "utility:0",
              "color": "utility",
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:1",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:1",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            }
          ],
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": []
  },
  {
    "id": "crowded-opponent-no-mercy",
    "label": "Monopoly Deal No Mercy \u00b7 inspect 13 public sets",
    "selfId": "baf691ac-60ab-5cf4-b394-02f24342044e",
    "focusCard": null,
    "room": {
      "id": "912e77fe-9657-5ec5-af75-60cf91d471ce",
      "name": "Synthetic Deal workspace",
      "code": "DESIGN1",
      "game_id": "deal-no-mercy",
      "owner_id": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
      "capacity": 4,
      "settings": {},
      "status": "playing",
      "revision": 1,
      "match_id": "e8b146d0-8da9-54f7-a051-a668a5d2bfc6",
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
                "id": "d004",
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
                "id": "d005",
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
                "id": "d007",
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
                "id": "d008",
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
                "id": "d009",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d010",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d011",
                "label": "3M",
                "color": "neutral",
                "subtitle": "MONEY",
                "value": "3M",
                "suit": "",
                "colors": [],
                "effect": "",
                "set_name": null,
                "set_size": null,
                "rent_ladder": []
              },
              {
                "id": "d012",
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
                }
              ],
              "sky:0": [
                {
                  "id": "d020",
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
              ],
              "pink:0": [
                {
                  "id": "d023",
                  "label": "St. Charles Place",
                  "color": "pink",
                  "subtitle": "St. Charles Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "pink"
                  ],
                  "effect": "",
                  "set_name": "Pink",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    2,
                    4
                  ]
                }
              ],
              "orange:0": [
                {
                  "id": "d026",
                  "label": "St. James Place",
                  "color": "orange",
                  "subtitle": "St. James Place",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "orange"
                  ],
                  "effect": "",
                  "set_name": "Orange",
                  "set_size": 3,
                  "rent_ladder": [
                    1,
                    3,
                    5
                  ]
                }
              ],
              "red:0": [
                {
                  "id": "d029",
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
              ],
              "yellow:0": [
                {
                  "id": "d032",
                  "label": "Atlantic Avenue",
                  "color": "yellow",
                  "subtitle": "Atlantic Avenue",
                  "value": "3M",
                  "suit": "property",
                  "colors": [
                    "yellow"
                  ],
                  "effect": "",
                  "set_name": "Yellow",
                  "set_size": 3,
                  "rent_ladder": [
                    2,
                    4,
                    6
                  ]
                }
              ],
              "green:0": [
                {
                  "id": "d035",
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
              ],
              "blue:0": [
                {
                  "id": "d038",
                  "label": "Park Place",
                  "color": "blue",
                  "subtitle": "Park Place",
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
              ],
              "rail:0": [
                {
                  "id": "d040",
                  "label": "Reading Railroad",
                  "color": "rail",
                  "subtitle": "Reading Railroad",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "rail"
                  ],
                  "effect": "",
                  "set_name": "Railroads",
                  "set_size": 4,
                  "rent_ladder": [
                    1,
                    2,
                    3,
                    4
                  ]
                }
              ],
              "utility:0": [
                {
                  "id": "d044",
                  "label": "Electric Company",
                  "color": "utility",
                  "subtitle": "Electric Company",
                  "value": "2M",
                  "suit": "property",
                  "colors": [
                    "utility"
                  ],
                  "effect": "",
                  "set_name": "Utilities",
                  "set_size": 2,
                  "rent_ladder": [
                    1,
                    2
                  ]
                }
              ],
              "brown:1": [
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
              "blue:1": [
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
              ],
              "green:1": [
                {
                  "id": "d051",
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
        "discard": null,
        "drawn": null,
        "draw_count": 88,
        "pot": 0,
        "message": "Three sets. One winner.",
        "actions": [],
        "winners": [],
        "detail": {
          "moves": 3,
          "rent_multiplier": 1,
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
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "pink:0",
              "color": "pink",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "orange:0",
              "color": "orange",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "red:0",
              "color": "red",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "yellow:0",
              "color": "yellow",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:0",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "rail:0",
              "color": "rail",
              "count": 1,
              "set_size": 4,
              "complete": false,
              "rent": 1
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "utility:0",
              "color": "utility",
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
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "blue:1",
              "color": "blue",
              "count": 1,
              "set_size": 2,
              "complete": false,
              "rent": 3
            },
            {
              "player": "c0326a78-e994-5c4e-a0d9-a0a575f279e2",
              "key": "green:1",
              "color": "green",
              "count": 1,
              "set_size": 3,
              "complete": false,
              "rent": 2
            }
          ],
          "pending_action": null,
          "payment_bundles": []
        }
      },
      "paused": false,
      "missing_players": [],
      "invite_token": null,
      "bot_pending": false,
      "bot_due_at": null,
      "last_action": null,
      "activity": []
    },
    "transitions": []
  }
];
