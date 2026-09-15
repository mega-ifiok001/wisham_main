'use client';

import { Pause } from 'lucide-react';

interface Props {
  title: string;
  timeStr: string;
  progress: number;
  onStop: () => void;
}

export function PreviewBar({ title, timeStr, progress, onStop }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-3 z-40">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <button
          onClick={onStop}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center"
          aria-label="Stop preview"
        >
          <Pause className="w-4 h-4 fill-current" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-bold">{title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-400">{timeStr}</span>
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider hidden sm:block">
          Preview
        </span>
      </div>
    </div>
  );
}

export default PreviewBar;