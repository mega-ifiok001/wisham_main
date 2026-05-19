import React from 'react';
import { Shield, Disc, Download, ExternalLink, Sparkles, FolderArchive, Key } from 'lucide-react';
import { Track } from '../data/beats';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  purgedTracks: Track[];
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ isOpen, onClose, purgedTracks }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0F0F13] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-200 max-h-[90vh] flex flex-col">
        
        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-purple-500 to-amber-500" />

        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
              <Sparkles className="w-4 h-4" /> Your Account
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">My Purchased Beats</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 grow">

          {/* Purchased Tracks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg text-white">
                <Shield className="w-5 h-5 text-orange-400" /> Your Beats ({purgedTracks.length})
              </div>
              <span className="text-xs text-neutral-400">100% Yours Forever</span>
            </div>

            {purgedTracks.length === 0 ? (
              <div className="p-12 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3">
                <FolderArchive className="w-12 h-12 text-neutral-600 mx-auto" />
                <h4 className="text-lg font-semibold text-neutral-300">You haven't bought any beats yet</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Browse the beats and buy one you like. After you pay, it will show up here and be removed from the site forever.
                </p>
                <button 
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:opacity-95"
                >
                  Browse Beats
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purgedTracks.map((track) => (
                  <div key={track.id} className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.coverGradient} flex items-center justify-center text-black font-black text-sm shrink-0 shadow-lg`}>
                        {track.type === 'package' ? 'PKG' : 'WAV'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-base">{track.title}</h5>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">YOURS</span>
                        </div>
                        <p className="text-xs text-neutral-400">{track.type === 'package' ? 'Beat Package' : `${track.genre} • ${track.bpm} BPM`}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
                      <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-orange-400" /> Full Rights</span>
                      <a 
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(`AUDIOFORGE BEAT RECEIPT\n\nBeat: ${track.title}\nStems: ${track.stemsCount} files\nStatus: PURCHASED & REMOVED FROM SITE`)}`}
                        download={`${track.title}_Receipt.txt`}
                        className="flex items-center gap-1 text-white hover:text-orange-400 bg-neutral-800/80 hover:bg-neutral-800 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download ({track.stemsCount} files)
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academy Section */}
          <div className="space-y-4 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <Disc className="w-5 h-5 text-purple-400" /> Music Production Classes
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-r from-purple-950/20 to-neutral-900 border border-purple-500/20 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-purple-400 font-mono uppercase tracking-widest block">Course</span>
                  <h5 className="text-white font-bold text-base">Beginner's Class</h5>
                  <p className="text-xs text-neutral-400">Learn the basics of Cubase & FL Studio</p>
                </div>
                <button className="px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5">
                  Start Learning <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 bg-gradient-to-r from-orange-950/20 to-neutral-900 border border-orange-500/20 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-orange-400 font-mono uppercase tracking-widest block">Course</span>
                  <h5 className="text-white font-bold text-base">Arrangements</h5>
                  <p className="text-xs text-neutral-400">Learn song structure & beat arrangements</p>
                </div>
                <button className="px-4 py-2 bg-orange-500/20 text-orange-300 hover:bg-orange-500 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5">
                  Start Learning <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/50">
          <span className="text-xs font-mono text-neutral-500">AudioForge Account</span>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
