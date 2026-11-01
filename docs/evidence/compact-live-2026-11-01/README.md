# Actual compact flow — 1 November 2026

Six fresh fixed-viewport screenshots show actual home, bot lobby and active
Four in a Row at phone 390×844 and desktop 1440×1000. These are synthetic QA
sessions. Room-code elements are masked. The exact owned room was abandoned,
its bot removed, its host left, then a fresh read returned 404. No active invite,
identity credential or real player data is retained.

The first game begins at 442px on phone (previously 600px) and 358px on desktop
(previously 479px). The first phone row is fully visible. Phone lobby seats use
one column with Ada and one Bot badge on a line. Ready and Start have full rows
at 549px and 607px, each 48px high. Desktop keeps them in one row. All six pages fit
the viewport. Active screens show a saved human move and bot response, with the
turn returned to the human. Every final screenshot was opened and reviewed.

checks.json stores sanitized final geometry and room closure. The separate
failed-flow-cleanup.json records closure of an earlier failed assertion room;
its resolved credential-bearing raw trace was discarded. Regular tests now
assert compact game identity, small art beside Players, full-row CTAs, collapsed
chat and current profile copy. Natural matches, refresh/rematch and pending/
disconnected checks remain.
