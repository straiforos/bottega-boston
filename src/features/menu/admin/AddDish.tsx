import { useState } from 'react';
import { Button } from '@/design-system/bottega-f5161c';
import { staffContent } from '@/content/en/staff';
import { DishEditor } from './DishEditor';
import { useMenuAdmin } from './useMenuAdmin';

/** "Add dish" action at the end of a section; expands into the inline editor. */
export function AddDish({ sectionId, nextSortOrder }: { sectionId: string; nextSortOrder: number }) {
  const [open, setOpen] = useState(false);
  const admin = useMenuAdmin();

  if (!open) {
    return (
      <div className="dish-add">
        <Button variant="primary" onClick={() => setOpen(true)}>
          {staffContent.addDish}
        </Button>
      </div>
    );
  }
  return (
    <DishEditor
      initial={{ name: '', price: '', description: '', tags: [] }}
      onCancel={() => setOpen(false)}
      onSave={async (draft, photo) => {
        await admin.create(sectionId, draft, photo, nextSortOrder);
        setOpen(false);
      }}
    />
  );
}
