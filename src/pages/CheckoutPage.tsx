import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Music } from 'lucide-react';
import { api } from '../lib/api';

type Status = 'verifying' | 'success' | 'error';

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || '';
  const [status, setStatus] = useState<Status>('verifying');
  const [sale, setSale] = useState<Awaited<ReturnType<typeof api.verifyCheckout>>['sale'] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (tried) return;
    setTried(true);

    if (!reference) {
      setStatus('error');
      setErrorMsg('No payment reference found. Your payment may still be processing — check your email for the receipt.');
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
  }, [reference, tried]);

  const goHome = (
    <Link
      to="/beats"
      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors"
    >
      Browse More Beats <ArrowRight className="w-4 h-4" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-black text-2xl tracking-tight text-neutral-900">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Music className="w-5 h-5" />
            </span>
            WISHAM
          </Link>
          <Link to="/beats" className="text-sm font-semibold text-neutral-500 hover:text-red-600 transition-colors">
            ← Back to beats
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {status === 'verifying' && (
            <div className="text-center py-16 space-y-5">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
              <h1 className="text-2xl font-extrabold">Confirming your payment…</h1>
              <p className="text-sm text-neutral-500">Please wait while we verify your transaction with Paystack.</p>
            </div>
          )}

          {status === 'success' && sale && (
            <div className="text-center py-8 space-y-6">
              <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
              <div>
                <h1 className="text-3xl font-extrabold">Payment successful!</h1>
                <p className="text-neutral-500 mt-2">
                  You now own <strong className="text-neutral-900">"{sale.beatTitle}"</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 text-left space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">License</span><span className="font-bold uppercase">{sale.licenseType}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Stems included</span><span className="font-bold">{sale.includesStems ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Amount paid</span><span className="font-bold">${sale.amountUsd.toFixed(2)}</span></div>
                {sale.licenseHash && (
                  <div className="flex justify-between"><span className="text-neutral-500">License hash</span><code className="text-red-600 font-mono text-xs">{sale.licenseHash}</code></div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-left">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  📬 <strong>Check your inbox.</strong> Your beat{sale.includesStems ? ' and stems' : ''}{sale.licenseType === 'exclusive' ? ' plus your exclusive license document' : ''} have been sent to{' '}
                  <strong className="text-neutral-900">{sale.buyerEmail}</strong>. Download links expire in 48 hours. Check spam/junk if you don't see it.
                </p>
              </div>

              {goHome}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12 space-y-5">
              <XCircle className="w-14 h-14 text-red-600 mx-auto" />
              <h1 className="text-2xl font-extrabold">We couldn't confirm the payment</h1>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">{errorMsg}</p>
              <div className="flex justify-center">{goHome}</div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-4 px-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} WISHAM — Own your sound.
      </footer>
    </div>
  );
};

export default CheckoutPage;