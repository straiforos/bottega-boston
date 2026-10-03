import { Display, Stamp } from '@/design-system/bottega-f5161c';
import hero from '@/assets/hero.asset.json';

export function HeroSection() {
  return (
    <section className="hero" aria-label="Welcome to Bottega">
      <img
        className="hero-photo"
        src={hero.url}
        alt="A woman in sunglasses enjoying Bottega fettuccine bolognese"
        fetchPriority="high"
      />
      <div className="hero-copy bt-surface-light">
        <div className="hero-headline">
          <div className="hero-stamp">
            <span className="desktop-logo">
              <Stamp size="md" variant="light">
                Buona
                <br />
                Semplice
                <br />
                Italian.
              </Stamp>
            </span>
            <span className="mobile-logo">
              <Stamp size="sm" variant="light">
                Buona
                <br />
                Semplice
                <br />
                Italian.
              </Stamp>
            </span>
          </div>
          <Display as="h1" size="xl" tone="forest" className="hero-hashtag">
            #PASTAISLIFE
          </Display>
        </div>
      </div>
    </section>
  );
}
