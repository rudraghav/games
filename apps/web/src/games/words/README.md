# Word Agents table

The renderer consumes the viewer's authorized key or operative board and the
server's enumerated clue/guess options. It never infers hidden agents. Operatives
select a word, can clear it by selecting it again, then confirm; spymasters enter
a one-word clue and an allowed count. Pending or paused moves disable inputs.

The five-column board keeps a readable minimum width inside the shared
`HorizontalRail`. At narrow widths, touch scrolling and separate Previous/Next
controls below the board expose all columns without shrinking words or covering
squares. Focusing a word reveals that column. The decision area retains a stable
height, and its own scrolling keeps long controls reachable.

`tests/browser/crowded-board-party.spec.ts` checks four- and ten-seat legal
projections at 320, 390, 768 and 1440 pixels, including long words in operative
and spymaster views. Keyboard clue/guess selection, clearing, pending/paused
states and exact action payloads are checked separately. This is mounted
projection evidence; saved multiplayer and full-match behavior have separate
verification suites.
