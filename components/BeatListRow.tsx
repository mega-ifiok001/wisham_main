'use client';

import { Play, Pause, Clock } from 'lucide-react';
import type { Beat } from '@/lib/types';

interface Props {
  beat: Beat;
  isPlaying: boolean;
  onTogglePlay: (beat: Beat) => void;
  onBuy: (beat: Beat) => void;
}

/** Thin horizontal row used by the "list" view. */
export function BeatListRow({ beat, isPlaying, onTogglePlay, onBuy }: Props) {
  return (
    <div className="group flex items-center gap-3 px-2 py-1.5 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors">
      {/* Cover / play */}
      <button
        onClick={() => onTogglePlay(beat)}
        className={`relative w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${beat.coverGradient} flex items-center justify-center`}
        aria-label={`Preview ${beat.title}`}
      >
        <span className="w-6 h-6 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow">
          {isPlaying ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 ml-0.5 fill-current" />
          )}
        </span>
      </button>

      {/* Title + genre */}
      <div className="flex items-center gap-2 min-w-0 w-48 shrink-0">
        <h3 className="font-extrabold text-sm truncate">{beat.title}</h3>
        <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full shrink-0">
          {beat.genre}
        </span>
      </div>

      {/* Meta */}
      <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-500 flex-1 min-w-0">
        <span className="font-bold text-red-600 shrink-0">{beat.bpm} BPM</span>
        <span>·</span>
        <span className="shrink-0">{beat.keySignature}</span>
        <span className="flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" /> {beat.duration}
        </span>
        <span className="hidden lg:inline">·</span>
        <span className="hidden lg:inline truncate">{beat.artist}</span>
      </div>

      {/* Prices */}
      <div className="hidden sm:block text-right text-[11px] leading-tight shrink-0 ml-auto">
        <div className="font-black text-neutral-900">${beat.exclusivePrice} excl.</div>
        <div className="text-neutral-500 font-semibold">
          ${beat.inclusivePrice} lease · ${beat.inclusiveStemsPrice} +stems
        </div>
      </div>

      {/* Buy */}
      <button
        onClick={() => onBuy(beat)}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
      >
        Buy
      </button>
    </div>
  );
}

export default BeatListRow;