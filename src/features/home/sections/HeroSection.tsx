import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Display, Stamp } from '@/design-system/bottega-f5161c';
import { useStaffSession } from '@/hooks/useStaffSession';
import { defaultHomeContent, homeContentQueryOptions, lines } from '@/lib/home/home-content';
import { HeroEditor } from '../admin/HomeContentEditors';

export function Broken({ text }: { text: string }) {
  return lines(text).map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

export function HeroSection() {
  const { data = defaultHomeContent } = useQuery(homeContentQueryOptions);
  const { isAdmin } = useStaffSession();
  const hero = data.hero;
  return (
    <section className="hero home-editable" aria-label="Welcome to Bottega">
      <img className="hero-photo" src={hero.imageUrl} alt={hero.imageAlt} fetchPriority="high" />
      <div className="hero-copy bt-surface-light">
        <div className="hero-headline">
          {hero.showStamp && (
            <div className="hero-stamp">
              <span className="desktop-only">
                <Stamp size="md" variant="light">
                  <Broken text={hero.stamp} />
                </Stamp>
              </span>
              <span className="mobile-only">
                <Stamp size="sm" variant="light">
                  <Broken text={hero.stamp} />
                </Stamp>
              </span>
            </div>
          )}
          <Display as="h1" size="hero" tone="forest" className="hero-hashtag">
            {hero.headline}
          </Display>
        </div>
      </div>
      {isAdmin && <HeroEditor hero={hero} />}
    </section>
  );
}
