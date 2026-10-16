export const DIETARY_OPTIONS = [
  { tag: 'GF', label: 'Gluten free' },
  { tag: 'V', label: 'Vegetarian' },
  { tag: 'VG', label: 'Vegan' },
] as const;

export type DietaryTag = (typeof DIETARY_OPTIONS)[number]['tag'];

/** Vegan dishes are also vegetarian, so a V filter accepts VG dishes. */
export function hasDietary(tags: readonly string[], wanted: DietaryTag) {
  return tags.includes(wanted) || (wanted === 'V' && tags.includes('VG'));
}

export function matchesDietary(tags: readonly string[], wanted: readonly DietaryTag[]) {
  return wanted.every((tag) => hasDietary(tags, tag));
}

/** Keeps tags in the canonical GF, V, VG order. */
export function toggleTag(tags: readonly string[], tag: DietaryTag) {
  const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
  return DIETARY_OPTIONS.map((o) => o.tag).filter((t) => next.includes(t));
}
