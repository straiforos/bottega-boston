export const SNACKBAR_MAX = 3;
export const SNACKBAR_DEFAULT_DURATION = 5000;

export interface QueuedSnackbar { id: string }

/** Adds newest first and keeps at most SNACKBAR_MAX visible. */
export function pushSnackbar<T extends QueuedSnackbar>(list: T[], item: T, max = SNACKBAR_MAX): T[] {
  return [item, ...list.filter((s) => s.id !== item.id)].slice(0, max);
}

/** undefined → default duration; null → stays open until dismissed. */
export function resolveDuration(duration: number | null | undefined): number | null {
  return duration === undefined ? SNACKBAR_DEFAULT_DURATION : duration;
}

/** Pausable countdown: remaining time survives pause/resume. */
export function createTimer(ms: number, onDone: () => void) {
  let remaining = ms;
  let started = 0;
  let handle: ReturnType<typeof setTimeout> | undefined;
  const resume = () => {
    if (handle !== undefined) return;
    started = Date.now();
    handle = setTimeout(() => { handle = undefined; onDone(); }, remaining);
  };
  const pause = () => {
    if (handle === undefined) return;
    clearTimeout(handle);
    handle = undefined;
    remaining = Math.max(0, remaining - (Date.now() - started));
  };
  const clear = () => { if (handle !== undefined) clearTimeout(handle); handle = undefined; };
  resume();
  return { pause, resume, clear, get remaining() { return remaining; } };
}
