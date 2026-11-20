// ─── PROCEDURAL CRICKET SOUND & HAPTIC FEEDBACK ENGINE ───
// Generates 100% offline procedural audio synthesis (Web Audio API) + Native Capacitor Haptics
// Zero external asset downloads, zero network latency, persistent mute preferences.

class ProceduralCricketAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private isUnlocked: boolean = false;

  constructor() {
    this.muted = false; // Enabled at full volume by default per user specification
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auctionxi_audio_muted', 'false');
      } catch {
        // localStorage unavailable
      }

      // Automatically attach global touch/click gesture listeners to unlock and keep AudioContext active
      const unlockEvents = ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'];
      const onUserGesture = () => {
        this.unlockAudio();
      };
      unlockEvents.forEach((evt) => {
        window.addEventListener(evt, onUserGesture, { passive: true });
      });
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        try {
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        } catch {
          // fallback
        }
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

  private getDestination(): AudioNode {
    if (this.masterGain && this.ctx) return this.masterGain;
    return this.ctx!.destination;
  }

  // 1. Crisp "Willow Crack" Bat Impact (Loud, Punchy Wooden Clack)
  public playWillowCrack(type: 'dot' | 'single' | 'four' | 'six') {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const dest = this.getDestination();

      // Layer A: Low-mid wooden body thump
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const baseFreq = type === 'six' ? 440 : type === 'four' ? 380 : type === 'single' ? 320 : 260;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + (type === 'six' ? 0.12 : 0.08));

      const oscVol = type === 'six' ? 0.95 : type === 'four' ? 0.85 : type === 'single' ? 0.65 : 0.45;
      oscGain.gain.setValueAtTime(oscVol, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'six' ? 0.14 : 0.09));

      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.16);

      // Layer B: High willow wood crack (transient noise burst)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.9;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(type === 'six' ? 2400 : 2000, now);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = this.ctx.createGain();
      const noiseVol = type === 'six' ? 0.9 : type === 'four' ? 0.8 : 0.55;
      noiseGain.gain.setValueAtTime(noiseVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'six' ? 0.06 : 0.04));

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start(now);
      noise.stop(now + 0.07);
    } catch {
      // Audio not permitted or unaccelerated
    }
  }

  // 2. Crowd Roar / Stadium Atmosphere Surge (Loud, Immersive Wankhede Roar)
  public playCrowdRoar(intensity: 'boundary' | 'six' | 'wicket' | 'cheer') {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const duration = intensity === 'six' ? 2.2 : intensity === 'wicket' ? 2.5 : 1.5;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Rich crowd cheer murmur
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5) * 0.55;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(intensity === 'six' ? 2800 : 2200, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(700, now + duration);

      const gain = this.ctx.createGain();
      const peakVol = intensity === 'six' ? 0.9 : intensity === 'wicket' ? 0.95 : 0.75;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination());

      whiteNoise.start(now);
      whiteNoise.stop(now + duration + 0.05);
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
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const dest = this.getDestination();

      // Sharp timber strikes + flying bails
      [750, 1100, 420, 2400].forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.035;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 3 ? 'sine' : 'square';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.16);

        const vol = idx === 3 ? 0.6 : 0.8;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.25);
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
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignored
    }
  }

  // 4b. Coin Toss Metallic Spin & Clink
  public playCoinFlip() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.22);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignored
    }
  }

  public playCoinClink() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Ignored
    }
  }

  // 4c. Umpire / Bowler HOWZAT Appeal Roar
  public playAppealHowzat() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime + 0.005;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.exponentialRampToValueAtTime(420, now + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.45);

      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(540, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(160, now + 0.45);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.65, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.getDestination());

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } catch {
      // Ignored
    }
  }

  // 4d. Stadium IPL Horn Fanfare
  public playBoundaryHorn() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime + 0.005;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.getDestination());

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // Ignored
    }
  }

  // 4e. Crowd Gasp (Play & Miss or Dot Pressure)
  public playCrowdGasp() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const now = this.ctx.currentTime + 0.005;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination());

      noise.start(now);
      noise.stop(now + 0.38);
    } catch {
      // Ignored
    }
  }

  // 5. Auction Gavel Slam (Heavy Wooden Block Strike)
  public playAuctionGavel(isSold: boolean = false) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const strikes = isSold ? [0, 0.12] : [0];
      const dest = this.getDestination();

      strikes.forEach((offset, idx) => {
        if (!this.ctx) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx === 1 ? 2100 : 1700, t);
        osc.frequency.exponentialRampToValueAtTime(75, t + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.1);

        const vol = idx === 1 ? 0.95 : 0.85;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {
      // Ignored
    }
  }

  // 5b. Auction Gavel Bang (Direct alias for hammer strike)
  public playGavelBang(isSold: boolean = true) {
    this.playAuctionGavel(isSold);
  }

  // 6. Bidding Paddle Snappy Click
  public playBiddingPaddle() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(now);
      osc.stop(now + 0.07);
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
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const dest = this.getDestination();

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.38);
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
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const dest = this.getDestination();

      [0, 0.12].forEach((offset) => {
        if (!this.ctx) return;
        const t = now + offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.09);

        gain.gain.setValueAtTime(0.55, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.12);
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
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignored
    }
  }

  // 10. Crisp UI Micro-Tap (Clear audible pop)
  public playUiTap(style: 'light' | 'medium' | 'select' = 'light') {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = style === 'select' ? 950 : style === 'medium' ? 700 : 520;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      const vol = style === 'select' ? 0.6 : style === 'medium' ? 0.45 : 0.35;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(now);
      osc.stop(now + 0.06);
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
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const dest = this.getDestination();

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1850, now);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      gain1.gain.setValueAtTime(0.5, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(260, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(70, now + 0.14);
      gain2.gain.setValueAtTime(0.7, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(dest);
      osc2.connect(gain2);
      gain2.connect(dest);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.2);
    } catch {
      // Ignored
    }
  }

  // 12. Confetti & Tournament Fanfare (Loud Victory Horns)
  public playConfettiFanfare() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime + 0.005;
      const notes = [587.33, 783.99, 987.77, 1174.66];
      const dest = this.getDestination();

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.55, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.42);
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
  | 'trade_deal_success' 
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
    } else if (type === 'trade_success' || type === 'trade_deal_success') {
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
      } else if (type === 'trade_success' || type === 'trade_deal_success') {
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
