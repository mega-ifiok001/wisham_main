'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import type { Beat } from '@/lib/types';
import { api } from '@/lib/client-api';

/** Live "fresh on the store" strip for the landing page. */
export function BeatsStrip() {
  const [beats, setBeats] = useState<Beat[]>([]);

  useEffect(() => {
    api
      .getBeats()
      .then((res) => setBeats(res.beats))
      .catch(() => {});
  }, []);

  if (beats.length === 0) return null;

  return (
    <section id="beats" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Fresh on the store</h2>
            <p className="text-neutral-500 mt-3">Live from the WISHAM catalog, updated in real time.</p>
          </div>
          <Link
            href="/beats"
            className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"
          >
            Browse all beats <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beats.slice(0, 4).map((b) => (
            <Link
              key={b.id}
              href="/beats"
              className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all"
            >
              <div className={`relative h-32 bg-gradient-to-br ${b.coverGradient}`}>
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                  <span className="w-11 h-11 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </span>
                </span>
                <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur">
                  {b.genre}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-extrabold text-sm truncate">{b.title}</h3>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-neutral-500">
                    {b.bpm} BPM · {b.keySignature}
                  </span>
                  <span className="font-black text-red-600">${b.exclusivePrice}</span>
                </div>
                <div className="mt-2 text-[11px] text-neutral-400">
                  ${b.inclusivePrice} lease · ${b.inclusiveStemsPrice} +stems
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BeatsStrip;