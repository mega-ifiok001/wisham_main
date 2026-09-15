'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/lib/client-api';
import { useAdminAuth } from '@/components/AdminAuthProvider';
import type { AdminStats, Beat, Sale } from '@/lib/types';
import { emptyBeatForm, type BeatFormValues } from '@/components/admin/beat-form';

/** All dashboard state + data operations, shared by the dashboard shell. */
export function useDashboardData() {
  const { admin } = useAdminAuth();

  const [beats, setBeats] = useState<Beat[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BeatFormValues>(emptyBeatForm);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [b, s, st] = await Promise.all([adminApi.beats(), adminApi.sales(), adminApi.stats()]);
      setBeats(b.beats);
      setSales(s.sales);
      setStats(st.stats);
      setRecent(st.recent);
    } catch (err) {
      setError((err as Error).message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) refresh();
  }, [admin, refresh]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyBeatForm);
    setShowForm(true);
  };

  const openEdit = (beat: Beat) => {
    setEditingId(beat.id);
    setForm({
      title: beat.title,
      artist: beat.artist,
      genre: beat.genre,
      bpm: beat.bpm,
      keySignature: beat.keySignature,
      duration: beat.duration,
      description: beat.description || '',
      coverGradient: beat.coverGradient,
      exclusivePrice: beat.exclusivePrice,
      inclusivePrice: beat.inclusivePrice,
      inclusiveStemsPrice: beat.inclusiveStemsPrice,
      audioUrl: beat.audioUrl || '',
      stemsUrl: beat.stemsUrl || '',
    });
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSave = async (files: { audioFile: File | null; stemsFile: File | null }) => {
    setIsSaving(true);
    setError('');
    try {
      const fd = new FormData();
      (Object.keys(form) as (keyof BeatFormValues)[]).forEach((k) => {
        fd.append(k, String(form[k]));
      });
      if (files.audioFile) fd.append('audioFile', files.audioFile);
      if (files.stemsFile) fd.append('stemsFile', files.stemsFile);

      if (editingId) {
        await adminApi.updateBeat(editingId, fd);
        flash('Beat updated.');
      } else {
        await adminApi.createBeat(fd);
        flash('Beat added to the store.');
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      setError((err as Error).message || 'Failed to save beat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSold = async (beat: Beat, isSold: boolean) => {
    setError('');
    try {
      const fd = new FormData();
      fd.append('isSold', String(isSold));
      await adminApi.updateBeat(beat.id, fd);
      flash(isSold ? 'Beat marked as sold.' : 'Beat relisted — it is live again.');
      refresh();
    } catch (err) {
      setError((err as Error).message || 'Failed to update beat');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also deletes its sales history.`)) return;
    try {
      await adminApi.deleteBeat(id);
      flash('Beat deleted.');
      refresh();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete beat');
    }
  };

  return {
    beats,
    sales,
    stats,
    recent,
    isLoading,
    notice,
    error,
    showForm,
    editingId,
    form,
    isSaving,
    setForm,
    openAdd,
    openEdit,
    closeForm,
    handleSave,
    handleToggleSold,
    handleDelete,
    refresh,
  };
}