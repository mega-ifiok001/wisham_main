import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { LICENSE_TIERS } from '@/lib/pricing';

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">Simple licensing</h2>
          <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
            One-time payments. No subscriptions. Every beat is sold per license.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {LICENSE_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 rounded-2xl border-2 flex flex-col transition-shadow hover:shadow-xl ${
                tier.popular
                  ? 'border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1 rounded-full">
                  Most common
                </span>
              )}
              <h3 className="font-extrabold text-lg">{tier.name}</h3>
              <p className="text-neutral-500 text-sm mt-1">{tier.desc}</p>
              <div className="mt-6 mb-6">
                <span className="text-5xl font-black tracking-tight">{tier.price}</span>
                <span className="text-neutral-400 font-semibold text-sm"> / one-time</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-neutral-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/beats"
                className={`mt-8 py-3.5 rounded-xl text-center font-bold text-sm transition-colors ${
                  tier.popular
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-2 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Find a beat
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;