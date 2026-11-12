/**
 * Break Calculator — ported from note-manager-v2 (BreakCalu.tsx) and generalized.
 *
 * Given a break start time in 24-hour "HH:mm" form and a duration in minutes
 * (default 90 = 1h30m), returns the expected return time as "HH:mm", wrapping
 * correctly across the midnight boundary (matching v2's `hours % 24` behavior).
 */

export const DEFAULT_BREAK_MINUTES = 90;

const MINUTES_PER_DAY = 24 * 60;

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:mm" (24-hour) into minutes since midnight. Throws on invalid input. */
export function parseTimeToMinutes(time: string): number {
  const match = TIME_PATTERN.exec(time.trim());
  if (!match) {
    throw new Error(`Invalid time "${time}"; expected 24-hour HH:mm`);
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

/** Format minutes-since-midnight (any integer) into zero-padded "HH:mm", wrapping at 24h. */
export function formatMinutes(totalMinutes: number): string {
  const wrapped =
    ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Compute the return time from a break.
 * @param startTime break start time, "HH:mm" (24-hour)
 * @param durationMinutes break length in minutes (default 90)
 */
export function computeReturnTime(
  startTime: string,
  durationMinutes: number = DEFAULT_BREAK_MINUTES,
): string {
  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) {
    throw new Error('durationMinutes must be a non-negative number');
  }
  return formatMinutes(parseTimeToMinutes(startTime) + durationMinutes);
}

/** Current wall-clock time as "HH:mm" (local), convenient for a "use current time" button. */
export function nowAsTime(date: Date = new Date()): string {
  return formatMinutes(date.getHours() * 60 + date.getMinutes());
}
