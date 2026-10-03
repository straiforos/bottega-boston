import { useEffect, useRef } from 'react';
import { WaveRibbon } from '@/design-system/bottega-f5161c';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export function MovingRibbon({ text }: { text: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) ref.current?.pauseAnimations();
    else ref.current?.unpauseAnimations();
  }, [reducedMotion]);

  return <WaveRibbon ref={ref} text={text} separator="✦" />;
}
