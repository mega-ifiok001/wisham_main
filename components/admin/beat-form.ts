export interface BeatFormValues {
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  keySignature: string;
  duration: string;
  description: string;
  coverGradient: string;
  exclusivePrice: number;
  inclusivePrice: number;
  inclusiveStemsPrice: number;
  audioUrl: string;
  stemsUrl: string;
}

export const GENRES = ['Trap', 'Drill', 'Boom Bap', 'Synthwave', 'R&B'];

export const GRADIENTS = [
  'from-red-500 to-red-700',
  'from-rose-500 to-red-600',
  'from-red-600 to-rose-800',
  'from-neutral-800 to-red-900',
];

export const emptyBeatForm: BeatFormValues = {
  title: '',
  artist: 'WISHAM',
  genre: 'Trap',
  bpm: 120,
  keySignature: 'C Minor',
  duration: '3:00',
  description: '',
  coverGradient: GRADIENTS[0],
  exclusivePrice: 60,
  inclusivePrice: 30,
  inclusiveStemsPrice: 40,
  audioUrl: '',
  stemsUrl: '',
};