import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Music, CheckCircle2, Loader2, Mail, Sparkles } from 'lucide-react';
import { Beat, api } from '../lib/api';

interface CheckoutModalProps { beat: Beat | null; isOpen: boolean; onClose: () => void }

type Tier = 'exclusive' | 'inclusive' | 'inclusive-stems';

const TIERS: { id: Tier; name: string; price: (b: Beat) => number; badge?: string; features: string[]; license: string }[] = [
  { id: 'exclusive', name: 'Exclusive', badge: 'Beat removed from store', price: (b) => b.exclusivePrice,
    features: ['Full Exclusive Ownership', 'Master WAV + Full Stems + License'], license: 'License included' },
  { id: 'inclusive', name: 'Inclusive', price: (b) => b.inclusivePrice,
    features: ['Lease — unlimited commercial use', 'Master WAV only'], license: 'No license' },
  { id: 'inclusive-stems', name: 'Inclusive + Stems', price: (b) => b.inclusiveStemsPrice,
    features: ['Lease — unlimited commercial use', 'Master WAV + Full Stems'], license: 'No license' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ beat, isOpen, onClose }) => {
  const [tier, setTier] = useState<Tier>('exclusive');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (!isOpen) { setTier('exclusive'); setError(''); setIsLoading(false); } }, [isOpen]);

  if (!isOpen || !beat) return null;

  const selected = TIERS.find((t) => t.id === tier)!;
  const price = selected.price(beat);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) return setError('Please enter a valid email — we send your files & license there.');
    setIsLoading(true);
    try {
      const res = await api.initializeCheckout({
        beatId: beat.id,
        licenseType: tier === 'exclusive' ? 'exclusive' : 'inclusive',
        includesStems: tier === 'inclusive-stems',
        email,
        name: name || undefined,
      });
      window.location.href = res.authorizationUrl; // secure Paystack hosted checkout
    } catch (err) {
      setError((err as Error).message || 'Could not start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl text-neutral-900 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white"><Music className="w-5 h-5" /></span>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Checkout</h3>
              <p className="text-xs text-neutral-500 truncate max-w-[200px]">"{beat.title}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Choose your license</label>
            {TIERS.map((t) => {
              const active = tier === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setTier(t.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${active ? 'border-red-600 bg-red-50' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-red-600' : 'border-neutral-300'}`}>
                        {active && <span className="w-2 h-2 rounded-full bg-red-600" />}
                      </span>
                      <span className="font-bold text-sm">{t.name}</span>
                      {t.badge && <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">{t.badge}</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg">${t.price(beat).toFixed(0)}</span>
                      {t.license === 'No license' ? (
                        <span className="block text-[10px] text-neutral-400 font-semibold uppercase">No license</span>
                      ) : (
                        <span className="block text-[10px] text-red-600 font-semibold uppercase flex items-center gap-0.5"><Sparkles className="w-3 h-3" /> {t.license}</span>
                      )}
                    </div>
                  </div>
                  <ul className="mt-2 pl-6 space-y-0.5">
                    {t.features.map((f) => (
                      <li key={f} className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Buyer details */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Delivery email
              </label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
              <p className="text-[11px] text-neutral-400 mt-1">
                {selected.license !== 'No license' ? 'Your license, master WAV & stems arrive in this inbox.' : 'Your downloads are delivered to this inbox.'}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">Name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Artist / Legal name"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
            </div>
            {error && <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-lg shadow-red-600/20">
              {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Contacting Paystack…</>) : (<><Lock className="w-4 h-4" /> Pay ${price.toFixed(0)} · {selected.name}</>)}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-green-600" /> Secured by Paystack. You'll be redirected to complete payment.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;