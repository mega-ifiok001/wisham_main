import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ozmnqrckglyizpkwgrjb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96bW5xcmNrZ2x5aXpwa3dncmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDc0OTMsImV4cCI6MjA5MzkyMzQ5M30.pfeePtxrEzXVZJ1gnqBDlKTY4CsaXGGO0LU3Dum-klw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Beat {
  id: string;
  title: string;
  artist: string;
  genre: 'Trap' | 'Drill' | 'Boom Bap' | 'Synthwave' | 'R&B';
  bpm: number;
  key_signature: string;
  price: number;
  description: string | null;
  duration: string;
  cover_gradient: string;
  audio_url: string | null;
  stems_url: string | null;
  is_sold: boolean;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  beat_id: string;
  beat_title: string;
  buyer_id: string | null;
  buyer_email: string;
  price: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchased_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  beat_id: string;
  sale_id: string | null;
  download_count: number;
  purchased_at: string;
}

export interface Class {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassEnrollment {
  id: string;
  user_id: string;
  class_id: string;
  status: 'active' | 'cancelled' | 'expired';
  enrolled_at: string;
  expires_at: string | null;
}
