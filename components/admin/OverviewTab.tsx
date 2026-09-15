'use client';

import { DollarSign, Music, ShoppingBag, Sparkles, Layers, Edit, TrendingUp } from 'lucide-react';
import type { AdminStats, Sale } from '@/lib/types';

interface Props {
  stats: AdminStats | null;
  recent: Sale[];
  onViewAll: () => void;
}

export function OverviewTab({ stats, recent, onViewAll }: Props) {
  const cards = [
    { label: 'Total revenue', value: stats ? `$${stats.totalRevenueUsd.toFixed(2)}` : '—', icon: DollarSign, sub: 'paid sales' },
    { label: 'Paid sales', value: stats ? String(stats.paidSales) : '—', icon: ShoppingBag, sub: `${stats?.pendingSales ?? 0} pending` },
    { label: 'Exclusive sales', value: stats ? String(stats.exclusiveCount) : '—', icon: Sparkles, sub: 'with license' },
    { label: 'Inclusive sales', value: stats ? String(stats.inclusiveCount) : '—', icon: Layers, sub: 'no license' },
    { label: 'Beats in store', value: stats ? String(stats.totalBeats) : '—', icon: Music, sub: 'total uploaded' },
    { label: 'Sold exclusively', value: stats ? String(stats.soldBeats) : '—', icon: Edit, sub: 'removed from store' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{c.label}</span>
              <span className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <c.icon className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black mt-2">{c.value}</div>
            <div className="text-xs text-neutral-400 mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-extrabold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" /> Recent sales
          </h3>
          <button onClick={onViewAll} className="text-xs font-bold text-red-600 hover:underline">
            View all
          </button>
        </div>

        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-400">
            No sales yet — your first purchase will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3 font-bold">{s.beatTitle}</td>
                    <td className="px-5 py-3 text-neutral-500">{s.buyerEmail}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                          s.licenseType === 'exclusive'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {s.licenseType}
                        {s.includesStems ? ' +stems' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-black">${s.amountUsd.toFixed(2)}</td>
                    <td className="px-5 py-3 text-neutral-400 text-xs">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewTab;