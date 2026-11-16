"use client";

// Supercharged High-Impact Stamp Audio Synthesizer
// Combines a heavy sub-bass 125Hz -> 22Hz thump with a wooden crack transient
// Uses a boosted master gain of 2.4 for aggressive, punchy impact without audio clipping
export function playStampSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Master Gain (boosted to 2.4 for aggressive, loud impact)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(2.4, now);

    // Layer 1: Heavy Sub-Bass Slam (Triangle wave 125Hz -> 22Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(125, now);
    subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.22);

    subFilter.type = "lowpass";
    subFilter.frequency.setValueAtTime(380, now);
    subFilter.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(1.0, now + 0.012);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);

    // Layer 2: Wooden Crack Impact (Transient snap)
    const crackOsc = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crackOsc.type = "sine";
    crackOsc.frequency.setValueAtTime(260, now);
    crackOsc.frequency.exponentialRampToValueAtTime(75, now + 0.06);

    crackGain.gain.setValueAtTime(0.001, now);
    crackGain.gain.linearRampToValueAtTime(0.85, now + 0.006);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    crackOsc.connect(crackGain);
    crackGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.4);
    crackOsc.start(now);
    crackOsc.stop(now + 0.1);

    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // ignore
      }
    }, 500);
  } catch {
    // Graceful fallback if audio is restricted or unsupported
  }
}
