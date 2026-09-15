'use client';

import { Search } from 'lucide-react';
import { ViewToggle, type ViewMode } from '@/components/ViewToggle';

export const GENRES = ['All', 'Trap', 'Drill', 'Boom Bap', 'Synthwave', 'R&B'];

export const SORTS: [string, string][] = [
  ['newest', 'Newest'],
  ['price-low', 'Price ↑'],
  ['price-high', 'Price ↓'],
  ['bpm', 'BPM'],
];

interface Props {
  search: string;
  onSearch: (value: string) => void;
  genre: string;
  onGenre: (genre: string) => void;
  sort: string;
  onSort: (sort: string) => void;
  view: ViewMode;
  onView: (view: ViewMode) => void;
}

export function BeatsToolbar({ search, onSearch, genre, onGenre, sort, onSort, view, onView }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search beats, keys…"
            className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 outline-none focus:border-red-500"
          aria-label="Sort beats"
        >
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => onGenre(g)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${
                genre === g ? 'bg-red-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <ViewToggle view={view} onChange={onView} />
      </div>
    </div>
  );
}

export default BeatsToolbar;