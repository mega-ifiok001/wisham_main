'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Music, Loader2, Mail } from 'lucide-react';
import type { Beat } from '@/lib/types';
import { api } from '@/lib/client-api';
import { LicenseTierPicker, TIERS, type Tier } from '@/components/LicenseTierPicker';

interface CheckoutModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ beat, isOpen, onClose }: CheckoutModalProps) {
  const [tier, setTier] = useState<Tier>('exclusive');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTier('exclusive');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !beat) return null;

  const selected = TIERS.find((t) => t.id === tier)!;
  const price = selected.price(beat);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Please enter a valid email — we send your files & license there.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.initializeCheckout({
        beatId: beat.id,
        licenseType: tier === 'exclusive' ? 'exclusive' : 'inclusive',
        includesStems: tier === 'inclusive-stems',
        email,
        name: name || undefined,
      });
      window.location.href = res.authorizationUrl; // Paystack hosted checkout
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
            <span className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Music className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Checkout</h3>
              <p className="text-xs text-neutral-500 truncate max-w-[200px]">&quot;{beat.title}&quot;</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <LicenseTierPicker beat={beat} tier={tier} onChange={setTier} />

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                <Mail className="w-3.5 h-3.5" /> Delivery email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                {selected.license !== 'No license'
                  ? 'Your license, master WAV & stems arrive in this inbox.'
                  : 'Your downloads are delivered to this inbox.'}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Artist / Legal name"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
              />
            </div>

            {error && (
              <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors shadow-lg shadow-red-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Contacting Paystack…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay ${price.toFixed(0)} · {selected.name}
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-green-600" /> Secured by Paystack. You&apos;ll be
              redirected to complete payment.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;