/**
 * Scrolls a section into view *below* the sticky site header.
 *
 * Plain `scrollIntoView()` parks the section's heading underneath the header
 * bar, so in-page targets (`#locations`, `#club`, …) aim a header-height lower
 * instead. Menu filters use `?section=` on `/menu`, not hashes.
 */
export function scrollToSection(hashOrId: string) {
  const id = hashOrId.replace(/^#/, '');
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector<HTMLElement>('.shared-header-stack');
  const top = el.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight ?? 0);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}
