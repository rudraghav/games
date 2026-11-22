/**
 * The event date travels as a whole number of days since 1 January 2020, so it
 * has no time of day and no time zone. Every conversion here is UTC arithmetic:
 * the same number is the same calendar day for every viewer.
 */
const EPOCH = Date.UTC(2020, 0, 1);
const DAY_MS = 86_400_000;
export const MAX_DAY = 40000;

/** `2026-12-20` for a native date input, or '' when there is no date. */
export function dayToDateInput(day: number | null) {
  if (day === null || !Number.isInteger(day) || day < 0 || day > MAX_DAY) return '';
  return new Date(EPOCH + day * DAY_MS).toISOString().slice(0, 10);
}

/** The day number for a native date input's value, or null when it is not a usable date. */
export function dateInputToDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, date] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(year, month - 1, date);
  const parsed = new Date(time);
  // 31 February rolls over into March; refuse it instead of saving another day.
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== date
  )
    return null;
  const day = Math.round((time - EPOCH) / DAY_MS);
  return day >= 0 && day <= MAX_DAY ? day : null;
}

const parts = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Saturday 20 December 2026", the same in every time zone. */
export function formatDay(day: number | null) {
  if (day === null || !Number.isInteger(day) || day < 0 || day > MAX_DAY) return '';
  const found = Object.fromEntries(
    parts.formatToParts(new Date(EPOCH + day * DAY_MS)).map((part) => [part.type, part.value]),
  );
  return `${found.weekday} ${found.day} ${found.month} ${found.year}`;
}

/** Today's day number in the viewer's own calendar, for the date input's lower bound. */
export function localToday(now = new Date()) {
  return Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - EPOCH) / DAY_MS);
}
