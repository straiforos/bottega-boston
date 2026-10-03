import { Marquee } from '@/design-system/bottega-f5161c';
import { RestaurantSketch } from '@/components/RestaurantSketch';

export function SketchMarquee({ text, variant = 'cream' }: { text: string; variant?: 'cream' | 'forest' | 'tomato' }) {
  return (
    <Marquee
      text={text}
      variant={variant}
      className="sketch-marquee"
      separator={
        <span className="marquee-sketches">
          <RestaurantSketch kind="pasta" small />
          <RestaurantSketch kind="lemon" small />
        </span>
      }
    />
  );
}
