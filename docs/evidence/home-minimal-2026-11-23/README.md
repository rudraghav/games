# A minimal home page — 23 November 2026

## Why

The owner found the home page repetitive and cluttered, with weak hierarchy, and asked
for a minimal page that makes starting a new game the priority and demotes earlier
rooms. Measured before: 5,876px tall at 1440x900 and about 7,300px at 390x844; every
game appeared two or three times (five collection rails, a Featured banner, then all
30 large tiles), with nine category chips overlapping the rails.

## What it is now

1. Start: the headline "How do you want to play?" and exactly three actions. `Play
   solo` is the only filled button ("On your own or against bots"); `Create room`
   ("Play with friends") is the only one on the page; `Join a room` ("Have a code?")
   has an inline code field on wide screens.
2. Browse: a search field, one row of six occasion chips (All, Quick with bots, With
   friends, Two players, Solo, For teams) and a grid in which each game appears once
   as cover, name and one line ("2–10 players · 10–20 min"). Five columns at 1440, three
   near 800, two on a phone.

Demoted: progress is a small chip in the header, shown once a game has been finished;
a game in progress gets one slim Continue line and other rooms do not appear on the
home view; `Games` and `Your games` are quiet text tabs beside the Browse heading; an
invitation is one slim ticket above the headline, only when there is one.

Removed: the five rails and See all, the Featured banner, the Players dropdown, the
nine mechanic chips (kinds of game are search words now: "cards", "board games",
"casino"), the welcome strip and the Continue rail.

## Measured

| Screen | Before | Now (new visitor) | Now (returning, invitation, game in progress) |
| --- | --- | --- | --- |
| 1440x900 | 5,876px | 1,810px, first tile at y=508 | 1,941px |
| 390x844 | about 7,300px | 3,129px, first tile at y=516 | 3,274px |

## Checks

- `scripts/verify.py frontend contracts tooling`: pass (484 unit tests).
- `scripts/verify.py browser`: 526 passed, 77 skipped, 1 failed. The failure was the
  intermittent Uno saved-selection test seen once before; its cause is now found and
  fixed in the test: in about one No Mercy deal in fifty (84 of 4,000 simulated), taking
  the first legal move stacks draws until a player passes 25 cards and is out before a
  plain card can be played. The test now deals again in that case and passed 12 of 12
  repeats across desktop and phone.
- WebKit at iPhone 13 and 1440x900: no sideways overflow, 30 tiles, 2 and 5 columns,
  ticket notches drawn.

## Not verified

- Firefox (cover scaling uses CSS `zoom`; checked in Chromium and WebKit only).
- On a 664px-tall phone viewport, a player with both an invitation and a game in
  progress sees the first tiles start just below the first screen.
