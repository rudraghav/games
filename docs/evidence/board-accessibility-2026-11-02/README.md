# Public board accessibility follow-up

The original 17-item audit release is complete. This next task addresses three
additional omissions confirmed in the actual Chromium accessibility tree:

- Four in a Row's main surface exposed its group but none of its42 cells.
- Mancala's main stores exposed bare counts without their supplied labels.
- Its overview exposed fourteen numbers without owner/pit/store identities.

Labels on generic containers were not represented as named objects. Existing
board renderers now use named read-only images for those positions, matching the
Four overview's established pattern. Mancala labels identify the public owner,
pit/store and seed count. Its legal buttons preserve the server's action label
and add the owner. All authoritative game actions and state remain unchanged.

The regression checks assert the browser's accessibility tree, not merely an
`aria-label` attribute. They cover all42 Four cells, all14 Mancala positions,
Enter/Space moves, nonmutating inspection, one overview focus stop and Escape
restoration at phone/desktop widths. Saved-room tests verify server readback and
refresh separately. No hidden state, dependency, schema or cloud setting changes.

Local checks and production publication are recorded separately in the final
verification receipt and root journal. These checks do not substitute for a
human native screen-reader usability study.
