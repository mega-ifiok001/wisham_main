import { useState, useEffect } from 'react';
import { 
  Search, Play, Pause, Clock, Filter, Zap, 
  ShoppingCart, Grid, List
} from 'lucide-react';
import { supabase, Beat } from '../lib/supabase';
import { audioSynth } from '../utils/audioSynth';
import { CheckoutModal } from '../components/CheckoutModal';
import { Track } from '../data/beats';
import { Link } from 'react-router-dom';

type GenreFilter = 'all' | 'Trap' | 'Drill' | 'Boom Bap' | 'Synthwave' | 'R&B';
type ViewMode = 'grid' | 'list';

export const BeatsCatalog = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'bpm'>('newest');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackTimeStr, setPlaybackTimeStr] = useState('0:00');
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutBeat, setCheckoutBeat] = useState<Beat | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Convert Beat to Track for checkout modal
  const beatToTrack = (beat: Beat): Track => ({
    id: beat.id,
    title: beat.title,
    artist: beat.artist,
    type: 'single',
    genre: beat.genre === 'R&B' ? 'R&B / Soul' : beat.genre,
    bpm: beat.bpm,
    key: beat.key_signature,
    price: beat.price,
    description: beat.description || '',
    includes: ['24-Bit Master WAV', 'Full Trackout Stems', 'Exclusive Ownership Rights'],
    duration: beat.duration,
    stemsCount: 18,
    isSold: beat.is_sold,
    coverGradient: beat.cover_gradient,
    tags: [beat.genre, `${beat.bpm} BPM`],
    synthConfig: { tempo: beat.bpm, pattern: 'trap', rootFreq: 130.81 }
  });

  // Fetch beats from Supabase
  useEffect(() => {
    fetchBeats();
  }, []);

  const fetchBeats = async () => {
    try {
      const { data, error } = await supabase
        .from('beats')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Using sample beats (Supabase not connected)');
        setIsLoading(false);
        return;
      }

      if (data) {
        setBeats(data);
      }
    } catch (error) {
      console.log('Using sample beats');
    }
    setIsLoading(false);
  };

  // Filter and sort beats
  const filteredBeats = beats
    .filter(beat => {
      const matchesSearch = 
        beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        beat.key_signature.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = genreFilter === 'all' || beat.genre === genreFilter;
      
      return matchesSearch && matchesGenre && !beat.is_sold;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'bpm':
          return a.bpm - b.bpm;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Handle play/pause
  const handleTogglePlay = (beat: Beat) => {
    if (beat.is_sold) return;

    if (playingTrackId === beat.id) {
      audioSynth.stop();
      setPlayingTrackId(null);
    } else {
      setPlayingTrackId(beat.id);
      setPlaybackProgress(0);
      setPlaybackTimeStr('0:00');
      
      // Use beat properties for synth
      const patternMap: Record<string, 'trap' | 'synthwave' | 'boombap' | 'drill'> = {
        'Trap': 'trap',
        'Synthwave': 'synthwave',
        'Boom Bap': 'boombap',
        'Drill': 'drill',
        'R&B': 'trap'
      };
      
      audioSynth.play(beat.bpm, patternMap[beat.genre] || 'trap', 130.81, (prog, timeStr) => {
        setPlaybackProgress(prog);
        setPlaybackTimeStr(timeStr);
      });
    }
  };

  // Handle purchase
  const handlePurchaseSuccess = (beatId: string) => {
    setBeats(prev => prev.filter(b => b.id !== beatId));
    if (playingTrackId === beatId) {
      audioSynth.stop();
      setPlayingTrackId(null);
    }
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => audioSynth.stop();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-neutral-100">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-xl font-black text-white">
                
                WISHAM
              </Link>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400 text-sm font-medium">Beats Catalog</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search beats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
              {(['all', 'Trap', 'Drill', 'Boom Bap', 'Synthwave', 'R&B'] as GenreFilter[]).map((genre) => (
                <button
                  key={genre}
                  onClick={() => setGenreFilter(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    genreFilter === genre
                      ? 'bg-orange-500 text-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {genre === 'all' ? 'All Genres' : genre}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300 focus:outline-none focus:border-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bpm">BPM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-neutral-400">
            <span className="text-white font-medium">{filteredBeats.length}</span> beats available
          </p>
        </div>

        {isLoading ? (
          viewMode === 'grid' ? (
            /* Shimmering Grid Skeleton matching exact card shape */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-[#131318] rounded-xl border border-neutral-800 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-neutral-800/60" />
                  <div className="p-3 space-y-2.5">
                    <div className="h-4 bg-neutral-800 rounded w-3/4" />
                    <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-5 bg-neutral-800 rounded w-1/3" />
                      <div className="w-8 h-8 bg-neutral-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Shimmering List Skeleton matching exact row shape */
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-neutral-800 bg-neutral-900/40 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 shrink-0" />
                  <div className="w-12 h-12 rounded-lg bg-neutral-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-1/4" />
                    <div className="flex gap-2">
                      <div className="h-3 bg-neutral-800/60 rounded w-12" />
                      <div className="h-3 bg-neutral-800/60 rounded w-16" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-5 bg-neutral-800 rounded w-12" />
                    <div className="w-20 h-9 bg-neutral-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredBeats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400">No beats found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setGenreFilter('all'); }}
              className="mt-4 px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View - Compact Cards
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBeats.map((beat) => {
              const isPlaying = playingTrackId === beat.id;
              return (
                <div
                  key={beat.id}
                  className={`group bg-[#131318] rounded-xl border transition-all overflow-hidden ${
                    isPlaying ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Cover Art */}
                  <div className={`relative aspect-square bg-gradient-to-br ${beat.cover_gradient}`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                    {/* Play button overlay */}
                    <button
                      onClick={() => handleTogglePlay(beat)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-500 text-black flex items-center justify-center">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </div>
                    </button>
                    {/* Genre badge */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-medium text-white">
                      {beat.genre}
                    </span>
                    {/* Playing indicator */}
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
                          style={{ width: `${playbackProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-white truncate">{beat.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <span>{beat.bpm} BPM</span>
                      <span>•</span>
                      <span>{beat.key_signature}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-black text-white">${beat.price}</span>
                      <button
                        onClick={() => { setCheckoutBeat(beat); setIsCheckoutOpen(true); }}
                        className="p-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View - Compact Rows
          <div className="space-y-2">
            {filteredBeats.map((beat) => {
              const isPlaying = playingTrackId === beat.id;
              return (
                <div
                  key={beat.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    isPlaying ? 'border-orange-500 bg-orange-500/5' : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50'
                  }`}
                >
                  {/* Play button */}
                  <button
                    onClick={() => handleTogglePlay(beat)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isPlaying ? 'bg-orange-500 text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  {/* Cover */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${beat.cover_gradient} shrink-0 flex items-center justify-center`}>
                    <span className="text-lg">🎵</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">{beat.title}</h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
                      <span className="px-1.5 py-0.5 bg-neutral-800 rounded">{beat.genre}</span>
                      <span>{beat.bpm} BPM</span>
                      <span>{beat.key_signature}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{beat.duration}</span>
                    </div>
                  </div>

                  {/* Price & Buy */}
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-white">${beat.price}</span>
                    <button
                      onClick={() => { setCheckoutBeat(beat); setIsCheckoutOpen(true); }}
                      className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Audio Player */}
      {playingTrackId && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0F0F13]/95 backdrop-blur-xl border-t border-orange-500/40 p-3 z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => {
                const beat = beats.find(b => b.id === playingTrackId);
                if (beat) handleTogglePlay(beat);
              }}
              className="w-10 h-10 rounded-full bg-orange-500 text-black flex items-center justify-center"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-orange-400 font-mono">Playing:</span>
                <span className="text-white font-medium">{beats.find(b => b.id === playingTrackId)?.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-neutral-500">{playbackTimeStr}</span>
                <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                    style={{ width: `${playbackProgress}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">3:00</span>
              </div>
            </div>
            <button
              onClick={() => { audioSynth.stop(); setPlayingTrackId(null); }}
              className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        track={checkoutBeat ? beatToTrack(checkoutBeat) : null}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPurgeSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};

export default BeatsCatalog;
