import type { AstrologyPoint, AstrologySystemChart } from '@games/api-client';

export const planetSymbols: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  north_node: '☊',
  south_node: '☋',
};
const zodiacSigns = [
  { art: 'aries', rashi: 'Mesha' },
  { art: 'taurus', rashi: 'Vrishabha' },
  { art: 'gemini', rashi: 'Mithuna', vedicArt: 'mithuna' },
  { art: 'cancer', rashi: 'Karka' },
  { art: 'leo', rashi: 'Simha' },
  { art: 'virgo', rashi: 'Kanya' },
  { art: 'libra', rashi: 'Tula' },
  { art: 'scorpio', rashi: 'Vrishchika' },
  { art: 'sagittarius', rashi: 'Dhanu', vedicArt: 'dhanu' },
  { art: 'capricorn', rashi: 'Makara', vedicArt: 'makara' },
  { art: 'aquarius', rashi: 'Kumbha', vedicArt: 'kumbha' },
  { art: 'pisces', rashi: 'Meena' },
];

/** A house and a planet each carry their own tropical or sidereal sign index. */
export function zodiacSign(
  point: Pick<AstrologyPoint, 'sign_index' | 'sign'>,
  system: AstrologySystemChart['system'],
) {
  const entry = zodiacSigns[point.sign_index];
  if (!entry) return { name: point.sign, label: point.sign, image: undefined };
  const vedic = system === 'vedic';
  return {
    name: vedic ? entry.rashi : point.sign,
    label: vedic ? `${entry.rashi} (${point.sign})` : point.sign,
    image: `/art/zodiac/${(vedic && entry.vedicArt) || entry.art}.webp`,
  };
}

/** Formatting only: never round a returned 29.99° into the next sign. */
export function formatDegree(degree: number) {
  const whole = Math.floor(degree);
  const minute = Math.min(59, Math.floor((degree - whole) * 60 + 1e-8));
  return `${whole}° ${String(minute).padStart(2, '0')}′`;
}
export function wheelPoint(longitude: number, ascendant: number, radius: number) {
  const angle = ((longitude - ascendant) * Math.PI) / 180;
  return { x: 240 - radius * Math.cos(angle), y: 240 + radius * Math.sin(angle) };
}
/** Separate labels, preserving an exact leader back to every calculated point. */
export function planetLabels(points: readonly AstrologyPoint[], ascendant: number) {
  const ordered = points
    .map((point) => ({ point, angle: (point.longitude - ascendant + 360) % 360 }))
    .sort((a, b) => a.angle - b.angle);
  if (!ordered.length) return [];
  let cut = 0,
    largest = -1;
  ordered.forEach((entry, index) => {
    const gap = (ordered[(index + 1) % ordered.length].angle - entry.angle + 360) % 360;
    if (gap > largest) {
      largest = gap;
      cut = (index + 1) % ordered.length;
    }
  });
  let previous = -Infinity;
  return [...ordered.slice(cut), ...ordered.slice(0, cut)].map((entry, index, list) => {
    const angle = entry.angle + (index && entry.angle < list[0].angle ? 360 : 0);
    const labelAngle = Math.max(angle, previous + 19);
    previous = labelAngle;
    return {
      point: entry.point,
      anchor: wheelPoint(entry.point.longitude, ascendant, 166),
      label: wheelPoint(ascendant + labelAngle, ascendant, 129),
    };
  });
}
