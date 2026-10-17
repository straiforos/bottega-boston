import { useState } from 'react';
import { Button } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { TileEditor } from './TileEditor';
import { useGalleryAdmin } from './useGalleryAdmin';
import { GalleryEditorDialog } from './GalleryEditorDialog';
import { GalleryActionIcon } from './GalleryActionIcon';

/** Final slot in the staff gallery; opens the editor without stretching the row. */
export function AddTile({ nextSortOrder }: { nextSortOrder: number }) {
  const [open, setOpen] = useState(false);
  const admin = useGalleryAdmin();

  return (
    <div className="gallery-cell gallery-add">
      <Button variant="primary" onClick={() => setOpen(true)}>
        <GalleryActionIcon action="add" />
        {staffContent.gallery.add}
      </Button>
      <GalleryEditorDialog open={open} label={staffContent.gallery.add} onCancel={() => setOpen(false)}>
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
      </GalleryEditorDialog>
    </div>
  );
}
