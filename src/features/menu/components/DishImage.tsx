import { useCallback, useEffect, useState } from 'react';
import { variantsForConnection } from '@/lib/media/process-image';
import type { MenuItem } from '@/lib/menu/types';
import { menuImages } from '@/lib/menu-images';

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

/** Responsive dish photo that fades in once loaded; srcset is capped by connection quality. */
export function DishImage({ item }: { item: MenuItem }) {
  const [allowed, setAllowed] = useState<readonly string[]>(['thumb', 'standard']);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    setAllowed(variantsForConnection(connection));
  }, []);

  // Cached images may finish before React attaches onLoad.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  const variants = item.imageVariants?.filter((v) => allowed.includes(v.key)) ?? [];
  const fallback = item.imageUrl ?? menuImages[item.id];
  if (!fallback && variants.length === 0) return null;
  const smallest = variants[0]?.url ?? fallback;

  return (
    <div className="menu-dish-image">
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
    </div>
  );
}
