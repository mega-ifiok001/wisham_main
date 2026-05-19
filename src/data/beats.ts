export interface Track {
  id: string;
  title: string;
  artist: string;
  type: 'single' | 'package';
  genre: 'Trap' | 'Synthwave' | 'Boom Bap' | 'Drill' | 'R&B / Soul' | 'Bundle';
  bpm: number;
  key: string;
  price: number;
  originalPrice?: number;
  description: string;
  includes: string[];
  duration: string;
  stemsCount: number;
  isSold: boolean;
  coverGradient: string;
  tags: string[];
  synthConfig: {
    tempo: number;
    pattern: 'trap' | 'synthwave' | 'boombap' | 'drill';
    rootFreq: number;
  };
}

export const INITIAL_TRACKS: Track[] = [
  // Normal Tracks (Single Beats)
  {
    id: 'beat-1',
    title: 'Hyperdrive',
    artist: 'AudioForge Master',
    type: 'single',
    genre: 'Trap',
    bpm: 142,
    key: 'C# Minor',
    price: 150,
    description: 'Heavy 808s, dark bells, and rapid hi-hat rolls. Perfect for high-energy festival bangers.',
    includes: ['24-Bit Master WAV', 'Full Trackout Stems (18 files)', 'Exclusive Ownership Rights', 'Instant Purge Guarantee'],
    duration: '3:12',
    stemsCount: 18,
    isSold: false,
    coverGradient: 'from-orange-500 to-red-600',
    tags: ['Banger', 'Dark', '808 Heavy'],
    synthConfig: { tempo: 142, pattern: 'trap', rootFreq: 138.59 } // C#3
  },
  {
    id: 'beat-2',
    title: 'Neon Shadows',
    artist: 'Kavinsky Clone',
    type: 'single',
    genre: 'Synthwave',
    bpm: 110,
    key: 'A Minor',
    price: 220,
    description: 'Analog Juno-106 arpeggios, gated reverb snares, and driving basslines straight from 1984.',
    includes: ['24-Bit Master WAV', 'Full Trackout Stems (24 files)', 'MIDI Chord File', 'Exclusive Ownership Rights'],
    duration: '3:45',
    stemsCount: 24,
    isSold: false,
    coverGradient: 'from-purple-600 to-pink-500',
    tags: ['Retro', 'Cinematic', 'Analog Synth'],
    synthConfig: { tempo: 110, pattern: 'synthwave', rootFreq: 110.0 } // A2
  },
  {
    id: 'beat-3',
    title: 'Vintage Velvet',
    artist: 'Dilla Tribute',
    type: 'single',
    genre: 'Boom Bap',
    bpm: 92,
    key: 'F Major',
    price: 180,
    description: 'Dusty vinyl Rhodes chords, unquantized MPC swing, and deep acoustic bass grooves.',
    includes: ['24-Bit Master WAV', 'Full Trackout Stems (14 files)', 'Exclusive Ownership Rights', 'Instant Purge Guarantee'],
    duration: '2:58',
    stemsCount: 14,
    isSold: false,
    coverGradient: 'from-amber-600 to-yellow-700',
    tags: ['Lo-Fi', 'Warm', 'Vinyl'],
    synthConfig: { tempo: 92, pattern: 'boombap', rootFreq: 174.61 } // F3
  },
  {
    id: 'beat-4',
    title: 'Titanium Edge',
    artist: 'UK Forge',
    type: 'single',
    genre: 'Drill',
    bpm: 144,
    key: 'G Minor',
    price: 195,
    description: 'Gliding sub bass, haunting choral pads, and syncopated snare rolls designed for lyrical aggression.',
    includes: ['24-Bit Master WAV', 'Full Trackout Stems (22 files)', 'Exclusive Ownership Rights'],
    duration: '3:20',
    stemsCount: 22,
    isSold: false,
    coverGradient: 'from-emerald-600 to-teal-800',
    tags: ['Sliding 808', 'Aggressive', 'UK Drill'],
    synthConfig: { tempo: 144, pattern: 'drill', rootFreq: 98.0 } // G2
  },
  {
    id: 'beat-5',
    title: 'Midnight Rain',
    artist: 'Velvet Keys',
    type: 'single',
    genre: 'R&B / Soul',
    bpm: 120,
    key: 'D# Minor',
    price: 170,
    description: 'Sensual guitar licks, lush ambient vocal chops, and smooth trap-infused percussion.',
    includes: ['24-Bit Master WAV', 'Full Trackout Stems (16 files)', 'Exclusive Ownership Rights'],
    duration: '3:05',
    stemsCount: 16,
    isSold: false,
    coverGradient: 'from-indigo-600 to-cyan-500',
    tags: ['Emotional', 'Guitar', 'Smooth'],
    synthConfig: { tempo: 120, pattern: 'trap', rootFreq: 155.56 } // D#3
  },

  // Package Tracks / Multi-Beat Stem Bundles
  {
    id: 'pkg-1',
    title: 'Cyberpunk Odyssey 5-Beat Master Package',
    artist: 'AudioForge Elite Team',
    type: 'package',
    genre: 'Bundle',
    bpm: 125,
    key: 'Multiple Keys',
    price: 499,
    originalPrice: 850,
    description: 'A colossal premium package containing 5 unreleased cyberpunk & dark synthwave exclusive tracks. Includes complete DAW project files (FL Studio & Ableton), 110+ individual WAV stems, and full royalty-free transfer.',
    includes: [
      '5 Mastered WAV Tracks',
      '5 Unmastered Mixdowns',
      'All 112 Multi-Track Stems',
      'Full DAW Project Session Files',
      'Instant Server Purge Script Execution',
      'Signed Digital License Certificate'
    ],
    duration: '18:40 total',
    stemsCount: 112,
    isSold: false,
    coverGradient: 'from-amber-500 via-red-600 to-purple-800',
    tags: ['5-Beat Bundle', 'VIP Package', 'Save $350', 'Project Files Included'],
    synthConfig: { tempo: 125, pattern: 'synthwave', rootFreq: 130.81 } // C3
  },
  {
    id: 'pkg-2',
    title: 'Metro Trilogy: Atlanta Trap Trackout Bundle',
    artist: 'Pluto Soundlab',
    type: 'package',
    genre: 'Bundle',
    bpm: 138,
    key: 'Am / Em / Bm',
    price: 380,
    originalPrice: 550,
    description: '3 elite hard-hitting trap anthems crafted with custom analog saturation. Designed for major label placement ready artists wanting cohesive EP material.',
    includes: [
      '3 Mastered WAV Tracks',
      '68 High-Fidelity WAV Stems',
      'Exclusive Unlimited License',
      'Instant Auto-Delete Guarantee'
    ],
    duration: '10:15 total',
    stemsCount: 68,
    isSold: false,
    coverGradient: 'from-orange-400 via-amber-600 to-emerald-700',
    tags: ['3-Beat Bundle', 'EP Ready', 'Hard Trap', 'Master Trackouts'],
    synthConfig: { tempo: 138, pattern: 'trap', rootFreq: 123.47 } // B2
  }
];

