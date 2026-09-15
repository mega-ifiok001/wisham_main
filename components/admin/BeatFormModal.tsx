'use client';

import { useState } from 'react';
import { X, Loader2, UploadCloud } from 'lucide-react';
import { adminApi } from '@/lib/client-api';
import { BeatFormFields } from '@/components/admin/BeatFormFields';
import { FileField } from '@/components/admin/FileField';
import type { BeatFormValues } from '@/components/admin/beat-form';

interface Props {
  editingId: string | null;
  form: BeatFormValues;
  onChange: (patch: Partial<BeatFormValues>) => void;
  onClose: () => void;
  onSubmit: (files: { audioFile: File | null; stemsFile: File | null }) => void;
  isSaving: boolean;
  error?: string;
}

export function BeatFormModal({ editingId, form, onChange, onClose, onSubmit, isSaving, error }: Props) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [stemsFile, setStemsFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  /**
   * Big WAV/ZIP files can't pass through serverless functions, so we upload
   * directly from the browser to Cloudinary using a signature from our server.
   */
  const handleFile = async (file: File, kind: 'audio' | 'stems') => {
    const isStems = kind === 'stems' || /\.(zip|rar|7z)$/i.test(file.name);
    setStatus(`Preparing ${file.name}…`);

    try {
      const sign = await adminApi.signUpload(file.name);
      setStatus(`Uploading ${file.name} (${(file.size / 1048576).toFixed(1)} MB)…`);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sign.apiKey);
      fd.append('timestamp', String(sign.timestamp));
      fd.append('type', sign.type);
      fd.append('folder', sign.folder);
      fd.append('signature', sign.signature);

      const res = await fetch(sign.uploadUrl, { method: 'POST', body: fd });
      const json = (await res.json()) as {
        public_id?: string;
        error?: { message?: string };
      };
      if (!res.ok || !json.public_id) {
        throw new Error(json.error?.message || `Upload failed (${res.status})`);
      }

      const stored = `cld:${sign.resourceType}:${json.public_id}`;
      onChange(isStems ? { stemsUrl: stored } : { audioUrl: stored });
      setStatus(`✓ ${file.name} uploaded to Cloudinary`);
      return;
    } catch {
      setStatus('Cloudinary unavailable — this file will upload through the server (local dev).');
      if (isStems) setStemsFile(file);
      else setAudioFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 shrink-0">
          <h3 className="font-extrabold text-base">{editingId ? 'Edit beat' : 'Add a new beat'}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ audioFile, stemsFile });
          }}
          className="p-5 space-y-3 overflow-y-auto"
        >
          <BeatFormFields form={form} onChange={onChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FileField
              label="Master audio file"
              accept="audio/*"
              buttonCls="file:bg-red-600"
              urlValue={form.audioUrl}
              placeholder="or r2:key / https://cdn/master.wav"
              onFile={(f) => handleFile(f, 'audio')}
              onUrl={(v) => onChange({ audioUrl: v })}
            />
            <FileField
              label="Stems archive (zip)"
              accept="audio/*,.zip"
              buttonCls="file:bg-neutral-800"
              urlValue={form.stemsUrl}
              placeholder="or r2:key / https://cdn/stems.zip"
              onFile={(f) => handleFile(f, 'stems')}
              onUrl={(v) => onChange({ stemsUrl: v })}
            />
          </div>

          {status && (
            <p className="flex items-center gap-2 text-[11px] text-neutral-500">
              <UploadCloud className="w-3.5 h-3.5 text-red-500" /> {status}
            </p>
          )}

          {error && (
            <p className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : editingId ? (
                'Save changes'
              ) : (
                'Add beat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BeatFormModal;