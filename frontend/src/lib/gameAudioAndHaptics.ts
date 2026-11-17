// ─── PROCEDURAL CRICKET SOUND & HAPTIC FEEDBACK ENGINE ───
// Generates 100% offline procedural audio synthesis (Web Audio API) + Native Capacitor Haptics
// Zero external asset downloads, zero network latency, persistent mute preferences.

class ProceduralCricketAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auctionxi_audio_muted');
        if (stored !== null) {
          this.muted = stored === 'true';
        }
      } catch {
        // localStorage unavailable
      }

      // Automatically attach global touch/click gesture listeners to unlock AudioContext on first user interaction
      const unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
      const onUserGesture = () => {
        this.unlockAudio();
        unlockEvents.forEach((evt) => window.removeEventListener(evt, onUserGesture));
      };
      unlockEvents.forEach((evt) => {
        window.addEventListener(evt, onUserGesture, { once: true, passive: true });
      });
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Explicitly unlocks the Web Audio API context upon user gesture
   */
  public unlockAudio() {
    if (typeof window === 'undefined') return;
    try {
      this.initContext();
      if (this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            this.playSilentBuffer();
          }).catch(() => {});
        } else {
          this.playSilentBuffer();
        }
      }
    } catch {
      // Audio context restricted
    }
  }

  private playSilentBuffer() {
    if (!this.ctx || this.isUnlocked) return;
    try {
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(0);
      this.isUnlocked = true;
    } catch {
      // ignore
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auctionxi_audio_muted', String(muted));
        window.dispatchEvent(new CustomEvent('auctionxi_sound_change', { detail: { isMuted: muted } }));
      } catch {
        // Ignored
      }
    }
  }

  public getMuted(): boolean {
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    const next = !this.muted;
    this.setMuted(next);
    if (!next) {
      this.unlockAudio();
    }
    return next;
  }

  // 1. Crisp "Willow Crack" Bat Impact
  public playWillowCrack(type: 'dot' | 'single' | 'four' | 'six') {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp wooden transient
      const freq = type === 'six' ? 2400 : type === 'four' ? 2100 : type === 'single' ? 1750 : 1300;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      // Body resonance
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(4.0, now);

      const maxGain = type === 'six' ? 0.9 : type === 'four' ? 0.75 : type === 'single' ? 0.5 : 0.35;
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
  public playCrowdRoar(intensity: 'boundary' | 'six' | 'wicket' | 'cheer') {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const duration = intensity === 'six' ? 1.8 : intensity === 'wicket' ? 2.2 : 1.2;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
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
      filter.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.35);
      filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      const peakVol = intensity === 'six' ? 0.55 : intensity === 'wicket' ? 0.7 : 0.35;
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(peakVol, this.ctx.currentTime + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

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
    if (this.muted) return;
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
    if (this.muted) return;
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

  // 5. Auction Gavel Slam (Deep Wood Sounding Block Strike)
  public playAuctionGavel(isSold: boolean = false) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const strikes = isSold ? [0, 0.11] : [0];

      strikes.forEach((offset, idx) => {
        if (!this.ctx) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Gavel wood transient + chest thump
        osc.type = idx === 1 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(idx === 1 ? 2200 : 1800, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, t);
        filter.frequency.exponentialRampToValueAtTime(280, t + 0.09);

        const vol = idx === 1 ? 0.95 : 0.75;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 1 ? 0.22 : 0.14));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // Ignored
    }
  }

  // 6. Bidding Paddle Snappy Click / Boardroom Paddle Raise
  public playBiddingPaddle() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.04);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignored
    }
  }

  // 7. Trade Deal Completed (Ascending Contract Triumph Chord)
  public playTradeDealSuccess() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // C5, E5, G5, C6 arpeggio chord
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {
      // Ignored
    }
  }

  // 8. Trade / Action Rejected (Double Low Buzzer)
  public playTradeReject() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        if (!this.ctx) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
      });
    } catch {
      // Ignored
    }
  }

  // 9. Card Swap / Shuffle Tactile Whoosh
  public playCardSwap() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignored
    }
  }

  // 10. Crisp UI Micro-Tap
  public playUiTap(style: 'light' | 'medium' | 'select' = 'light') {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = style === 'select' ? 880 : style === 'medium' ? 640 : 440;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);

      const vol = style === 'select' ? 0.35 : style === 'medium' ? 0.25 : 0.15;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignored
    }
  }

  // 11. Phase Lock / Metallic Latch Sound
  public playPhaseLock() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // High metallic ping followed by solid thud
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1850, now);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(260, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(70, now + 0.14);
      gain2.gain.setValueAtTime(0.5, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.2);
    } catch {
      // Ignored
    }
  }

  // 12. Confetti & Tournament Fanfare
  public playConfettiFanfare() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // D5, G5, B5, D6 triumphant fanfare
      const notes = [587.33, 783.99, 987.77, 1174.66];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.38);
      });
    } catch {
      // Ignored
    }
  }
}

export const gameAudio = new ProceduralCricketAudio();

// ─── CAPACITOR & WEB HAPTICS ENGINE ───
export type GameHapticType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'four' 
  | 'six' 
  | 'wicket' 
  | 'paddle' 
  | 'gavel' 
  | 'trade_success' 
  | 'trade_reject' 
  | 'lock';

export async function triggerGameHaptic(type: GameHapticType = 'light') {
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
    } else if (type === 'gavel') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(async () => {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }, 110);
    } else if (type === 'trade_success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'trade_reject') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (type === 'lock') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'paddle') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === 'heavy') {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    return;
  } catch {
    // Not running inside native Capacitor, proceed to navigator.vibrate fallback
  }

  // 2. Web Vibration API Fallback
  try {
    if ('vibrate' in navigator) {
      if (type === 'six') {
        navigator.vibrate([160, 60, 220]);
      } else if (type === 'four') {
        navigator.vibrate([100, 40, 100]);
      } else if (type === 'wicket') {
        navigator.vibrate([250, 70, 350]);
      } else if (type === 'gavel') {
        navigator.vibrate([120, 50, 180]);
      } else if (type === 'trade_success') {
        navigator.vibrate([80, 50, 120]);
      } else if (type === 'trade_reject') {
        navigator.vibrate([180, 60, 180]);
      } else if (type === 'lock') {
        navigator.vibrate([90]);
      } else if (type === 'heavy') {
        navigator.vibrate(100);
      } else if (type === 'medium') {
        navigator.vibrate(45);
      } else if (type === 'paddle') {
        navigator.vibrate(25);
      } else {
        navigator.vibrate(20);
      }
    }
  } catch {
    // Ignored
  }
}
