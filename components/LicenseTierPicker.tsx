'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';
import type { Beat } from '@/lib/types';

export type Tier = 'exclusive' | 'inclusive' | 'inclusive-stems';

export const TIERS: {
  id: Tier;
  name: string;
  price: (b: Beat) => number;
  badge?: string;
  features: string[];
  license: string;
}[] = [
  {
    id: 'exclusive',
    name: 'Exclusive',
    badge: 'Beat will be removed from store',
    price: (b) => b.exclusivePrice,
    features: ['Full Exclusive Ownership', 'Master WAV + Full Stems + License'],
    license: 'License included',
  },
  {
    id: 'inclusive',
    name: 'Inclusive',
    price: (b) => b.inclusivePrice,
    features: ['Lease — unlimited commercial use', 'Master WAV only'],
    license: 'No license',
  },
  {
    id: 'inclusive-stems',
    name: 'Inclusive + Stems',
    price: (b) => b.inclusiveStemsPrice,
    features: ['Lease — unlimited commercial use', 'Master WAV + Full Stems'],
    license: 'No license',
  },
];

interface Props {
  beat: Beat;
  tier: Tier;
  onChange: (tier: Tier) => void;
}

export function LicenseTierPicker({ beat, tier, onChange }: Props) {
  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
        Choose your license
      </label>
      {TIERS.map((t) => {
        const active = tier === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              active
                ? 'border-red-600 bg-red-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    active ? 'border-red-600' : 'border-neutral-300'
                  }`}
                >
                  {active && <span className="w-2 h-2 rounded-full bg-red-600" />}
                </span>
                <span className="font-bold text-sm">{t.name}</span>
                {t.badge && (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {t.badge}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="font-black text-lg">${t.price(beat).toFixed(0)}</span>
                {t.license === 'No license' ? (
                  <span className="block text-[10px] text-neutral-400 font-semibold uppercase">
                    No license
                  </span>
                ) : (
                  <span className="block text-[10px] text-red-600 font-semibold uppercase flex items-center gap-0.5">
                     {t.license}
                  </span>
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
  );
}

export default LicenseTierPicker;