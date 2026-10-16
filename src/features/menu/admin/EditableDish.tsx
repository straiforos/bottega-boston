import { useState } from 'react';
import { Button } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import type { MenuItem } from '@/lib/menu/types';
import { MenuDishCard } from '../components/MenuDishCard';
import { DishEditor } from './DishEditor';
import { useMenuAdmin } from './useMenuAdmin';

/** Dish card with in-place Edit/Delete for signed-in staff. */
export function EditableDish({ item }: { item: MenuItem }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const admin = useMenuAdmin();

  if (editing) {
    return (
      <DishEditor
        initial={{ name: item.name, price: item.price, description: item.description }}
        onCancel={() => setEditing(false)}
        onSave={async (draft, photo) => {
          await admin.update(item.id, draft, photo);
          setEditing(false);
        }}
      />
    );
  }

  const remove = async () => {
    if (!window.confirm(staffContent.confirmDelete(item.name))) return;
    setBusy(true);
    try {
      await admin.remove(item.id);
    } catch {
      window.alert(staffContent.failed);
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
            onClick={() => void remove()}
            disabled={busy}
            aria-label={`${staffContent.delete} ${item.name}`}
          >
            {staffContent.delete}
          </Button>
        </div>
      }
    />
  );
}
