'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { audioSynth } from './audioSynth';
import type { Beat } from './types';

function patternFor(genre: string): 'trap' | 'drill' | 'boombap' | 'synthwave' {
  const g = genre.toLowerCase();
  if (g.includes('drill')) return 'drill';
  if (g.includes('boom') || g.includes('r&b') || g.includes('soul')) return 'boombap';
  if (g.includes('synth')) return 'synthwave';
  return 'trap';
}

/**
 * Beat preview playback: plays a published preview file when available,
 * otherwise falls back to the built-in synth preview.
 */
export function useAudioPreview() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeStr, setTimeStr] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioSynth.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setProgress(0);
    setTimeStr('0:00');
  }, []);

  // Always stop audio when the component unmounts
  useEffect(() => {
    return () => {
      audioSynth.stop();
      audioRef.current?.pause();
    };
  }, []);

  const toggle = (beat: Beat) => {
    if (playingId === beat.id) {
      stop();
      return;
    }
    stop();

    if (beat.audioUrl) {
      const audio = new Audio(beat.audioUrl);
      audioRef.current = audio;
      setPlayingId(beat.id);
      audio.play().catch(() => {
        audioSynth.play(beat.bpm, patternFor(beat.genre), 130.81, (p, t) => {
          setProgress(p);
          setTimeStr(t);
        });
      });
      audio.addEventListener('ended', stop);
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          const m = Math.floor(audio.currentTime / 60);
          const s = Math.floor(audio.currentTime % 60)
            .toString()
            .padStart(2, '0');
          setTimeStr(`${m}:${s}`);
        }
      });
      return;
    }

    audioSynth.play(beat.bpm, patternFor(beat.genre), 130.81, (p, t) => {
      setProgress(p);
      setTimeStr(t);
    });
    setPlayingId(beat.id);
  };

  return { playingId, progress, timeStr, toggle, stop };
}