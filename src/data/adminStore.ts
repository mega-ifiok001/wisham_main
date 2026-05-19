// Simple store for admin data (in real app this would be a backend database)

export interface BeatSale {
  id: string;
  beatId: string;
  beatTitle: string;
  buyerEmail: string;
  price: number;
  date: string;
  time: string;
}

export interface AdminBeat {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  price: number;
  isSold: boolean;
  dateAdded: string;
}

// Initial sample data
export const initialBeats: AdminBeat[] = [
  { id: 'beat-1', title: 'Hyperdrive', genre: 'Trap', bpm: 142, price: 150, isSold: false, dateAdded: '2025-01-15' },
  { id: 'beat-2', title: 'Neon Shadows', genre: 'Synthwave', bpm: 110, price: 220, isSold: false, dateAdded: '2025-01-18' },
  { id: 'beat-3', title: 'Vintage Velvet', genre: 'Boom Bap', bpm: 92, price: 180, isSold: false, dateAdded: '2025-01-20' },
  { id: 'beat-4', title: 'Titanium Edge', genre: 'Drill', bpm: 144, price: 195, isSold: false, dateAdded: '2025-01-22' },
  { id: 'beat-5', title: 'Midnight Rain', genre: 'R&B', bpm: 120, price: 170, isSold: false, dateAdded: '2025-01-25' },
];

export const initialSales: BeatSale[] = [
  { id: 'sale-1', beatId: 'old-beat-1', beatTitle: 'Dark Knight (Trap)', buyerEmail: 'john.doe@email.com', price: 200, date: '2025-01-10', time: '14:23' },
  { id: 'sale-2', beatId: 'old-beat-2', beatTitle: 'Ocean Waves (R&B)', buyerEmail: 'sarah.smith@gmail.com', price: 175, date: '2025-01-12', time: '09:45' },
  { id: 'sale-3', beatId: 'old-beat-3', beatTitle: 'City Lights (Drill)', buyerEmail: 'mike.jones@yahoo.com', price: 250, date: '2025-01-14', time: '18:30' },
  { id: 'sale-4', beatId: 'old-beat-4', beatTitle: 'Sunset Boulevard (Synthwave)', buyerEmail: 'lisa.wong@email.com', price: 180, date: '2025-01-16', time: '11:15' },
  { id: 'sale-5', beatId: 'old-beat-5', beatTitle: 'Street Dreams (Boom Bap)', buyerEmail: 'carlos.r@email.com', price: 160, date: '2025-01-18', time: '20:05' },
];
