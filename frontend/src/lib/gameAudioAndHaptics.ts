// ─── PROCEDURAL CRICKET SOUND & HAPTIC FEEDBACK ENGINE ───
// Generates 100% offline audio synthesis (Web Audio API) + Native Capacitor Haptics

class ProceduralCricketAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 1. Crisp "Willow Crack" Bat Impact
  public playWillowCrack(type: 'dot' | 'single' | 'four' | 'six') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp wooden transient
      const freq = type === 'six' ? 2400 : type === 'four' ? 2100 : 1600;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      // Body resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(4.0, now);

      const maxGain = type === 'six' ? 0.9 : type === 'four' ? 0.75 : 0.4;
      gain.gain.setValueAtTime(maxGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'six' ? 0.14 : 0.09));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio not permitted or unaccelerated
    }
  }

  // 2. Crowd Roar / Stadium Atmosphere Surge
  public playCrowdRoar(intensity: 'boundary' | 'six' | 'wicket') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * (intensity === 'six' ? 1.8 : intensity === 'wicket' ? 2.2 : 1.2);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate pink/white crowd murmur noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.08;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.4);
      filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + (intensity === 'six' ? 1.8 : 1.2));

      const gain = this.ctx.createGain();
      const peakVol = intensity === 'six' ? 0.55 : intensity === 'wicket' ? 0.7 : 0.35;
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peakVol, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (intensity === 'six' ? 1.8 : 1.2));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Ignored
    }
  }

  // 3. Stumps Cartwheel & Timber Clatter
  public playStumpShatter() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High wooden impact + metallic chime
      [820, 1150, 480].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15 + idx * 0.03);

        gain.gain.setValueAtTime(0.4, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18 + idx * 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + 0.25);
      });
    } catch {
      // Ignored
    }
  }

  // 4. Subtle Ball Release / Whistle
  public playBallWhoosh() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignored
    }
  }
}

export const gameAudio = new ProceduralCricketAudio();

// ─── CAPACITOR HAPTICS ENGINE ───
export async function triggerGameHaptic(type: 'light' | 'four' | 'six' | 'wicket') {
  if (typeof window === 'undefined') return;

  // 1. Try native Capacitor Haptics
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    if (type === 'six') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(async () => {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }, 100);
    } else if (type === 'four') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'wicket') {
      await Haptics.notification({ type: NotificationType.Error });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    return;
  } catch {
    // Not in native Capacitor or module unavailable, fallback to navigator.vibrate
  }

  // 2. Web Vibration API Fallback
  try {
    if ('vibrate' in navigator) {
      if (type === 'six') {
        navigator.vibrate([150, 60, 200]);
      } else if (type === 'four') {
        navigator.vibrate([100, 40, 100]);
      } else if (type === 'wicket') {
        navigator.vibrate([250, 70, 350]);
      } else {
        navigator.vibrate(35);
      }
    }
  } catch {
    // Ignored
  }
}
