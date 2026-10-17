/** Firefox blocks `target="_blank"` links that keep an opener relationship (COOP), so every new-tab link must sever it. */
export const EXTERNAL_REL = "noopener noreferrer";

/** Return the rel a new-tab link must carry; an explicit rel always wins. */
export function externalRel(target?: string, rel?: string): string | undefined {
  if (rel !== undefined) return rel;
  return target === "_blank" ? EXTERNAL_REL : undefined;
}
