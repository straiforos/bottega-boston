import { useQuery } from '@tanstack/react-query';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { staffContent } from '@/content/en/staff';
import { useStaffSession } from '@/hooks/useStaffSession';
import { galleryQueryOptions } from '@/lib/gallery/gallery-api';
import { fallbackGallery } from '@/lib/gallery/gallery-assets';
import { AddTile } from '../admin/AddTile';
import { EditableTile } from '../admin/EditableTile';
import { GalleryTile } from '../components/GalleryTile';

export function SocialSection() {
  const { data: items = fallbackGallery } = useQuery(galleryQueryOptions);
  const { isAdmin } = useStaffSession();

  return (
    <section className="social-section">
      {isAdmin && (
        <div className="gallery-editing-ribbon" role="status">
          <MovingRibbon text={staffContent.gallery.editing} variant="tomato" />
        </div>
      )}
      <div className="gallery">
        {items.map((item) =>
          isAdmin ? <EditableTile key={item.id} item={item} items={items} /> : <GalleryTile key={item.id} item={item} />,
        )}
      </div>
      {isAdmin && <AddTile nextSortOrder={(items.at(-1)?.sortOrder ?? 0) + 1} />}
    </section>
  );
}
