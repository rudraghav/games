import type { AstrologyChart, AstrologyPlace, AstrologyReading } from '@games/api-client';
import computed from './astrology-chart-synthetic.json' with { type: 'json' };

// Deterministic Astronomy Engine fixture: J2000 noon, Greenwich. Not a person's birth data.
export const syntheticChart = computed as AstrologyChart;
export const syntheticPlace: AstrologyPlace = {
  id: 'geo:1',
  label: 'Greenwich · synthetic calculation fixture',
  latitude: 51.4779,
  longitude: 0,
  timezone: 'Europe/London',
  country_code: 'GB',
};
// Explicit presentation copy for Storybook/tests; never a production AI fallback.
export const syntheticAstrologyReading: AstrologyReading = {
  chart: syntheticChart,
  interpretation: {
    western: {
      focus_points: ['sun', 'moon'],
      normal:
        'Synthetic layout example: give your creative project a small, practical beginning. Read this together with the selected cards as a prompt for reflection.',
      quirky:
        'Synthetic layout example: your inner project manager has arrived with a colour-coded notebook. Give them one small task before they schedule a six-hour meeting.',
    },
    vedic: {
      focus_points: ['sun', 'moon'],
      normal:
        'Synthetic layout example: notice which routines support your curiosity. A little consistency can leave more space for a playful new interest.',
      quirky:
        'Synthetic layout example: let your calendar be a helpful sidekick rather than a dramatic final boss. One manageable quest is enough for today.',
    },
    tarot_connection:
      'Synthetic layout example: the chart and the three cards invite a balance between beginning, experimenting and following through with care.',
    next_step: 'Synthetic layout example: spend ten minutes trying one small creative experiment.',
  },
};