export const ACADEMY_COURSES = [
  {
    title: 'Cubase Suite Mastery',
    tag: 'Industry Standard',
    tagColor: 'purple',
    icon: 'Disc',
    description: 'Designed for tracking vocalists, sweeping film scores, and high-level audio routing configurations. Learn advanced template layouts and robust engineering pipelines.',
    features: ['Vocal Editing', 'Advanced Comping', 'MIDI Logic', 'Stem Mastering'],
    bgGradient: 'from-purple-950/40 via-neutral-900 to-neutral-950',
    borderColor: 'hover:border-purple-500/50',
    accentColor: 'text-purple-400',
    badgeClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
  },
  {
    title: 'FL Studio Speed & Flow',
    tag: 'Hitmaker Choice',
    tagColor: 'orange',
    icon: 'Music',
    description: 'Unlock lightning-fast drum processing, bounce rhythms flawlessly, and exploit the piano roll for complex melodies. Focuses heavily on modern urban music genres.',
    features: ['Piano Roll Tricks', 'Gross Beat Mechanics', 'Mixing Lab', 'Beat Block Cures'],
    bgGradient: 'from-orange-950/40 via-neutral-900 to-neutral-950',
    borderColor: 'hover:border-orange-500/50',
    accentColor: 'text-orange-400',
    badgeClass: 'bg-orange-500/10 border-orange-500/20 text-orange-400'
  },
  {
    title: 'Ableton Live Live-Looping & Sound Design',
    tag: 'Electronic Prodigy',
    tagColor: 'emerald',
    icon: 'Sparkles',
    description: 'Master Session View workflow, complex Operator FM synthesis, Max for Live devices, and live performance controller mappings.',
    features: ['Wavetable Synthesis', 'Drum Rack Racks', 'Sidechain Wizardry', 'Live Performance'],
    bgGradient: 'from-emerald-950/40 via-neutral-900 to-neutral-950',
    borderColor: 'hover:border-emerald-500/50',
    accentColor: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }
];

export const PRICING_TIERS = [
  {
    name: "Beginner's Class",
    level: "Level 1",
    price: 15,
    period: "/month",
    description: "Foundational beat construction & theory",
    features: [
      "Basic sequencing & step entry",
      "Sound selection blueprints",
      "Introduction to Cubase & FL Studio",
      "Weekly structural exercises",
      "Access to community Discord channels"
    ],
    popular: false,
    badge: "",
    btnStyle: "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
    icon: "BookOpen",
    color: "text-orange-400"
  },
  {
    name: "Arrangements & Structure",
    level: "Level 2",
    price: 20,
    period: "/month",
    description: "Advanced track progression & song formulas",
    features: [
      "Advanced transition architecture",
      "Creating drop impact & energy switches",
      "Full production workflow breakdown",
      "Priority access to review critiques",
      "Monthly stems mixing challenges"
    ],
    popular: true,
    badge: "Advance Tier",
    btnStyle: "bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold shadow-lg shadow-orange-500/20 hover:opacity-95",
    icon: "Layers",
    color: "text-amber-400"
  },
  {
    name: "Master Engineer Pro",
    level: "Level 3",
    price: 45,
    period: "/month",
    description: "Commercial mixing, mastering & acoustics",
    features: [
      "1-on-1 monthly track breakdown critique",
      "Analog emulation vs hardware workflows",
      "Vocal chain presets & stem mastering",
      "Direct stem stems download for practice",
      "Exclusive VIP Masterclass archives"
    ],
    popular: false,
    badge: "Elite Master",
    btnStyle: "bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20",
    icon: "Sliders",
    color: "text-purple-400"
  }
];

export const REVIEWS = [
  {
    quote: "Purchased the Metro Trilogy package and the stems were crystal clear. The instant auto-delete script gave me 100% peace of mind for my album release.",
    author: "Kash Da Producer",
    role: "Billboard Charting Artist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    rating: 5
  },
  {
    quote: "The Cubase Suite Mastery course taught me more about vocal routing in 2 weeks than 3 years of YouTube tutorials. Unbeatable value.",
    author: "Elena Rostova",
    role: "Film Composer & Producer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5
  },
  {
    quote: "Never seen a marketplace like this. Once I bought 'Hyperdrive', my friend tried to find it 10 minutes later and it was completely purged. Real exclusivity.",
    author: "Marcus 'Vibe' Vance",
    role: "Independent Hip-Hop Artist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    rating: 5
  }
];
