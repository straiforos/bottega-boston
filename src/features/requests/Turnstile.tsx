import { useEffect, useRef } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getTurnstileSiteKey } from '@/lib/turnstile.server';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('turnstile')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Cloudflare Turnstile human check; reports a token (or '' when it expires). */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const getKey = useServerFn(getTurnstileSiteKey);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let id: string | undefined;
    let cancelled = false;
    (async () => {
      const { siteKey } = await getKey();
      if (!siteKey || cancelled) return;
      await loadScript();
      if (cancelled || !ref.current || !window.turnstile) return;
      id = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: 'light',
        callback: (t: string) => cb.current(t),
        'expired-callback': () => cb.current(''),
        'error-callback': () => cb.current(''),
      });
    })().catch(() => cb.current(''));
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [getKey]);

  return <div ref={ref} className="request-turnstile" />;
}
