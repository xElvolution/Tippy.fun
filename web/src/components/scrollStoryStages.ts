/**
 * Shared scroll-story timing for 2-D text and 3-D scene so they never drift.
 * Four equal quarters of scroll progress (0 → 1 across the sticky section).
 */

export const STORY_STAGE_COUNT = 4;

/** Portion of each quarter (0–1 within that quarter) used to blend into the next stage. */
export const STORY_BAND_CROSSFADE = 0.1;

/**
 * Returns four weights that sum to ~1. At most two adjacent stages are non-zero,
 * so headings never stack like two full-opacity layers.
 */
export function exclusiveStageWeights(p: number): [number, number, number, number] {
  const n = STORY_STAGE_COUNT;
  const t = p * n;
  const i = Math.min(Math.floor(t + 1e-9), n - 1);
  const f = t - i;
  const w: [number, number, number, number] = [0, 0, 0, 0];
  const edge = 1 - STORY_BAND_CROSSFADE;
  if (f <= edge) {
    w[i] = 1;
  } else {
    const u = (f - edge) / STORY_BAND_CROSSFADE;
    w[i] = 1 - u;
    w[Math.min(i + 1, n - 1)] = u;
  }
  return w;
}
