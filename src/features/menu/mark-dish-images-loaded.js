/**
 * Capture-phase listener so SSR dish photos can fade in before React hydrates.
 * `load` does not bubble, and React strips string `onload` attributes from <img>.
 */
document.addEventListener(
  'load',
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.menu-dish-image')) return;
    target.classList.add('is-loaded');
  },
  true,
);
