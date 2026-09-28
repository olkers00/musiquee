import { createRng } from "@/lib/demo/seed-random";

const NOTE_POOL = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0];

interface SynthHandle {
  ctx: AudioContext;
  master: GainNode;
  nodes: (OscillatorNode | AudioNode)[];
  startedAt: number;
  offset: number;
}

/**
 * Demo mode has no real 30s preview audio to fetch, so we generate a soft,
 * deterministic ambient pad per track (seeded by track id) — enough to make
 * the bottom player feel alive without pretending to be the real song.
 */
export class SynthPreviewPlayer {
  private handle: SynthHandle | null = null;
  private rafId: number | null = null;
  private duration = 30;
  private onProgress: ((seconds: number) => void) | null = null;
  private onEnded: (() => void) | null = null;

  isSupported(): boolean {
    return typeof window !== "undefined" && "AudioContext" in window;
  }

  play(
    seed: string,
    durationSec: number,
    onProgress: (seconds: number) => void,
    onEnded: () => void,
    fromOffset = 0
  ) {
    this.stop();
    if (!this.isSupported()) return;

    this.duration = Math.min(durationSec, 30);
    this.onProgress = onProgress;
    this.onEnded = onEnded;

    const AudioCtx = window.AudioContext;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;

    gain.connect(filter);
    filter.connect(ctx.destination);

    const rng = createRng(seed);
    const notes = [rng.pick(NOTE_POOL), rng.pick(NOTE_POOL), rng.pick(NOTE_POOL)];
    const oscillators = notes.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = freq * (i === 2 ? 2 : 1);
      osc.detune.value = rng.int(-6, 6);
      osc.connect(gain);
      return osc;
    });

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const now = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0.05, now + 0.6);
    const stopAt = now + this.duration - fromOffset;
    gain.gain.setValueAtTime(0.05, Math.max(now, stopAt - 1));
    gain.gain.linearRampToValueAtTime(0, stopAt);

    oscillators.forEach((osc) => osc.start(now));

    this.handle = {
      ctx,
      master: gain,
      nodes: [...oscillators, lfo, gain, filter],
      startedAt: now,
      offset: fromOffset,
    };

    this.tick();

    window.setTimeout(() => {
      this.stop();
      this.onEnded?.();
    }, (this.duration - fromOffset) * 1000);
  }

  private tick = () => {
    if (!this.handle) return;
    const elapsed = this.handle.ctx.currentTime - this.handle.startedAt + this.handle.offset;
    this.onProgress?.(Math.min(elapsed, this.duration));
    this.rafId = window.requestAnimationFrame(this.tick);
  };

  pause(): number {
    if (!this.handle) return 0;
    const elapsed = this.handle.ctx.currentTime - this.handle.startedAt + this.handle.offset;
    this.stop();
    return elapsed;
  }

  stop() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.handle) {
      this.handle.nodes.forEach((node) => {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          try {
            (node as OscillatorNode).stop();
          } catch {
            /* already stopped */
          }
        }
      });
      void this.handle.ctx.close().catch(() => undefined);
      this.handle = null;
    }
  }
}
