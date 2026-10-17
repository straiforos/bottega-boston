import { useEffect, useRef } from 'react';

/** Unsent request drafts survive a refresh or closed tab for this long. */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const draftKey = (kind: string) => `bottega:request-draft:${kind}`;

export function encodeDraft<T>(data: T, now: number) {
  return JSON.stringify({ savedAt: now, data });
}

/** Pure: returns the saved draft, or null when missing, corrupt or expired. */
export function decodeDraft<T>(raw: string | null, now: number): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt?: unknown; data?: unknown };
    if (typeof parsed.savedAt !== 'number' || now - parsed.savedAt > DRAFT_TTL_MS || !parsed.data) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}

/** Restores a draft once after hydration, then saves on every change. */
export function useFormDraft<T>(key: string, value: T, restore: (draft: T) => void) {
  const ready = useRef(false);
  useEffect(() => {
    try {
      const draft = decodeDraft<T>(window.localStorage.getItem(key), Date.now());
      if (draft) restore(draft);
    } catch {
      /* storage unavailable */
    }
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!ready.current) return;
    try {
      window.localStorage.setItem(key, encodeDraft(value, Date.now()));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value]);
  return () => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };
}
