'use client';

import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface Props {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex items-center rounded-xl border border-neutral-200 p-1 bg-white">
      <button
        onClick={() => onChange('grid')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          view === 'grid' ? 'bg-red-600 text-white' : 'text-neutral-500 hover:text-neutral-900'
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-3.5 h-3.5" /> Grid
      </button>
      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          view === 'list' ? 'bg-red-600 text-white' : 'text-neutral-500 hover:text-neutral-900'
        }`}
        aria-label="List view"
      >
        <List className="w-3.5 h-3.5" /> List
      </button>
    </div>
  );
}

export default ViewToggle;