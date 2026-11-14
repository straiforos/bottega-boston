import type { MenuItem } from '@/lib/menu/types';

/** Mark a dish photo ready so CSS can fade it in. */
function markLoaded(img: HTMLImageElement) {
  img.classList.add('is-loaded');
}

/** Dish photo baked into SSR HTML so the browser starts the request from markup.
 *  Native lazy/eager decides when to fetch; CSS fades in on load (see menu
 *  route head script for pre-hydrate, onLoad/ref after hydrate). */
export function DishImage({ item, priority = false }: { item: MenuItem; priority?: boolean }) {
  const variants = item.imageVariants ?? [];
  const imageUrl = item.imageUrl;
  if (!imageUrl && variants.length === 0) return null;

  // Smallest variant as `src` when present so ignored-srcset UAs stay light.
  const src = variants[0]?.url ?? imageUrl!;

  return (
    <div className="menu-dish-image">
      <img
        src={src}
        srcSet={variants.length ? variants.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined}
        sizes="(max-width: 900px) 50vw, 33vw"
        alt={`Illustrative ${item.name}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        width={480}
        height={480}
        onLoad={(e) => markLoaded(e.currentTarget)}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) markLoaded(node);
        }}
      />
    </div>
  );
}
