export const MIN_HOLD_DURATION_MS = 3000;
export const MAX_HOLD_DURATION_MS = 60000;

export function getHoldDurationMs(pausesToday) {
  if (!pausesToday || pausesToday <= 0) {
    return MIN_HOLD_DURATION_MS;
  }

  if (pausesToday === 1) {
    return 5000;
  }

  return Math.min(pausesToday * 5000, MAX_HOLD_DURATION_MS);
}
