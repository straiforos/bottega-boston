import { PillLabel } from '@/design-system/bottega-f5161c';
import { GalleryVideo } from '@/components/media/GalleryVideo';
import type { GalleryItem } from '@/lib/gallery/types';

/** One gallery tile; photos use their sized versions via srcset. */
export function GalleryTile({ item }: { item: GalleryItem }) {
  if (item.type === 'video') {
    return (
      <figure className="gallery-item">
        <GalleryVideo src={item.url} versions={item.versions} poster={item.poster} label={item.alt} />
      </figure>
    );
  }
  const srcSet = item.versions.length ? item.versions.map((v) => `${v.url} ${v.width}w`).join(', ') : undefined;
  return (
    <figure className="gallery-item">
      <img
        src={item.versions[0]?.url ?? item.url}
        srcSet={srcSet}
        sizes="(max-width: 900px) 50vw, 25vw"
        loading="lazy"
        decoding="async"
        alt={item.alt}
      />
      {item.caption && (
        <figcaption>
          <PillLabel variant="mustard">{item.caption}</PillLabel>
        </figcaption>
      )}
    </figure>
  );
}
