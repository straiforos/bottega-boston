import { useEffect, useState } from 'react';
import { variantsForConnection } from '@/lib/menu/process-image';
import type { MenuItem } from '@/lib/menu/types';
import { menuImages } from '@/lib/menu-images';

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

/** Responsive dish photo: srcset lets the browser pick by size/DPR, capped by connection quality. */
export function DishImage({ item }: { item: MenuItem }) {
  const [allowed, setAllowed] = useState<readonly string[]>(['thumb', 'standard']);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    setAllowed(variantsForConnection(connection));
  }, []);

  const variants = item.imageVariants?.filter((v) => allowed.includes(v.key)) ?? [];
  const fallback = item.imageUrl ?? menuImages[item.id];
  if (!fallback && variants.length === 0) return null;
  const smallest = variants[0]?.url ?? fallback;

  return (
    <img
      src={smallest}
      srcSet={variants.length ? variants.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined}
      sizes="(max-width: 900px) 50vw, 33vw"
      alt={`Illustrative ${item.name}`}
      loading="lazy"
      decoding="async"
      width={480}
      height={480}
    />
  );
}
