import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@games/ui';
import { dealDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { DealCardInformation } from '@/games/deal/DealCardInformation';
import { dealInfoEntries } from '@/games/deal/information';
import { dealScenarios } from './generated/deal-scenarios';

function DealInformationPreview({ scenario = 'collections' }: { scenario?: string }) {
  const fixture = dealScenarios.find((item) => item.id === scenario)!;
  const room = mapRoom(fixture.room);
  const match = room.game!;
  const details = dealDetails(match.detail);
  const entries = dealInfoEntries(match, room, fixture.selfId, details);
  const [cardId, setCardId] = useState(
    fixture.focusCard ||
      (scenario === 'payment-bank'
        ? entries.find((entry) => entry.card.colors.length === 10)?.card.id
        : null) ||
      entries[0].card.id,
  );
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button data-info-story-opener onClick={() => setOpen(true)}>
        Open card info
      </Button>
      {open ? (
        <DealCardInformation
          room={room}
          match={match}
          selfId={fixture.selfId}
          pending={false}
          onAction={() => undefined}
          details={details}
          cardId={cardId}
          onCardChange={setCardId}
          onClose={() => setOpen(false)}
          restoreFocus={() =>
            document.querySelector<HTMLButtonElement>('[data-info-story-opener]')?.focus()
          }
        />
      ) : null}
    </>
  );
}
const meta = { title: 'Games/Deal information', component: DealInformationPreview } satisfies Meta<
  typeof DealInformationPreview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CompletedSet: Story = {};
export const AllColourWild: Story = { args: { scenario: 'payment-bank' } };
export const BoostedRent: Story = { args: { scenario: 'doubled-rent' } };
export const LargeHand: Story = { args: { scenario: 'information-hand' } };
