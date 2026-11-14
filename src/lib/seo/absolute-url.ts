import { PUBLIC_SITE_ORIGIN } from './site-origin';

/** Join origin + path into an absolute URL (path may already include query). */
export function absoluteUrl(path: string, origin: string = PUBLIC_SITE_ORIGIN): string {
  const base = origin.replace(/\/+$/, '');
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
