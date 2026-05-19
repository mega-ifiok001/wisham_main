// Web Audio API Synthesizer for high-fidelity beat previews

class AudioPreviewSynth {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private isPlaying: boolean = false;
  private currentPattern: string = 'trap';
  private rootFreq: number = 130.81; // C3
  private onProgressCallback: ((progress: number, timeStr: string) => void) | null = null;
  private startTime: number = 0;
  private simulatedDuration: number = 180; // 3 minutes simulated

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(bpm: number, pattern: string, rootFreq: number, onProgress: (p: number, t: string) => void) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentPattern = pattern;
    this.rootFreq = rootFreq;
    this.onProgressCallback = onProgress;
    this.startTime = this.ctx.currentTime;

    const stepDuration = 60 / bpm / 4; // 16th notes
    let nextStepTime = this.ctx.currentTime;
    let step = 0;

    const scheduler = () => {
      while (nextStepTime < this.ctx!.currentTime + 0.1) {
        this.scheduleNote(step, nextStepTime);
        nextStepTime += stepDuration;
        step = (step + 1) % 16;
      }

      if (this.isPlaying && this.onProgressCallback && this.ctx) {
        const elapsed = this.ctx.currentTime - this.startTime;
        const prog = Math.min((elapsed / this.simulatedDuration) * 100, 100);
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
        this.onProgressCallback(prog, `${mins}:${secs}`);
      }

      if (this.isPlaying) {
        this.timerId = window.setTimeout(scheduler, 25);
      }
    };

    scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.isPlaying) return;

    // Kick on 0, 8, sometimes 10 or 14
    if (step === 0 || step === 8 || (this.currentPattern === 'trap' && step === 11)) {
      this.triggerKick(time);
      if (step === 0 || step === 8) {
        this.trigger808(time, this.rootFreq);
      }
    }

    // Snare / Clap on 4 and 12
    if (step === 4 || step === 12) {
      this.triggerSnare(time);
    }

    // Hi-hats on almost every step or rolls
    if (this.currentPattern === 'trap') {
      if (step % 2 === 0 || step === 14 || step === 15) {
        this.triggerHiHat(time, step >= 14 ? 0.03 : 0.05);
      }
    } else {
      if (step % 4 === 0 || step % 4 === 2) {
        this.triggerHiHat(time, 0.06);
      }
    }

    // Melodic Synth chords/arps
    if (this.currentPattern === 'synthwave') {
      const arpNotes = [1, 1.25, 1.5, 1.875];
      const mult = arpNotes[step % 4];
      if (step % 2 === 0) {
        this.triggerSynth(time, this.rootFreq * mult * 2, 0.15, 'sawtooth');
      }
    } else if (this.currentPattern === 'trap') {
      if (step === 0 || step === 6 || step === 12) {
        this.triggerSynth(time, this.rootFreq * 3, 0.3, 'sine');
      }
    } else if (this.currentPattern === 'drill') {
      if (step === 0 || step === 10) {
        this.triggerSynth(time, this.rootFreq * 2.5, 0.25, 'triangle');
        // Sliding 808
        this.triggerSlide808(time, this.rootFreq * 0.5, this.rootFreq * 0.75);
      }
    } else {
      // Boom Bap Rhodes chords simulation
      if (step === 0 || step === 8) {
        this.triggerSynth(time, this.rootFreq * 1.5, 0.4, 'triangle');
        this.triggerSynth(time, this.rootFreq * 1.875, 0.4, 'triangle');
      }
    }
  }

  private triggerKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private trigger808(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq / 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc.start(time);
    osc.stop(time + 0.8);
  }

  private triggerSlide808(time: number, startFreq: number, endFreq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const dist = this.ctx.createWaveShaper();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.2);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, time + 0.6);

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  private triggerSnare(time: number) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.1);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    noise.start(time);
    noise.stop(time + 0.1);
  }

  private triggerHiHat(time: number, dur: number) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.start(time);
    noise.stop(time + dur);
  }

  private triggerSynth(time: number, freq: number, dur: number, type: OscillatorType) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.start(time);
    osc.stop(time + dur);
  }
}

export const audioSynth = new AudioPreviewSynth();
