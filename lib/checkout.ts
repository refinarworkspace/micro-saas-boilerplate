import { sleep } from './utils';

/**
 * -----------------------------------------------------------------------------
 * Client-side Stripe Checkout placeholder
 * -----------------------------------------------------------------------------
 * This is intentionally framework-agnostic and does NOT import the server-only
 * `stripe` SDK (which would bloat the client bundle). In production you would
 * POST to a route handler that creates a Stripe Checkout Session server-side
 * and returns its URL, then redirect the browser to it:
 *
 *   const res = await fetch('/api/checkout', {
 *     method: 'POST',
 *     body: JSON.stringify({ planId }),
 *   });
 *   const { url } = await res.json();
 *   window.location.href = url;
 *
 * Until you wire that up, this simulates the round-trip so the UI is fully
 * explorable.
 */
export async function startCheckout(
  planId: string
): Promise<{ url: string | null }> {
  // eslint-disable-next-line no-console
  console.info(`[stripe placeholder] Creating checkout session for "${planId}"…`);
  await sleep(900);
  // Returning a null URL signals "demo mode" to the caller.
  return { url: null };
}
