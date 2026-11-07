/**
 * Shared Gemini studio-scene copy so dining/catering polish scripts describe the
 * same countertop (and dining the same plate).
 */

/** Matte warm limestone cove used under every studio food shot. */
export const STUDIO_COUNTERTOP =
  'uniform matte warm-stone countertop, dusty beige limestone approx hex #C4B5A0, fine soft grain, no veining, no marble, no wood, no butcher block, no paper; soft seamless backdrop in that exact same tone with no horizon seam';

/**
 * Standard single-portion dining plate — white ceramic coupe so desserts and
 * plated dishes share one vessel language (not marble, plastic, or bare stone).
 */
export const STUDIO_DINING_PLATE =
  'round matte white ceramic coupe plate (shallow, no heavy rim pattern, no marble, no grey stone, no logo), sized so the portion sits centered with a little empty plate showing';

/** Dining polish: counter + plate + lighting/composite rules. */
export function diningStudioSceneLines(options?: {
  /** When true, always place food on STUDIO_DINING_PLATE (e.g. cake currently bare or in plastic). */
  requirePlate?: boolean;
}): string[] {
  const plateRule = options?.requirePlate
    ? `Serve the food on ${STUDIO_DINING_PLATE}. Do not leave it bare on the counter, in plastic takeout, or on marble/grey stone.`
    : `If the food is plated or should be a plated portion, use ${STUDIO_DINING_PLATE}. Keep cups, bowls, and bakeware when those are the natural vessel—do not force a plate under a drink.`;

  return [
    `Set the scene on ${STUDIO_COUNTERTOP}.`,
    plateRule,
    'Soft even studio lighting with a gentle contact shadow under the plate or vessel. Crop square 1:1, subject centered.',
    'CRITICAL: Do not paste or overlay a cutout on a new background. Relight so the food belongs in the scene—matching perspective, soft contact shadow, no hard matte edge or floating sticker look.',
    'Remove store interior, people, clutter, logos, text, watermarks, and UI chrome. No extra garnish or props.',
  ];
}

/** Catering polish: same stone; hotel pan / tray instead of dining plate. */
export function cateringStudioSceneLines(): string[] {
  return [
    `Set the scene on ${STUDIO_COUNTERTOP}.`,
    'Vessel is bulk catering (metal hotel pan or packed tray)—never a single dining plate, marble slab, or parchment sheet.',
    'Soft even studio lighting with a gentle contact shadow under the tray. Crop square 1:1, tray centered.',
    'CRITICAL: Do not paste or overlay a cutout. Relight so the tray belongs on the stone.',
    'Remove store interior, people, clutter, logos, text, watermarks, and UI chrome.',
  ];
}
