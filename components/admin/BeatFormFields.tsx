'use client';

import { GENRES, GRADIENTS, type BeatFormValues } from '@/components/admin/beat-form';

const inputCls =
  'w-full px-3 py-1.5 rounded-lg border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm';
const labelCls = 'block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1';

interface Props {
  form: BeatFormValues;
  onChange: (patch: Partial<BeatFormValues>) => void;
}

export function BeatFormFields({ form, onChange }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Night Rider"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Artist</label>
          <input value={form.artist} onChange={(e) => onChange({ artist: e.target.value })} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Genre *</label>
          <select value={form.genre} onChange={(e) => onChange({ genre: e.target.value })} className={inputCls}>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>BPM</label>
          <input
            type="number"
            min="60"
            max="200"
            value={form.bpm}
            onChange={(e) => onChange({ bpm: parseInt(e.target.value) || 0 })}
            className={`${inputCls} font-mono`}
          />
        </div>

        <div>
          <label className={labelCls}>Key</label>
          <input
            value={form.keySignature}
            onChange={(e) => onChange({ keySignature: e.target.value })}
            placeholder="C Minor"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Duration</label>
          <input
            value={form.duration}
            onChange={(e) => onChange({ duration: e.target.value })}
            placeholder="3:00"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Cover gradient</label>
          <select
            value={form.coverGradient}
            onChange={(e) => onChange({ coverGradient: e.target.value })}
            className={inputCls}
          >
            {GRADIENTS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-4">
          <label className={labelCls}>Description</label>
          <textarea
            rows={1}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Exclusive ($)</label>
          <input
            type="number"
            min="0"
            value={form.exclusivePrice}
            onChange={(e) => onChange({ exclusivePrice: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div>
          <label className={labelCls}>Inclusive ($)</label>
          <input
            type="number"
            min="0"
            value={form.inclusivePrice}
            onChange={(e) => onChange({ inclusivePrice: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div>
          <label className={labelCls}>Incl + Stems ($)</label>
          <input
            type="number"
            min="0"
            value={form.inclusiveStemsPrice}
            onChange={(e) => onChange({ inclusiveStemsPrice: parseFloat(e.target.value) || 0 })}
            className={`${inputCls} font-mono`}
          />
        </div>
      </div>
    </div>
  );
}

export default BeatFormFields;