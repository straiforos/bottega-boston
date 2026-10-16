import { useState } from 'react';
import { Button } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { TileEditor } from './TileEditor';
import { useGalleryAdmin } from './useGalleryAdmin';

/** "Add photo or video" action under the gallery; expands into the inline editor. */
export function AddTile({ nextSortOrder }: { nextSortOrder: number }) {
  const [open, setOpen] = useState(false);
  const admin = useGalleryAdmin();

  if (!open) {
    return (
      <div className="gallery-add">
        <Button variant="primary" onClick={() => setOpen(true)}>
          {staffContent.gallery.add}
        </Button>
      </div>
    );
  }
  return (
    <div className="gallery-editor-wrap">
      <TileEditor
        initial={{ alt: '', caption: '' }}
        requireFile
        onCancel={() => setOpen(false)}
        onSave={async (draft, file, onProgress) => {
          if (!file) return;
          await admin.create(draft, file, nextSortOrder, onProgress);
          setOpen(false);
        }}
      />
    </div>
  );
}
