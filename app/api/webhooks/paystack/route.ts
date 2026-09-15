import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/services/paystack';
import { finalizeSale } from '@/lib/services/sales';

export const runtime = 'nodejs';

/**
 * Paystack webhook. The raw body is required for the HMAC check, so we read
 * text() instead of json().
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  const valid = signature ? await verifyWebhookSignature(signature, raw) : false;
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: { event?: string; data?: { reference?: string } } = {};
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ received: true });
  }

  const reference = body?.data?.reference;

  // Respond fast — finalize in the background
  if (body?.event === 'charge.success' && reference) {
    finalizeSale(String(reference)).catch((err) =>
      console.error('Webhook finalize failed:', err.message)
    );
  }

  return NextResponse.json({ received: true });
}