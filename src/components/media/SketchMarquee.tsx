import { Marquee } from '@/design-system/bottega-f5161c';
import { RestaurantSketch } from '@/components/RestaurantSketch';

export function SketchMarquee({ text }: { text: string }) {
  return (
    <Marquee
      text={text}
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