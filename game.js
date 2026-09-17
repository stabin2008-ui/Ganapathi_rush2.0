/**
 * ============================================================================
 * GANAPATHI RUSH 2.0 — MASTER FESTIVAL RUNNER ENGINE
 * "Run • Collect • Celebrate • Reach Bappa"
 * Visual Overhaul: Rich, Cinematic Indian Ganesh Chaturthi Festival Street
 * Built completely from scratch with HTML5 Canvas 2D & Web Audio API
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. CONSTANTS & CONFIGURATION
// ----------------------------------------------------------------------------
const CONFIG = {
  // Road & Perspective
  ROAD_LENGTH: 850,       // Max Z depth
  HORIZON_Y_RATIO: 0.32,  // Horizon height on canvas
  ROAD_BASE_Y_RATIO: 0.90,// Base of the road on canvas
  BASE_ROAD_WIDTH: 780,   // Base road width at player
  CAM_DEPTH: 250,         // Perspective camera focal depth

  // Physics & Movement
  BASE_SPEED: 260,        // Starting speed (units/s)
  MAX_SPEED: 520,         // Maximum speed
  SPEED_ACCEL: 0.08,      // Speed increment per meter
  LANE_LERP_SPEED: 15.0,  // Smooth lane interpolation speed
  GRAVITY: -38.0,         // Jump gravity
  JUMP_FORCE: 14.2,       // Jump launch velocity
  SLIDE_DURATION: 0.55,   // Slide duration in seconds

  // Hitbox Calibration (Smaller than sprite for fairness)
  PLAYER_HIT_W: 0.45,
  PLAYER_HIT_H: 0.60,
  PLAYER_SLIDE_H: 0.25,
  HIT_DEPTH_THRESHOLD: 32,

  // Destination & Milestones
  DESTINATION_DISTANCE: 2400, // Distance to reach Grand Ganesha Pandal
  INVULNERABLE_TIME: 1.25,    // Post-hit invulnerability duration

  // Audio Volumes
  SFX_VOLUME: 0.55,
  MUSIC_VOLUME: 0.30
};

// ----------------------------------------------------------------------------
// 2. PROCEDURAL AUDIO MANAGER (Web Audio API)
// ----------------------------------------------------------------------------
class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.unlocked = false;

    // Procedural Dhol Rhythm Sequencer
    this.rhythmTimer = null;
    this.rhythmStep = 0;
    this.isPlayingRhythm = false;
  }

  init() {
    if (this.unlocked && this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(CONFIG.SFX_VOLUME, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(CONFIG.MUSIC_VOLUME, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.unlocked = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  // Modak Collection: 2-tone melodic crystalline chime
  playModak() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, t); // E5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, t + 0.12); // C6
    osc2.frequency.setValueAtTime(1318.51, t); // E6
    osc2.frequency.exponentialRampToValueAtTime(1567.98, t + 0.12); // G6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  // Coin Collection: Crisp metallic sparkle ring
  playCoin() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t); // A6
    osc.frequency.setValueAtTime(2637, t + 0.06); // E7

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Jump: Snappy upward air whoosh
  playJump() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.16);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Landing: Low soft dust thud
  playLand() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Slide: Quick filtered white noise sweep
  playSlide() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // Near Miss: High speed doppler whoosh with sparkle
  playNearMiss() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(330, t + 0.24);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  // Hit / Collision: Low impactful rumble
  playHit() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

    gain.gain.setValueAtTime(0.40, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Shield Break: Crystalline shatter
  playShieldBreak() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [1046, 1318, 1567, 2093].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.03);
      gain.gain.setValueAtTime(0.18, t + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.22);
    });
  }

  // Combo Up: Harmonic ascending arpeggio
  playComboUp(tier = 2) {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const freqs = baseFreqs.slice(0, Math.min(tier + 1, baseFreqs.length));

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.20, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.25);
    });
  }

  // Power-Up Pickup: Festive fanfare swell
  playPowerUp() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880];
    chords.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.8, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // Bappa's Blessing: Sacred temple bell chime
  playBlessing() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [261.63, 523.25, 784, 1046.5].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.6);
    });
  }

  // Landmark Arrival Chime
  playLandmarkChime() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.08);
      gain.gain.setValueAtTime(0.16, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.8);
    });
  }

  // Game Over: Solemn descending harmonic drone
  playGameOver() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    [220, 196, 174.6, 146.8].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);

      gain.gain.setValueAtTime(0.15, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.5);
    });
  }

  // Finale: Triumphant festive dhol roll
  playFinale() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 12; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100 + i * 18, t + i * 0.07);

      gain.gain.setValueAtTime(0.28, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.16);
    }
  }

  // UI Tap
  playClick() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Subtle Dhol Rhythm Generator (Background Loop during gameplay)
  startDholRhythm() {
    if (this.isPlayingRhythm) return;
    this.isPlayingRhythm = true;
    this.rhythmStep = 0;
    this.scheduleNextDholBeat();
  }

  stopDholRhythm() {
    this.isPlayingRhythm = false;
    if (this.rhythmTimer) {
      clearTimeout(this.rhythmTimer);
      this.rhythmTimer = null;
    }
  }

  scheduleNextDholBeat() {
    if (!this.isPlayingRhythm) return;
    if (this.unlocked && !this.isMuted && this.ctx) {
      const t = this.ctx.currentTime;
      const isBass = (this.rhythmStep % 4 === 0) || (this.rhythmStep % 4 === 2);
      const isRim = (this.rhythmStep % 4 === 1) || (this.rhythmStep % 4 === 3);

      if (isBass) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(85, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      if (isRim) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.06);
        gain.gain.setValueAtTime(0.10, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.07);
      }

      if (this.rhythmStep % 8 === 0) {
        const bell = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(1760, t);
        bellGain.gain.setValueAtTime(0.04, t);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        bell.connect(bellGain);
        bellGain.connect(this.musicGain);
        bell.start(t);
        bell.stop(t + 0.8);
      }
    }

    this.rhythmStep = (this.rhythmStep + 1) % 16;
    this.rhythmTimer = setTimeout(() => this.scheduleNextDholBeat(), 205);
  }
}

// ----------------------------------------------------------------------------
// 3. PERSPECTIVE ENGINE (3D Projection)
// ----------------------------------------------------------------------------
class PerspectiveEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.horizonY = this.height * CONFIG.HORIZON_Y_RATIO;
    this.groundBaseY = this.height * CONFIG.ROAD_BASE_Y_RATIO;
    this.roadBaseHalfWidth = CONFIG.BASE_ROAD_WIDTH * 0.5;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.horizonY = h * CONFIG.HORIZON_Y_RATIO;
    this.groundBaseY = h * CONFIG.ROAD_BASE_Y_RATIO;
    this.roadBaseHalfWidth = Math.min(w * 0.44, CONFIG.BASE_ROAD_WIDTH * 0.5);
  }

  project(laneX, worldY = 0, worldZ = 0) {
    const scale = CONFIG.CAM_DEPTH / (worldZ + CONFIG.CAM_DEPTH);
    const pRatio = Math.pow(scale, 1.28);
    const screenY = this.horizonY + (this.groundBaseY - this.horizonY) * pRatio - worldY * scale;
    const roadHalfWidthAtZ = this.roadBaseHalfWidth * scale;
    const laneWidth = (roadHalfWidthAtZ * 2) / 3;
    const screenX = (this.width * 0.5) + laneX * laneWidth;

    return {
      x: screenX,
      y: screenY,
      scale: scale,
      laneWidth: laneWidth,
      roadHalfWidth: roadHalfWidthAtZ
    };
  }
}

// ----------------------------------------------------------------------------
// 4. PARTICLE SYSTEM (Object Pooled, 600 Max)
// ----------------------------------------------------------------------------
class ParticleSystem {
  constructor(maxParticles = 600) {
    this.pool = [];
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#ffd152',
        alpha: 1.0,
        decay: 0.02,
        shape: 'circle', // 'circle', 'petal', 'star', 'spark'
        rotation: 0,
        vRot: 0
      });
    }
  }

  spawn(x, y, count, options = {}) {
    let spawned = 0;
    for (let i = 0; i < this.pool.length && spawned < count; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x + (Math.random() - 0.5) * (options.spreadX || 10);
        p.y = y + (Math.random() - 0.5) * (options.spreadY || 10);
        const speed = (options.minSpeed || 2) + Math.random() * (options.maxSpeed || 8);
        const angle = options.angle !== undefined
          ? options.angle + (Math.random() - 0.5) * (options.angleSpread || 0.5)
          : Math.random() * Math.PI * 2;
        p.vx = Math.cos(angle) * speed + (options.baseVx || 0);
        p.vy = Math.sin(angle) * speed + (options.baseVy || 0);
        p.size = (options.minSize || 3) + Math.random() * (options.maxSize || 5);
        p.color = options.colors
          ? options.colors[Math.floor(Math.random() * options.colors.length)]
          : (options.color || '#ffd152');
        p.alpha = 1.0;
        p.decay = (options.minDecay || 0.02) + Math.random() * (options.maxDecay || 0.03);
        p.shape = options.shape || 'circle';
        p.rotation = Math.random() * Math.PI * 2;
        p.vRot = (Math.random() - 0.5) * 0.2;
        spawned++;
      }
    }
  }

  update(dt) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.active) {
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        p.rotation += p.vRot;
        p.alpha -= p.decay * 60 * dt;
        if (p.alpha <= 0) {
          p.active = false;
        }
      }
    }
  }

  render(ctx) {
    ctx.save();
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (p.active) {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'petal') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.shape === 'spark') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(p.size * 0.5, 0);
          ctx.lineTo(0, p.size * 2);
          ctx.lineTo(-p.size * 0.5, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  clear() {
    this.pool.forEach(p => p.active = false);
  }
}

// ----------------------------------------------------------------------------
// 5. PLAYER CONTROLLER
// ----------------------------------------------------------------------------
class Player {
  constructor(game) {
    this.game = game;
    this.lane = 1;          // 0: Left, 1: Center, 2: Right
    this.currentLaneX = 0;  // Interpolated world X (-1 to 1)
    this.jumpY = 0;         // Height off ground (world units)
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.runCycle = 0;
    this.invulnerableTimer = 0;
    this.trailType = 'sparkle';

    this.baseWidth = 84;
    this.baseHeight = 120;
  }

  reset() {
    this.lane = 1;
    this.currentLaneX = 0;
    this.jumpY = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.runCycle = 0;
    this.invulnerableTimer = 0;
  }

  moveLeft() {
    if (this.lane > 0) {
      this.lane--;
      this.game.audio.playClick();
    }
  }

  moveRight() {
    if (this.lane < 2) {
      this.lane++;
      this.game.audio.playClick();
    }
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = CONFIG.JUMP_FORCE;
      this.isSliding = false;
      this.slideTimer = 0;
      this.game.audio.playJump();

      const proj = this.game.perspective.project(this.currentLaneX, 0, 0);
      this.game.particles.spawn(proj.x, proj.y, 16, {
        colors: ['#ffd152', '#ffba08', '#e2e8f0'],
        minSpeed: 1,
        maxSpeed: 4,
        minSize: 2,
        maxSize: 4
      });
    }
  }

  slide() {
    if (this.isJumping) {
      this.velocityY = -26.0;
      this.game.audio.playSlide();
    } else if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = CONFIG.SLIDE_DURATION;
      this.game.audio.playSlide();

      const proj = this.game.perspective.project(this.currentLaneX, 0, 0);
      this.game.particles.spawn(proj.x, proj.y, 18, {
        colors: ['#ff8426', '#ffd152', '#ffffff'],
        minSpeed: 2,
        maxSpeed: 6,
        shape: 'spark'
      });
    }
  }

  update(dt) {
    const targetX = this.lane - 1;
    this.currentLaneX += (targetX - this.currentLaneX) * Math.min(1.0, CONFIG.LANE_LERP_SPEED * dt);

    if (this.isJumping) {
      this.jumpY += this.velocityY * 60 * dt;
      this.velocityY += CONFIG.GRAVITY * dt;

      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.game.audio.playLand();

        const proj = this.game.perspective.project(this.currentLaneX, 0, 0);
        this.game.particles.spawn(proj.x, proj.y, 16, {
          colors: ['#ffd152', '#ff8426', '#e2e8f0'],
          minSpeed: 2,
          maxSpeed: 5,
          angle: Math.PI * 1.5,
          angleSpread: 1.2
        });
      }
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.slideTimer = 0;
      }
    }

    const speedRatio = this.game.speed / CONFIG.BASE_SPEED;
    this.runCycle += 12 * speedRatio * dt;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Trail particles
    if (Math.random() < 0.6) {
      const proj = this.game.perspective.project(this.currentLaneX, this.jumpY * 1.5, 0);
      let colors = ['#ffd152', '#ffba08'];
      let shape = 'circle';
      if (this.trailType === 'marigold') {
        colors = ['#ff8426', '#ffba08', '#d62828'];
        shape = 'petal';
      } else if (this.trailType === 'kumkum') {
        colors = ['#d62828', '#ff6b1a', '#ffbe53'];
        shape = 'spark';
      } else if (this.trailType === 'diya') {
        colors = ['#ffbe53', '#ff6b1a', '#ffffff'];
        shape = 'circle';
      }
      this.game.particles.spawn(proj.x + (Math.random() - 0.5) * 16, proj.y - 10, 2, {
        colors: colors,
        shape: shape,
        minSpeed: 0.5,
        maxSpeed: 2.0,
        minSize: 2,
        maxSize: 5,
        minDecay: 0.03,
        maxDecay: 0.05
      });
    }
  }

  render(ctx) {
    const proj = this.game.perspective.project(this.currentLaneX, this.jumpY * 1.5, 0);
    const px = proj.x;
    const py = proj.y;
    const scale = proj.scale;

    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(px, py);

    // Ground Shadow
    const shadowScale = Math.max(0.3, 1.0 - (this.jumpY / 80));
    ctx.save();
    ctx.scale(scale * shadowScale, scale * shadowScale * 0.4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, (this.jumpY * 1.5) / (shadowScale * 0.4), 38, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.scale(scale, scale);

    const targetX = this.lane - 1;
    const laneTilt = (targetX - this.currentLaneX) * 0.22;
    ctx.rotate(laneTilt);

    const runBounce = this.isJumping ? 0 : Math.sin(this.runCycle) * 3.5;
    const legAngle = this.isJumping ? 0.35 : Math.sin(this.runCycle) * 0.65;

    if (this.isSliding) {
      // Sliding Posture
      ctx.fillStyle = 'rgba(255, 209, 82, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-10, -8, 40, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff8426';
      ctx.beginPath();
      ctx.ellipse(-15, -18, 26, 12, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff7eb';
      ctx.beginPath();
      ctx.ellipse(12, -26, 24, 14, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(12, -26, 15, 0, Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(28, -36, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d62828';
      ctx.beginPath();
      ctx.arc(28, -42, 11, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      ctx.moveTo(34, -48);
      ctx.lineTo(39, -56);
      ctx.lineTo(31, -48);
      ctx.fill();

    } else {
      // Running Posture
      ctx.save();
      ctx.translate(0, -32 + runBounce);

      // Left Leg
      ctx.save();
      ctx.rotate(legAngle);
      ctx.fillStyle = '#ff6b1a';
      ctx.beginPath();
      ctx.roundRect(-16, 0, 12, 32, 6);
      ctx.fill();
      ctx.fillStyle = '#ffd152';
      ctx.fillRect(-16, 26, 12, 6);
      ctx.fillStyle = '#7a3e1d';
      ctx.fillRect(-18, 30, 16, 6);
      ctx.restore();

      // Right Leg
      ctx.save();
      ctx.rotate(-legAngle);
      ctx.fillStyle = '#e85d04';
      ctx.beginPath();
      ctx.roundRect(4, 0, 12, 32, 6);
      ctx.fill();
      ctx.fillStyle = '#ffd152';
      ctx.fillRect(4, 26, 12, 6);
      ctx.fillStyle = '#7a3e1d';
      ctx.fillRect(4, 30, 16, 6);
      ctx.restore();

      ctx.restore();

      // Torso
      ctx.save();
      ctx.translate(0, -68 + runBounce);

      // Fluttering Sash
      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      const sashWave = Math.sin(this.runCycle * 1.5) * 8;
      ctx.moveTo(-16, 8);
      ctx.quadraticCurveTo(-34 + sashWave, 24, -28 + sashWave, 42);
      ctx.lineTo(-20 + sashWave, 40);
      ctx.quadraticCurveTo(-26 + sashWave, 22, -10, 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff7eb';
      ctx.beginPath();
      ctx.roundRect(-18, -4, 36, 42, [8, 8, 4, 4]);
      ctx.fill();

      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(0, 36);
      ctx.stroke();

      ctx.fillStyle = '#d62828';
      ctx.beginPath();
      ctx.arc(0, 8, 2.5, 0, Math.PI * 2);
      ctx.arc(0, 18, 2.5, 0, Math.PI * 2);
      ctx.arc(0, 28, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      const armAngle = -legAngle * 0.8;
      ctx.save();
      ctx.translate(-18, 2);
      ctx.rotate(armAngle);
      ctx.fillStyle = '#fff7eb';
      ctx.fillRect(-4, 0, 8, 24);
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(0, 26, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(18, 2);
      ctx.rotate(-armAngle);
      ctx.fillStyle = '#fff7eb';
      ctx.fillRect(-4, 0, 8, 24);
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(0, 26, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffba08';
      ctx.beginPath();
      ctx.arc(2, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head & Turban
      ctx.translate(0, -16);
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d62828';
      ctx.fillRect(-1.5, -6, 3, 7);
      ctx.fillStyle = '#ffd152';
      ctx.fillRect(-1, -1, 2, 2);

      ctx.fillStyle = '#ff6b1a';
      ctx.beginPath();
      ctx.arc(0, -5, 14, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d62828';
      ctx.beginPath();
      ctx.ellipse(0, -7, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(4, -22);
      ctx.lineTo(-4, -22);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Power-Up Auras
    if (this.game.powerUps.hasShield) {
      const shieldPulse = Math.sin(Date.now() * 0.008) * 4;
      ctx.save();
      ctx.translate(0, -50);
      ctx.strokeStyle = 'rgba(255, 209, 82, 0.85)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffd152';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, 48 + shieldPulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 209, 82, 0.15)';
      ctx.fill();

      for (let m = 0; m < 8; m++) {
        const rad = (m * Math.PI) / 4 + (Date.now() * 0.002);
        const sx = Math.cos(rad) * (48 + shieldPulse);
        const sy = Math.sin(rad) * (48 + shieldPulse);
        ctx.fillStyle = '#ffd152';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (this.game.powerUps.isMagnetActive) {
      ctx.save();
      ctx.translate(0, -50);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const waveOffset = (Date.now() * 0.05) % 24;
      ctx.arc(0, 0, 36 + waveOffset, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 48 + waveOffset, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();
    }

    if (this.game.powerUps.isBoostActive) {
      ctx.save();
      ctx.translate(0, -50);
      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff6b1a';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(0, 0, 54, 70, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

// ----------------------------------------------------------------------------
// 6. OBSTACLE MANAGER (Fair Spawner & 5 Distinct Types)
// ----------------------------------------------------------------------------
class ObstacleManager {
  constructor(game) {
    this.game = game;
    this.obstacles = [];
    this.spawnDistanceCounter = 0;
    this.minWaveGap = 210;
  }

  reset() {
    this.obstacles = [];
    this.spawnDistanceCounter = 0;
  }

  update(dt) {
    const moveDist = this.game.speed * dt;
    this.spawnDistanceCounter += moveDist;

    if (this.game.state === 'DESTINATION_CELEBRATION') {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        this.obstacles[i].z -= moveDist;
        if (this.obstacles[i].z < -60) this.obstacles.splice(i, 1);
      }
      return;
    }

    const currentWaveGap = this.minWaveGap + (this.game.speed - CONFIG.BASE_SPEED) * 0.55;
    if (this.spawnDistanceCounter >= currentWaveGap) {
      this.spawnDistanceCounter = 0;
      this.spawnWave();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.z -= moveDist;

      if (!obs.nearMissChecked && obs.z < 0 && obs.z > -40) {
        obs.nearMissChecked = true;
        const laneDiff = Math.abs(this.game.player.currentLaneX - (obs.lane - 1));
        if (laneDiff < 0.85 && !obs.hit) {
          this.game.triggerNearMiss(obs);
        }
      }

      if (obs.z < -60) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  spawnWave() {
    const obstacleTypes = ['BARRICADE', 'DHOL', 'TORAN', 'CRATES', 'CART'];
    const safeLane = Math.floor(Math.random() * 3);

    const allowTwo = this.game.distance > 400 && Math.random() < 0.45;
    const occupiedLanes = [];

    for (let lane = 0; lane < 3; lane++) {
      if (lane !== safeLane) {
        if (!allowTwo && occupiedLanes.length >= 1) break;
        occupiedLanes.push(lane);
      }
    }

    occupiedLanes.forEach(lane => {
      let type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      if (type === 'TORAN' && this.game.distance < 300) {
        type = 'BARRICADE';
      }

      this.obstacles.push({
        type: type,
        lane: lane,
        z: CONFIG.ROAD_LENGTH,
        hit: false,
        nearMissChecked: false,
        baseWidth: 64,
        baseHeight: type === 'TORAN' ? 85 : 55
      });
    });
  }

  render(ctx) {
    const sorted = [...this.obstacles].sort((a, b) => b.z - a.z);

    sorted.forEach(obs => {
      const laneX = obs.lane - 1;
      const proj = this.game.perspective.project(laneX, 0, obs.z);
      const scale = proj.scale;
      const x = proj.x;
      const y = proj.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      switch (obs.type) {
        case 'BARRICADE':
          this.renderBarricade(ctx);
          break;
        case 'DHOL':
          this.renderDhol(ctx);
          break;
        case 'TORAN':
          this.renderToran(ctx);
          break;
        case 'CRATES':
          this.renderCrates(ctx);
          break;
        case 'CART':
          this.renderCart(ctx);
          break;
      }
      ctx.restore();
    });
  }

  renderBarricade(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#92400e';
    ctx.fillRect(-34, -48, 68, 12);
    ctx.fillRect(-34, -28, 68, 10);

    ctx.fillStyle = '#ffba08';
    for (let g = -30; g <= 30; g += 10) {
      ctx.beginPath();
      ctx.arc(g, -48, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#78350f';
    ctx.fillRect(-28, -48, 8, 48);
    ctx.fillRect(20, -48, 8, 48);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-18, -48); ctx.lineTo(-10, -48); ctx.lineTo(-20, -36); ctx.lineTo(-28, -36); ctx.fill();
    ctx.moveTo(6, -48); ctx.lineTo(14, -48); ctx.lineTo(4, -36); ctx.lineTo(-4, -36); ctx.fill();
  }

  renderDhol(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5c2c16';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-24, 0); ctx.lineTo(-14, -24); ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0); ctx.lineTo(14, -24); ctx.lineTo(24, 0);
    ctx.stroke();

    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.ellipse(0, -34, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(-26, -34, 6, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(26, -34, 6, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffd152';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24, -46); ctx.lineTo(24, -22);
    ctx.moveTo(-24, -22); ctx.lineTo(24, -46);
    ctx.stroke();

    ctx.strokeStyle = '#ff6b1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -54); ctx.lineTo(10, -38);
    ctx.stroke();
  }

  renderToran(ctx) {
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-38, -125, 8, 125);
    ctx.fillRect(30, -125, 8, 125);

    ctx.fillStyle = '#d62828';
    ctx.fillRect(-42, -125, 84, 14);

    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -125, 14, Math.PI, Math.PI * 2);
    ctx.fill();

    const hangingY = -110;
    ctx.fillStyle = '#ffba08';
    for (let m = -34; m <= 34; m += 12) {
      ctx.beginPath();
      ctx.arc(m, hangingY + Math.sin(m * 0.2) * 6, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(m, hangingY + 6);
      ctx.lineTo(m + 4, hangingY + 22);
      ctx.lineTo(m - 4, hangingY + 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffba08';
    }

    ctx.fillStyle = 'rgba(214, 40, 40, 0.9)';
    ctx.fillRect(-22, -88, 44, 14);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▼ SLIDE', 0, -77);
  }

  renderCrates(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.fillRect(-28, -32, 28, 32);
    ctx.fillRect(0, -24, 28, 24);

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(-14, -36, 6, 0, Math.PI * 2);
    ctx.arc(-6, -34, 5, 0, Math.PI * 2);
    ctx.arc(14, -28, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(-18, -34, 4, 0, Math.PI * 2);
    ctx.arc(8, -26, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  renderCart(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(-26, -12, 12, 0, Math.PI * 2);
    ctx.arc(26, -12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(-26, -12, 4, 0, Math.PI * 2);
    ctx.arc(26, -12, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b45309';
    ctx.fillRect(-34, -38, 68, 26);

    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.moveTo(-38, -38);
    ctx.lineTo(0, -56);
    ctx.lineTo(38, -38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -56, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ----------------------------------------------------------------------------
// 7. COLLECTIBLE MANAGER (Glowing Modaks, Coins & Trails)
// ----------------------------------------------------------------------------
class CollectibleManager {
  constructor(game) {
    this.game = game;
    this.items = [];
    this.spawnTimer = 0;
  }

  reset() {
    this.items = [];
    this.spawnTimer = 0;
  }

  update(dt) {
    const moveDist = this.game.speed * dt;
    this.spawnTimer += moveDist;

    if (this.spawnTimer >= 140) {
      this.spawnTimer = 0;
      this.spawnPattern();
    }

    const isMagnet = this.game.powerUps.isMagnetActive;
    const playerX = this.game.player.currentLaneX;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.z -= moveDist;

      if (isMagnet && item.type === 'MODAK' && item.z < 320 && item.z > -20) {
        const targetLaneX = playerX;
        item.laneX += (targetLaneX - item.laneX) * Math.min(1.0, 10 * dt);
      }

      if (!item.collected && Math.abs(item.z) < 28) {
        const laneDiff = Math.abs(this.game.player.currentLaneX - item.laneX);
        const playerJump = this.game.player.jumpY;

        const isHeightMatch = (item.worldY === 0 && playerJump < 30) ||
                              (item.worldY > 20 && playerJump >= 18);

        if (laneDiff < 0.65 && isHeightMatch) {
          item.collected = true;
          this.game.collectItem(item);
        }
      }

      if (item.z < -40 || item.collected) {
        this.items.splice(i, 1);
      }
    }
  }

  spawnPattern() {
    const patterns = ['STRAIGHT', 'ZIGZAG', 'ARC', 'COIN_TRAIL'];
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    const baseLane = Math.floor(Math.random() * 3) - 1;

    if (p === 'STRAIGHT') {
      for (let k = 0; k < 4; k++) {
        this.items.push({
          type: 'MODAK',
          laneX: baseLane,
          worldY: 0,
          z: CONFIG.ROAD_LENGTH + k * 45,
          collected: false
        });
      }
    } else if (p === 'ZIGZAG') {
      for (let k = 0; k < 3; k++) {
        const lane = Math.max(-1, Math.min(1, baseLane + (k % 2 === 0 ? -1 : 1)));
        this.items.push({
          type: 'MODAK',
          laneX: lane,
          worldY: 0,
          z: CONFIG.ROAD_LENGTH + k * 50,
          collected: false
        });
      }
    } else if (p === 'ARC') {
      for (let k = 0; k < 4; k++) {
        const jumpElevation = Math.sin((k / 3) * Math.PI) * 48;
        this.items.push({
          type: 'MODAK',
          laneX: baseLane,
          worldY: jumpElevation,
          z: CONFIG.ROAD_LENGTH + k * 38,
          collected: false
        });
      }
    } else if (p === 'COIN_TRAIL') {
      for (let k = 0; k < 3; k++) {
        this.items.push({
          type: 'COIN',
          laneX: baseLane,
          worldY: 0,
          z: CONFIG.ROAD_LENGTH + k * 40,
          collected: false
        });
      }
    }
  }

  render(ctx) {
    const sorted = [...this.items].sort((a, b) => b.z - a.z);

    sorted.forEach(item => {
      const proj = this.game.perspective.project(item.laneX, item.worldY, item.z);
      const scale = proj.scale;
      const x = proj.x;
      const y = proj.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      const bobbing = Math.sin(Date.now() * 0.006 + item.z * 0.05) * 6;
      ctx.translate(0, bobbing - 20);

      if (item.type === 'MODAK') {
        this.renderModak(ctx);
      } else {
        this.renderCoin(ctx);
      }
      ctx.restore();
    });
  }

  renderModak(ctx) {
    const pulse = Math.sin(Date.now() * 0.008) * 3;
    ctx.shadowColor = '#ffd152';
    ctx.shadowBlur = 12 + pulse;

    ctx.fillStyle = '#fff7eb';
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.bezierCurveTo(16, -14, 20, 10, 0, 16);
    ctx.bezierCurveTo(-20, 10, -16, -14, 0, -26);
    ctx.fill();

    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -24); ctx.lineTo(0, 14);
    ctx.moveTo(-2, -22); ctx.quadraticCurveTo(-10, 0, -6, 12);
    ctx.moveTo(2, -22); ctx.quadraticCurveTo(10, 0, 6, 12);
    ctx.stroke();

    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -26, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderCoin(ctx) {
    const spin = Math.cos(Date.now() * 0.007);
    ctx.scale(spin, 1);

    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ॐ', 0, 0);
  }
}

// ----------------------------------------------------------------------------
// 8. POWER-UP MANAGER (6 Distinct Power-Ups & Timers)
// ----------------------------------------------------------------------------
class PowerUpManager {
  constructor(game) {
    this.game = game;
    this.tokens = [];
    this.spawnTimer = 0;

    this.hasShield = false;
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.isBoostActive = false;
    this.boostTimer = 0;
    this.isDoubleScore = false;
    this.doubleScoreTimer = 0;
    this.isSlowTime = false;
    this.slowTimeTimer = 0;
  }

  reset() {
    this.tokens = [];
    this.spawnTimer = 0;
    this.hasShield = false;
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.isBoostActive = false;
    this.boostTimer = 0;
    this.isDoubleScore = false;
    this.doubleScoreTimer = 0;
    this.isSlowTime = false;
    this.slowTimeTimer = 0;
    this.updateHUD();
  }

  update(dt) {
    const moveDist = this.game.speed * dt;
    this.spawnTimer += moveDist;

    if (this.spawnTimer >= 320) {
      this.spawnTimer = 0;
      this.spawnToken();
    }

    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const tok = this.tokens[i];
      tok.z -= moveDist;

      if (Math.abs(tok.z) < 26) {
        const laneDiff = Math.abs(this.game.player.currentLaneX - (tok.lane - 1));
        if (laneDiff < 0.65) {
          this.activate(tok.type);
          this.tokens.splice(i, 1);
          continue;
        }
      }

      if (tok.z < -40) {
        this.tokens.splice(i, 1);
      }
    }

    let hudNeedsUpdate = false;

    if (this.isMagnetActive) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.isMagnetActive = false;
        hudNeedsUpdate = true;
      }
    }

    if (this.isBoostActive) {
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) {
        this.isBoostActive = false;
        hudNeedsUpdate = true;
      }
    }

    if (this.isDoubleScore) {
      this.doubleScoreTimer -= dt;
      if (this.doubleScoreTimer <= 0) {
        this.isDoubleScore = false;
        hudNeedsUpdate = true;
      }
    }

    if (this.isSlowTime) {
      this.slowTimeTimer -= dt;
      if (this.slowTimeTimer <= 0) {
        this.isSlowTime = false;
        hudNeedsUpdate = true;
      }
    }

    if (hudNeedsUpdate) {
      this.updateHUD();
    }
  }

  spawnToken() {
    const types = ['SHIELD', 'MAGNET', 'BOOST', 'DOUBLE', 'SLOW', 'HEART'];
    const selected = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);

    this.tokens.push({
      type: selected,
      lane: lane,
      z: CONFIG.ROAD_LENGTH
    });
  }

  activate(type) {
    this.game.audio.playPowerUp();
    this.game.showToast(`POWER-UP: ${type}!`);
    this.game.missions.track('POWER_UP');

    switch (type) {
      case 'SHIELD':
        this.hasShield = true;
        break;
      case 'MAGNET':
        this.isMagnetActive = true;
        this.magnetTimer = 12.0;
        break;
      case 'BOOST':
        this.isBoostActive = true;
        this.boostTimer = 6.0;
        break;
      case 'DOUBLE':
        this.isDoubleScore = true;
        this.doubleScoreTimer = 12.0;
        break;
      case 'SLOW':
        this.isSlowTime = true;
        this.slowTimeTimer = 8.0;
        break;
      case 'HEART':
        if (this.game.lives < 3) {
          this.game.lives++;
          this.game.updateLivesHUD();
          this.game.showToast('EXTRA LIFE RESTORED! ❤️');
        }
        break;
    }
    this.updateHUD();
  }

  updateHUD() {
    const container = document.getElementById('hudPowerups');
    if (!container) return;

    let html = '';
    if (this.hasShield) {
      html += `<div class="powerup-pill">🛡️ SHIELD</div>`;
    }
    if (this.isMagnetActive) {
      html += `<div class="powerup-pill">🧲 MAGNET <span class="time-bar"><span class="time-fill" style="width:${(this.magnetTimer / 12) * 100}%"></span></span></div>`;
    }
    if (this.isBoostActive) {
      html += `<div class="powerup-pill">⚡ BOOST <span class="time-bar"><span class="time-fill" style="width:${(this.boostTimer / 6) * 100}%"></span></span></div>`;
    }
    if (this.isDoubleScore) {
      html += `<div class="powerup-pill">⭐ 2X SCORE <span class="time-bar"><span class="time-fill" style="width:${(this.doubleScoreTimer / 12) * 100}%"></span></span></div>`;
    }
    if (this.isSlowTime) {
      html += `<div class="powerup-pill">⏱️ SLOW <span class="time-bar"><span class="time-fill" style="width:${(this.slowTimeTimer / 8) * 100}%"></span></span></div>`;
    }
    container.innerHTML = html;
  }

  render(ctx) {
    this.tokens.forEach(tok => {
      const laneX = tok.lane - 1;
      const proj = this.game.perspective.project(laneX, 10, tok.z);
      const scale = proj.scale;
      const x = proj.x;
      const y = proj.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      const bob = Math.sin(Date.now() * 0.007 + tok.z) * 6;
      ctx.translate(0, bob - 24);

      ctx.shadowColor = '#ffd152';
      ctx.shadowBlur = 16;

      ctx.fillStyle = 'rgba(255, 209, 82, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      let icon = '🛡️';
      if (tok.type === 'MAGNET') icon = '🧲';
      if (tok.type === 'BOOST') icon = '⚡';
      if (tok.type === 'DOUBLE') icon = '⭐';
      if (tok.type === 'SLOW') icon = '⏱️';
      if (tok.type === 'HEART') icon = '❤️';

      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, 0, 2);

      ctx.restore();
    });
  }
}

// ----------------------------------------------------------------------------
// 9. DENSE CINEMATIC FESTIVAL ENVIRONMENT (Streets, Pandals, Crowds, Ganesha)
// ----------------------------------------------------------------------------
class EnvironmentManager {
  constructor(game) {
    this.game = game;
    this.phase = 1; // 1: Sunset, 2: Evening, 3: Night, 4: Ganesha Destination
    this.fireworks = [];
    this.scenery = [];
    this.overheadFestoons = [];

    // Dense roadside festival scenery generation
    this.initScenery();
  }

  initScenery() {
    this.scenery = [];
    this.overheadFestoons = [];

    // Overhead festive festoons spanning across street every 85 units
    for (let z = 50; z < CONFIG.ROAD_LENGTH + 120; z += 85) {
      this.overheadFestoons.push({ z: z });
    }

    // Dense multi-tier roadside scenery:
    // Left & Right sides packed with stalls, pandals, dhol drummers, crowd, banners, lamps
    const types = [
      'STALL_MODAK', 'STALL_FLOWERS', 'DHOL_GROUP', 'CROWD_CHEER',
      'GRAND_PANDAL', 'PANDAL_GATE', 'FESTIVAL_BANNER', 'PEDESTAL_DIYA',
      'KANDIL_LIGHTS', 'FESTIVE_UMBRELLA'
    ];

    let curZ = 30;
    while (curZ < CONFIG.ROAD_LENGTH + 140) {
      // Curbside Foreground item (closer to road)
      const curbType = this.getSceneryTypeForDistance(0, 'FOREGROUND');
      this.scenery.push({
        side: 'LEFT',
        tier: 'FOREGROUND',
        x: -1.75 - Math.random() * 0.2,
        z: curZ,
        type: curbType,
        flip: false
      });
      this.scenery.push({
        side: 'RIGHT',
        tier: 'FOREGROUND',
        x: 1.75 + Math.random() * 0.2,
        z: curZ + 20,
        type: curbType,
        flip: true
      });

      // Midground Streetfront Shop / Pandal (larger, set slightly back)
      const midType = this.getSceneryTypeForDistance(0, 'MIDGROUND');
      this.scenery.push({
        side: 'LEFT',
        tier: 'MIDGROUND',
        x: -2.75 - Math.random() * 0.35,
        z: curZ + 15,
        type: midType,
        flip: false
      });
      this.scenery.push({
        side: 'RIGHT',
        tier: 'MIDGROUND',
        x: 2.75 + Math.random() * 0.35,
        z: curZ + 35,
        type: midType,
        flip: true
      });

      curZ += 48; // Dense 48-unit spacing for a packed festival street!
    }
  }

  // Visual Progression scenery type selector
  getSceneryTypeForDistance(dist, tier) {
    const pct = Math.min(1.0, dist / CONFIG.DESTINATION_DISTANCE);
    if (tier === 'FOREGROUND') {
      if (pct < 0.20) { // 0-20%: Festival Entrance
        const pool = ['PEDESTAL_DIYA', 'FESTIVAL_BANNER', 'CROWD_CHEER', 'PEDESTAL_DIYA'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.40) { // 20-40%: Festival Street
        const pool = ['CROWD_CHEER', 'FESTIVAL_BANNER', 'PEDESTAL_DIYA', 'FESTIVE_UMBRELLA'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.60) { // 40-60%: Dhol Chowk
        const pool = ['DHOL_GROUP', 'DHOL_GROUP', 'CROWD_CHEER', 'FESTIVAL_BANNER'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.80) { // 60-80%: Flower Bazaar
        const pool = ['PEDESTAL_DIYA', 'CROWD_CHEER', 'FESTIVE_UMBRELLA', 'PEDESTAL_DIYA'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.95) { // 80-95%: Grand Festival Night
        const pool = ['PEDESTAL_DIYA', 'CROWD_CHEER', 'DHOL_GROUP', 'PEDESTAL_DIYA'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else { // 95-100%: Ganesha Destination
        const pool = ['PEDESTAL_DIYA', 'PEDESTAL_DIYA', 'CROWD_CHEER', 'FESTIVAL_BANNER'];
        return pool[Math.floor(Math.random() * pool.length)];
      }
    } else { // MIDGROUND
      if (pct < 0.20) { // 0-20%: Festival Entrance
        const pool = ['PANDAL_GATE', 'STALL_MODAK', 'GRAND_PANDAL', 'FESTIVAL_BANNER'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.40) { // 20-40%: Festival Street
        const pool = ['STALL_MODAK', 'STALL_MODAK', 'FESTIVE_UMBRELLA', 'KANDIL_LIGHTS', 'GRAND_PANDAL'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.60) { // 40-60%: Dhol Chowk
        const pool = ['GRAND_PANDAL', 'DHOL_GROUP', 'DHOL_GROUP', 'PANDAL_GATE', 'KANDIL_LIGHTS'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.80) { // 60-80%: Flower Bazaar / Grand Pandal Street
        const pool = ['STALL_FLOWERS', 'STALL_FLOWERS', 'GRAND_PANDAL', 'PANDAL_GATE', 'KANDIL_LIGHTS'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else if (pct < 0.95) { // 80-95%: Grand Festival Night
        const pool = ['GRAND_PANDAL', 'GRAND_PANDAL', 'KANDIL_LIGHTS', 'PANDAL_GATE', 'STALL_FLOWERS'];
        return pool[Math.floor(Math.random() * pool.length)];
      } else { // 95-100%: Ganesha Destination
        const pool = ['GRAND_PANDAL', 'GRAND_PANDAL', 'PANDAL_GATE', 'KANDIL_LIGHTS'];
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  reset() {
    this.phase = 1;
    this.fireworks = [];
    this.initScenery();
  }

  update(dt) {
    const dist = this.game.distance;

    // Progression Phases: Sunset (0-500m) -> Evening (500-1100m) -> Night (1100-1900m) -> Destination (1900m+)
    if (dist < 500) {
      this.phase = 1;
    } else if (dist < 1100) {
      this.phase = 2;
    } else if (dist < 1900) {
      this.phase = 3;
    } else {
      this.phase = 4;
    }

    // Scroll Roadside Scenery with Dynamic Zone Spawning
    const moveDist = this.game.speed * dt;
    const maxZ = CONFIG.ROAD_LENGTH + 120;

    this.scenery.forEach(item => {
      item.z -= moveDist;
      if (item.z < 0) {
        item.z += maxZ;
        item.type = this.getSceneryTypeForDistance(this.game.distance, item.tier);
      }
    });

    this.overheadFestoons.forEach(f => {
      f.z -= moveDist;
      if (f.z < 0) {
        f.z += maxZ;
      }
    });

    // Special Zone Particles (Dhol Chowk & Flower Bazaar)
    const pct = Math.min(1.0, dist / CONFIG.DESTINATION_DISTANCE);
    if (pct >= 0.40 && pct < 0.60 && Math.random() < 0.25) {
      this.game.particles.spawn(Math.random() * this.game.width, Math.random() * (this.game.height * 0.6), 1, {
        colors: ['#ff8426', '#ffd152', '#ff4d6d'],
        shape: 'petal',
        minSpeed: 1.2,
        maxSpeed: 2.8,
        baseVx: 1.5,
        baseVy: 1.0
      });
    } else if (pct >= 0.60 && pct < 0.80 && Math.random() < 0.30) {
      this.game.particles.spawn(Math.random() * this.game.width, Math.random() * (this.game.height * 0.6), 1, {
        colors: ['#f43f5e', '#ff8426', '#ffd152', '#fb7185'],
        shape: 'petal',
        minSpeed: 1.0,
        maxSpeed: 2.5,
        baseVx: 1.4,
        baseVy: 1.1
      });
    }

    // Fireworks in Phase 3 & 4
    if ((this.phase >= 3 || this.game.state === 'DESTINATION_CELEBRATION') && Math.random() < 0.035) {
      this.spawnFirework();
    }

    for (let f = this.fireworks.length - 1; f >= 0; f--) {
      const fw = this.fireworks[f];
      fw.life -= dt;
      if (fw.life <= 0) {
        this.fireworks.splice(f, 1);
      }
    }
  }

  spawnFirework() {
    const x = Math.random() * this.game.width;
    const y = Math.random() * (this.game.height * 0.28);
    const colors = ['#ffd152', '#ff6b1a', '#ff4d6d', '#38bdf8', '#4ade80', '#c084fc'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    this.fireworks.push({
      x: x,
      y: y,
      color: chosenColor,
      life: 1.2,
      maxLife: 1.2,
      radius: 26 + Math.random() * 36
    });

    this.game.particles.spawn(x, y, 22, {
      color: chosenColor,
      minSpeed: 2,
      maxSpeed: 7,
      shape: 'spark'
    });
  }

  // CINEMATIC FESTIVAL SKY
  renderSky(ctx, width, height) {
    const horizon = this.game.perspective.horizonY;
    const grad = ctx.createLinearGradient(0, 0, 0, horizon);

    if (this.phase === 1) {
      // Sunset: Royal Purple -> Crimson -> Fiery Saffron -> Golden Horizon
      grad.addColorStop(0, '#230b38');
      grad.addColorStop(0.35, '#7f1d3d');
      grad.addColorStop(0.70, '#c2410c');
      grad.addColorStop(0.92, '#ea580c');
      grad.addColorStop(1, '#ffba08');
    } else if (this.phase === 2) {
      // Twilight: Amethyst Violet -> Deep Magenta -> Saffron Twilight
      grad.addColorStop(0, '#0f1026');
      grad.addColorStop(0.40, '#2e104d');
      grad.addColorStop(0.75, '#6b1d52');
      grad.addColorStop(1, '#b45309');
    } else {
      // Grand Festival Night: Midnight Indigo -> Deep Sapphire with Celestial Glow
      grad.addColorStop(0, '#03050d');
      grad.addColorStop(0.45, '#070f2b');
      grad.addColorStop(0.85, '#101d4a');
      grad.addColorStop(1, '#1e295d');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, horizon + 2);

    // Sun / Moon with Atmospheric Halo
    if (this.phase === 1) {
      // Radiant Setting Sun casting volumetric glow
      const sunX = width * 0.72;
      const sunY = horizon * 0.65;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 140);
      sunGlow.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
      sunGlow.addColorStop(0.35, 'rgba(255, 130, 30, 0.55)');
      sunGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Glowing Full Moon with Luminous Aura
      const moonX = width * 0.8;
      const moonY = horizon * 0.42;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 90);
      moonGlow.addColorStop(0, 'rgba(255, 245, 210, 0.8)');
      moonGlow.addColorStop(0.4, 'rgba(255, 209, 82, 0.25)');
      moonGlow.addColorStop(1, 'rgba(255, 209, 82, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fffdf0';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Ambient Twinkling Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let s = 0; s < 45; s++) {
        const sx = (s * 137.5) % width;
        const sy = (s * 73.1) % (horizon * 0.85);
        const sz = (s % 3 === 0) ? 2.0 : 1.2;
        ctx.fillRect(sx, sy, sz, sz);
      }
    }

    // Fireworks
    this.fireworks.forEach(fw => {
      const progress = 1 - (fw.life / fw.maxLife);
      ctx.save();
      ctx.strokeStyle = fw.color;
      ctx.globalAlpha = 1 - progress;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = fw.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.radius * progress, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Parallax Silhouettes of Temples and City Skyline
    this.renderParallaxSilhouettes(ctx, width, horizon);

    // EARLY VISIBLE GANESHA DESTINATION ON HORIZON
    this.renderHorizonGaneshaDestination(ctx, width, horizon);
  }

  renderParallaxSilhouettes(ctx, width, horizon) {
    const scrollOffset = (this.game.distance * 0.15) % 400;

    ctx.fillStyle = this.phase === 1 ? '#451228' : '#050816';
    ctx.beginPath();
    ctx.moveTo(0, horizon);

    for (let x = -scrollOffset; x < width + 400; x += 120) {
      ctx.lineTo(x, horizon);
      ctx.lineTo(x + 20, horizon - 28);
      ctx.lineTo(x + 35, horizon - 62);
      ctx.lineTo(x + 50, horizon - 28);
      ctx.lineTo(x + 75, horizon - 18);
      ctx.lineTo(x + 105, horizon);
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();

    // Saffron Festival Flags on spires
    ctx.fillStyle = '#ff6b1a';
    for (let x = -scrollOffset; x < width + 400; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x + 35, horizon - 62);
      ctx.lineTo(x + 48, horizon - 56);
      ctx.lineTo(x + 35, horizon - 50);
      ctx.closePath();
      ctx.fill();
    }
  }

  // MAGNIFICENT GANESHA DESTINATION ON THE HORIZON
  renderHorizonGaneshaDestination(ctx, width, horizon) {
    const dist = this.game.distance;
    const progress = Math.min(1.0, dist / CONFIG.DESTINATION_DISTANCE);
    const centerX = width * 0.5;

    // Scales from distant sacred beacon to colossal glowing temple sanctum
    const scale = 0.25 + Math.pow(progress, 1.4) * 1.35;
    const ganeshaY = horizon - 28 * scale;

    ctx.save();
    ctx.translate(centerX, ganeshaY);
    ctx.scale(scale, scale);

    // Divine Golden Halo (Prabhavali) with Rotating Rays
    const pulse = Math.sin(Date.now() * 0.005) * 8;
    const haloRadius = 60 + pulse;

    const haloGlow = ctx.createRadialGradient(0, -60, 20, 0, -60, haloRadius * 1.8);
    haloGlow.addColorStop(0, 'rgba(255, 230, 120, 0.95)');
    haloGlow.addColorStop(0.4, 'rgba(255, 140, 20, 0.5)');
    haloGlow.addColorStop(1, 'rgba(255, 100, 10, 0)');
    ctx.fillStyle = haloGlow;
    ctx.beginPath();
    ctx.arc(0, -60, haloRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Prabhavali Sunburst Rays
    ctx.strokeStyle = 'rgba(255, 209, 82, 0.75)';
    ctx.lineWidth = 2.5;
    const rayRot = Date.now() * 0.001;
    for (let r = 0; r < 16; r++) {
      const angle = (r * Math.PI) / 8 + rayRot;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (haloRadius * 0.7), -60 + Math.sin(angle) * (haloRadius * 0.7));
      ctx.lineTo(Math.cos(angle) * (haloRadius * 1.3), -60 + Math.sin(angle) * (haloRadius * 1.3));
      ctx.stroke();
    }

    // Grand Multi-Tier Temple Pandal Architecture
    ctx.fillStyle = '#7f1d1d'; // Crimson temple base
    ctx.beginPath();
    ctx.moveTo(-110, 25);
    ctx.lineTo(-90, -110);
    ctx.lineTo(0, -165); // Towering Shikhara pinnacle
    ctx.lineTo(90, -110);
    ctx.lineTo(110, 25);
    ctx.closePath();
    ctx.fill();

    // Golden Kalash Finials & Temple Spire
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -168, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-3, -185, 6, 18);

    // Carved Golden Pandal Columns
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-95, -100, 12, 125);
    ctx.fillRect(83, -100, 12, 125);

    // Ornate Royal Canopy Fabric
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-95, -95);
    ctx.quadraticCurveTo(0, -125, 95, -95);
    ctx.lineTo(90, -85);
    ctx.quadraticCurveTo(0, -115, -90, -85);
    ctx.closePath();
    ctx.fill();

    // ========================================
    // MAJESTIC LORD GANESHA IDOL
    // ========================================
    // 1. Royal Golden Mukut (Jeweled Crown)
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.moveTo(-22, -88);
    ctx.lineTo(0, -125);
    ctx.lineTo(22, -88);
    ctx.closePath();
    ctx.fill();

    // Ruby on Crown
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -102, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. Head & Large Fan-Like Ears
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -70, 25, 0, Math.PI * 2);
    ctx.fill();

    // Left & Right Ears with Kundal Ornaments
    ctx.beginPath();
    ctx.arc(-34, -70, 18, 0, Math.PI * 2);
    ctx.arc(34, -70, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-42, -62, 5, 0, Math.PI * 2);
    ctx.arc(42, -62, 5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Sacred Chandan Tilak & Trinetra on Forehead
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-2, -82, 4, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, -78, 12, 2.5);

    // 4. Curved Elephant Trunk holding Golden Modak
    ctx.strokeStyle = '#ffd152';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -62);
    ctx.quadraticCurveTo(12, -38, -10, -28);
    ctx.stroke();

    // Giant Glowing Modak on Trunk
    ctx.fillStyle = '#fff7eb';
    ctx.shadowColor = '#ffd152';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-12, -28, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Divine Seated Body in Saffron Pitambar
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, -15, 42, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marigold Varmala Garland draped on chest
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, -32, 24, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 6. Blessing Hand (Abhaya Mudra) radiating light
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(-36, -24, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // PERSPECTIVE ROAD, SIDEWALKS, CURBS & RICH SCENERY
  renderRoad(ctx) {
    const persp = this.game.perspective;
    const width = persp.width;
    const horizon = persp.horizonY;
    const groundBase = persp.groundBaseY;

    // 1. Sidewalk Stone Pavements extending beyond the road
    const pFarLeftWalk = persp.project(-3.6, 0, CONFIG.ROAD_LENGTH);
    const pFarRightWalk = persp.project(3.6, 0, CONFIG.ROAD_LENGTH);
    const pNearLeftWalk = persp.project(-3.6, 0, 0);
    const pNearRightWalk = persp.project(3.6, 0, 0);

    ctx.save();

    // Stone Sidewalk Pavement Base
    const walkGrad = ctx.createLinearGradient(0, horizon, 0, groundBase);
    walkGrad.addColorStop(0, '#151726');
    walkGrad.addColorStop(1, '#252136');
    ctx.fillStyle = walkGrad;

    // Left Sidewalk
    ctx.beginPath();
    ctx.moveTo(pFarLeftWalk.x, pFarLeftWalk.y);
    const pFarRoadL = persp.project(-1.5, 0, CONFIG.ROAD_LENGTH);
    ctx.lineTo(pFarRoadL.x, pFarRoadL.y);
    const pNearRoadL = persp.project(-1.5, 0, 0);
    ctx.lineTo(pNearRoadL.x, pNearRoadL.y);
    ctx.lineTo(pNearLeftWalk.x, pNearLeftWalk.y);
    ctx.closePath();
    ctx.fill();

    // Right Sidewalk
    ctx.beginPath();
    const pFarRoadR = persp.project(1.5, 0, CONFIG.ROAD_LENGTH);
    ctx.moveTo(pFarRoadR.x, pFarRoadR.y);
    ctx.lineTo(pFarRightWalk.x, pFarRightWalk.y);
    ctx.lineTo(pNearRightWalk.x, pNearRightWalk.y);
    const pNearRoadR = persp.project(1.5, 0, 0);
    ctx.lineTo(pNearRoadR.x, pNearRoadR.y);
    ctx.closePath();
    ctx.fill();

    // 2. Asphalt Road Surface with Warm Golden Ambient Reflections
    const roadGrad = ctx.createLinearGradient(0, horizon, 0, groundBase);
    roadGrad.addColorStop(0, '#181b2e');
    roadGrad.addColorStop(0.5, '#23253b');
    roadGrad.addColorStop(1, '#2c2e47');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(pFarRoadL.x, pFarRoadL.y);
    ctx.lineTo(pFarRoadR.x, pFarRoadR.y);
    ctx.lineTo(pNearRoadR.x, pNearRoadR.y);
    ctx.lineTo(pNearRoadL.x, pNearRoadL.y);
    ctx.closePath();
    ctx.fill();

    // 3. Glowing Illuminated Curbs with Alternating Saffron & Gold Segments
    const segments = 24;
    const speedOffset = (this.game.distance * 1.8) % 100;

    for (let s = 0; s < segments; s++) {
      const z1 = Math.pow(s / segments, 1.8) * CONFIG.ROAD_LENGTH;
      const z2 = Math.pow((s + 1) / segments, 1.8) * CONFIG.ROAD_LENGTH;

      const pL1 = persp.project(-1.5, 0, z1);
      const pL2 = persp.project(-1.5, 0, z2);
      const pR1 = persp.project(1.5, 0, z1);
      const pR2 = persp.project(1.5, 0, z2);

      const isAlt = (s + Math.floor(speedOffset * 0.1)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#ff6b1a' : '#ffd152';

      // Left Illuminated Curb
      ctx.beginPath();
      ctx.moveTo(pL1.x, pL1.y);
      ctx.lineTo(pL2.x, pL2.y);
      ctx.lineTo(pL2.x - 9 * pL2.scale, pL2.y);
      ctx.lineTo(pL1.x - 9 * pL1.scale, pL1.y);
      ctx.closePath();
      ctx.fill();

      // Right Illuminated Curb
      ctx.beginPath();
      ctx.moveTo(pR1.x, pR1.y);
      ctx.lineTo(pR2.x, pR2.y);
      ctx.lineTo(pR2.x + 9 * pR2.scale, pR2.y);
      ctx.lineTo(pR1.x + 9 * pR1.scale, pR1.y);
      ctx.closePath();
      ctx.fill();

      // Curb Flower Petal Sprinkles & Side Diyas
      if (s % 3 === 0 && pL1.scale > 0.08) {
        ctx.fillStyle = '#ff8426';
        ctx.beginPath();
        ctx.arc(pL1.x + 4 * pL1.scale, pL1.y - 2 * pL1.scale, 2.5 * pL1.scale, 0, Math.PI * 2);
        ctx.arc(pR1.x - 4 * pR1.scale, pR1.y - 2 * pR1.scale, 2.5 * pR1.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Small glowing clay diyas placed along curbs
      if (s % 4 === 1 && pL1.scale > 0.1) {
        // Left diya
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(pL1.x - 5 * pL1.scale, pL1.y - 2 * pL1.scale, 5 * pL1.scale, 2.5 * pL1.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd152';
        ctx.beginPath();
        ctx.arc(pL1.x - 5 * pL1.scale, pL1.y - 5 * pL1.scale, 2 * pL1.scale, 0, Math.PI * 2);
        ctx.fill();

        // Right diya
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(pR1.x + 5 * pR1.scale, pR1.y - 2 * pR1.scale, 5 * pR1.scale, 2.5 * pR1.scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd152';
        ctx.beginPath();
        ctx.arc(pR1.x + 5 * pR1.scale, pR1.y - 5 * pR1.scale, 2 * pR1.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sacred Rangoli / Kolam Mandalas on Sidewalk Pavements
      if (s % 6 === 2 && pL1.scale > 0.12) {
        const rScale = pL1.scale;
        const rangoliRadius = 14 * rScale;

        // Left Sidewalk Rangoli
        const rangoliLX = pL1.x - 18 * rScale;
        const rangoliLY = pL1.y;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(rangoliLX, rangoliLY, rangoliRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 107, 26, 0.6)';
        ctx.beginPath();
        ctx.arc(rangoliLX, rangoliLY, rangoliRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 209, 82, 0.8)';
        ctx.beginPath();
        ctx.arc(rangoliLX, rangoliLY, rangoliRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Right Sidewalk Rangoli
        const rangoliRX = pR1.x + 18 * rScale;
        const rangoliRY = pR1.y;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(rangoliRX, rangoliRY, rangoliRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 107, 26, 0.6)';
        ctx.beginPath();
        ctx.arc(rangoliRX, rangoliRY, rangoliRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 209, 82, 0.8)';
        ctx.beginPath();
        ctx.arc(rangoliRX, rangoliRY, rangoliRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Moving Lane Dividers with Warm Golden Rim
    ctx.strokeStyle = '#fff7eb';
    const dashLength = 50;
    const dashGap = 50;
    const dashScroll = (this.game.distance * 3) % (dashLength + dashGap);

    for (let dZ = -dashScroll; dZ < CONFIG.ROAD_LENGTH; dZ += dashLength + dashGap) {
      if (dZ < 0) continue;
      const zStart = dZ;
      const zEnd = Math.min(CONFIG.ROAD_LENGTH, dZ + dashLength);

      const pDiv1Start = persp.project(-0.5, 0, zStart);
      const pDiv1End = persp.project(-0.5, 0, zEnd);
      ctx.lineWidth = Math.max(1, 4.0 * pDiv1Start.scale);
      ctx.beginPath();
      ctx.moveTo(pDiv1Start.x, pDiv1Start.y);
      ctx.lineTo(pDiv1End.x, pDiv1End.y);
      ctx.stroke();

      const pDiv2Start = persp.project(0.5, 0, zStart);
      const pDiv2End = persp.project(0.5, 0, zEnd);
      ctx.beginPath();
      ctx.moveTo(pDiv2Start.x, pDiv2Start.y);
      ctx.lineTo(pDiv2End.x, pDiv2End.y);
      ctx.stroke();
    }

    // 5. Render Overhead Light Festoons Spanning across the Road
    this.renderOverheadFestoons(ctx);

    // 6. Render Dense Roadside Scenery (Sorted Back-to-Front)
    this.renderRoadsideScenery(ctx);

    ctx.restore();
  }

  // OVERHEAD FESTIVE LIGHT FESTOONS (Connecting left and right sides)
  renderOverheadFestoons(ctx) {
    const persp = this.game.perspective;
    const sorted = [...this.overheadFestoons].sort((a, b) => b.z - a.z);

    sorted.forEach(f => {
      const pL = persp.project(-1.75, 75, f.z);
      const pR = persp.project(1.75, 75, f.z);
      const pMid = persp.project(0, 55, f.z);
      const scale = pMid.scale;
      if (scale <= 0.05) return;

      ctx.save();
      // Sagging Catenary Garland string
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = Math.max(1.5, 3 * scale);
      ctx.beginPath();
      ctx.moveTo(pL.x, pL.y);
      ctx.quadraticCurveTo(pMid.x, pMid.y, pR.x, pR.y);
      ctx.stroke();

      // Hanging Marigold Beads & Fairy Lights
      const lightCount = 7;
      for (let i = 1; i < lightCount; i++) {
        const t = i / lightCount;
        const lx = (1 - t) * (1 - t) * pL.x + 2 * (1 - t) * t * pMid.x + t * t * pR.x;
        const ly = (1 - t) * (1 - t) * pL.y + 2 * (1 - t) * t * pMid.y + t * t * pR.y;

        // Glowing Fairy Light dot
        const color = (i % 2 === 0) ? '#ffd152' : '#ff6b1a';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lx, ly, Math.max(1.5, 4 * scale), 0, Math.PI * 2);
        ctx.fill();

        // Hanging Mango leaf / flower tassel
        if (scale > 0.12 && i % 2 === 1) {
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + 2 * scale, ly + 8 * scale);
          ctx.lineTo(lx - 2 * scale, ly + 8 * scale);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Center Star Kandil hanging overhead
      if (scale > 0.14) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(pMid.x, pMid.y + 2 * scale);
        ctx.lineTo(pMid.x + 6 * scale, pMid.y + 10 * scale);
        ctx.lineTo(pMid.x, pMid.y + 18 * scale);
        ctx.lineTo(pMid.x - 6 * scale, pMid.y + 10 * scale);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // DENSE ROADSIDE SCENERY RENDERER
  renderRoadsideScenery(ctx) {
    const persp = this.game.perspective;
    const sorted = [...this.scenery].sort((a, b) => b.z - a.z);

    sorted.forEach(item => {
      const proj = persp.project(item.x, 0, item.z);
      const scale = proj.scale;
      if (scale <= 0.04) return;

      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.scale(scale * (item.flip ? -1 : 1), scale);

      switch (item.type) {
        case 'STALL_MODAK':
          this.renderModakStall(ctx);
          break;
        case 'STALL_FLOWERS':
          this.renderFlowerStall(ctx);
          break;
        case 'DHOL_GROUP':
          this.renderDholGroup(ctx);
          break;
        case 'CROWD_CHEER':
          this.renderCrowdCheer(ctx);
          break;
        case 'GRAND_PANDAL':
          this.renderGrandPandal(ctx);
          break;
        case 'PANDAL_GATE':
          this.renderPandalGate(ctx);
          break;
        case 'FESTIVAL_BANNER':
          this.renderFestivalBanner(ctx);
          break;
        case 'PEDESTAL_DIYA':
          this.renderPedestalDiya(ctx);
          break;
        case 'KANDIL_LIGHTS':
          this.renderKandilLights(ctx);
          break;
        case 'FESTIVE_UMBRELLA':
          this.renderFestiveUmbrella(ctx);
          break;
      }
      ctx.restore();
    });
  }

  // 1. Large Decorated Modak & Mithai Shop
  renderModakStall(ctx) {
    // Warm Interior Glow
    ctx.fillStyle = 'rgba(255, 209, 82, 0.25)';
    ctx.fillRect(-55, -80, 110, 80);

    // Carved Wooden Counter
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-50, -45, 100, 45);

    // Striped Saffron & Gold Awning Canopy
    ctx.fillStyle = '#ff8426';
    ctx.beginPath();
    ctx.moveTo(-60, -82);
    ctx.lineTo(0, -108);
    ctx.lineTo(60, -82);
    ctx.lineTo(55, -68);
    ctx.lineTo(-55, -68);
    ctx.closePath();
    ctx.fill();

    // Yellow Awning Stripes
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-35, -88, 14, 20);
    ctx.fillRect(18, -88, 14, 20);

    // Bamboo Frame Posts
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-56, -82, 6, 82);
    ctx.fillRect(50, -82, 6, 82);

    // Hanging Marigold Garlands on Awning
    ctx.fillStyle = '#ffba08';
    for (let x = -50; x <= 50; x += 12) {
      ctx.beginPath();
      ctx.arc(x, -68, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tiered Brass Platters piled with Modaks
    ctx.fillStyle = '#ffd152'; // Brass thali
    ctx.fillRect(-42, -50, 84, 5);

    ctx.fillStyle = '#fff7eb'; // Modaks
    for (let m = -34; m <= 34; m += 14) {
      ctx.beginPath();
      ctx.moveTo(m, -62);
      ctx.bezierCurveTo(m + 5, -56, m + 6, -50, m, -50);
      ctx.bezierCurveTo(m - 6, -50, m - 5, -56, m, -62);
      ctx.fill();
    }

    // Glowing Signboard: "मोदक भंडार"
    ctx.fillStyle = '#d62828';
    ctx.fillRect(-32, -36, 64, 16);
    ctx.fillStyle = '#ffd152';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('मोदक 🍬', 0, -24);
  }

  // 2. Large Flower Bazaar Stall
  renderFlowerStall(ctx) {
    // Bamboo Stall Frame
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-48, -90, 6, 90);
    ctx.fillRect(42, -90, 6, 90);
    ctx.fillRect(-52, -92, 104, 8);

    // Cascading Marigold Curtains (Hundreds of flowers in dense rows)
    for (let col = -42; col <= 42; col += 10) {
      const isYellow = (col % 20 === 0);
      ctx.fillStyle = isYellow ? '#ffd152' : '#ff8426';
      for (let row = -84; row <= -22; row += 9) {
        ctx.beginPath();
        ctx.arc(col, row, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rose Petal Basket Counter
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-44, -22, 88, 22);

    ctx.fillStyle = '#dc2626'; // Deep Red Rose heaps
    ctx.beginPath();
    ctx.arc(-22, -22, 14, Math.PI, Math.PI * 2);
    ctx.arc(22, -22, 14, Math.PI, Math.PI * 2);
    ctx.fill();

    // Hanging Floral Chandelier
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -96, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Dhol-Tasha Drum Group (Animated arms swinging drumsticks!)
  renderDholGroup(ctx) {
    const beatPhase = Math.sin(Date.now() * 0.015);

    for (let i = 0; i < 2; i++) {
      const dx = (i === 0) ? -20 : 20;

      // Drummer Body
      ctx.fillStyle = '#ff6b1a'; // Saffron kurta
      ctx.fillRect(dx - 10, -56, 20, 36);

      // White silk dhoti
      ctx.fillStyle = '#fff7eb';
      ctx.fillRect(dx - 11, -20, 22, 20);

      // Head & Red Kolhapuri Pagdi
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(dx, -66, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(dx, -72, 10, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd152'; // Gold kalgi
      ctx.fillRect(dx - 2, -80, 4, 8);

      // Dhol Drum slung across chest
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(dx, -36, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Drumsticks beating dynamically in rhythm
      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dx - 10, -48);
      ctx.lineTo(dx - 3, -36 + beatPhase * 8);
      ctx.moveTo(dx + 10, -48);
      ctx.lineTo(dx + 3, -36 - beatPhase * 8);
      ctx.stroke();
    }
  }

  // 4. Cheering Crowd of Festival Devotees
  renderCrowdCheer(ctx) {
    const flagWave = Math.sin(Date.now() * 0.008) * 10;

    // Crowd Silhouettes
    for (let c = -30; c <= 30; c += 15) {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(c, -22, 9, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(c, -48, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Raised cheering arms
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c - 5, -34);
      ctx.lineTo(c - 10, -56);
      ctx.moveTo(c + 5, -34);
      ctx.lineTo(c + 10, -56);
      ctx.stroke();
    }

    // Sacred Saffron Flag held high
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, -86);
    ctx.stroke();

    ctx.fillStyle = '#ff6b1a';
    ctx.beginPath();
    ctx.moveTo(0, -86);
    ctx.lineTo(32 + flagWave, -74);
    ctx.lineTo(0, -62);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Grand Illuminated Festival Pandal (Towering structure)
  renderGrandPandal(ctx) {
    // Multi-tier Pandal Walls & Roof
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-65, -120, 130, 120);

    // Ornate Golden Temple Arch
    ctx.strokeStyle = '#ffd152';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -80, 42, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Tiered Crimson & Gold Shikhara Roof
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-75, -120);
    ctx.lineTo(0, -165);
    ctx.lineTo(75, -120);
    ctx.closePath();
    ctx.fill();

    // Golden Kalash Finial
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -170, 8, 0, Math.PI * 2);
    ctx.fill();

    // Illuminated Fairy Lights along roofline
    const dots = 9;
    for (let d = 0; d < dots; d++) {
      const tx = -68 + (d * 17);
      const ty = -120 - Math.sin((d / (dots - 1)) * Math.PI) * 40;
      ctx.fillStyle = (d % 2 === 0) ? '#ffd152' : '#ff6b1a';
      ctx.beginPath();
      ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Large Ganesha Emblem in Pandal Arch
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -78, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7f1d1d';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ॐ', 0, -78);
  }

  // 6. Pandal Gate Column with Banana Stems
  renderPandalGate(ctx) {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-12, -90, 24, 90);
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-16, -96, 32, 8);
    ctx.fillRect(-16, -8, 32, 8);

    // Green Banana Stem at base with Coconuts
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-18, -60, 10, 60);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(-13, -56, 6, 0, Math.PI * 2);
    ctx.fill();

    // Brass Samai Diya atop pillar
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -102, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Festival Banner
  renderFestivalBanner(ctx) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-34, -75, 5, 75);
    ctx.fillRect(29, -75, 5, 75);

    ctx.fillStyle = '#d62828';
    ctx.fillRect(-32, -70, 64, 34);

    ctx.fillStyle = '#ffd152';
    for (let t = -30; t <= 30; t += 8) {
      ctx.fillRect(t, -36, 4, 8);
    }

    ctx.fillStyle = '#ffd152';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('॥ जय गणेश ॥', 0, -52);
  }

  // 8. Ornate Brass Pedestal Diya (Samai Lamp with Glowing Flames)
  renderPedestalDiya(ctx) {
    // Stone Plinth
    ctx.fillStyle = '#475569';
    ctx.fillRect(-14, -6, 28, 6);

    // Carved Brass Stem
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-3.5, -45, 7, 40);

    // 3 Tiers of Oil Lamps
    [-20, -32, -45].forEach((ly, idx) => {
      const radius = 18 - idx * 4;
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(0, ly, radius, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Flames
      ctx.fillStyle = '#ff8426';
      ctx.shadowColor = '#ffd152';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-radius * 0.7, ly - 4, 3, 0, Math.PI * 2);
      ctx.arc(0, ly - 5, 3.5, 0, Math.PI * 2);
      ctx.arc(radius * 0.7, ly - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // 9. Hanging Star Kandil Lantern Post
  renderKandilLights(ctx) {
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-4, -85, 4, 85);

    ctx.strokeStyle = '#ffd152';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -85);
    ctx.lineTo(-24, -62);
    ctx.stroke();

    // Star Kandil Lantern
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#ffd152';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(-24, -72);
    ctx.lineTo(-14, -58);
    ctx.lineTo(-24, -44);
    ctx.lineTo(-34, -58);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Golden Streamers
    ctx.fillStyle = '#ffd152';
    for (let f = -32; f <= -16; f += 4) {
      ctx.fillRect(f, -44, 2, 10);
    }
  }

  // 10. Traditional Festive Umbrella (Chattri)
  renderFestiveUmbrella(ctx) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -75, 6, 75);

    // Colorful Fabric Dome
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(0, -75, 32, Math.PI, Math.PI * 2);
    ctx.fill();

    // Gold Trim & Hanging Tassels
    ctx.fillStyle = '#ffd152';
    ctx.fillRect(-34, -75, 68, 5);
    for (let t = -30; t <= 30; t += 10) {
      ctx.fillRect(t, -70, 3, 7);
    }
  }
}

// ----------------------------------------------------------------------------
// 10. MISSION & FESTIVAL JOURNEY MANAGER
// ----------------------------------------------------------------------------
class MissionManager {
  constructor(game) {
    this.game = game;
    this.activeMissions = [];
    this.pool = [
      { id: 'MODAK_35', desc: 'Collect 35 Modaks', target: 35, current: 0, reward: 120, type: 'MODAK', icon: '🍬' },
      { id: 'DIST_800', desc: 'Reach 800 meters', target: 800, current: 0, reward: 150, type: 'DISTANCE', icon: '🏃' },
      { id: 'NEAR_3', desc: 'Perform 3 Near Misses', target: 3, current: 0, reward: 140, type: 'NEAR_MISS', icon: '✨' },
      { id: 'COMBO_3', desc: 'Reach x3 Combo', target: 3, current: 0, reward: 100, type: 'COMBO', icon: '🔥' },
      { id: 'POWER_2', desc: 'Collect 2 Power-Ups', target: 2, current: 0, reward: 150, type: 'POWER_UP', icon: '🛡️' },
      { id: 'COINS_60', desc: 'Collect 60 Festival Coins', target: 60, current: 0, reward: 180, type: 'COINS', icon: '🪙' }
    ];
  }

  generateMissions() {
    const shuffled = [...this.pool].sort(() => Math.random() - 0.5);
    this.activeMissions = shuffled.slice(0, 4).map(m => ({
      ...m,
      current: 0,
      completed: false
    }));
    this.renderStartScreenMissions();
    this.updateHUD();
  }

  track(type, amount = 1) {
    this.activeMissions.forEach(m => {
      if (!m.completed && m.type === type) {
        if (type === 'COMBO') {
          m.current = Math.max(m.current, amount);
        } else {
          m.current += amount;
        }

        if (m.current >= m.target) {
          m.completed = true;
          this.game.coins += m.reward;
          this.game.updateCoinsHUD();
          this.game.audio.playPowerUp();
          this.game.showToast(`✓ TASK COMPLETE! +${m.reward} COINS 🪙`);

          const completedCount = this.activeMissions.filter(x => x.completed).length;
          if (completedCount === this.activeMissions.length) {
            this.game.showBannerAlert("🙏 ALL FESTIVAL TASKS COMPLETE!", 2200);
            this.game.coins += 250;
            this.game.updateCoinsHUD();
            // Trigger Grand Visarjan / Ganesha Finale celebration
            setTimeout(() => {
              if (this.game.state === 'PLAYING') {
                this.game.triggerGaneshaDestination();
              }
            }, 1200);
          }
        }
      }
    });
    this.updateHUD();
  }

  updateHUD() {
    const fillEl = document.getElementById('hudJourneyFill');
    const pctEl = document.getElementById('hudJourneyPct');
    const miniTasksEl = document.getElementById('hudMiniTasks');

    const distPct = Math.min(1.0, this.game.distance / CONFIG.DESTINATION_DISTANCE);
    const completedTasks = this.activeMissions.filter(m => m.completed).length;
    const taskBonus = (completedTasks / this.activeMissions.length) * 0.2;
    const totalProgress = Math.min(100, Math.floor((distPct * 0.8 + taskBonus) * 100));

    if (fillEl) fillEl.style.width = totalProgress + '%';
    if (pctEl) pctEl.textContent = totalProgress + '%';

    if (miniTasksEl) {
      miniTasksEl.innerHTML = this.activeMissions.map(m => `
        <span class="task-item ${m.completed ? 'done' : ''}">
          ${m.icon} ${m.completed ? '✓' : m.current + '/' + m.target}
        </span>
      `).join(' • ');
    }
  }

  renderStartScreenMissions() {
    const list = document.getElementById('startMissionsList');
    if (!list) return;
    list.innerHTML = this.activeMissions.map(m => `
      <li class="${m.completed ? 'done' : ''}">
        <span>${m.icon} ${m.desc}</span>
        <strong>+${m.reward} 🪙</strong>
      </li>
    `).join('');
  }
}

// ----------------------------------------------------------------------------
// 11. INPUT MANAGER (Temple Run Swipe Controls & Desktop Keys)
// ----------------------------------------------------------------------------
class InputManager {
  constructor(game) {
    this.game = game;
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.game.audio.unlocked) {
        this.game.audio.init();
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          if (this.game.state === 'PLAYING') this.game.player.moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (this.game.state === 'PLAYING') this.game.player.moveRight();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          if (this.game.state === 'PLAYING') {
            e.preventDefault();
            this.game.player.jump();
          }
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (this.game.state === 'PLAYING') {
            e.preventDefault();
            this.game.player.slide();
          }
          break;
        case 'KeyP':
        case 'Escape':
          this.game.togglePause();
          break;
        case 'KeyM':
          this.game.toggleSound();
          break;
      }
    });

    const container = document.getElementById('game-container');
    let touchStartX = 0;
    let touchStartY = 0;
    let swipeTriggered = false;
    const SWIPE_THRESHOLD = 26;

    container.addEventListener('touchstart', (e) => {
      if (!this.game.audio.unlocked) this.game.audio.init();
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      swipeTriggered = false;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (swipeTriggered || this.game.state !== 'PLAYING') return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) >= SWIPE_THRESHOLD) {
        swipeTriggered = true;
        if (absX > absY) {
          if (dx > 0) this.game.player.moveRight();
          else this.game.player.moveLeft();
        } else {
          if (dy < 0) this.game.player.jump();
          else this.game.player.slide();
        }
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!swipeTriggered && this.game.state === 'PLAYING') {
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) >= 20) {
          if (absX > absY) {
            if (dx > 0) this.game.player.moveRight();
            else this.game.player.moveLeft();
          } else {
            if (dy < 0) this.game.player.jump();
            else this.game.player.slide();
          }
        }
      }
      swipeTriggered = false;
    }, { passive: true });

    document.getElementById('btnStartGame').addEventListener('click', () => {
      this.game.audio.init();
      this.game.audio.playClick();
      this.game.startRun();
    });

    document.getElementById('btnHowToPlay').addEventListener('click', () => {
      this.game.audio.init();
      this.game.audio.playClick();
      document.getElementById('modalHowToPlay').classList.add('active');
    });

    document.getElementById('btnCloseModal').addEventListener('click', () => {
      this.game.audio.playClick();
      document.getElementById('modalHowToPlay').classList.remove('active');
    });

    document.getElementById('btnSoundToggle').addEventListener('click', () => {
      this.game.audio.init();
      this.game.toggleSound();
    });

    document.getElementById('btnToggleSoundStart').addEventListener('click', () => {
      this.game.audio.init();
      this.game.toggleSound();
    });

    document.getElementById('btnToggleSoundPause').addEventListener('click', () => {
      this.game.toggleSound();
    });

    document.getElementById('btnPauseToggle').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.togglePause();
    });

    document.getElementById('btnResume').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.resume();
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.startRun();
    });

    document.getElementById('btnMenuFromPause').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.showMenu();
    });

    document.getElementById('btnRunAgain').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.startRun();
    });

    document.getElementById('btnMenuFromGameOver').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.showMenu();
    });

    document.getElementById('btnRunAgainFinale').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.startRun();
    });

    document.getElementById('btnMenuFromFinale').addEventListener('click', () => {
      this.game.audio.playClick();
      this.game.showMenu();
    });

    document.getElementById('btnShareScore').addEventListener('click', () => {
      this.game.shareScore();
    });

    const trailSel = document.getElementById('trailSelector');
    if (trailSel) {
      trailSel.addEventListener('change', (e) => {
        this.game.player.trailType = e.target.value;
      });
    }

    window.addEventListener('resize', () => {
      this.game.onResize();
    });
  }
}

// ----------------------------------------------------------------------------
// 12. CENTRAL GAME COORDINATOR & RAF LOOP
// ----------------------------------------------------------------------------
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.audio = new AudioManager();
    this.perspective = new PerspectiveEngine(this.canvas);
    this.particles = new ParticleSystem(600);
    this.player = new Player(this);
    this.obstacles = new ObstacleManager(this);
    this.collectibles = new CollectibleManager(this);
    this.powerUps = new PowerUpManager(this);
    this.environment = new EnvironmentManager(this);
    this.missions = new MissionManager(this);
    this.input = new InputManager(this);

    this.state = 'MENU';

    this.score = 0;
    this.distance = 0;
    this.modaks = 0;
    this.coins = 0;
    this.lives = 3;
    this.speed = CONFIG.BASE_SPEED;
    this.highScore = 0;

    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.bestCombo = 1;
    this.nearMissCount = 0;

    // 6 Themed Celebration Landmarks & Zones (0-20%, 20-40%, 40-60%, 60-80%, 80-95%, 95-100%)
    this.landmarks = [
      { dist: 0, name: 'FESTIVAL ENTRANCE', icon: '🛕', shown: false },
      { dist: 480, name: 'FESTIVAL STREET', icon: '🎊', shown: false },
      { dist: 960, name: 'DHOL CHOWK', icon: '🥁', shown: false },
      { dist: 1440, name: 'FLOWER BAZAAR', icon: '🌸', shown: false },
      { dist: 1920, name: 'GRAND FESTIVAL NIGHT', icon: '🏮', shown: false },
      { dist: 2280, name: 'GANESHA DESTINATION', icon: '🙏', shown: false }
    ];

    this.lastBlessingDist = 0;
    this.celebrationTimer = 0;

    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    this.lastTimestamp = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    this.onResize();
    this.input.bindEvents();
    this.missions.generateMissions();
    this.showMenu();

    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  onResize() {
    const container = document.getElementById('game-container');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.width = width;
    this.height = height;
    this.perspective.resize(width, height);
  }

  showMenu() {
    this.state = 'MENU';
    this.audio.stopDholRhythm();
    this.hideAllScreens();
    document.getElementById('screenStart').classList.add('active');
    document.getElementById('startHighScore').textContent = this.highScore;
  }

  startRun() {
    this.state = 'PLAYING';
    this.score = 0;
    this.distance = 0;
    this.modaks = 0;
    this.coins = 0;
    this.lives = 3;
    this.speed = CONFIG.BASE_SPEED;
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.bestCombo = 1;
    this.nearMissCount = 0;
    this.lastBlessingDist = 0;
    this.celebrationTimer = 0;

    this.landmarks.forEach(lm => lm.shown = false);

    this.player.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.powerUps.reset();
    this.environment.reset();
    this.particles.clear();
    this.missions.generateMissions();

    this.updateHUD();
    this.updateLivesHUD();
    this.hideAllScreens();

    this.audio.startDholRhythm();

    const hint = document.getElementById('swipeTutorialHint');
    if (hint) {
      hint.classList.add('show');
      setTimeout(() => hint.classList.remove('show'), 3800);
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.pause();
    } else if (this.state === 'PAUSED') {
      this.resume();
    }
  }

  pause() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.audio.stopDholRhythm();
    document.getElementById('screenPause').classList.add('active');
  }

  resume() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    document.getElementById('screenPause').classList.remove('active');
    this.audio.startDholRhythm();
  }

  gameOver() {
    this.state = 'GAME_OVER';
    this.audio.stopDholRhythm();
    this.audio.playGameOver();

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    document.getElementById('goScore').textContent = Math.floor(this.score);
    document.getElementById('goDistance').textContent = Math.floor(this.distance) + 'm';
    document.getElementById('goModaks').textContent = this.modaks;
    document.getElementById('goCombo').textContent = 'x' + this.bestCombo;
    document.getElementById('goNearMisses').textContent = this.nearMissCount;
    document.getElementById('goCoins').textContent = this.coins;

    const completed = this.missions.activeMissions.filter(m => m.completed).length;
    const summaryEl = document.getElementById('goTasksSummary');
    if (summaryEl) {
      summaryEl.textContent = `🚩 Festival Tasks Completed: ${completed} / ${this.missions.activeMissions.length}`;
    }

    document.getElementById('screenGameOver').classList.add('active');
  }

  triggerGaneshaDestination() {
    if (this.state === 'DESTINATION_CELEBRATION' || this.state === 'FINALE') return;
    this.state = 'DESTINATION_CELEBRATION';
    this.celebrationTimer = 4.8;
    this.celebrationPhase = 1;

    this.audio.playFinale();
    this.showBannerAlert("GANAPATI BAPPA MORYA! 🙏", 2200);

    for (let i = 0; i < 80; i++) {
      this.particles.spawn(Math.random() * this.width, Math.random() * (this.height * 0.4), 1, {
        colors: ['#ffd152', '#ff6b1a', '#fff', '#f43f5e', '#38bdf8'],
        minSpeed: 2,
        maxSpeed: 8,
        shape: 'spark'
      });
    }
  }

  showFinaleScreen() {
    this.state = 'FINALE';
    this.audio.stopDholRhythm();

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    document.getElementById('finScore').textContent = Math.floor(this.score);
    document.getElementById('finDistance').textContent = Math.floor(this.distance) + 'm';
    document.getElementById('finModaks').textContent = this.modaks;
    document.getElementById('finCombo').textContent = 'x' + this.bestCombo;
    document.getElementById('finNearMisses').textContent = this.nearMissCount;
    document.getElementById('finCoins').textContent = this.coins;

    const mContainer = document.getElementById('finMissions');
    const compCount = this.missions.activeMissions.filter(m => m.completed).length;
    mContainer.textContent = `🚩 Festival Journey Completed: ${compCount} / ${this.missions.activeMissions.length} Tasks • Reached Lord Ganesha! 🙏`;

    document.getElementById('screenFinale').classList.add('active');
  }

  hideAllScreens() {
    document.querySelectorAll('.screen-overlay').forEach(el => el.classList.remove('active'));
  }

  showLandmark(name, icon = '📍') {
    this.audio.playLandmarkChime();
    const banner = document.getElementById('landmarkBanner');
    const textEl = document.getElementById('landmarkText');
    const iconEl = banner ? banner.querySelector('.landmark-icon') : null;
    if (!banner || !textEl) return;

    if (iconEl) iconEl.textContent = icon;
    textEl.textContent = name;
    banner.classList.add('active');
    if (this.landmarkTimeout) clearTimeout(this.landmarkTimeout);
    this.landmarkTimeout = setTimeout(() => {
      banner.classList.remove('active');
    }, 2800);

    // Landmark celebratory burst
    this.particles.spawn(this.width * 0.5, this.height * 0.22, 28, {
      colors: ['#ffd152', '#ff6b1a', '#ff4d6d', '#fff'],
      minSpeed: 2,
      maxSpeed: 6.5,
      shape: 'spark'
    });
  }

  toggleSound() {
    const isUnmuted = this.audio.toggleMute();
    const soundText = isUnmuted ? '🔊' : '🔇';
    document.getElementById('btnSoundToggle').textContent = soundText;
    document.getElementById('btnToggleSoundPause').textContent = soundText + ' SOUND';
    document.getElementById('startSoundIcon').textContent = soundText;
  }

  shareScore() {
    const text = `🪔 I scored ${Math.floor(this.score)} points and reached Lord Ganesha in Ganapathi Rush 2.0! Ganapati Bappa Morya! 🙏`;
    if (navigator.share) {
      navigator.share({
        title: 'Ganapathi Rush 2.0',
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Score copied to clipboard! 📋');
      });
    }
  }

  collectItem(item) {
    if (item.type === 'MODAK') {
      this.audio.playModak();
      this.modaks++;
      this.missions.track('MODAK', 1);

      const basePoints = 10;
      const scoreMul = this.powerUps.isDoubleScore ? 2 : 1;
      const points = basePoints * this.comboMultiplier * scoreMul;
      this.score += points;

      this.comboCount++;
      this.comboTimer = 3.6;
      this.evaluateComboTier();

      const proj = this.perspective.project(item.laneX, item.worldY, item.z);
      this.particles.spawn(proj.x, proj.y, 8, {
        colors: ['#ffd152', '#ff8426', '#fff'],
        minSpeed: 1.5,
        maxSpeed: 4.5
      });

    } else if (item.type === 'COIN') {
      this.audio.playCoin();
      this.coins++;
      this.score += 50 * (this.powerUps.isDoubleScore ? 2 : 1);
      this.missions.track('COINS', 1);

      const proj = this.perspective.project(item.laneX, item.worldY, item.z);
      this.particles.spawn(proj.x, proj.y, 10, {
        colors: ['#ffd152', '#f59e0b', '#ffffff'],
        shape: 'spark',
        minSpeed: 2,
        maxSpeed: 5
      });
    }

    this.updateHUD();
  }

  evaluateComboTier() {
    let newTier = 1;
    if (this.comboCount >= 30) newTier = 5;
    else if (this.comboCount >= 20) newTier = 4;
    else if (this.comboCount >= 10) newTier = 3;
    else if (this.comboCount >= 5) newTier = 2;

    if (newTier > this.comboMultiplier) {
      this.comboMultiplier = newTier;
      if (this.comboMultiplier > this.bestCombo) {
        this.bestCombo = this.comboMultiplier;
      }
      this.audio.playComboUp(this.comboMultiplier);
      this.showBannerAlert(`COMBO x${this.comboMultiplier}! 🔥`);
      this.missions.track('COMBO', this.comboMultiplier);

      const badge = document.getElementById('hudComboBadge');
      if (badge) {
        badge.classList.add('pulsing');
        setTimeout(() => badge.classList.remove('pulsing'), 300);
      }
    }
  }

  triggerNearMiss(obstacle) {
    this.nearMissCount++;
    this.audio.playNearMiss();
    this.score += 150 * (this.powerUps.isDoubleScore ? 2 : 1);
    this.comboCount += 2;
    this.comboTimer = 3.6;
    this.evaluateComboTier();
    this.missions.track('NEAR_MISS', 1);

    this.showBannerAlert('NEAR MISS! +150 ✨');

    const proj = this.perspective.project(this.player.currentLaneX, 10, 0);
    this.particles.spawn(proj.x, proj.y, 14, {
      colors: ['#ffd152', '#38bdf8', '#ffffff'],
      shape: 'spark',
      minSpeed: 3,
      maxSpeed: 7
    });

    this.updateHUD();
  }

  triggerBlessing() {
    this.audio.playBlessing();
    this.showBannerAlert("BAPPA'S BLESSING! 🙏✨");

    this.powerUps.isDoubleScore = true;
    this.powerUps.doubleScoreTimer = 14.0;
    this.powerUps.hasShield = true;
    this.powerUps.updateHUD();

    for (let i = 0; i < 40; i++) {
      this.particles.spawn(Math.random() * this.width, Math.random() * (this.height * 0.5), 1, {
        colors: ['#ffd152', '#fff7eb', '#ff6b1a'],
        minSpeed: 1,
        maxSpeed: 4,
        shape: 'spark'
      });
    }
  }

  checkCollisions() {
    if (this.player.invulnerableTimer > 0 || this.state === 'DESTINATION_CELEBRATION') return;

    for (let i = 0; i < this.obstacles.obstacles.length; i++) {
      const obs = this.obstacles.obstacles[i];
      if (obs.hit) continue;

      if (Math.abs(obs.z) < CONFIG.HIT_DEPTH_THRESHOLD) {
        const laneDiff = Math.abs(this.player.currentLaneX - (obs.lane - 1));

        if (laneDiff < CONFIG.PLAYER_HIT_W) {
          let isHit = false;

          if (obs.type === 'TORAN') {
            if (!this.player.isSliding) {
              isHit = true;
            }
          } else {
            if (this.player.jumpY < 32) {
              isHit = true;
            }
          }

          if (isHit) {
            obs.hit = true;
            this.handlePlayerHit(obs);
            break;
          }
        }
      }
    }
  }

  handlePlayerHit(obs) {
    if (this.powerUps.isBoostActive) {
      this.audio.playHit();
      this.triggerScreenShake(8, 0.2);
      const proj = this.perspective.project(obs.lane - 1, 10, obs.z);
      this.particles.spawn(proj.x, proj.y, 25, {
        colors: ['#ffd152', '#ff6b1a'],
        minSpeed: 4,
        maxSpeed: 9
      });
      return;
    }

    if (this.powerUps.hasShield) {
      this.powerUps.hasShield = false;
      this.powerUps.updateHUD();
      this.audio.playShieldBreak();
      this.player.invulnerableTimer = 0.8;
      this.triggerScreenShake(6, 0.2);
      this.showToast('DIVINE SHIELD ABSORBED HIT! 🛡️');

      const proj = this.perspective.project(this.player.currentLaneX, 20, 0);
      this.particles.spawn(proj.x, proj.y, 22, {
        colors: ['#ffd152', '#38bdf8', '#ffffff'],
        shape: 'spark',
        minSpeed: 3,
        maxSpeed: 8
      });
      return;
    }

    this.lives--;
    this.updateLivesHUD();
    this.audio.playHit();
    this.triggerScreenShake(12, 0.35);
    this.player.invulnerableTimer = CONFIG.INVULNERABLE_TIME;

    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;

    const proj = this.perspective.project(this.player.currentLaneX, 20, 0);
    this.particles.spawn(proj.x, proj.y, 25, {
      colors: ['#d62828', '#ff6b1a', '#ffd152'],
      minSpeed: 3,
      maxSpeed: 8
    });

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  triggerScreenShake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }

  showBannerAlert(text, duration = 1400) {
    const alert = document.getElementById('bannerAlert');
    if (!alert) return;
    alert.textContent = text;
    alert.classList.add('show');
    if (this.bannerAlertTimeout) clearTimeout(this.bannerAlertTimeout);
    this.bannerAlertTimeout = setTimeout(() => alert.classList.remove('show'), duration);
  }

  updateHUD() {
    document.getElementById('hudScore').textContent = Math.floor(this.score);
    document.getElementById('hudDistance').textContent = Math.floor(this.distance);
    document.getElementById('hudModaks').textContent = this.modaks;
    document.getElementById('hudCoins').textContent = this.coins;

    const comboText = document.getElementById('hudComboText');
    const comboFill = document.getElementById('hudComboFill');
    if (comboText && comboFill) {
      comboText.textContent = `COMBO x${this.comboMultiplier}`;
      const fillPct = Math.max(0, Math.min(100, (this.comboTimer / 3.6) * 100));
      comboFill.style.width = fillPct + '%';
    }

    this.missions.updateHUD();
  }

  updateLivesHUD() {
    const livesEl = document.getElementById('hudLives');
    if (!livesEl) return;
    const hearts = livesEl.querySelectorAll('.heart');
    hearts.forEach((h, idx) => {
      if (idx < this.lives) {
        h.classList.remove('lost');
        h.classList.add('active');
      } else {
        h.classList.remove('active');
        h.classList.add('lost');
      }
    });
  }

  updateCoinsHUD() {
    document.getElementById('hudCoins').textContent = this.coins;
  }

  // --------------------------------------------------------------------------
  // MAIN RAF ANIMATION LOOP
  // --------------------------------------------------------------------------
  gameLoop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    } else if (this.state === 'DESTINATION_CELEBRATION') {
      this.updateCelebration(dt);
    }

    this.render();

    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  update(dt) {
    let targetSpeed = CONFIG.BASE_SPEED + this.distance * CONFIG.SPEED_ACCEL;
    if (this.powerUps.isBoostActive) targetSpeed *= 1.45;
    if (this.powerUps.isSlowTime) targetSpeed *= 0.55;
    this.speed = Math.min(CONFIG.MAX_SPEED, targetSpeed);

    const distanceDelta = this.speed * dt * 0.1;
    this.distance += distanceDelta;
    this.score += distanceDelta * 1.2 * (this.powerUps.isDoubleScore ? 2 : 1);
    this.missions.track('DISTANCE', Math.floor(distanceDelta));

    // Check Landmarks
    for (let lm of this.landmarks) {
      if (!lm.shown && this.distance >= lm.dist) {
        lm.shown = true;
        this.showLandmark(lm.name, lm.icon);
        break;
      }
    }

    // Combo Decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
      }
    }

    // Rare Bappa's Blessing Event
    if (this.distance - this.lastBlessingDist > 650 && Math.random() < 0.005) {
      this.lastBlessingDist = this.distance;
      this.triggerBlessing();
    }

    // Check Destination Reach Milestone (~2400m)
    if (this.distance >= CONFIG.DESTINATION_DISTANCE) {
      this.triggerGaneshaDestination();
      return;
    }

    // Ambient floating marigold petals and golden sparkles
    if (Math.random() < 0.35) {
      const px = Math.random() * this.width;
      const py = Math.random() * (this.height * 0.7);
      this.particles.spawn(px, py, 1, {
        colors: ['#ff8426', '#ffd152', '#f43f5e', '#ffba08'],
        shape: 'petal',
        minSpeed: 0.8,
        maxSpeed: 2.5,
        baseVx: 1.2,
        baseVy: 0.8,
        minSize: 2.5,
        maxSize: 5.5,
        minDecay: 0.015,
        maxDecay: 0.025
      });
    }

    // Update Subsystems
    this.player.update(dt);
    this.obstacles.update(dt);
    this.collectibles.update(dt);
    this.powerUps.update(dt);
    this.environment.update(dt);
    this.particles.update(dt);

    this.checkCollisions();

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
      }
    }

    this.updateHUD();
  }

  updateCelebration(dt) {
    this.celebrationTimer -= dt;

    if (this.celebrationTimer <= 2.4 && this.celebrationPhase === 1) {
      this.celebrationPhase = 2;
      this.showBannerAlert("FESTIVAL COMPLETE! 🪔", 2200);
    }

    this.speed = Math.max(50, this.speed - 65 * dt);
    this.distance += this.speed * dt * 0.1;
    this.score += 220 * dt;

    this.player.update(dt);
    this.environment.update(dt);
    this.particles.update(dt);

    if (Math.random() < 0.55) {
      this.particles.spawn(Math.random() * this.width, Math.random() * (this.height * 0.35), 3, {
        colors: ['#ffd152', '#ff6b1a', '#ff4d6d', '#38bdf8', '#fff', '#f59e0b'],
        minSpeed: 3,
        maxSpeed: 9,
        shape: 'spark'
      });
      this.particles.spawn(Math.random() * this.width, Math.random() * (this.height * 0.3), 1, {
        colors: ['#ff8426', '#ffd152', '#f43f5e'],
        shape: 'petal',
        minSpeed: 1,
        maxSpeed: 3,
        baseVx: 1.3,
        baseVy: 1.2
      });
    }

    if (Math.random() < 0.06) {
      this.environment.spawnFirework();
    }

    this.updateHUD();

    if (this.celebrationTimer <= 0) {
      this.showFinaleScreen();
    }
  }

  render() {
    this.ctx.save();

    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.ctx.translate(shakeX, shakeY);
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Cinematic Sky & Horizon Ganesha Destination
    this.environment.renderSky(this.ctx, this.width, this.height);

    // 2. Road, Sidewalks, Curbs & Dense Roadside Scenery
    this.environment.renderRoad(this.ctx);

    // 3. Obstacles (sorted back-to-front)
    this.obstacles.render(this.ctx);

    // 4. Collectibles & Power-Up Tokens
    this.collectibles.render(this.ctx);
    this.powerUps.render(this.ctx);

    // 5. Player Character & Auras
    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'DESTINATION_CELEBRATION') {
      this.player.render(this.ctx);
    }

    // 6. Particle FX & Ambient Petals
    this.particles.render(this.ctx);

    this.ctx.restore();
  }
}

// ----------------------------------------------------------------------------
// 13. BOOTSTRAP
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
