import { useEffect, useRef } from 'react';
import { desktopCardProgress, easeOutCubic, mobileCardProgress } from '@/lib/motion/offering-progress';

export function useOfferingsMotion() {
  const offeringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = offeringsRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || preference.matches) return;
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.offering'));
    const track = container.closest<HTMLElement>('.offerings-track');
    const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
    const travel = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bt-space-xl')) || 2;
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      if (track && desktop.matches) {
        const rect = track.getBoundingClientRect();
        const overall = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - viewport)));
        cards.forEach((card, index) => {
          const raw = desktopCardProgress(overall, index);
          const progress = easeOutCubic(raw);
          card.style.opacity = Math.min(1, raw * 1.6).toFixed(3);
          card.style.transform = `translateY(${((1 - progress) * viewport * 0.75).toFixed(1)}px) rotate(${((1 - progress) * (index % 2 ? -6 : 6)).toFixed(2)}deg)`;
        });
        return;
      }
      cards.forEach((card, index) => {
        const progress = mobileCardProgress(viewport, card.getBoundingClientRect().top, index);
        card.style.opacity = progress.toFixed(3);
        card.style.transform = `translateY(${((1 - progress) * travel).toFixed(3)}rem)`;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      cards.forEach((card) => {
        card.style.opacity = '';
        card.style.transform = '';
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', stop);
    schedule();
    return () => {
      preference.removeEventListener('change', stop);
      stop();
    };
  }, []);

  return offeringsRef;
}
