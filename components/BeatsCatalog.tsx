'use client';

import { useState, useEffect } from 'react';
import { Music, Loader2 } from 'lucide-react';
import type { Beat } from '@/lib/types';
import { api } from '@/lib/client-api';
import { useAudioPreview } from '@/lib/use-audio-preview';
import { BeatCard } from '@/components/BeatCard';
import { BeatListRow } from '@/components/BeatListRow';
import { BeatsToolbar } from '@/components/BeatsToolbar';
import { PreviewBar } from '@/components/PreviewBar';
import { CheckoutModal } from '@/components/CheckoutModal';
import type { ViewMode } from '@/components/ViewToggle';

export function BeatsCatalog() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState<ViewMode>('grid');
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { playingId, progress, timeStr, toggle, stop } = useAudioPreview();

  useEffect(() => {
    api
      .getBeats()
      .then((res) => setBeats(res.beats))
      .catch((err) => setError((err as Error).message || 'Could not load beats'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = beats
    .filter((b) => {
      const q = search.toLowerCase();
      const matchesQ =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.keySignature.toLowerCase().includes(q);
      const matchesG = genre === 'All' || b.genre === genre;
      return matchesQ && matchesG;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'price-low':
          return a.exclusivePrice - b.exclusivePrice;
        case 'price-high':
          return b.exclusivePrice - a.exclusivePrice;
        case 'bpm':
          return a.bpm - b.bpm;
        case 'newest':
        default:
          return 0;
      }
    });

  const playingBeat = beats.find((b) => b.id === playingId);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 font-black text-2xl tracking-tight">
            <img src="/logo.png" width={130} alt="" />
          </a>
          <a href="/" className="text-sm font-semibold text-neutral-500 hover:text-red-600 transition-colors">
            ← Home
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">The Beat Store</h1>
            <p className="text-neutral-500 mt-1 text-sm">
              Every beat · $30 lease / $40 lease + stems / $60 exclusive.
            </p>
          </div>
          <BeatsToolbar
            search={search}
            onSearch={setSearch}
            genre={genre}
            onGenre={setGenre}
            sort={sort}
            onSort={setSort}
            view={view}
            onView={setView}
          />
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4 text-neutral-400">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-sm font-semibold">Loading beats…</span>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="font-bold text-red-600">{error}</p>
            <p className="text-sm text-neutral-400 mt-2">Please refresh the page and try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-neutral-400">
            <p className="font-bold text-neutral-600">No beats found.</p>
            <p className="text-sm mt-1">Try a different search or check back soon.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                isPlaying={playingId === beat.id}
                onTogglePlay={toggle}
                onBuy={(b) => {
                  setCheckoutBeat(b);
                  setIsCheckoutOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
            {filtered.map((beat) => (
              <BeatListRow
                key={beat.id}
                beat={beat}
                isPlaying={playingId === beat.id}
                onTogglePlay={toggle}
                onBuy={(b) => {
                  setCheckoutBeat(b);
                  setIsCheckoutOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {playingBeat && (
        <PreviewBar title={playingBeat.title} timeStr={timeStr} progress={progress} onStop={stop} />
      )}

      <CheckoutModal
        beat={checkoutBeat}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}

export default BeatsCatalog;