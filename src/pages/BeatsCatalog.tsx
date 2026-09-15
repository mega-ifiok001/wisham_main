import { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, Music, Loader2, Clock } from 'lucide-react';
import { Beat, api } from '../lib/api';
import { audioSynth } from '../utils/audioSynth';
import { CheckoutModal } from '../components/CheckoutModal';

const GENRES = ['All', 'Trap', 'Drill', 'Boom Bap', 'Synthwave', 'R&B'];

function patternFor(genre: string): 'trap' | 'drill' | 'boombap' | 'synthwave' {
  const g = genre.toLowerCase();
  if (g.includes('drill')) return 'drill';
  if (g.includes('boom') || g.includes('r&b') || g.includes('soul')) return 'boombap';
  if (g.includes('synth')) return 'synthwave';
  return 'trap';
}

export const BeatsCatalog = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeStr, setTimeStr] = useState('0:00');
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    api
      .getBeats()
      .then((res) => setBeats(res.beats))
      .catch((err) => setError((err as Error).message || 'Could not load beats'))
      .finally(() => setIsLoading(false));
  }, []);

  const stopAll = () => {
    audioSynth.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setProgress(0);
    setTimeStr('0:00');
  };

  const handleTogglePlay = (beat: Beat) => {
    if (playingId === beat.id) {
      stopAll();
      return;
    }
    stopAll();

    // Real preview file if published, otherwise fall back to the synth preview
    if (beat.audioUrl) {
      const audio = new Audio(beat.audioUrl);
      audioRef.current = audio;
      setPlayingId(beat.id);
      audio.play().catch(() => {
        audioSynth.play(beat.bpm, patternFor(beat.genre), 130.81, (p, t) => { setProgress(p); setTimeStr(t); });
      });
      audio.addEventListener('ended', stopAll);
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          const m = Math.floor(audio.currentTime / 60);
          const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
          setTimeStr(`${m}:${s}`);
        }
      });
      return;
    }

    audioSynth.play(beat.bpm, patternFor(beat.genre), 130.81, (p, t) => { setProgress(p); setTimeStr(t); });
    setPlayingId(beat.id);
  };

  const filtered = beats.filter((b) => {
    const q = search.toLowerCase();
    const matchesQ = !q || b.title.toLowerCase().includes(q) || b.genre.toLowerCase().includes(q) || b.keySignature.toLowerCase().includes(q);
    const matchesG = genre === 'All' || b.genre === genre;
    return matchesQ && matchesG;
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200 bg-white/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 font-black text-2xl tracking-tight text-neutral-900">
            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white"><Music className="w-5 h-5" /></span>
            WISHAM
          </a>
          <a href="/" className="text-sm font-semibold text-neutral-500 hover:text-red-600 transition-colors">← Home</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">The Beat Store</h1>
            <p className="text-neutral-500 mt-1 text-sm">Every beat · $30 lease / $40 lease + stems / $60 exclusive.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search beats, keys…"
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors ${genre === g ? 'bg-red-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-4 text-neutral-400">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-sm font-semibold">Loading beats…</span>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="font-bold text-red-600">{error}</p>
            <p className="text-sm text-neutral-400 mt-2">Make sure the WISHAM server is running (server/src/index.js).</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-neutral-400">
            <p className="font-bold text-neutral-600">No beats found.</p>
            <p className="text-sm mt-1">Try a different search or check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((beat) => (
              <div key={beat.id} className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all">
                {/* Cover / preview */}
                <div className={`relative h-36 bg-gradient-to-br ${beat.coverGradient}`}>
                  <button
                    onClick={() => handleTogglePlay(beat)}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors"
                    aria-label={`Preview ${beat.title}`}
                  >
                    <span className="w-12 h-12 rounded-full bg-white/95 text-neutral-900 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                      {playingId === beat.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                    </span>
                  </button>
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-black/50 text-white px-2 py-1 rounded-full backdrop-blur">
                    {beat.genre}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-extrabold text-base truncate">{beat.title}</h3>
                  <p className="text-xs text-neutral-400 mb-3">{beat.artist}</p>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 mb-4">
                    <span className="font-bold text-red-600">{beat.bpm} BPM</span>
                    <span>·</span>
                    <span>{beat.keySignature}</span>
                    <span className="ml-auto flex items-center gap-1"><Clock className="w-3 h-3" /> {beat.duration}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <div className="font-black text-neutral-900">${beat.exclusivePrice} <span className="text-neutral-400 font-semibold">excl.</span></div>
                      <div className="text-neutral-500 font-semibold">${beat.inclusivePrice} lease</div>
                    </div>
                    <button
                      onClick={() => { setCheckoutBeat(beat); setIsCheckoutOpen(true); }}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors"
                    >
                      Buy now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky preview player */}
      {playingId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-3 z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button onClick={stopAll} className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Pause className="w-4 h-4 fill-current" />
            </button>
            <div className="flex-1">
              <div className="text-sm font-bold">{beats.find((b) => b.id === playingId)?.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-neutral-400">{timeStr}</span>
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider hidden sm:block">Preview</span>
          </div>
        </div>
      )}

      <CheckoutModal beat={checkoutBeat} isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
};

export default BeatsCatalog;