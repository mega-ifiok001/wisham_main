'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/client-api';
import type { Beat } from '@/lib/types';

interface Options {
  /** Items per page (default 8) */
  limit?: number;
  genre?: string;
  q?: string;
  sort?: string;
}

/**
 * Infinite-scroll ("liquid") feed for the public catalog.
 * Keeps loading more pages automatically as the sentinel scrolls into view.
 */
export function useBeatsFeed({ limit = 8, genre, q, sort }: Options = {}) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(
    async (nextPage: number, replace = false) => {
      if (replace) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const res = await api.getBeats({ page: nextPage, limit, genre, q, sort });
        setBeats((prev) => (replace ? res.beats : [...prev, ...res.beats]));
        setTotal(res.total);
        setPage(res.page);
        setHasMore(res.hasMore);
      } catch (err) {
        setError((err as Error).message || 'Could not load beats');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [limit, genre, q, sort]
  );

  // First page (+ reset whenever filters change)
  useEffect(() => {
    setHasMore(true);
    load(1, true);
  }, [load]);

  // Auto-load more when the sentinel becomes visible
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          load(page + 1);
        }
      },
      { rootMargin: '420px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page, load]);

  return { beats, total, page, hasMore, isLoading, isLoadingMore, error, sentinelRef, reload: load };
}