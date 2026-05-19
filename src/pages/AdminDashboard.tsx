import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, LogOut, Music, DollarSign, Users, TrendingUp, 
  Plus, Trash2, Edit, Check, X, Clock, BarChart3, Package, 
  Home, RefreshCw, ChevronRight, Upload, AlertCircle, FileAudio
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Beat, Sale } from '../lib/supabase';
import { PREMIUM_SAMPLE_BEATS, COVER_GRADIENTS } from '../utils/beatHelpers';

type Tab = 'overview' | 'beats' | 'sales';

export const AdminDashboard = () => {
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [beats, setBeats] = useState<Beat[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Status messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Trap' as Beat['genre'],
    bpm: 120,
    key_signature: 'C Minor',
    price: 100,
    description: '',
    duration: '3:00',
    cover_gradient: 'from-orange-500 to-red-600',
    audio_url: '',
    stems_url: '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [stemsFile, setStemsFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      // Add a slight buffer to allow onAuthStateChange to fully settle in React 19
      const timer = setTimeout(() => {
        if (!user || !isAdmin) {
          navigate('/admin/login', { replace: true });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch data from Supabase
  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Fetch beats
      const { data: beatsData, error: beatsErr } = await supabase
        .from('beats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (beatsErr) {
        setErrorMsg(`Supabase Beats Error: ${beatsErr.message}`);
        setBeats(PREMIUM_SAMPLE_BEATS); // fallback
      } else if (beatsData) {
        setBeats(beatsData);
      }

      // Fetch sales
      const { data: salesData, error: salesErr } = await supabase
        .from('sales')
        .select('*')
        .order('purchased_at', { ascending: false });
      
      if (salesErr) {
        console.error('Sales fetch error:', salesErr);
      } else if (salesData) {
        setSales(salesData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setErrorMsg('Failed to connect to Supabase. Showing sample fallback data.');
      setBeats(PREMIUM_SAMPLE_BEATS);
    }
    setIsLoading(false);
  };

  // Seed sample beats into Supabase if empty
  const handleSeedSampleBeats = async () => {
    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setUploadProgress('Seeding 9 premium sample beats to Supabase...');

    try {
      let successCount = 0;
      for (const beat of PREMIUM_SAMPLE_BEATS) {
        const { error } = await supabase.from('beats').insert({
          title: beat.title,
          artist: beat.artist,
          genre: beat.genre,
          bpm: beat.bpm,
          key_signature: beat.key_signature,
          price: beat.price,
          description: beat.description,
          duration: beat.duration,
          cover_gradient: beat.cover_gradient,
          audio_url: beat.audio_url,
          stems_url: beat.stems_url,
          is_sold: false,
        });

        if (!error) successCount++;
      }

      setSuccessMsg(`Successfully seeded ${successCount} sample beats into Supabase!`);
      await fetchData();
    } catch (err) {
      setErrorMsg(`Seeding failed: ${(err as Error).message}`);
    }

    setIsUploading(false);
    setUploadProgress('');
  };

  // Upload helper for Supabase Storage buckets
  const uploadFileToBucket = async (file: File, bucket: 'beats-audio' | 'beats-stems') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      throw new Error(`Bucket '${bucket}' upload error: ${error.message}. (Ensure bucket is public and RLS allows uploads)`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  // Handlers
  const handleAddBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setUploadProgress('Uploading files & saving beat...');

    let finalAudioUrl = formData.audio_url;
    let finalStemsUrl = formData.stems_url;

    try {
      // 1. Upload Audio File if present
      if (audioFile) {
        setUploadProgress('Uploading master audio file to Supabase Storage...');
        try {
          finalAudioUrl = await uploadFileToBucket(audioFile, 'beats-audio');
        } catch (uploadErr) {
          setErrorMsg((uploadErr as Error).message);
          // Keep whatever manual URL was provided or empty
        }
      }

      // 2. Upload Stems File if present
      if (stemsFile) {
        setUploadProgress('Uploading stems archive to Supabase Storage...');
        try {
          finalStemsUrl = await uploadFileToBucket(stemsFile, 'beats-stems');
        } catch (uploadErr) {
          setErrorMsg((uploadErr as Error).message);
        }
      }

      setUploadProgress('Inserting beat record into database...');
      
      const { data: newBeat, error: insertErr } = await supabase
        .from('beats')
        .insert({
          title: formData.title,
          artist: 'AudioForge',
          genre: formData.genre,
          bpm: formData.bpm,
          key_signature: formData.key_signature,
          price: formData.price,
          description: formData.description,
          duration: formData.duration || '3:00',
          cover_gradient: formData.cover_gradient,
          audio_url: finalAudioUrl || null,
          stems_url: finalStemsUrl || null,
          is_sold: false,
        })
        .select()
        .single();

      if (insertErr) {
        throw new Error(`Supabase Database Insert Error: ${insertErr.message}`);
      }

      if (newBeat) {
        setBeats(prev => [newBeat, ...prev]);
        setSuccessMsg(`Beat "${newBeat.title}" successfully added to Supabase live catalog!`);
      }

      // Reset form
      setFormData({ 
        title: '', genre: 'Trap', bpm: 120, key_signature: 'C Minor', price: 100, 
        description: '', duration: '3:00', cover_gradient: 'from-orange-500 to-red-600', 
        audio_url: '', stems_url: '' 
      });
      setAudioFile(null);
      setStemsFile(null);
      setShowAddModal(false);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }

    setIsUploading(false);
    setUploadProgress('');
  };

  const handleEditBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBeat) return;

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setUploadProgress('Updating files & saving beat...');

    let finalAudioUrl = formData.audio_url;
    let finalStemsUrl = formData.stems_url;

    try {
      if (audioFile) {
        setUploadProgress('Uploading new audio file...');
        try { finalAudioUrl = await uploadFileToBucket(audioFile, 'beats-audio'); } 
        catch (err) { setErrorMsg((err as Error).message); }
      }
      if (stemsFile) {
        setUploadProgress('Uploading new stems file...');
        try { finalStemsUrl = await uploadFileToBucket(stemsFile, 'beats-stems'); } 
        catch (err) { setErrorMsg((err as Error).message); }
      }

      setUploadProgress('Updating database record...');

      const { data: updatedBeat, error: updateErr } = await supabase
        .from('beats')
        .update({
          title: formData.title,
          genre: formData.genre,
          bpm: formData.bpm,
          key_signature: formData.key_signature,
          price: formData.price,
          description: formData.description,
          duration: formData.duration,
          cover_gradient: formData.cover_gradient,
          audio_url: finalAudioUrl || null,
          stems_url: finalStemsUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingBeat.id)
        .select()
        .single();

      if (updateErr) {
        throw new Error(`Supabase Update Error: ${updateErr.message}`);
      }

      if (updatedBeat) {
        setBeats(prev => prev.map(b => b.id === editingBeat.id ? updatedBeat : b));
        setSuccessMsg(`Beat "${updatedBeat.title}" successfully updated in Supabase!`);
      }

      setEditingBeat(null);
      setFormData({ 
        title: '', genre: 'Trap', bpm: 120, key_signature: 'C Minor', price: 100, 
        description: '', duration: '3:00', cover_gradient: 'from-orange-500 to-red-600', 
        audio_url: '', stems_url: '' 
      });
      setAudioFile(null);
      setStemsFile(null);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }

    setIsUploading(false);
    setUploadProgress('');
  };

  const handleDeleteBeat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this beat from Supabase?')) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.from('beats').delete().eq('id', id);
      if (error) throw new Error(`Delete failed: ${error.message}`);

      setBeats(prev => prev.filter(b => b.id !== id));
      setSuccessMsg('Beat successfully deleted from Supabase.');
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  const startEditing = (beat: Beat) => {
    setEditingBeat(beat);
    setFormData({
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm,
      key_signature: beat.key_signature,
      price: beat.price,
      description: beat.description || '',
      duration: beat.duration || '3:00',
      cover_gradient: beat.cover_gradient || 'from-orange-500 to-red-600',
      audio_url: beat.audio_url || '',
      stems_url: beat.stems_url || '',
    });
    setAudioFile(null);
    setStemsFile(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Stats
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.price), 0);
  const availableBeats = beats.filter(b => !b.is_sold).length;
  const totalBuyers = new Set(sales.map(s => s.buyer_email)).size;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-neutral-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0F0F13] border-r border-neutral-800 p-6 z-40 hidden lg:block">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
     
          <div>
            <span className="font-black text-lg text-white">WISHAM</span>
            <span className="block text-[10px] text-orange-400 uppercase tracking-wider">Admin Portal</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-orange-500/10 text-orange-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('beats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'beats' ? 'bg-orange-500/10 text-orange-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Music className="w-5 h-5" />
            Manage Beats
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'sales' ? 'bg-orange-500/10 text-orange-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Sales History
          </button>
        </nav>

        {/* User info */}
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <p className="text-xs text-neutral-500 mb-1">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{profile?.email || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-red-500/10 border border-neutral-800 hover:border-red-500/20 text-neutral-400 hover:text-red-400 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-black">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-black text-white">ADMIN</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile Nav */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-orange-500 text-black' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('beats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'beats' ? 'bg-orange-500 text-black' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Beats
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'sales' ? 'bg-orange-500 text-black' : 'bg-neutral-900 text-neutral-400'
            }`}
          >
            Sales
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'beats' && 'Manage Beats'}
              {activeTab === 'sales' && 'Sales History'}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Welcome back, {profile?.full_name || 'Admin'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Refresh data from Supabase"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
            </button>
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              View Live Site
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Supabase Operation Notice</span>
              <p className="text-xs leading-relaxed">{errorMsg}</p>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-white text-sm ml-auto">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 text-green-200">
            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Success</span>
              <p className="text-xs leading-relaxed">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-green-400 hover:text-white text-sm ml-auto">✕</button>
          </div>
        )}

        {/* Database Empty Seed Prompt */}
        {beats.length === 0 && !isLoading && (
          <div className="p-12 text-center bg-neutral-900/40 rounded-3xl border border-neutral-800 space-y-4">
            <Music className="w-12 h-12 text-neutral-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-white">You currently haven't uploaded any beat, Ajay.</h4>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
               <code className="text-orange-400">beats</code> table is currently empty. You can add a new beat manually, or instantly populate your database with our 9 premium studio tracks.
              </p>
            </div>
            <button
              onClick={handleSeedSampleBeats}
              disabled={isUploading}
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-black font-extrabold text-sm rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isUploading ? uploadProgress || 'Seeding...' : '⚡ Seed 9 Premium Sample Beats to Supabase'}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800" />
                  <div className="h-8 bg-neutral-800 rounded w-1/2" />
                  <div className="h-3 bg-neutral-800/60 rounded w-3/4" />
                </div>
              ))}
            </div>
            <div className="h-40 rounded-2xl bg-neutral-900/40 border border-neutral-800 p-6 space-y-4">
              <div className="h-6 bg-neutral-800 rounded w-1/4" />
              <div className="space-y-2">
                <div className="h-4 bg-neutral-800/60 rounded w-full" />
                <div className="h-4 bg-neutral-800/60 rounded w-5/6" />
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !isLoading && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-950/30 to-neutral-900 border border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-2xl lg:text-3xl font-black text-white block">${totalRevenue}</span>
                <span className="text-xs text-neutral-400 uppercase tracking-wider">Total Earned</span>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-950/30 to-neutral-900 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Music className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-2xl lg:text-3xl font-black text-white block">{availableBeats}</span>
                <span className="text-xs text-neutral-400 uppercase tracking-wider">Beats For Sale</span>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 to-neutral-900 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-2xl lg:text-3xl font-black text-white block">{totalBuyers}</span>
                <span className="text-xs text-neutral-400 uppercase tracking-wider">Total Buyers</span>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/30 to-neutral-900 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <span className="text-2xl lg:text-3xl font-black text-white block">{sales.length}</span>
                <span className="text-xs text-neutral-400 uppercase tracking-wider">Total Sales</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setActiveTab('beats'); setShowAddModal(true); }}
                className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-neutral-900 border border-orange-500/20 hover:border-orange-500/40 transition-colors text-left group"
              >
                <Plus className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-1">Add New Beat</h3>
                <p className="text-sm text-neutral-400">Upload audio files, stems, and set pricing</p>
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-neutral-900 border border-purple-500/20 hover:border-purple-500/40 transition-colors text-left group"
              >
                <BarChart3 className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-1">View Sales Report</h3>
                <p className="text-sm text-neutral-400">See all customer purchases and download logs</p>
              </button>
            </div>

            {/* Recent Sales */}
            <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Recent Sales
                </h3>
                <button
                  onClick={() => setActiveTab('sales')}
                  className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {sales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-neutral-900/80 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{sale.beat_title}</h4>
                        <p className="text-xs text-neutral-400 font-mono">{sale.buyer_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-bold font-mono">${sale.price}</span>
                      <p className="text-xs text-neutral-500">{formatDate(sale.purchased_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Beats Tab */}
        {activeTab === 'beats' && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-neutral-400 font-mono text-sm">{beats.length} total beats managed</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-4 h-4" />
                Add New Beat
              </button>
            </div>

            <div className="space-y-3">
              {beats.map((beat) => (
                <div
                  key={beat.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    beat.is_sold 
                      ? 'bg-neutral-950/50 border-neutral-900 opacity-60' 
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Visual Cover preview */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${beat.cover_gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md`}>
                    🎵
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-base ${beat.is_sold ? 'line-through text-neutral-500' : 'text-white'}`}>
                        {beat.title}
                      </h4>
                      {beat.is_sold && (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono">SOLD & PURGED</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
                      <span className="px-2 py-0.5 bg-neutral-800 text-orange-400 rounded border border-neutral-700">{beat.genre}</span>
                      <span>{beat.bpm} BPM</span>
                      <span>Key: {beat.key_signature}</span>
                      <span>{beat.duration}</span>
                      {beat.audio_url && <span className="text-green-400 flex items-center gap-1">✓ Audio Attached</span>}
                      {beat.stems_url && <span className="text-blue-400 flex items-center gap-1">✓ Stems Attached</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <span className="text-xl font-black text-white font-mono">${beat.price}</span>

                  {/* Actions */}
                  {!beat.is_sold && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(beat)}
                        className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-blue-500/20 text-neutral-300 hover:text-blue-400 flex items-center justify-center transition-all border border-neutral-700"
                        title="Edit beat properties & files"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBeat(beat.id)}
                        className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 flex items-center justify-center transition-all border border-neutral-700"
                        title="Delete beat from Supabase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && !isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-300">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-bold block text-green-400">Total Marketplace Earnings</span>
                <span className="text-3xl font-black text-white font-mono">${totalRevenue}</span>
              </div>
              <Package className="w-10 h-10 text-green-400 opacity-80" />
            </div>

            <div className="rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden overflow-x-auto">
              <div className="grid grid-cols-5 gap-4 p-4 bg-neutral-800/50 text-xs font-bold text-neutral-400 uppercase tracking-wider min-w-[600px]">
                <span>Beat Title</span>
                <span>Buyer Email</span>
                <span>Price</span>
                <span>Date</span>
                <span>Time</span>
              </div>

              <div className="divide-y divide-neutral-800">
                {sales.map((sale) => (
                  <div key={sale.id} className="grid grid-cols-5 gap-4 p-4 text-sm hover:bg-neutral-800/30 transition-colors min-w-[600px]">
                    <span className="text-white font-bold truncate">{sale.beat_title}</span>
                    <span className="text-orange-400 font-mono text-xs truncate">{sale.buyer_email}</span>
                    <span className="text-green-400 font-bold font-mono">${sale.price}</span>
                    <span className="text-neutral-300">{formatDate(sale.purchased_at)}</span>
                    <span className="text-neutral-400 font-mono">{formatTime(sale.purchased_at)}</span>
                  </div>
                ))}
              </div>

              {sales.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <Package className="w-12 h-12 text-neutral-600 mx-auto" />
                  <h4 className="text-lg font-bold text-neutral-300">No Sales Logged Yet</h4>
                  <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    When customers purchase beats, their verified email, timestamps, and payment amounts will populate here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ADD BEAT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#131318] border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                  <Upload className="w-6 h-6 text-orange-500" /> Add New Beat Listing
                </h3>
                <p className="text-xs text-neutral-400">Upload master audio files, stems archive, and configure marketplace properties.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddBeat} className="space-y-6">
              {/* File Upload Section */}
              <div className="p-5 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-orange-400" /> Master Audio & Stems Upload
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Master Audio File (MP3 / WAV)</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-black hover:file:bg-orange-400 cursor-pointer"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">Uploaded to Supabase <code className="text-orange-400">beats-audio</code> bucket.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Stems Archive (ZIP / RAR)</label>
                    <input
                      type="file"
                      accept=".zip,.rar,.7z"
                      onChange={(e) => setStemsFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-black hover:file:bg-blue-400 cursor-pointer"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">Uploaded to Supabase <code className="text-blue-400">beats-stems</code> bucket.</p>
                  </div>
                </div>

                {/* Direct URL Fallbacks */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-3">
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Or Paste Direct File URLs (Fallback / External Host):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      value={formData.audio_url}
                      onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
                      placeholder="https://external-host.com/master.wav"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <input
                      type="url"
                      value={formData.stems_url}
                      onChange={(e) => setFormData({...formData, stems_url: e.target.value})}
                      placeholder="https://external-host.com/stems.zip"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Beat Properties */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Beat Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Night Rider"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Genre</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value as Beat['genre']})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    >
                      <option value="Trap">Trap</option>
                      <option value="Drill">Drill</option>
                      <option value="Boom Bap">Boom Bap</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="R&B">R&B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">BPM</label>
                    <input
                      type="number"
                      required
                      min="60"
                      max="200"
                      value={formData.bpm}
                      onChange={(e) => setFormData({...formData, bpm: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Key Signature</label>
                    <input
                      type="text"
                      required
                      value={formData.key_signature}
                      onChange={(e) => setFormData({...formData, key_signature: e.target.value})}
                      placeholder="C# Minor"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Duration</label>
                    <input
                      type="text"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="3:15"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Cover Visual Style</label>
                    <select
                      value={formData.cover_gradient}
                      onChange={(e) => setFormData({...formData, cover_gradient: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                    >
                      {COVER_GRADIENTS.map((cg, i) => (
                        <option key={i} value={cg.value}>{cg.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Preview Box</label>
                    <div className={`w-full h-11 rounded-xl bg-gradient-to-r ${formData.cover_gradient} flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                      Visual Card Gradient Preview
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Beat Description & Vibe</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the mood, instruments used, or perfect artist fit..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 text-sm resize-none"
                  />
                </div>
              </div>

              {isUploading && uploadProgress && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 text-orange-300 text-xs font-mono animate-pulse">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" /> Save Beat to Supabase Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BEAT MODAL */}
      {editingBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#131318] border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-500" /> Edit Beat: {editingBeat.title}
                </h3>
                <p className="text-xs text-neutral-400">Update audio files, stems archive, or pricing properties.</p>
              </div>
              <button onClick={() => setEditingBeat(null)} className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditBeat} className="space-y-6">
              {/* File Upload Section */}
              <div className="p-5 bg-neutral-900/60 rounded-2xl border border-neutral-800 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-blue-400" /> Replace Master Audio & Stems
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Replace Audio File (MP3 / WAV)</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500 file:text-black hover:file:bg-orange-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Replace Stems (ZIP / RAR)</label>
                    <input
                      type="file"
                      accept=".zip,.rar,.7z"
                      onChange={(e) => setStemsFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-black hover:file:bg-blue-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 space-y-3">
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase tracking-wider">Or Update Direct File URLs:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      value={formData.audio_url}
                      onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
                      placeholder="https://external-host.com/master.wav"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 font-mono"
                    />
                    <input
                      type="url"
                      value={formData.stems_url}
                      onChange={(e) => setFormData({...formData, stems_url: e.target.value})}
                      placeholder="https://external-host.com/stems.zip"
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Beat Properties */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Beat Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Genre</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({...formData, genre: e.target.value as Beat['genre']})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    >
                      <option value="Trap">Trap</option>
                      <option value="Drill">Drill</option>
                      <option value="Boom Bap">Boom Bap</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="R&B">R&B</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">BPM</label>
                    <input
                      type="number"
                      required
                      min="60"
                      max="200"
                      value={formData.bpm}
                      onChange={(e) => setFormData({...formData, bpm: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Key Signature</label>
                    <input
                      type="text"
                      required
                      value={formData.key_signature}
                      onChange={(e) => setFormData({...formData, key_signature: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Duration</label>
                    <input
                      type="text"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Cover Visual Style</label>
                    <select
                      value={formData.cover_gradient}
                      onChange={(e) => setFormData({...formData, cover_gradient: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                    >
                      {COVER_GRADIENTS.map((cg, i) => (
                        <option key={i} value={cg.value}>{cg.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Beat Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm resize-none"
                  />
                </div>
              </div>

              {isUploading && uploadProgress && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 text-blue-300 text-xs font-mono animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingBeat(null)}
                  className="flex-1 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Save Changes
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
