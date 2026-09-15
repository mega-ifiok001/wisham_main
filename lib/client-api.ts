// Browser-side API client. Everything is same-origin now (Next.js), so no base URL
// and no CORS to worry about.
import type { AdminStats, Beat, Sale } from './types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`
    ) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export interface BeatsFeed {
  beats: Beat[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const api = {
  /** Paginated + filterable public catalog. */
  getBeats: (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    q?: string;
    sort?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.genre && params.genre !== 'All') sp.set('genre', params.genre);
    if (params?.q) sp.set('q', params.q);
    if (params?.sort && params.sort !== 'newest') sp.set('sort', params.sort);
    const qs = sp.toString();
    return request<BeatsFeed>(`/beats${qs ? `?${qs}` : ''}`);
  },

  initializeCheckout: (payload: {
    beatId: string;
    licenseType: 'exclusive' | 'inclusive';
    includesStems?: boolean;
    email: string;
    name?: string;
  }) =>
    request<{
      authorizationUrl: string;
      reference: string;
      saleId: string;
      amountUsd: number;
      licenseType: string;
    }>('/checkout/initialize', { method: 'POST', body: JSON.stringify(payload) }),

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

  /** Ask the server for a signed, direct-to-Cloudinary upload package. */
  signUpload: (filename: string) =>
    request<{
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      type: string;
      signature: string;
      resourceType: 'video' | 'raw';
      uploadUrl: string;
      cloudinaryReady: boolean;
    }>('/admin/uploads/sign', { method: 'POST', body: JSON.stringify({ filename }) }),
};