// WISHAM frontend API client — talks to the Express server (server/).
// In dev, Vite proxies /api -> http://localhost:4000 (see vite.config.ts).
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data as { error?: string }).error || `Request failed (${res.status})`;
    const err = new Error(message) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

// ---------- Public ----------
export const api = {
  getBeats: () => request<{ beats: Beat[] }>('/beats'),

  initializeCheckout: (payload: {
    beatId: string;
    licenseType: 'exclusive' | 'inclusive';
    includesStems?: boolean;
    email: string;
    name?: string;
  }) =>
    request<{ authorizationUrl: string; reference: string; saleId: string; amountUsd: number; licenseType: string }>(
      '/checkout/initialize',
      { method: 'POST', body: JSON.stringify(payload) }
    ),

  verifyCheckout: (reference: string) =>
    request<{
      success: boolean;
      sale: {
        id: string;
        beatTitle: string;
        buyerEmail: string;
        licenseType: string;
        includesStems: boolean;
        amountUsd: number;
        licenseHash: string | null;
        paid: boolean;
      };
    }>(`/checkout/verify?reference=${encodeURIComponent(reference)}`),
};

// ---------- Admin ----------
export const adminApi = {
  login: (email: string, password: string) =>
    request<{ admin: { email: string; name?: string } }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ ok: boolean }>('/admin/logout', { method: 'POST' }),

  me: () => request<{ admin: { email: string; name?: string } }>('/admin/me'),

  beats: () => request<{ beats: Beat[] }>('/admin/beats'),

  sales: () => request<{ sales: Sale[] }>('/admin/sales'),

  stats: () => request<{ stats: AdminStats; recent: Sale[] }>('/admin/stats'),

  createBeat: (form: FormData) =>
    request<{ beat: Beat }>('/admin/beats', { method: 'POST', body: form }),

  updateBeat: (id: string, form: FormData) =>
    request<{ beat: Beat }>(`/admin/beats/${id}`, { method: 'PATCH', body: form }),

  deleteBeat: (id: string) => request<{ ok: boolean }>(`/admin/beats/${id}`, { method: 'DELETE' }),
};