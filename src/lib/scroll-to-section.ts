/**
 * Scrolls a section into view *below* the sticky site header.
 *
 * Plain `scrollIntoView()` parks the section's heading underneath the header
 * bar, so every hash target (`#locations`, `#events`, `#category-8`) aims a
 * header-height lower instead.
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
