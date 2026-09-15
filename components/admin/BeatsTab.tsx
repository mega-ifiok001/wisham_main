'use client';

import { Plus, Trash2, Edit, RotateCcw, Download } from 'lucide-react';
import type { Beat } from '@/lib/types';

interface Props {
  beats: Beat[];
  onAdd: () => void;
  onEdit: (beat: Beat) => void;
  onDelete: (id: string, title: string) => void;
  onToggleSold: (beat: Beat, isSold: boolean) => void;
}

export function BeatsTab({ beats, onAdd, onEdit, onDelete, onToggleSold }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg">{beats.length} beats</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add beat
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {beats.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-400">
            No beats yet. Add your first beat to start selling.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3">Beat</th>
                  <th className="px-5 py-3">Genre</th>
                  <th className="px-5 py-3">Excl</th>
                  <th className="px-5 py-3">Incl</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {beats.map((b) => (
                  <tr key={b.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-bold">{b.title}</div>
                      <div className="text-xs text-neutral-400">
                        {b.bpm} BPM · {b.keySignature} · {b.duration}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-500">{b.genre}</td>
                    <td className="px-5 py-3 font-black">${b.exclusivePrice}</td>
                    <td className="px-5 py-3 text-neutral-600">
                      ${b.inclusivePrice} / ${b.inclusiveStemsPrice}
                    </td>
                    <td className="px-5 py-3">
                      {b.isSold ? (
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-red-600 text-white">
                          Sold
                        </span>
                      ) : b.audioUrl ? (
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Live
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          No file
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {b.isSold && (
                          <button
                            onClick={() => onToggleSold(b, false)}
                            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                            title="Relist this beat (make it available again)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(b)}
                          className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <span
                          className={`p-2 rounded-lg ${
                            b.audioUrl ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-50 text-neutral-300'
                          }`}
                          title={b.audioUrl ? `Master file: ${b.audioUrl}` : 'No master file uploaded'}
                        >
                          <Download className="w-4 h-4" />
                        </span>
                        <button
                          onClick={() => onDelete(b.id, b.title)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default BeatsTab;