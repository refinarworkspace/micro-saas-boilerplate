/**
 * -----------------------------------------------------------------------------
 * A/B testing utilities (client-side)
 * -----------------------------------------------------------------------------
 * Deterministically assigns a visitor to a variant per experiment, persists the
 * assignment in a cookie, and tracks exposure/conversion events to the API.
 *
 * These functions are safe to import anywhere; they guard against SSR by
 * checking for `document`/`window`.
 */

export type Variant = string;

const COOKIE_PREFIX = 'ab_';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function pickWeighted(variants: Variant[], weights?: number[]): Variant {
  if (!weights || weights.length !== variants.length) {
    return variants[Math.floor(Math.random() * variants.length)];
  }
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < variants.length; i++) {
    r -= weights[i];
    if (r <= 0) return variants[i];
  }
  return variants[variants.length - 1];
}

/**
 * Returns the visitor's variant for an experiment, assigning (and persisting)
 * one on first call.
 */
export function assignVariant(
  experiment: string,
  variants: Variant[] = ['A', 'B'],
  weights?: number[]
): Variant {
  const cookieName = COOKIE_PREFIX + experiment;
  const existing = readCookie(cookieName);
  if (existing && variants.includes(existing)) return existing;

  const variant = pickWeighted(variants, weights);
  writeCookie(cookieName, variant, ONE_YEAR_SECONDS);
  return variant;
}

/** Reads the already-assigned variant (or null). */
export function getAssignedVariant(experiment: string): Variant | null {
  return readCookie(COOKIE_PREFIX + experiment);
}

/**
 * Tracks an event (e.g. 'exposure', 'conversion') for an experiment. Fire and
 * forget — failures are swallowed so they never break the UI.
 */
export async function trackEvent(
  experiment: string,
  event: string,
  variant?: Variant
): Promise<void> {
  const resolvedVariant =
    variant ?? getAssignedVariant(experiment) ?? 'A';
  try {
    await fetch('/api/ab-testing/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experiment,
        variant: resolvedVariant,
        event,
      }),
      keepalive: true,
    });
  } catch {
    /* ignore network errors */
  }
}

/** Convenience: record a conversion for an experiment. */
export function trackConversion(experiment: string, variant?: Variant) {
  return trackEvent(experiment, 'conversion', variant);
}
