import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Music, LogOut, Plus, Trash2, Edit, Download, RefreshCw,
  DollarSign, ShoppingBag, Sparkles, Layers, LayoutDashboard, AlertCircle, Loader2, X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Beat, Sale, AdminStats, adminApi } from '../lib/api';

type Tab = 'overview' | 'beats' | 'sales';

const GENRES = ['Trap', 'Drill', 'Boom Bap', 'Synthwave', 'R&B'];
const GRADIENTS = ['from-red-500 to-red-700', 'from-rose-500 to-red-600', 'from-red-600 to-rose-800', 'from-neutral-800 to-red-900'];

interface BeatForm {
  title: string; artist: string; genre: string; bpm: number; keySignature: string; duration: string; description: string;
  coverGradient: string; exclusivePrice: number; inclusivePrice: number; inclusiveStemsPrice: number; audioUrl: string; stemsUrl: string;
}

const emptyForm: BeatForm = {
  title: '', artist: 'WISHAM', genre: 'Trap', bpm: 120, keySignature: 'C Minor', duration: '3:00', description: '',
  coverGradient: GRADIENTS[0], exclusivePrice: 60, inclusivePrice: 30, inclusiveStemsPrice: 40, audioUrl: '', stemsUrl: '',
};

export const AdminDashboard = () => {
  const { admin, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [beats, setBeats] = useState<Beat[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BeatForm>(emptyForm);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [stemsFile, setStemsFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !admin) navigate('/admin/login', { replace: true });
  }, [admin, authLoading, navigate]);

  const fetchAll = useCallback(async () => {
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
    if (admin) fetchAll();
  }, [admin, fetchAll]);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 4000); };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setAudioFile(null); setStemsFile(null); setShowForm(true); };

  const openEdit = (beat: Beat) => {
    setEditingId(beat.id);
    setForm({
      title: beat.title, artist: beat.artist, genre: beat.genre, bpm: beat.bpm, keySignature: beat.keySignature,
      duration: beat.duration, description: beat.description || '', coverGradient: beat.coverGradient,
      exclusivePrice: beat.exclusivePrice, inclusivePrice: beat.inclusivePrice, inclusiveStemsPrice: beat.inclusiveStemsPrice,
      audioUrl: beat.audioUrl || '', stemsUrl: beat.stemsUrl || '',
    });
    setAudioFile(null); setStemsFile(null);
    setShowForm(true);
  };

  const handleSaveBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('artist', form.artist);
      fd.append('genre', form.genre);
      fd.append('bpm', String(form.bpm));
      fd.append('keySignature', form.keySignature);
      fd.append('duration', form.duration);
      fd.append('description', form.description);
      fd.append('coverGradient', form.coverGradient);
      fd.append('exclusivePrice', String(form.exclusivePrice));
      fd.append('inclusivePrice', String(form.inclusivePrice));
      fd.append('inclusiveStemsPrice', String(form.inclusiveStemsPrice));
      fd.append('audioUrl', form.audioUrl);
      fd.append('stemsUrl', form.stemsUrl);
      if (audioFile) fd.append('audioFile', audioFile);
      if (stemsFile) fd.append('stemsFile', stemsFile);

      if (editingId) {
        await adminApi.updateBeat(editingId, fd);
        flash('Beat updated.');
      } else {
        await adminApi.createBeat(fd);
        flash('Beat added to the store.');
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError((err as Error).message || 'Failed to save beat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This also deletes its sales history.`)) return;
    try {
      await adminApi.deleteBeat(id);
      flash('Beat deleted.');
      fetchAll();
    } catch (err) {
      setError((err as Error).message || 'Failed to delete beat');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/admin/login', { replace: true }); };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-black text-xl text-neutral-900">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white"><Music className="w-5 h-5" /></span>
            WISHAM
            <span className="text-xs font-bold text-neutral-400 ml-1 uppercase tracking-widest">Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} disabled={isLoading}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="hidden sm:block text-xs text-neutral-400 font-medium">{admin?.email}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="px-6 pt-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {([['overview', 'Overview', LayoutDashboard], ['beats', 'Beats', Music], ['sales', 'Sales', ShoppingBag]] as [Tab, string, typeof LayoutDashboard][]).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === id ? 'bg-red-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        {notice && <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">{notice}</div>}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total revenue', value: stats ? `$${stats.totalRevenueUsd.toFixed(2)}` : '—', icon: DollarSign, sub: 'paid sales' },
                { label: 'Paid sales', value: stats ? String(stats.paidSales) : '—', icon: ShoppingBag, sub: `${stats?.pendingSales ?? 0} pending` },
                { label: 'Exclusive sales', value: stats ? String(stats.exclusiveCount) : '—', icon: Sparkles, sub: 'with license' },
                { label: 'Inclusive sales', value: stats ? String(stats.inclusiveCount) : '—', icon: Layers, sub: 'no license' },
                { label: 'Beats in store', value: stats ? String(stats.totalBeats) : '—', icon: Music, sub: 'total uploaded' },
                { label: 'Sold exclusively', value: stats ? String(stats.soldBeats) : '—', icon: Edit, sub: 'removed from store' },
              ].map((c) => (
                <div key={c.label} className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{c.label}</span>
                    <span className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><c.icon className="w-4 h-4" /></span>
                  </div>
                  <div className="text-3xl font-black mt-2">{c.value}</div>
                  <div className="text-xs text-neutral-400 mt-1">{c.sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-extrabold">Recent sales</h3>
                <button onClick={() => setActiveTab('sales')} className="text-xs font-bold text-red-600 hover:underline">View all</button>
              </div>
              {recent.length === 0 ? (
                <p className="p-8 text-center text-sm text-neutral-400">No sales yet — your first exclusive purchase will appear here.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {recent.map((s) => (
                      <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-5 py-3 font-bold">{s.beatTitle}</td>
                        <td className="px-5 py-3 text-neutral-500">{s.buyerEmail}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${s.licenseType === 'exclusive' ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-500'}`}>
                            {s.licenseType}{s.includesStems ? ' +stems' : ''}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-black">${s.amountUsd.toFixed(2)}</td>
                        <td className="px-5 py-3 text-neutral-400 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {activeTab === 'beats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">{beats.length} beats</h3>
              <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" /> Add beat
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {beats.length === 0 ? (
                <p className="p-8 text-center text-sm text-neutral-400">No beats yet. Add your first beat to start selling.</p>
              ) : (
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
                          <div className="text-xs text-neutral-400">{b.bpm} BPM · {b.keySignature} · {b.duration}</div>
                        </td>
                        <td className="px-5 py-3 text-neutral-500">{b.genre}</td>
                        <td className="px-5 py-3 font-black">${b.exclusivePrice}</td>
                        <td className="px-5 py-3 text-neutral-600">${b.inclusivePrice} / ${b.inclusiveStemsPrice}</td>
                        <td className="px-5 py-3">
                          {b.isSold ? (
                            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-red-600 text-white">Sold</span>
                          ) : b.audioUrl ? (
                            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-green-100 text-green-700">Live</span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-700">No file</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(b)} className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <span
                              className={`p-2 rounded-lg ${b.audioUrl ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-50 text-neutral-300'}`}
                              title={b.audioUrl ? `Master file: ${b.audioUrl}` : 'No master file uploaded'}>
                              <Download className="w-4 h-4" />
                            </span>
                            <button onClick={() => handleDelete(b.id, b.title)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg">{sales.length} sales</h3>
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {sales.length === 0 ? (
                <p className="p-8 text-center text-sm text-neutral-400">No sales recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                        <th className="px-5 py-3">Beat</th>
                        <th className="px-5 py-3">Buyer</th>
                        <th className="px-5 py-3">License</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s) => (
                        <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                          <td className="px-5 py-3 font-bold">
                            {s.beatTitle}
                            {s.licenseHash && <div className="text-[10px] font-mono text-red-500">{s.licenseHash}</div>}
                          </td>
                          <td className="px-5 py-3">
                            <div>{s.buyerEmail}</div>
                            {s.buyerName && <div className="text-xs text-neutral-400">{s.buyerName}</div>}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${s.licenseType === 'exclusive' ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-500'}`}>
                              {s.licenseType}{s.includesStems ? ' +stems' : ''}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-black">${s.amountUsd.toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                              s.paymentStatus === 'success' ? 'bg-green-100 text-green-700' : s.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {s.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-neutral-400 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {sales.some((s) => s.paymentStatus === 'success' && !s.emailSent) && (
              <p className="text-xs text-amber-600">⚠️ Some successful sales have not received their email yet — they will re-send on the next verification/webhook hit.</p>
            )}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl text-neutral-900 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="font-extrabold text-lg">{editingId ? 'Edit beat' : 'Add a new beat'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBeat} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Night Rider" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Artist</label>
                  <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Genre *</label>
                  <select value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm">
                    {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">BPM</label>
                  <input type="number" min="60" max="200" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Key</label>
                  <input value={form.keySignature} onChange={(e) => setForm({ ...form, keySignature: e.target.value })}
                    placeholder="C Minor" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Duration</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="3:00" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Cover gradient</label>
                  <select value={form.coverGradient} onChange={(e) => setForm({ ...form, coverGradient: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm">
                    {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm resize-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Exclusive ($)</label>
                  <input type="number" min="0" step="1" value={form.exclusivePrice} onChange={(e) => setForm({ ...form, exclusivePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm font-mono" />
                  <p className="text-[10px] text-neutral-400 mt-1">Stems + license</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Inclusive ($)</label>
                  <input type="number" min="0" step="1" value={form.inclusivePrice} onChange={(e) => setForm({ ...form, inclusivePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm font-mono" />
                  <p className="text-[10px] text-neutral-400 mt-1">No stems</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Incl + Stems ($)</label>
                  <input type="number" min="0" step="1" value={form.inclusiveStemsPrice} onChange={(e) => setForm({ ...form, inclusiveStemsPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 outline-none text-sm font-mono" />
                  <p className="text-[10px] text-neutral-400 mt-1">With stems</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Master audio file</label>
                  <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:text-xs file:font-bold" />
                  <input value={form.audioUrl} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                    placeholder="or external URL (R2 / S3 / CDN)" className="w-full mt-2 px-4 py-2 rounded-lg border border-neutral-200 focus:border-red-500 outline-none text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Stems archive (zip/wav)</label>
                  <input type="file" accept="audio/*,.zip" onChange={(e) => setStemsFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:text-white file:text-xs file:font-bold" />
                  <input value={form.stemsUrl} onChange={(e) => setForm({ ...form, stemsUrl: e.target.value })}
                    placeholder="or external URL" className="w-full mt-2 px-4 py-2 rounded-lg border border-neutral-200 focus:border-red-500 outline-none text-xs font-mono" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60">
                  {isSaving ? (<><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>) : (<>{editingId ? 'Save changes' : 'Add beat'}</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;