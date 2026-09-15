export interface Beat {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  keySignature: string;
  description: string | null;
  duration: string;
  coverGradient: string;
  audioUrl: string | null;
  stemsUrl: string | null;
  exclusivePrice: number;
  inclusivePrice: number;
  inclusiveStemsPrice: number;
  isSold: boolean;
  soldAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  beatId: string;
  beatTitle: string;
  buyerEmail: string;
  buyerName: string | null;
  licenseType: 'exclusive' | 'inclusive';
  includesStems: boolean;
  amountUsd: number;
  currency: string;
  paymentRef: string | null;
  paymentStatus: 'pending' | 'success' | 'failed';
  licenseHash: string | null;
  emailSent: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalSales: number;
  paidSales: number;
  totalRevenueUsd: number;
  totalBeats: number;
  soldBeats: number;
  exclusiveCount: number;
  inclusiveCount: number;
  pendingSales: number;
}

export type LicenseTier = 'exclusive' | 'inclusive' | 'inclusive-stems';