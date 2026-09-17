/**
 * ============================================================================
 * GANAPATHI RUSH 2.0 — MASTER GAME ENGINE
 * Fast-Paced 3-Lane Ganesh Chaturthi Festival Runner
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

  // Milestones & Progression
  VISARJAN_DISTANCE: 2600,// Distance to trigger Grand Visarjan Finale
  INVULNERABLE_TIME: 1.25,// Post-hit invulnerability duration

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
    for (let i = 0; i < 8; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100 + i * 20, t + i * 0.08);

      gain.gain.setValueAtTime(0.28, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.15);
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
      // Traditional 4-beat Dholak groove: Bass, Tasha, Bass, Double-Tasha
      const isBass = (this.rhythmStep % 4 === 0) || (this.rhythmStep % 4 === 2);
      const isRim = (this.rhythmStep % 4 === 1) || (this.rhythmStep % 4 === 3);

      if (isBass) {
        // Low resonant Dhol bass (Dagga)
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
        // High crisp Tasha snap
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

      // Occasional soft temple bell on the 8th beat
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
    // 145 BPM syncopated festive groove
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

  // Projects (laneX: -1 to 1, worldY: elevation, worldZ: distance from player)
  project(laneX, worldY = 0, worldZ = 0) {
    const scale = CONFIG.CAM_DEPTH / (worldZ + CONFIG.CAM_DEPTH);
    // Perspective compression mapping
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
// 4. PARTICLE SYSTEM (Object Pooled)
// ----------------------------------------------------------------------------
class ParticleSystem {
  constructor(maxParticles = 350) {
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

    // Base dimensions at scale 1.0 (player plane Z = 0)
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

      // Jump dust puff
      const proj = this.game.perspective.project(this.currentLaneX, 0, 0);
      this.game.particles.spawn(proj.x, proj.y, 14, {
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
      // In-air quick drop
      this.velocityY = -26.0;
      this.game.audio.playSlide();
    } else if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = CONFIG.SLIDE_DURATION;
      this.game.audio.playSlide();

      // Slide dust streak
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
    // Smooth lane interpolation: -1 (Left), 0 (Center), 1 (Right)
    const targetX = this.lane - 1;
    this.currentLaneX += (targetX - this.currentLaneX) * Math.min(1.0, CONFIG.LANE_LERP_SPEED * dt);

    // Jump Physics
    if (this.isJumping) {
      this.jumpY += this.velocityY * 60 * dt;
      this.velocityY += CONFIG.GRAVITY * dt;

      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.game.audio.playLand();

        // Landing dust
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

    // Slide Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.slideTimer = 0;
      }
    }

    // Run animation cycle (scales with game speed)
    const speedRatio = this.game.speed / CONFIG.BASE_SPEED;
    this.runCycle += 12 * speedRatio * dt;

    // Invulnerability cooldown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Emit decorative trail particles behind player
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

  // Render stylized procedural festival runner
  render(ctx) {
    const proj = this.game.perspective.project(this.currentLaneX, this.jumpY * 1.5, 0);
    const px = proj.x;
    const py = proj.y;
    const scale = proj.scale;

    // Invulnerability flash (rapid blinking)
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(px, py);

    // 1. Ground Shadow
    const shadowScale = Math.max(0.3, 1.0 - (this.jumpY / 80));
    ctx.save();
    ctx.scale(scale * shadowScale, scale * shadowScale * 0.4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, (this.jumpY * 1.5) / (shadowScale * 0.4), 38, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.scale(scale, scale);

    // Dynamic tilt when switching lanes
    const targetX = this.lane - 1;
    const laneTilt = (targetX - this.currentLaneX) * 0.22;
    ctx.rotate(laneTilt);

    const runBounce = this.isJumping ? 0 : Math.sin(this.runCycle) * 3.5;
    const legAngle = this.isJumping ? 0.35 : Math.sin(this.runCycle) * 0.65;

    // ==========================================
    // SLIDE POSE vs RUN / JUMP POSE
    // ==========================================
    if (this.isSliding) {
      // ----------------------------------------
      // Low Crouch Sliding Posture
      // ----------------------------------------
      // Sliding dust
      ctx.fillStyle = 'rgba(255, 209, 82, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-10, -8, 40, 14, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Dhoti legs stretched low
      ctx.fillStyle = '#ff8426'; // Saffron dhoti
      ctx.beginPath();
      ctx.ellipse(-15, -18, 26, 12, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Torso leaning low forward
      ctx.fillStyle = '#fff7eb'; // Cream Kurta
      ctx.beginPath();
      ctx.ellipse(12, -26, 24, 14, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Gold festive border
      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(12, -26, 15, 0, Math.PI);
      ctx.stroke();

      // Head low
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(28, -36, 12, 0, Math.PI * 2);
      ctx.fill();

      // Festive Pagdi (turban)
      ctx.fillStyle = '#d62828';
      ctx.beginPath();
      ctx.arc(28, -42, 11, Math.PI, Math.PI * 2);
      ctx.fill();

      // Golden kalgi plume
      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      ctx.moveTo(34, -48);
      ctx.lineTo(39, -56);
      ctx.lineTo(31, -48);
      ctx.fill();

    } else {
      // ----------------------------------------
      // Standing / Running / Jumping Posture
      // ----------------------------------------

      // Legs (Dhoti)
      ctx.save();
      ctx.translate(0, -32 + runBounce);

      // Left Leg
      ctx.save();
      ctx.rotate(legAngle);
      ctx.fillStyle = '#ff6b1a'; // Saffron
      ctx.beginPath();
      ctx.roundRect(-16, 0, 12, 32, 6);
      ctx.fill();
      // Gold dhoti hem
      ctx.fillStyle = '#ffd152';
      ctx.fillRect(-16, 26, 12, 6);
      // Foot
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
      // Gold dhoti hem
      ctx.fillStyle = '#ffd152';
      ctx.fillRect(4, 26, 12, 6);
      // Foot
      ctx.fillStyle = '#7a3e1d';
      ctx.fillRect(4, 30, 16, 6);
      ctx.restore();

      ctx.restore(); // end legs

      // Torso (Embroidered Kurta)
      ctx.save();
      ctx.translate(0, -68 + runBounce);

      // Fluttering Sash / Uttariya in back
      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      const sashWave = Math.sin(this.runCycle * 1.5) * 8;
      ctx.moveTo(-16, 8);
      ctx.quadraticCurveTo(-34 + sashWave, 24, -28 + sashWave, 42);
      ctx.lineTo(-20 + sashWave, 40);
      ctx.quadraticCurveTo(-26 + sashWave, 22, -10, 12);
      ctx.closePath();
      ctx.fill();

      // Kurta Body
      ctx.fillStyle = '#fff7eb'; // Cream festive kurta
      ctx.beginPath();
      ctx.roundRect(-18, -4, 36, 42, [8, 8, 4, 4]);
      ctx.fill();

      // Gold embroidery trim & festive buttons
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
      // Left Arm
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

      // Right Arm (Holding offering/flower ribbon)
      ctx.save();
      ctx.translate(18, 2);
      ctx.rotate(-armAngle);
      ctx.fillStyle = '#fff7eb';
      ctx.fillRect(-4, 0, 8, 24);
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(0, 26, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Little marigold flower in hand
      ctx.fillStyle = '#ffba08';
      ctx.beginPath();
      ctx.arc(2, 28, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head & Festive Turban
      ctx.translate(0, -16);
      ctx.fillStyle = '#e0a876';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      // Tilak on forehead
      ctx.fillStyle = '#d62828';
      ctx.fillRect(-1.5, -6, 3, 7);
      ctx.fillStyle = '#ffd152';
      ctx.fillRect(-1, -1, 2, 2);

      // Festive Pagdi (Turban)
      ctx.fillStyle = '#ff6b1a';
      ctx.beginPath();
      ctx.arc(0, -5, 14, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d62828';
      ctx.beginPath();
      ctx.ellipse(0, -7, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden kalgi / broach
      ctx.fillStyle = '#ffd152';
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(4, -22);
      ctx.lineTo(-4, -22);
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // end torso
    }

    // ==========================================
    // POWER-UP AURAS & EFFECTS
    // ==========================================
    // 1. Divine Shield Aura
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

      // Mandala tick marks
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

    // 2. Modak Magnet Aura
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

    // 3. Bappa Boost Golden Shockwave
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
    this.minWaveGap = 210; // Base spacing between waves
  }

  reset() {
    this.obstacles = [];
    this.spawnDistanceCounter = 0;
  }

  update(dt) {
    const moveDist = this.game.speed * dt;
    this.spawnDistanceCounter += moveDist;

    // Check spawner threshold (scales smoothly with speed to guarantee fair human reaction time)
    const currentWaveGap = this.minWaveGap + (this.game.speed - CONFIG.BASE_SPEED) * 0.55;
    if (this.spawnDistanceCounter >= currentWaveGap) {
      this.spawnDistanceCounter = 0;
      this.spawnWave();
    }

    // Update active obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.z -= moveDist;

      // Check Near-Miss (when obstacle just passed the player plane: z < 0 && z > -35)
      if (!obs.nearMissChecked && obs.z < 0 && obs.z > -40) {
        obs.nearMissChecked = true;
        // If obstacle is adjacent to player lane and player didn't hit it
        const laneDiff = Math.abs(this.game.player.currentLaneX - (obs.lane - 1));
        if (laneDiff < 0.85 && !obs.hit) {
          this.game.triggerNearMiss(obs);
        }
      }

      // Cleanup past camera
      if (obs.z < -60) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  // GUARANTEED FAIRNESS: AT LEAST ONE SAFE LANE ALWAYS FREE
  spawnWave() {
    const obstacleTypes = ['BARRICADE', 'DHOL', 'TORAN', 'CRATES', 'CART'];
    // Random safe lane: 0 (Left), 1 (Center), 2 (Right)
    const safeLane = Math.floor(Math.random() * 3);

    // Number of obstacles in this wave (1 or 2, NEVER 3)
    // 0-400m: strictly 1 obstacle per wave. 400m+: sometimes 2 obstacles.
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
      // Overhead Toran (requires slide) only appears after 300m
      if (type === 'TORAN' && this.game.distance < 300) {
        type = 'BARRICADE';
      }

      this.obstacles.push({
        type: type,
        lane: lane,          // 0, 1, 2
        z: CONFIG.ROAD_LENGTH,
        hit: false,
        nearMissChecked: false,
        baseWidth: 64,
        baseHeight: type === 'TORAN' ? 85 : 55
      });
    });
  }

  render(ctx) {
    // Sort back-to-front for proper depth ordering
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

  // 1. Festival Barricade (Ground: Jump or switch lane)
  renderBarricade(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden barrier slats
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-34, -48, 68, 12);
    ctx.fillRect(-34, -28, 68, 10);

    // Decorative Marigold Garland across top
    ctx.fillStyle = '#ffba08';
    for (let g = -30; g <= 30; g += 10) {
      ctx.beginPath();
      ctx.arc(g, -48, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-28, -48, 8, 48);
    ctx.fillRect(20, -48, 8, 48);

    // Hazard Stripes
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-18, -48); ctx.lineTo(-10, -48); ctx.lineTo(-20, -36); ctx.lineTo(-28, -36); ctx.fill();
    ctx.moveTo(6, -48); ctx.lineTo(14, -48); ctx.lineTo(4, -36); ctx.lineTo(-4, -36); ctx.fill();
  }

  // 2. Large Dhol Drum (Ground: Jump or switch lane)
  renderDhol(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden stand
    ctx.strokeStyle = '#5c2c16';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-24, 0); ctx.lineTo(-14, -24); ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0); ctx.lineTo(14, -24); ctx.lineTo(24, 0);
    ctx.stroke();

    // Cylindrical Drum Barrel (Dholak)
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.ellipse(0, -34, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rims with gold tension rings
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(-26, -34, 6, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(26, -34, 6, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cross tuning cords
    ctx.strokeStyle = '#ffd152';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24, -46); ctx.lineTo(24, -22);
    ctx.moveTo(-24, -22); ctx.lineTo(24, -46);
    ctx.stroke();

    // Drumsticks (Tasha sticks)
    ctx.strokeStyle = '#ff6b1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -54); ctx.lineTo(10, -38);
    ctx.stroke();
  }

  // 3. Overhead Festival Toran (High: Slide under or switch lane)
  renderToran(ctx) {
    // Side Bamboo Pillars
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-38, -125, 8, 125);
    ctx.fillRect(30, -125, 8, 125);

    // Decorative Hanging Arch Bar
    ctx.fillStyle = '#d62828';
    ctx.fillRect(-42, -125, 84, 14);

    // Gold Temple Motif on Arch
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -125, 14, Math.PI, Math.PI * 2);
    ctx.fill();

    // Hanging Marigold Garlands & Mango Leaves (Requires sliding under!)
    const hangingY = -110;
    ctx.fillStyle = '#ffba08'; // Marigold
    for (let m = -34; m <= 34; m += 12) {
      ctx.beginPath();
      ctx.arc(m, hangingY + Math.sin(m * 0.2) * 6, 6, 0, Math.PI * 2);
      ctx.fill();

      // Green mango leaf pendant
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(m, hangingY + 6);
      ctx.lineTo(m + 4, hangingY + 22);
      ctx.lineTo(m - 4, hangingY + 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffba08';
    }

    // "SLIDE!" prompt banner under the toran
    ctx.fillStyle = 'rgba(214, 40, 40, 0.9)';
    ctx.fillRect(-22, -88, 44, 14);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▼ SLIDE', 0, -77);
  }

  // 4. Flower & Fruit Crates (Ground: Jump or switch lane)
  renderCrates(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden boxes stacked
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-28, -32, 28, 32);
    ctx.fillRect(0, -24, 28, 24);

    // Fruit & floral offerings overflowing
    ctx.fillStyle = '#ea580c'; // Coconuts/oranges
    ctx.beginPath();
    ctx.arc(-14, -36, 6, 0, Math.PI * 2);
    ctx.arc(-6, -34, 5, 0, Math.PI * 2);
    ctx.arc(14, -28, 6, 0, Math.PI * 2);
    ctx.fill();

    // Marigold petals
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(-18, -34, 4, 0, Math.PI * 2);
    ctx.arc(8, -26, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Festival Push Cart (Wide Ground: Switch lane)
  renderCart(ctx) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
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

    // Cart base
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-34, -38, 68, 26);

    // Decorative festival canopy
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.moveTo(-38, -38);
    ctx.lineTo(0, -56);
    ctx.lineTo(38, -38);
    ctx.closePath();
    ctx.fill();

    // Golden tassel
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

    // Periodically spawn trails of Modaks and Festival Coins
    if (this.spawnTimer >= 140) {
      this.spawnTimer = 0;
      this.spawnPattern();
    }

    // Magnet Attraction Logic
    const isMagnet = this.game.powerUps.isMagnetActive;
    const playerX = this.game.player.currentLaneX;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.z -= moveDist;

      // Magnet effect: attract nearby modaks smoothly
      if (isMagnet && item.type === 'MODAK' && item.z < 320 && item.z > -20) {
        const targetLaneX = playerX;
        item.laneX += (targetLaneX - item.laneX) * Math.min(1.0, 10 * dt);
      }

      // Check Collection (when near player plane Z ~ 0)
      if (!item.collected && Math.abs(item.z) < 28) {
        const laneDiff = Math.abs(this.game.player.currentLaneX - item.laneX);
        const playerJump = this.game.player.jumpY;

        // Collision logic with tolerance
        const isHeightMatch = (item.worldY === 0 && playerJump < 30) ||
                              (item.worldY > 20 && playerJump >= 18);

        if (laneDiff < 0.65 && isHeightMatch) {
          item.collected = true;
          this.game.collectItem(item);
        }
      }

      // Cleanup
      if (item.z < -40 || item.collected) {
        this.items.splice(i, 1);
      }
    }
  }

  spawnPattern() {
    const patterns = ['STRAIGHT', 'ZIGZAG', 'ARC', 'COIN_TRAIL'];
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    const baseLane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1

    if (p === 'STRAIGHT') {
      // 4 Modaks in a single lane
      for (let k = 0; k < 4; k++) {
        this.items.push({
          type: 'MODAK',
          laneX: baseLane,
          worldY: 0,
          z: CONFIG.ROAD_LENGTH + k * 45,
          collected: false,
          rot: Math.random() * Math.PI
        });
      }
    } else if (p === 'ZIGZAG') {
      // 3 Modaks weaving lanes
      for (let k = 0; k < 3; k++) {
        const lane = Math.max(-1, Math.min(1, baseLane + (k % 2 === 0 ? -1 : 1)));
        this.items.push({
          type: 'MODAK',
          laneX: lane,
          worldY: 0,
          z: CONFIG.ROAD_LENGTH + k * 50,
          collected: false,
          rot: 0
        });
      }
    } else if (p === 'ARC') {
      // Arc of 4 modaks requiring a jump
      for (let k = 0; k < 4; k++) {
        const jumpElevation = Math.sin((k / 3) * Math.PI) * 48;
        this.items.push({
          type: 'MODAK',
          laneX: baseLane,
          worldY: jumpElevation,
          z: CONFIG.ROAD_LENGTH + k * 38,
          collected: false,
          rot: 0
        });
      }
    } else if (p === 'COIN_TRAIL') {
      // Rare Festival Coins trail
      for (let k = 0; k < 3; k++) {
        this.items.push({
          type: 'COIN',
          laneX: baseLane,
          worldY: 0,
          z: CONFIG.ROAD_LENGTH + k * 40,
          collected: false,
          rot: 0
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

  // Glowing Golden Modak
  renderModak(ctx) {
    // Divine Glow Aura
    const pulse = Math.sin(Date.now() * 0.008) * 3;
    ctx.shadowColor = '#ffd152';
    ctx.shadowBlur = 12 + pulse;

    // Outer Sweet Body (Teardrop / pleated dumpling)
    ctx.fillStyle = '#fff7eb'; // Steamed rice flour base
    ctx.beginPath();
    ctx.moveTo(0, -26); // Pointed top
    ctx.bezierCurveTo(16, -14, 20, 10, 0, 16);
    ctx.bezierCurveTo(-20, 10, -16, -14, 0, -26);
    ctx.fill();

    // Saffron / Jaggery Center Glow & Pleat Ridges
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -24); ctx.lineTo(0, 14);
    ctx.moveTo(-2, -22); ctx.quadraticCurveTo(-10, 0, -6, 12);
    ctx.moveTo(2, -22); ctx.quadraticCurveTo(10, 0, 6, 12);
    ctx.stroke();

    // Golden Kalgi Sparkle on top tip
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, -26, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Festival Coin
  renderCoin(ctx) {
    // 3D Coin Rotation Effect
    const spin = Math.cos(Date.now() * 0.007);
    ctx.scale(spin, 1);

    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;

    // Golden Coin Rim
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Inner Face
    ctx.fillStyle = '#ffd152';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Om symbol or star stamp
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

    // Active power-up states
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

    // Periodically spawn a power-up token on the road (~every 280-350m)
    if (this.spawnTimer >= 320) {
      this.spawnTimer = 0;
      this.spawnToken();
    }

    // Update floating tokens
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const tok = this.tokens[i];
      tok.z -= moveDist;

      // Check Pickup
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

    // Countdown active timers
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

      // Floating bobbing
      const bob = Math.sin(Date.now() * 0.007 + tok.z) * 6;
      ctx.translate(0, bob - 24);

      // Rotating Token Sphere
      ctx.shadowColor = '#ffd152';
      ctx.shadowBlur = 16;

      ctx.fillStyle = 'rgba(255, 209, 82, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffd152';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Icon
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
// 9. ENVIRONMENT MANAGER (4 Phases, Parallax & Visarjan Finale)
// ----------------------------------------------------------------------------
class EnvironmentManager {
  constructor(game) {
    this.game = game;
    this.phase = 1; // 1: Sunset, 2: Evening, 3: Night, 4: Visarjan Rush
    this.fireworks = [];
    this.floatingDiyas = [];
    this.skyGradient = null;

    // Roadside decorative element counters
    this.diyaPoles = [];
    for (let z = 40; z < CONFIG.ROAD_LENGTH; z += 90) {
      this.diyaPoles.push({ z: z });
    }
  }

  reset() {
    this.phase = 1;
    this.fireworks = [];
    this.floatingDiyas = [];
  }

  update(dt) {
    const dist = this.game.distance;

    // Environment Progression Phases
    if (dist < 500) {
      this.phase = 1; // Sunset Festival
    } else if (dist < 1200) {
      this.phase = 2; // Evening Celebration
    } else if (dist < 2000) {
      this.phase = 3; // Night Festival
    } else {
      this.phase = 4; // Visarjan Rush
    }

    // Scroll Roadside Diya Lamp Posts
    const moveDist = this.game.speed * dt;
    this.diyaPoles.forEach(pole => {
      pole.z -= moveDist;
      if (pole.z < 0) {
        pole.z += CONFIG.ROAD_LENGTH;
      }
    });

    // Background Fireworks in Phase 3 & 4
    if (this.phase >= 3 && Math.random() < 0.02) {
      this.spawnFirework();
    }

    // Update fireworks
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
    const colors = ['#ffd152', '#ff6b1a', '#ff4d6d', '#38bdf8', '#4ade80'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    this.fireworks.push({
      x: x,
      y: y,
      color: chosenColor,
      life: 1.2,
      maxLife: 1.2,
      radius: 20 + Math.random() * 30
    });

    // Burst sparkles
    this.game.particles.spawn(x, y, 20, {
      color: chosenColor,
      minSpeed: 2,
      maxSpeed: 7,
      shape: 'spark'
    });
  }

  renderSky(ctx, width, height) {
    const horizon = this.game.perspective.horizonY;
    const grad = ctx.createLinearGradient(0, 0, 0, horizon);

    if (this.phase === 1) {
      // Phase 1: Sunset Amber
      grad.addColorStop(0, '#3b1842');
      grad.addColorStop(0.5, '#9d2f2d');
      grad.addColorStop(0.85, '#e25c1d');
      grad.addColorStop(1, '#ffba08');
    } else if (this.phase === 2) {
      // Phase 2: Evening Twilight Purple
      grad.addColorStop(0, '#12142e');
      grad.addColorStop(0.5, '#2e194a');
      grad.addColorStop(0.85, '#6a2c5a');
      grad.addColorStop(1, '#c2543d');
    } else {
      // Phase 3 & 4: Deep Navy Night with Stars
      grad.addColorStop(0, '#050711');
      grad.addColorStop(0.6, '#0b112c');
      grad.addColorStop(1, '#1b2554');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, horizon + 2);

    // Stars / Celestial Moon or Sun
    if (this.phase === 1) {
      // Warm Setting Sun
      ctx.fillStyle = 'rgba(255, 230, 150, 0.9)';
      ctx.shadowColor = '#ff6b1a';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(width * 0.72, horizon * 0.65, 36, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Glowing Full Moon
      ctx.fillStyle = '#fff9e6';
      ctx.shadowColor = '#ffd152';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(width * 0.8, horizon * 0.42, 28, 0, Math.PI * 2);
      ctx.fill();

      // Ambient Stars
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let s = 0; s < 30; s++) {
        const sx = (s * 137.5) % width;
        const sy = (s * 73.1) % (horizon * 0.75);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }

    // Render Fireworks
    this.fireworks.forEach(fw => {
      const progress = 1 - (fw.life / fw.maxLife);
      ctx.save();
      ctx.strokeStyle = fw.color;
      ctx.globalAlpha = 1 - progress;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.radius * progress, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Parallax Silhouettes: Temple Spires, Pandal Canopies, and Ghat
    this.renderParallaxSilhouettes(ctx, width, horizon);
  }

  renderParallaxSilhouettes(ctx, width, horizon) {
    const scrollOffset = (this.game.distance * 0.15) % 400;

    // Distant Temple Silhouettes
    ctx.fillStyle = this.phase === 1 ? '#4a1525' : '#070916';
    ctx.beginPath();
    ctx.moveTo(0, horizon);

    for (let x = -scrollOffset; x < width + 400; x += 120) {
      // Temple Spire (Shikhara)
      ctx.lineTo(x, horizon);
      ctx.lineTo(x + 20, horizon - 28);
      ctx.lineTo(x + 35, horizon - 58); // Shikhara tip
      ctx.lineTo(x + 50, horizon - 28);
      ctx.lineTo(x + 70, horizon - 16);
      ctx.lineTo(x + 100, horizon);
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();

    // Saffron Festival Flags fluttering on spires
    ctx.fillStyle = '#ff6b1a';
    for (let x = -scrollOffset; x < width + 400; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x + 35, horizon - 58);
      ctx.lineTo(x + 48, horizon - 52);
      ctx.lineTo(x + 35, horizon - 46);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Perspective 3-Lane Road, Festival Curbs & Diya Lamps
  renderRoad(ctx) {
    const persp = this.game.perspective;
    const width = persp.width;
    const horizon = persp.horizonY;
    const groundBase = persp.groundBaseY;

    // Ground surrounding road (Festive stone street / Visarjan riverbank)
    ctx.fillStyle = this.phase === 4 ? '#0f1d38' : '#141728';
    ctx.fillRect(0, horizon, width, persp.height - horizon);

    // If Visarjan finale, render illuminated sacred river reflections!
    if (this.phase === 4) {
      const riverGrad = ctx.createLinearGradient(0, horizon, 0, groundBase);
      riverGrad.addColorStop(0, '#0a1936');
      riverGrad.addColorStop(1, '#0e3a6c');
      ctx.fillStyle = riverGrad;
      ctx.fillRect(0, horizon, width, groundBase - horizon);

      // Floating diyas on water sides
      ctx.fillStyle = '#ffd152';
      for (let w = 0; w < 16; w++) {
        const dx = (w * 88 + Date.now() * 0.02) % width;
        const dy = horizon + 30 + (w * 18) % 120;
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3D Road Trapezoid (Narrowing into horizon)
    const pFarLeft = persp.project(-1.5, 0, CONFIG.ROAD_LENGTH);
    const pFarRight = persp.project(1.5, 0, CONFIG.ROAD_LENGTH);
    const pNearLeft = persp.project(-1.5, 0, 0);
    const pNearRight = persp.project(1.5, 0, 0);

    ctx.save();
    // Road Surface
    const roadGrad = ctx.createLinearGradient(0, horizon, 0, groundBase);
    roadGrad.addColorStop(0, '#1c1f33');
    roadGrad.addColorStop(1, '#2a2d48');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(pFarLeft.x, pFarLeft.y);
    ctx.lineTo(pFarRight.x, pFarRight.y);
    ctx.lineTo(pNearRight.x, pNearRight.y);
    ctx.lineTo(pNearLeft.x, pNearLeft.y);
    ctx.closePath();
    ctx.fill();

    // Alternating Festival Curbs (Marigold yellow & Vermillion red stripes)
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

      // Left Curb
      ctx.beginPath();
      ctx.moveTo(pL1.x, pL1.y);
      ctx.lineTo(pL2.x, pL2.y);
      ctx.lineTo(pL2.x - 8 * pL2.scale, pL2.y);
      ctx.lineTo(pL1.x - 8 * pL1.scale, pL1.y);
      ctx.closePath();
      ctx.fill();

      // Right Curb
      ctx.beginPath();
      ctx.moveTo(pR1.x, pR1.y);
      ctx.lineTo(pR2.x, pR2.y);
      ctx.lineTo(pR2.x + 8 * pR2.scale, pR2.y);
      ctx.lineTo(pR1.x + 8 * pR1.scale, pR1.y);
      ctx.closePath();
      ctx.fill();
    }

    // Moving Lane Dividers (Dashes receding into depth)
    ctx.strokeStyle = '#fff7eb';
    ctx.lineWidth = 3;
    const dashLength = 50;
    const dashGap = 50;
    const dashScroll = (this.game.distance * 3) % (dashLength + dashGap);

    for (let dZ = -dashScroll; dZ < CONFIG.ROAD_LENGTH; dZ += dashLength + dashGap) {
      if (dZ < 0) continue;
      const zStart = dZ;
      const zEnd = Math.min(CONFIG.ROAD_LENGTH, dZ + dashLength);

      // Lane Divider 1 (Between Lane 0 and Lane 1: x = -0.5)
      const pDiv1Start = persp.project(-0.5, 0, zStart);
      const pDiv1End = persp.project(-0.5, 0, zEnd);
      ctx.lineWidth = Math.max(1, 3.5 * pDiv1Start.scale);
      ctx.beginPath();
      ctx.moveTo(pDiv1Start.x, pDiv1Start.y);
      ctx.lineTo(pDiv1End.x, pDiv1End.y);
      ctx.stroke();

      // Lane Divider 2 (Between Lane 1 and Lane 2: x = 0.5)
      const pDiv2Start = persp.project(0.5, 0, zStart);
      const pDiv2End = persp.project(0.5, 0, zEnd);
      ctx.beginPath();
      ctx.moveTo(pDiv2Start.x, pDiv2Start.y);
      ctx.lineTo(pDiv2End.x, pDiv2End.y);
      ctx.stroke();
    }

    // Roadside Diya Lamp Posts
    this.diyaPoles.forEach(pole => {
      // Left side pole
      const pLeft = persp.project(-1.75, 0, pole.z);
      const pRight = persp.project(1.75, 0, pole.z);
      const scale = pLeft.scale;

      if (scale > 0.05) {
        // Left Diya
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pLeft.x - 2 * scale, pLeft.y - 24 * scale, 4 * scale, 24 * scale);
        // Diya bowl & flame
        ctx.fillStyle = '#ffd152';
        ctx.beginPath();
        ctx.arc(pLeft.x, pLeft.y - 26 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Right Diya
        ctx.fillStyle = '#b45309';
        ctx.fillRect(pRight.x - 2 * scale, pRight.y - 24 * scale, 4 * scale, 24 * scale);
        ctx.fillStyle = '#ffd152';
        ctx.beginPath();
        ctx.arc(pRight.x, pRight.y - 26 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}

// ----------------------------------------------------------------------------
// 10. MISSION MANAGER (3 Active Randomized Goals)
// ----------------------------------------------------------------------------
class MissionManager {
  constructor(game) {
    this.game = game;
    this.activeMissions = [];
    this.pool = [
      { id: 'MODAK_40', desc: 'Collect 40 Modaks', target: 40, current: 0, reward: 100, type: 'MODAK' },
      { id: 'DIST_1000', desc: 'Travel 1000 meters', target: 1000, current: 0, reward: 150, type: 'DISTANCE' },
      { id: 'NEAR_3', desc: 'Perform 3 Near Misses', target: 3, current: 0, reward: 120, type: 'NEAR_MISS' },
      { id: 'COMBO_3', desc: 'Reach x3 Combo', target: 3, current: 0, reward: 100, type: 'COMBO' },
      { id: 'POWER_2', desc: 'Collect 2 Power-Ups', target: 2, current: 0, reward: 150, type: 'POWER_UP' },
      { id: 'COINS_10', desc: 'Collect 10 Festival Coins', target: 10, current: 0, reward: 200, type: 'COINS' }
    ];
  }

  generateMissions() {
    // Pick 3 random missions from the pool
    const shuffled = [...this.pool].sort(() => Math.random() - 0.5);
    this.activeMissions = shuffled.slice(0, 3).map(m => ({
      ...m,
      current: 0,
      completed: false
    }));
    this.renderStartScreenMissions();
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
          this.game.showToast(`MISSION COMPLETE! +${m.reward} COINS 🪙`);
        }
      }
    });
  }

  renderStartScreenMissions() {
    const list = document.getElementById('startMissionsList');
    if (!list) return;
    list.innerHTML = this.activeMissions.map(m => `
      <li class="${m.completed ? 'done' : ''}">
        <span>${m.desc}</span>
        <strong>+${m.reward} 🪙</strong>
      </li>
    `).join('');
  }
}

// ----------------------------------------------------------------------------
// 11. INPUT MANAGER (Keyboard, Mobile Swipes & Touch Buttons)
// ----------------------------------------------------------------------------
class InputManager {
  constructor(game) {
    this.game = game;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
  }

  bindEvents() {
    // Desktop Keyboard
    window.addEventListener('keydown', (e) => {
      // Audio auto-unlock on first user interaction
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

    // Mobile Swipe Gestures on Game Container
    const container = document.getElementById('game-container');
    container.addEventListener('touchstart', (e) => {
      if (!this.game.audio.unlocked) this.game.audio.init();
      const t = e.touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
      this.touchStartTime = Date.now();
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (this.game.state !== 'PLAYING') return;
      const t = e.changedTouches[0];
      const dx = t.clientX - this.touchStartX;
      const dy = t.clientY - this.touchStartY;
      const dt = Date.now() - this.touchStartTime;

      if (dt > 450) return; // Ignore long drags

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) > 30) {
        if (absX > absY) {
          // Horizontal Swipe
          if (dx > 0) this.game.player.moveRight();
          else this.game.player.moveLeft();
        } else {
          // Vertical Swipe
          if (dy < 0) this.game.player.jump();
          else this.game.player.slide();
        }
      }
    }, { passive: true });

    // Touch Navigation Buttons
    const bindBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        e.preventDefault();
        if (!this.game.audio.unlocked) this.game.audio.init();
        if (this.game.state === 'PLAYING') fn();
      };
      el.addEventListener('touchstart', handler, { passive: false });
      el.addEventListener('click', handler);
    };

    bindBtn('btnTouchLeft', () => this.game.player.moveLeft());
    bindBtn('btnTouchRight', () => this.game.player.moveRight());
    bindBtn('btnTouchJump', () => this.game.player.jump());
    bindBtn('btnTouchSlide', () => this.game.player.slide());

    // Screen Buttons
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

    // Share Score Button
    document.getElementById('btnShareScore').addEventListener('click', () => {
      this.game.shareScore();
    });

    // Cosmetic Trail Selector
    const trailSel = document.getElementById('trailSelector');
    if (trailSel) {
      trailSel.addEventListener('change', (e) => {
        this.game.player.trailType = e.target.value;
      });
    }

    // Window Resize
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

    // Engine Components
    this.audio = new AudioManager();
    this.perspective = new PerspectiveEngine(this.canvas);
    this.particles = new ParticleSystem(350);
    this.player = new Player(this);
    this.obstacles = new ObstacleManager(this);
    this.collectibles = new CollectibleManager(this);
    this.powerUps = new PowerUpManager(this);
    this.environment = new EnvironmentManager(this);
    this.missions = new MissionManager(this);
    this.input = new InputManager(this);

    // State Machine: MENU, PLAYING, PAUSED, GAME_OVER, FINALE, RESULTS
    this.state = 'MENU';

    // Game Stats
    this.score = 0;
    this.distance = 0;
    this.modaks = 0;
    this.coins = 0;
    this.lives = 3;
    this.speed = CONFIG.BASE_SPEED;
    this.highScore = 0;

    // Combo System
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.bestCombo = 1;
    this.nearMissCount = 0;

    // Blessing event trigger
    this.lastBlessingDist = 0;

    // Screen Shake FX
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    // Animation Loop Tracking
    this.lastTimestamp = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    this.onResize();
    this.input.bindEvents();
    this.missions.generateMissions();
    this.showMenu();

    // Start single RAF loop
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

  // State Transitions
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

    // Reset systems
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

    document.getElementById('screenGameOver').classList.add('active');
  }

  triggerVisarjanFinale() {
    this.state = 'FINALE';
    this.audio.stopDholRhythm();
    this.audio.playFinale();

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
    mContainer.textContent = `🚩 Missions Completed: ${compCount} / 3`;

    document.getElementById('screenFinale').classList.add('active');
  }

  hideAllScreens() {
    document.querySelectorAll('.screen-overlay').forEach(el => el.classList.remove('active'));
  }

  toggleSound() {
    const isUnmuted = this.audio.toggleMute();
    const soundText = isUnmuted ? '🔊' : '🔇';
    document.getElementById('btnSoundToggle').textContent = soundText;
    document.getElementById('btnToggleSoundPause').textContent = soundText + ' SOUND';
    document.getElementById('startSoundIcon').textContent = soundText;
  }

  shareScore() {
    const text = `🪔 I scored ${Math.floor(this.score)} points and ran ${Math.floor(this.distance)}m in Ganapathi Rush 2.0! Ganapati Bappa Morya! 🙏`;
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

  // --------------------------------------------------------------------------
  // GAMEPLAY MECHANICS & EVENT HANDLERS
  // --------------------------------------------------------------------------
  collectItem(item) {
    if (item.type === 'MODAK') {
      this.audio.playModak();
      this.modaks++;
      this.missions.track('MODAK', 1);

      // Score calculation with active multipliers
      const basePoints = 10;
      const scoreMul = this.powerUps.isDoubleScore ? 2 : 1;
      const points = basePoints * this.comboMultiplier * scoreMul;
      this.score += points;

      // Combo Increment
      this.comboCount++;
      this.comboTimer = 3.6; // Refresh combo timer
      this.evaluateComboTier();

      // Collect Sparkles
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
    this.comboCount += 2; // Bonus combo boost
    this.comboTimer = 3.6;
    this.evaluateComboTier();
    this.missions.track('NEAR_MISS', 1);

    this.showBannerAlert('NEAR MISS! +150 ✨');

    // Whoosh particle arc
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

    // Grants temporary double score + shield
    this.powerUps.isDoubleScore = true;
    this.powerUps.doubleScoreTimer = 14.0;
    this.powerUps.hasShield = true;
    this.powerUps.updateHUD();

    // Divine golden particle shower
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
    if (this.player.invulnerableTimer > 0) return;

    for (let i = 0; i < this.obstacles.obstacles.length; i++) {
      const obs = this.obstacles.obstacles[i];
      if (obs.hit) continue;

      // Depth match threshold (near player plane Z ~ 0)
      if (Math.abs(obs.z) < CONFIG.HIT_DEPTH_THRESHOLD) {
        const laneDiff = Math.abs(this.player.currentLaneX - (obs.lane - 1));

        if (laneDiff < CONFIG.PLAYER_HIT_W) {
          // Check Vertical Clearance based on obstacle type & player action
          let isHit = false;

          if (obs.type === 'TORAN') {
            // Overhead Toran: Safe if sliding, hit if standing or jumping!
            if (!this.player.isSliding) {
              isHit = true;
            }
          } else {
            // Ground obstacles: Safe if jumped over with sufficient clearance
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
    // If Bappa Boost active: plow through obstacle without damage!
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

    // If Divine Shield is active: absorb collision!
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

    // Take Damage: Lose Life
    this.lives--;
    this.updateLivesHUD();
    this.audio.playHit();
    this.triggerScreenShake(12, 0.35);
    this.player.invulnerableTimer = CONFIG.INVULNERABLE_TIME;

    // Reset combo chain on hit
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;

    // Hit particle explosion
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

  showBannerAlert(text) {
    const alert = document.getElementById('bannerAlert');
    if (!alert) return;
    alert.textContent = text;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 950);
  }

  updateHUD() {
    document.getElementById('hudScore').textContent = Math.floor(this.score);
    document.getElementById('hudDistance').textContent = Math.floor(this.distance);
    document.getElementById('hudModaks').textContent = this.modaks;
    document.getElementById('hudCoins').textContent = this.coins;

    // Combo text & timer bar
    const comboText = document.getElementById('hudComboText');
    const comboFill = document.getElementById('hudComboFill');
    if (comboText && comboFill) {
      comboText.textContent = `COMBO x${this.comboMultiplier}`;
      const fillPct = Math.max(0, Math.min(100, (this.comboTimer / 3.6) * 100));
      comboFill.style.width = fillPct + '%';
    }
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
    // Cap delta time to 0.1s to prevent huge jumps when switching tabs
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();

    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  update(dt) {
    // Dynamic Speed Scaling
    let targetSpeed = CONFIG.BASE_SPEED + this.distance * CONFIG.SPEED_ACCEL;
    if (this.powerUps.isBoostActive) targetSpeed *= 1.45;
    if (this.powerUps.isSlowTime) targetSpeed *= 0.55;
    this.speed = Math.min(CONFIG.MAX_SPEED, targetSpeed);

    // Distance & Distance-based scoring
    const distanceDelta = this.speed * dt * 0.1;
    this.distance += distanceDelta;
    this.score += distanceDelta * 1.2 * (this.powerUps.isDoubleScore ? 2 : 1);
    this.missions.track('DISTANCE', Math.floor(distanceDelta));

    // Combo Decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
      }
    }

    // Rare Bappa's Blessing Event (every ~650m)
    if (this.distance - this.lastBlessingDist > 650 && Math.random() < 0.005) {
      this.lastBlessingDist = this.distance;
      this.triggerBlessing();
    }

    // Check Grand Visarjan Finale Milestone (~2600m)
    if (this.distance >= CONFIG.VISARJAN_DISTANCE) {
      this.triggerVisarjanFinale();
      return;
    }

    // Update Engine Subsystems
    this.player.update(dt);
    this.obstacles.update(dt);
    this.collectibles.update(dt);
    this.powerUps.update(dt);
    this.environment.update(dt);
    this.particles.update(dt);

    // Collision Detection
    this.checkCollisions();

    // Screen Shake update
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.shakeIntensity = 0;
      }
    }

    this.updateHUD();
  }

  render() {
    this.ctx.save();

    // Apply Screen Shake
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.ctx.translate(shakeX, shakeY);
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Sky, Stars & Silhouettes
    this.environment.renderSky(this.ctx, this.width, this.height);

    // 2. Road, Curbs & Festive Lights
    this.environment.renderRoad(this.ctx);

    // 3. Obstacles (sorted back-to-front)
    this.obstacles.render(this.ctx);

    // 4. Collectibles & Power-Up Tokens
    this.collectibles.render(this.ctx);
    this.powerUps.render(this.ctx);

    // 5. Player Character & Auras
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.player.render(this.ctx);
    }

    // 6. Particle FX & Sparkles
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
