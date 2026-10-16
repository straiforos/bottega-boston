import { useState } from 'react';
import { Button, Confirmation } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import type { MenuItem } from '@/lib/menu/types';
import { MenuDishCard } from '../components/MenuDishCard';
import { DishEditor } from './DishEditor';
import { useMenuAdmin } from './useMenuAdmin';

/** Dish card with in-place Edit/Delete for signed-in staff. */
export function EditableDish({ item }: { item: MenuItem }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const admin = useMenuAdmin();

  if (editing) {
    return (
      <DishEditor
        initial={{ name: item.name, price: item.price, description: item.description, tags: item.tags }}
        onCancel={() => setEditing(false)}
        onSave={async (draft, photo) => {
          await admin.update(item.id, draft, photo);
          setEditing(false);
        }}
      />
    );
  }

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await admin.remove(item.id);
      setConfirming(false);
    } catch {
      setError(staffContent.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MenuDishCard
      item={item}
      actions={
        <div className="dish-admin-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditing(true)}
            aria-label={`${staffContent.edit} ${item.name}`}
          >
            {staffContent.edit}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="dish-delete"
            onClick={() => setConfirming(true)}
            disabled={busy}
            aria-label={`${staffContent.delete} ${item.name}`}
          >
            {staffContent.delete}
          </Button>
          <Confirmation
            open={confirming}
            title={staffContent.confirmDeleteTitle}
            variant="danger"
            confirmLabel={staffContent.delete}
            cancelLabel={staffContent.cancel}
            pending={busy}
            onCancel={() => setConfirming(false)}
            onConfirm={() => void remove()}
          >
            {staffContent.confirmDelete(item.name)}
            {error && <span role="alert"> {error}</span>}
          </Confirmation>
        </div>
      }
    />
  );
}
