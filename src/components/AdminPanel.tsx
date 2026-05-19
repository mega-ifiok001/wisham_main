import React, { useState } from 'react';
import { 
  Upload, Trash2, Edit, DollarSign, Music, Users, 
  Plus, X, Check, BarChart3, Clock, TrendingUp, Package
} from 'lucide-react';
import { AdminBeat, BeatSale } from '../data/adminStore';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  beats: AdminBeat[];
  sales: BeatSale[];
  onAddBeat: (beat: Omit<AdminBeat, 'id' | 'dateAdded' | 'isSold'>) => void;
  onDeleteBeat: (id: string) => void;
  onEditBeat: (id: string, updates: Partial<AdminBeat>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, onClose, beats, sales, onAddBeat, onDeleteBeat, onEditBeat 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'beats' | 'sales'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBeat, setEditingBeat] = useState<AdminBeat | null>(null);
  
  // Form state for adding/editing beats
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Trap',
    bpm: 120,
    price: 100
  });

  if (!isOpen) return null;

  // Calculate stats
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.price, 0);
  const totalBeats = beats.length;
  const soldBeats = beats.filter(b => b.isSold).length;
  const availableBeats = totalBeats - soldBeats;
  const totalBuyers = new Set(sales.map(s => s.buyerEmail)).size;

  const handleAddBeat = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBeat(formData);
    setFormData({ title: '', genre: 'Trap', bpm: 120, price: 100 });
    setShowAddModal(false);
  };

  const handleEditBeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBeat) {
      onEditBeat(editingBeat.id, formData);
      setEditingBeat(null);
      setFormData({ title: '', genre: 'Trap', bpm: 120, price: 100 });
    }
  };

  const startEditing = (beat: AdminBeat) => {
    setEditingBeat(beat);
    setFormData({
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm,
      price: beat.price
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="relative w-full max-w-6xl bg-[#0F0F13] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
        
        <div className="p-6 md:p-8 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">
              <Package className="w-4 h-4" /> Admin Control Panel
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">AudioForge Admin Dashboard</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 md:px-8 py-4 border-b border-neutral-800 bg-neutral-900/50 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'bg-white text-black' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('beats')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'beats' 
                ? 'bg-white text-black' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <span className="flex items-center gap-2"><Music className="w-4 h-4" /> Manage Beats</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'sales' 
                ? 'bg-white text-black' 
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Sales History</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto grow">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 bg-gradient-to-br from-green-900/30 to-neutral-900 rounded-2xl border border-green-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white block">${totalRevenue}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Total Earned</span>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-900/30 to-neutral-900 rounded-2xl border border-orange-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Music className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white block">{availableBeats}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Beats For Sale</span>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-900/30 to-neutral-900 rounded-2xl border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white block">{totalBuyers}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Total Buyers</span>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-900/30 to-neutral-900 rounded-2xl border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white block">{sales.length}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Total Sales</span>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" /> Recent Sales
                </h3>
                <div className="space-y-3">
                  {sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-neutral-900/80 rounded-xl border border-neutral-800">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{sale.beatTitle}</h4>
                          <p className="text-xs text-neutral-400">{sale.buyerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-bold font-mono">${sale.price}</span>
                        <p className="text-xs text-neutral-500">{sale.date} at {sale.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Beats Management Tab */}
          {activeTab === 'beats' && (
            <div className="space-y-6">
              {/* Add Beat Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Your Beats ({beats.length})</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> Add New Beat
                </button>
              </div>

              {/* Beats List */}
              <div className="space-y-3">
                {beats.map((beat) => (
                  <div 
                    key={beat.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      beat.isSold 
                        ? 'bg-neutral-950/50 border-neutral-900 opacity-60' 
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                        beat.isSold ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {beat.isSold ? 'SOLD' : 'LIVE'}
                      </div>
                      <div>
                        <h4 className={`font-bold ${beat.isSold ? 'line-through text-neutral-500' : 'text-white'}`}>
                          {beat.title}
                        </h4>
                        <p className="text-xs text-neutral-400">{beat.genre} • {beat.bpm} BPM • Added: {beat.dateAdded}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-white font-mono">${beat.price}</span>
                      
                      {!beat.isSold && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEditing(beat)}
                            className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-blue-500/20 text-neutral-400 hover:text-blue-400 flex items-center justify-center transition-all"
                            title="Edit beat"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteBeat(beat.id)}
                            className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all"
                            title="Delete beat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {beats.length === 0 && (
                  <div className="p-12 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800">
                    <Music className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-neutral-300">No Beats Yet</h4>
                    <p className="text-sm text-neutral-500 mt-2">Click "Add New Beat" to upload your first beat for sale.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sales History Tab */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">All Sales ({sales.length})</h3>
                <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold font-mono">
                  Total: ${totalRevenue}
                </div>
              </div>

              {/* Sales Table */}
              <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800 overflow-hidden overflow-x-auto">
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
                      <span className="text-white font-medium truncate">{sale.beatTitle}</span>
                      <span className="text-orange-400 font-mono text-xs truncate">{sale.buyerEmail}</span>
                      <span className="text-green-400 font-bold font-mono">${sale.price}</span>
                      <span className="text-neutral-300">{sale.date}</span>
                      <span className="text-neutral-400">{sale.time}</span>
                    </div>
                  ))}
                </div>

                {sales.length === 0 && (
                  <div className="p-12 text-center">
                    <TrendingUp className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-neutral-300">No Sales Yet</h4>
                    <p className="text-sm text-neutral-500 mt-2">When someone buys a beat, it will show up here with their email and purchase details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/50">
          <span className="text-xs font-mono text-neutral-500">Admin Access Level: Full Control</span>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Close Admin Panel
          </button>
        </div>

        {/* Add Beat Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <div className="w-full max-w-md bg-[#131318] border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add New Beat</h3>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddBeat} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Beat Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Night Rider"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                  >
                    <option value="Trap">Trap</option>
                    <option value="Drill">Drill</option>
                    <option value="Boom Bap">Boom Bap</option>
                    <option value="Synthwave">Synthwave</option>
                    <option value="R&B">R&B</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">BPM</label>
                    <input
                      type="number"
                      required
                      min="60"
                      max="200"
                      value={formData.bpm}
                      onChange={(e) => setFormData({...formData, bpm: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Upload className="w-4 h-4" /> Upload Beat For Sale
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Beat Modal */}
        {editingBeat && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
            <div className="w-full max-w-md bg-[#131318] border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Edit Beat</h3>
                <button onClick={() => setEditingBeat(null)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditBeat} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Beat Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                  >
                    <option value="Trap">Trap</option>
                    <option value="Drill">Drill</option>
                    <option value="Boom Bap">Boom Bap</option>
                    <option value="Synthwave">Synthwave</option>
                    <option value="R&B">R&B</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">BPM</label>
                    <input
                      type="number"
                      required
                      min="60"
                      max="200"
                      value={formData.bpm}
                      onChange={(e) => setFormData({...formData, bpm: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingBeat(null)}
                    className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
