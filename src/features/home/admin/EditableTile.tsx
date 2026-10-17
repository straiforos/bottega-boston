import { useState } from 'react';
import { Button, Confirmation } from '@/design-system/bottega-f5161c';
import { ArrowIcon } from '@/components/ArrowIcon';
import { staffContent } from '@/content/en/staff';
import type { GalleryItem } from '@/lib/gallery/types';
import { GalleryTile } from '../components/GalleryTile';
import { TileEditor } from './TileEditor';
import { useGalleryAdmin } from './useGalleryAdmin';
import { GalleryEditorDialog } from './GalleryEditorDialog';
import { GalleryActionIcon } from './GalleryActionIcon';

interface EditableTileProps {
  item: GalleryItem;
  items: readonly GalleryItem[];
}

/** Gallery tile with Edit / reorder / Delete for signed-in staff. */
export function EditableTile({ item, items }: EditableTileProps) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const admin = useGalleryAdmin();
  const t = staffContent.gallery;
  const index = items.findIndex((i) => i.id === item.id);
  const label = item.alt || item.caption;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setConfirming(false);
    } catch {
      setError(staffContent.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gallery-cell">
      <GalleryTile item={item} />
      <div className="gallery-admin-actions">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setEditing(true)}
          aria-label={`${staffContent.edit} ${label}`}
          title={staffContent.edit}
        >
          <GalleryActionIcon action="edit" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={busy || index === 0}
          onClick={() => void run(() => admin.move(items, item.id, -1))}
          aria-label={`${t.moveEarlier}: ${label}`}
          title={t.moveEarlier}
        >
          <ArrowIcon direction="left" />
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={busy || index === items.length - 1}
          onClick={() => void run(() => admin.move(items, item.id, 1))}
          aria-label={`${t.moveLater}: ${label}`}
          title={t.moveLater}
        >
          <ArrowIcon direction="right" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gallery-delete"
          disabled={busy}
          onClick={() => setConfirming(true)}
          aria-label={`${staffContent.delete} ${label}`}
          title={staffContent.delete}
        >
          <GalleryActionIcon action="delete" />
        </Button>
        {error && !confirming && <span role="alert">{error}</span>}
        <Confirmation
          open={confirming}
          title={t.confirmDeleteTitle}
          variant="danger"
          confirmLabel={staffContent.delete}
          cancelLabel={staffContent.cancel}
          pending={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() => void run(() => admin.remove(item.id))}
        >
          {t.confirmDelete}
          {error && <span role="alert"> {error}</span>}
        </Confirmation>
      </div>
      <GalleryEditorDialog open={editing} label={`${staffContent.edit} ${label}`} onCancel={() => setEditing(false)}>
        <TileEditor
          initial={{ alt: item.alt, caption: item.caption }}
          draftScope={`tile:${item.id}`}
          onCancel={() => setEditing(false)}
          onSave={async (draft, file, onProgress) => {
            await admin.update(item.id, draft, file, onProgress);
            setEditing(false);
          }}
        />
      </GalleryEditorDialog>
    </div>
  );
}
