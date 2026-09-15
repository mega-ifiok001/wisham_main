'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Music } from 'lucide-react';
import { api } from '@/lib/client-api';

type Status = 'verifying' | 'success' | 'error';

type SaleInfo = {
  id: string;
  beatTitle: string;
  buyerEmail: string;
  licenseType: string;
  includesStems: boolean;
  amountUsd: number;
  licenseHash: string | null;
  paid: boolean;
};

export function CheckoutView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference') || '';

  const [status, setStatus] = useState<Status>('verifying');
  const [sale, setSale] = useState<SaleInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    setStarted(true);

    if (!reference) {
      setStatus('error');
      setErrorMsg('No payment reference found. Your payment may still be processing — check your email.');
      return;
    }

    api
      .verifyCheckout(reference)
      .then((res) => {
        if (res.success && res.sale.paid) {
          setSale(res.sale);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg('Payment could not be confirmed. Please try again or contact us.');
        }
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg((err as Error).message || 'Something went wrong while confirming your payment.');
      });
  }, [reference, started]);

  const goShop = () => router.push('/beats');
  const shopBtn = (
    <button
      onClick={goShop}
      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
    >
      Browse More Beats <ArrowRight className="w-4 h-4" />
    </button>
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 font-black text-2xl tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Music className="w-5 h-5" />
            </span>
            WISHAM
          </a>
          <a href="/beats" className="text-sm font-semibold text-neutral-500 hover:text-red-600">
            ← Back to beats
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {status === 'verifying' && (
            <div className="text-center py-16 space-y-5">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
              <h1 className="text-2xl font-extrabold">Confirming your payment…</h1>
              <p className="text-sm text-neutral-500">
                Please wait while we verify your transaction with Paystack.
              </p>
            </div>
          )}

          {status === 'success' && sale && (
            <div className="text-center py-8 space-y-6">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
              <h1 className="text-3xl font-extrabold">Payment successful!</h1>

              <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Beat</span>
                  <span className="font-bold">{sale.beatTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">License</span>
                  <span className="font-bold uppercase">{sale.licenseType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Stems included</span>
                  <span className="font-bold">{sale.includesStems ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount paid</span>
                  <span className="font-bold">${sale.amountUsd.toFixed(2)}</span>
                </div>
                {sale.licenseHash && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">License hash</span>
                    <code className="text-red-600 font-mono text-xs">{sale.licenseHash}</code>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-left">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  📬 <strong>Check your inbox.</strong> Your beat
                  {sale.includesStems ? ' and stems' : ''}
                  {sale.licenseType === 'exclusive' ? ' plus your exclusive license PDF' : ''} were sent to{' '}
                  <strong className="text-neutral-900">{sale.buyerEmail}</strong>. Download links expire in 48
                  hours. Check spam/junk if you don&apos;t see it.
                </p>
              </div>

              {shopBtn}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12 space-y-5">
              <XCircle className="w-14 h-14 text-red-600 mx-auto" />
              <h1 className="text-2xl font-extrabold">We couldn&apos;t confirm the payment</h1>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">{errorMsg}</p>
              {shopBtn}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CheckoutView;