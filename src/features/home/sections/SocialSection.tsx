import { useQuery } from '@tanstack/react-query';
import { Button } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { restaurantContent } from '@/content/en/restaurant';
import { staffContent } from '@/content/en/staff';
import { useStaffSession } from '@/hooks/useStaffSession';
import { galleryQueryOptions } from '@/lib/gallery/gallery-api';
import { fallbackGallery } from '@/lib/gallery/gallery-assets';
import { AddTile } from '../admin/AddTile';
import { EditableTile } from '../admin/EditableTile';
import { GalleryTile } from '../components/GalleryTile';
import { useScrollArrows } from '../hooks/useScrollArrows';

export function SocialSection() {
  const { data: items = fallbackGallery } = useQuery(galleryQueryOptions);
  const { isAdmin } = useStaffSession();
  const arrows = useScrollArrows<HTMLDivElement>([items.length, isAdmin]);
  const labels = restaurantContent.media;

  return (
    <section className="social-section">
      {isAdmin && (
        <div className="gallery-editing-ribbon" role="status">
          <MovingRibbon text={staffContent.gallery.editing} variant="tomato" />
        </div>
      )}
      <div className="gallery-strip">
        <div className="gallery" ref={arrows.ref}>
          {items.map((item) =>
            isAdmin ? (
              <EditableTile key={item.id} item={item} items={items} />
            ) : (
              <GalleryTile key={item.id} item={item} />
            ),
          )}
        </div>
        {arrows.canPrev && (
          <span className="gallery-arrow" data-side="prev">
            <Button variant="cream" size="md" aria-label={labels.galleryPrev} onClick={() => arrows.page(-1)}>
              ←
            </Button>
          </span>
        )}
        {arrows.canNext && (
          <span className="gallery-arrow" data-side="next">
            <Button variant="cream" size="md" aria-label={labels.galleryNext} onClick={() => arrows.page(1)}>
              →
            </Button>
          </span>
        )}
      </div>
      {isAdmin && <AddTile nextSortOrder={(items.at(-1)?.sortOrder ?? 0) + 1} />}
    </section>
  );
}
