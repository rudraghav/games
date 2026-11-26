import type { TutorialDriver } from './tutorial-depth-run';

type Detail = {
  fates: string[];
  prompt: { candidates: { label: string | null; player: string | null }[] | null } | null;
};

/**
 * One real learner decision at the Truth or Dare table, through its own controls.
 * Tutorial rooms use the default settings, so this is always the friendly edition.
 * The kinds rotate by step so a walkthrough meets a truth, a dare and a burning building.
 */
export const playTruthOrDareDecision: TutorialDriver = async (page, before, step) => {
  const table = page.locator('#tutorial-game-table');
  const game = before.game!;
  const offered = game.actions.map((option) => option.action.type);
  if (offered.includes('pick')) {
    const picks = game.actions.filter((option) => option.action.type === 'pick');
    const choice = picks[step % picks.length];
    await table.getByRole('button', { name: choice.label, exact: true }).click();
  } else if (offered.includes('assign')) {
    const detail = game.detail as unknown as Detail;
    const names = before.members;
    for (const [row, candidate] of detail.prompt!.candidates!.entries()) {
      const name =
        candidate.label ??
        names.find((member) => member.id === candidate.player)?.name.replace(/^Bot\s+/i, '') ??
        '';
      await table
        .getByRole('group', { name, exact: true })
        .getByRole('radio', { name: detail.fates[row], exact: true })
        .check();
    }
    await table.getByRole('button', { name: 'Confirm fates', exact: true }).click();
  } else if (offered.includes('next')) {
    await table.getByRole('button', { name: 'Next turn', exact: true }).click();
  } else {
    // Mostly done, with an occasional pass: both are ordinary, scored choices.
    await table
      .getByRole('button', { name: step % 3 === 2 ? 'Pass' : 'Done', exact: true })
      .click();
  }
};
