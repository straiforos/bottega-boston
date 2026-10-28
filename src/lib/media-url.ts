/** Media URLs stored on gallery tiles: relative site paths or https only. */
export function isSafeMediaUrl(url: string) {
  const value = url.trim();
  if (!value || value.length > 2000) return false;
  if (/^\/(?!\/)/.test(value)) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
