/**
 * @jest-environment node
 *
 * Stripe webhook handler test. With no Stripe keys configured (the default in
 * CI/tests), the handler acknowledges the event in "demo mode" rather than
 * attempting signature verification.
 */
import { POST } from '@/app/api/stripe/webhook/route';

describe('POST /api/stripe/webhook', () => {
  it('acknowledges events in demo mode when Stripe is not configured', async () => {
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    });

    const res = await POST(req as never);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(json.demo).toBe(true);
  });

  it('does not throw when the body is empty', async () => {
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '',
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
  });
});
