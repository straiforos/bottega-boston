export function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export function desktopCardProgress(overall: number, index: number) {
  return clamp((overall - index * 0.27) / 0.3);
}

export function mobileCardProgress(viewport: number, top: number, index: number) {
  return clamp((viewport - top - index * viewport * 0.08) / (viewport * 0.35));
}
