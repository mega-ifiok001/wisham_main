'use client';

import { Play, Pause, Clock } from 'lucide-react';
import type { Beat } from '@/lib/types';

interface Props {
  beat: Beat;
  isPlaying: boolean;
  onTogglePlay: (beat: Beat) => void;
  onBuy: (beat: Beat) => void;
}

export function BeatCard({ beat, isPlaying, onTogglePlay, onBuy }: Props) {
  return (
    <div className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all">
      <div className={`relative h-36 bg-gradient-to-br ${beat.coverGradient}`}>
        <button
          onClick={() => onTogglePlay(beat)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors"
          aria-label={`Preview ${beat.title}`}
        >
          <span className="w-12 h-12 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            )}
          </span>
        </button>
        <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur">
          {beat.genre}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-extrabold text-base truncate">{beat.title}</h3>
        <p className="text-xs text-neutral-400 mb-3">{beat.artist}</p>

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-4">
          <span className="font-bold text-red-600">{beat.bpm} BPM</span>
          <span>·</span>
          <span>{beat.keySignature}</span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="w-3 h-3" /> {beat.duration}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs">
            <div className="font-black text-neutral-900">
              ${beat.exclusivePrice} <span className="text-neutral-400 font-semibold">excl.</span>
            </div>
            <div className="text-neutral-500 font-semibold">
              ${beat.inclusivePrice} lease · ${beat.inclusiveStemsPrice} +stems
            </div>
          </div>
          <button
            onClick={() => onBuy(beat)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}

export default BeatCard;