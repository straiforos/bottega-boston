import { useQueryClient } from '@tanstack/react-query';
import { addDish, deleteDish, menuQueryOptions, saveDish, uploadDishImage } from '@/lib/menu/menu-api';
import type { DishDraft } from '@/lib/menu/types';

/** Admin actions; each refreshes the live menu. Permission is enforced by the database. */
export function useMenuAdmin() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: menuQueryOptions.queryKey });

  return {
    async update(dishId: string, draft: DishDraft, photo: File | null) {
      const image = photo ? await uploadDishImage(dishId, photo) : undefined;
      await saveDish(dishId, draft, image);
      await refresh();
    },
    async create(sectionId: string, draft: DishDraft, photo: File | null, sortOrder: number) {
      await addDish(sectionId, draft, sortOrder, photo);
      await refresh();
    },
    async remove(dishId: string) {
      await deleteDish(dishId);
      await refresh();
    },
  };
}
