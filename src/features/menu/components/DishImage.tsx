import { useCallback, useEffect, useRef, useState } from 'react';
import { variantsForConnection } from '@/lib/media/process-image';
import type { MenuItem } from '@/lib/menu/types';
import { menuImages } from '@/lib/menu-images';

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

/** Distance beyond the viewport at which a dish photo may begin loading. */
const LOAD_MARGIN = '200px';

/** Progressive dish photo: stays a paper-toned placeholder until it scrolls
 *  near the viewport, then fades in once loaded; srcset is capped by
 *  connection quality. */
export function DishImage({ item }: { item: MenuItem }) {
  const [allowed, setAllowed] = useState<readonly string[]>(['thumb', 'standard']);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    setAllowed(variantsForConnection(connection));
  }, []);

  // Hold the download until the dish is close to the viewport so dishes load
  // as the guest scrolls, not all at once on arrival.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: LOAD_MARGIN },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [inView]);

  // Cached images may finish before React attaches onLoad.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  const variants = item.imageVariants?.filter((v) => allowed.includes(v.key)) ?? [];
  const fallback = item.imageUrl ?? menuImages[item.id];
  if (!fallback && variants.length === 0) return null;
  const smallest = variants[0]?.url ?? fallback;

  return (
    <div className="menu-dish-image" ref={wrapperRef}>
      {inView && (
        <img
          ref={imgRef}
          className={loaded ? 'is-loaded' : undefined}
          src={smallest}
          srcSet={variants.length ? variants.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined}
          sizes="(max-width: 900px) 50vw, 33vw"
          alt={`Illustrative ${item.name}`}
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
