/** Pure date math for one-off and repeating events. All "local" values are in the event's time zone. */

export type RecurrenceFreq = 'weekly' | 'biweekly' | 'monthly';

export interface Recurrence {
  readonly freq: RecurrenceFreq;
  /** 0 = Sunday … 6 = Saturday. Weekly/biweekly: chosen days. Monthly: first entry is the weekday. */
  readonly weekdays: readonly number[];
  /** Monthly only: 1–4 = first…fourth, -1 = last. */
  readonly nth?: number;
  /** Last allowed date, inclusive (YYYY-MM-DD). */
  readonly until?: string | null;
}

export interface EventSchedule {
  readonly id: string;
  readonly startsAt: string;
  readonly durationMinutes: number;
  readonly timezone: string;
  readonly ticketUrl: string | null;
  readonly recurrence: Recurrence | null;
}

export interface EventException {
  readonly occurrenceDate: string;
  readonly skipped: boolean;
  readonly startTime: string | null;
  readonly ticketUrl: string | null;
}

export interface Occurrence {
  readonly date: string;
  readonly startsAt: string;
  readonly ticketUrl: string | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local wall-clock parts of an instant in a time zone. */
export function localParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') % 24, minute: get('minute'), second: get('second') };
}

function offsetMs(instant: number, timeZone: string) {
  const p = localParts(new Date(instant), timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(instant / 1000) * 1000;
}

/** Converts a local date (YYYY-MM-DD) and time (HH:MM) in a zone to a UTC instant. */
export function zonedToUtc(date: string, time: string, timeZone: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let result = guess - offsetMs(guess, timeZone);
  const second = guess - offsetMs(result, timeZone);
  if (second !== result) result = second;
  return new Date(result);
}

export function localDate(instant: Date, timeZone: string) {
  const p = localParts(instant, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function localTime(instant: Date, timeZone: string) {
  const p = localParts(instant, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

const dayNumber = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
};
const fromDayNumber = (n: number) => new Date(n * 86_400_000).toISOString().slice(0, 10);
const weekday = (date: string) => (dayNumber(date) + 4) % 7; // 1970-01-01 was a Thursday

/** The nth (or last, -1) given weekday of a month, or null when it doesn't exist. */
export function nthWeekdayOfMonth(year: number, month: number, wd: number, nth: number): string | null {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const matches: string[] = [];
  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = `${year}-${pad(month)}-${pad(d)}`;
    if (weekday(date) === wd) matches.push(date);
  }
  return (nth === -1 ? matches[matches.length - 1] : matches[nth - 1]) ?? null;
}

/** Candidate local dates for a schedule, in order, starting at the first date. */
function* candidateDates(firstDate: string, rec: Recurrence | null, horizon: string): Generator<string> {
  if (!rec) {
    yield firstDate;
    return;
  }
  const last = rec.until && rec.until < horizon ? rec.until : horizon;
  if (rec.freq === 'monthly') {
    const wd = rec.weekdays[0] ?? weekday(firstDate);
    const nth = rec.nth ?? 1;
    let [y, m] = firstDate.split('-').map(Number);
    for (let i = 0; i < 240; i += 1) {
      const date = nthWeekdayOfMonth(y, m, wd, nth);
      if (date && date > last) return;
      if (date && date >= firstDate) yield date;
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return;
  }
  const days = rec.weekdays.length ? rec.weekdays : [weekday(firstDate)];
  const start = dayNumber(firstDate);
  const weekStart = start - weekday(firstDate);
  for (let n = start; n <= dayNumber(last); n += 1) {
    const date = fromDayNumber(n);
    if (!days.includes(weekday(date))) continue;
    if (rec.freq === 'biweekly' && Math.floor((n - weekStart) / 7) % 2 !== 0) continue;
    yield date;
  }
}

/** Upcoming dates (not yet ended) after applying skipped dates and one-date changes. */
export function upcomingOccurrences(
  event: EventSchedule,
  exceptions: readonly EventException[],
  now: Date,
  limit = 4,
): Occurrence[] {
  const start = new Date(event.startsAt);
  const tz = event.timezone;
  const firstDate = localDate(start, tz);
  const baseTime = localTime(start, tz);
  const horizon = fromDayNumber(dayNumber(localDate(now, tz)) + 400);
  const byDate = new Map(exceptions.map((e) => [e.occurrenceDate, e]));
  const out: Occurrence[] = [];
  for (const date of candidateDates(firstDate, event.recurrence, horizon)) {
    const ex = byDate.get(date);
    if (ex?.skipped) continue;
    const at = zonedToUtc(date, ex?.startTime || baseTime, tz);
    if (at.getTime() + event.durationMinutes * 60_000 < now.getTime()) continue;
    out.push({ date, startsAt: at.toISOString(), ticketUrl: ex?.ticketUrl || event.ticketUrl });
    if (out.length >= limit) break;
  }
  return out;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const NTH = { 1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', [-1]: 'Last' } as Record<number, string>;

/** Plain-English summary, e.g. "Every Thursday" or "First Friday of the month". */
export function describeRecurrence(rec: Recurrence | null): string | null {
  if (!rec) return null;
  const names = [...rec.weekdays].sort().map((d) => DAY_NAMES[d]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}` : names[0];
  if (rec.freq === 'monthly') return `${NTH[rec.nth ?? 1]} ${DAY_NAMES[rec.weekdays[0] ?? 0]} of the month`;
  return rec.freq === 'biweekly' ? `Every other ${list}` : `Every ${list}`;
}
