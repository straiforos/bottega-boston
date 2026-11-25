import { Fragment, useCallback, useEffect, useState } from 'react';
import { Display, Stamp } from '@/design-system/bottega-f5161c';
import { useStaffSession } from '@/hooks/useStaffSession';
import { lines } from '@/lib/home/home-content';
import { useHomeContent } from '../hooks/useHomeContent';
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
  const { data: home, homeFromServer, isFetchedAfterMount } = useHomeContent();
  const { isAdmin } = useStaffSession();
  // Never paint bundled defaults as a stand-in for a staff-configured photo.
  // CI prerender has no D1 (`homeFromServer` false) — keep the forest frame;
  // live SSR and post-fetch client paint the real URL (and fade it in).
  const hero = home.hero;
  const imageUrl = homeFromServer || isFetchedAfterMount ? hero.imageUrl : null;
  const [photoReady, setPhotoReady] = useState(false);

  useEffect(() => {
    setPhotoReady(false);
  }, [imageUrl]);

  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setPhotoReady(true);
  }, []);

  return (
    <section className="hero home-editable" aria-label="Welcome to Bottega">
      <div className="hero-photo-frame">
        {imageUrl ? (
          <img
            ref={imgRef}
            className={`hero-photo${photoReady ? ' is-ready' : ''}`}
            src={imageUrl}
            alt={hero.imageAlt}
            fetchPriority="high"
            decoding="async"
            onLoad={() => setPhotoReady(true)}
            onError={() => setPhotoReady(true)}
          />
        ) : null}
      </div>
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
