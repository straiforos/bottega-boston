/**
 * When the request host is www.<apex>, return the absolute Location for a
 * permanent redirect to SITE_ORIGIN (apex). Null means serve as usual.
 */
export function apexRedirectLocation(
  requestUrl: URL,
  siteOrigin: string | undefined,
): string | null {
  const configured = siteOrigin?.replace(/\/+$/, '');
  if (!configured) return null;

  let apexHost: string;
  try {
    apexHost = new URL(configured).hostname;
  } catch {
    return null;
  }

  if (requestUrl.hostname !== `www.${apexHost}`) return null;

  return `${configured}${requestUrl.pathname}${requestUrl.search}`;
}
