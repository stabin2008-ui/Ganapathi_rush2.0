/**
 * ============================================================================
 * GANAPATHI RUSH 2.0 — TRUE 3D MASTER FESTIVAL RUNNER
 * "Run • Collect • Celebrate • Reach Bappa"
 * Built with Three.js (WebGL), Real 3D Meshes, Dynamic Lighting & Shadows,
 * Procedural Indian Devotee Character, Volumetric Festival Vehicles,
 * 3D Heritage Havelis, Bazaars, Ganesh Pandals, Overhead Wire Canopies,
 * 3D Diyas, Rangoli, Star Kandils, Fireworks, and Web Audio API.
 * ============================================================================
 */

'use strict';

// ----------------------------------------------------------------------------
// 1. CONSTANTS & CONFIGURATION
// ----------------------------------------------------------------------------
const CONFIG = {
  // True 3D World & Lane Coordinates
  LANE_COUNT: 3,
  LANE_WIDTH: 3.2,
  LANES: [-3.2, 0, 3.2],       // 0: Left (-3.2), 1: Center (0), 2: Right (+3.2)
  PLAYER_Z: 0,
  ROAD_WIDTH: 11.5,
  ROAD_SEGMENT_LENGTH: 40.0,
  ROAD_SEGMENT_COUNT: 7,       // Segments from Z = +40 down to Z = -240
  SPAWN_Z: -140.0,             // Horizon spawn distance (inside 50-240 fog range for smooth fade-in)
  DESPAWN_Z: 4.5,              // Despawn behind player before reaching camera

  // Camera Third-Person Perspective Configuration
  CAM_FOV: 55,
  CAM_POS_Y: 4.2,
  CAM_POS_Z: 9.6,
  CAM_LOOK_Y: 1.65,
  CAM_LOOK_Z: -18.0,
  CAM_NEAR: 0.1,
  CAM_FAR: 380,
  CAM_LERP_SPEED: 8.5,

  // Player Physics & Movement
  BASE_SPEED: 32.0,            // Starting speed (world units/s)
  MAX_SPEED: 70.0,             // Max top speed
  SPEED_ACCEL: 0.014,          // Speed increment per meter traveled
  LANE_LERP_SPEED: 18.0,       // Lateral lane interpolation
  JUMP_FORCE: 14.5,            // Jump launch velocity
  GRAVITY: -36.0,              // Gravity acceleration
  SLIDE_DURATION: 0.60,        // Slide crouch duration
  MAX_JUMP_HEIGHT: 2.8,

  // Collision Hitbox Thresholds (World Units)
  PLAYER_HIT_W: 1.2,
  PLAYER_HIT_H: 2.1,
  PLAYER_SLIDE_H: 0.9,
  HIT_DEPTH_Z: 1.8,

  // Milestones & Destination
  DESTINATION_DISTANCE: 2400,  // Distance to reach Grand Ganesha Pandal
  INVULNERABLE_TIME: 1.35,     // Post-hit invulnerability

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
    return this.isMuted;
  }

  play(soundName) {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    switch (soundName) {
      case 'whoosh':
      case 'slide':
        this.playSlide();
        break;
      case 'jump':
        this.playJump();
        break;
      case 'modak':
        this.playModak();
        break;
      case 'coin':
        this.playCoin();
        break;
      case 'hit':
        this.playHit();
        break;
      case 'shield':
        this.playShield();
        break;
      case 'shieldBreak':
        this.playShieldBreak();
        break;
      case 'gameOver':
        this.playGameOver();
        break;
      case 'nearMiss':
        this.playNearMiss();
        break;
    }
  }

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

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

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

  playJump() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.18);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playSlide() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.28;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.28);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playHit() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.26);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.30);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.30);
  }

  playShieldBreak() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.3);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  playPowerUp() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.2, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.18);
    });
  }

  playNearMiss() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(1480, t + 0.15);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playLand() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playClick() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.04);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playGameOver() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const notes = [392.00, 349.23, 329.63, 261.63];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);
      gain.gain.setValueAtTime(0.22, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.35);
    });
  }

  playFinale() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.25, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.5);
    });
  }

  playDholBass() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playTashaSnare() {
    if (!this.unlocked || this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    gain.gain.setValueAtTime(0.20, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.10);
  }

  startDholRhythm() {
    if (this.isPlayingRhythm) return;
    this.isPlayingRhythm = true;
    this.rhythmStep = 0;

    const pattern = [
      { bass: true, snare: false },
      { bass: false, snare: true },
      { bass: false, snare: true },
      { bass: true, snare: false },
      { bass: false, snare: true },
      { bass: true, snare: true },
      { bass: false, snare: true },
      { bass: true, snare: false }
    ];

    this.rhythmTimer = setInterval(() => {
      if (!this.isPlayingRhythm) return;
      const beat = pattern[this.rhythmStep % pattern.length];
      if (beat.bass) this.playDholBass();
      if (beat.snare) this.playTashaSnare();
      this.rhythmStep++;
    }, 150);
  }

  stopDholRhythm() {
    this.isPlayingRhythm = false;
    if (this.rhythmTimer) {
      clearInterval(this.rhythmTimer);
      this.rhythmTimer = null;
    }
  }
}

// ----------------------------------------------------------------------------
// 3. TRUE 3D RENDERER & SCENE MANAGER (Three.js WebGL & Atmospheric Night Lighting)
// ----------------------------------------------------------------------------
class ThreeSceneManager {
  constructor(canvas) {
    this.canvas = canvas || document.getElementById('gameCanvas') || document.getElementById('webgl-canvas');
    if (!this.canvas) {
      console.error('Fatal: canvas not found in DOM');
      return;
    }

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Scene Root & Atmospheric Night Fog (Rich Deep Twilight Indigo/Purple, NEVER pitch black!)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x161331); // Rich Deep Indigo Night Sky
    this.scene.fog = new THREE.Fog(0x181432, 50, 240);

    // 2. Perspective Camera (Fixed Cinematic Endless-Runner Viewport)
    this.camera = new THREE.PerspectiveCamera(
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_FOV) ? CONFIG.CAM_FOV : 55,
      this.width / this.height,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_NEAR) ? CONFIG.CAM_NEAR : 0.1,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_FAR) ? CONFIG.CAM_FAR : 380
    );
    this.camera.position.set(
      0,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_POS_Y) ? CONFIG.CAM_POS_Y : 4.2,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_POS_Z) ? CONFIG.CAM_POS_Z : 9.6
    );
    this.camera.lookAt(
      0,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_LOOK_Y) ? CONFIG.CAM_LOOK_Y : 1.65,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_LOOK_Z) ? CONFIG.CAM_LOOK_Z : -18.0
    );

    // 3. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    // Rich Cinematic Tone Mapping (Exposure 1.12 brings out rich midtones and architectural detail)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Soft Shadow Mapping (Optimized for smooth 60fps)
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
    this.setupNightSky();
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // A. Ambient Foundation: Rich twilight indigo ambient (brings out building facades & crowds)
    this.ambientLight = new THREE.AmbientLight(0x3730a3, 0.82);
    this.scene.add(this.ambientLight);

    // B. Hemisphere Atmosphere: Deep royal purple sky + warm amber festival ground bounce
    this.hemiLight = new THREE.HemisphereLight(0x4b3fae, 0xf59e0b, 0.95);
    this.scene.add(this.hemiLight);

    // C. Directional Key Light: Cool silver moonlight casting crisp soft shadows
    this.dirLight = new THREE.DirectionalLight(0xdbeafe, 1.10);
    this.dirLight.position.set(-18, 48, 24);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 160;
    this.dirLight.shadow.camera.left = -24;
    this.dirLight.shadow.camera.right = 24;
    this.dirLight.shadow.camera.top = 24;
    this.dirLight.shadow.camera.bottom = -24;
    this.dirLight.shadow.bias = -0.0004;
    this.scene.add(this.dirLight);

    // D. Dynamic Player Diya Glow: Warm golden lantern light attached to player
    this.playerGlow = new THREE.PointLight(0xffb703, 1.35, 10.0, 2.0);
    this.playerGlow.position.set(0, 2.0, 1.0);
    this.scene.add(this.playerGlow);
  }

  setupNightSky() {
    this.skyGroup = new THREE.Group();

    // 0. Sky Hemisphere Gradient Dome (Deep Midnight Navy to Royal Purple Horizon)
    const skyGeo = new THREE.SphereGeometry(230, 32, 16);
    const pos = skyGeo.attributes.position;
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const factor = Math.max(0, Math.min(1, y / 230));
      // Top: Deep midnight navy (15/255, 12/255, 41/255)
      // Horizon: Warm royal twilight purple (40/255, 30/255, 75/255)
      const r = (15 + (40 - 15) * (1 - factor)) / 255;
      const g = (12 + (30 - 12) * (1 - factor)) / 255;
      const b = (41 + (75 - 41) * (1 - factor)) / 255;
      colors.push(r, g, b);
    }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const skyMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.skyGroup.add(this.skyMesh);

    // 1. Twinkling Starfield (1200 stars placed inside visible fog arc)
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.40;
      const r = 160 + Math.random() * 55;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi) + 12;
      starPositions[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 25;

      const isGolden = Math.random() > 0.82;
      starColors[i * 3] = isGolden ? 1.0 : 0.88;
      starColors[i * 3 + 1] = isGolden ? 0.90 : 0.92;
      starColors[i * 3 + 2] = isGolden ? 0.65 : 1.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.88
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.skyGroup.add(this.stars);

    // 2. 3D Silver-Gold Crescent Moon with Soft Halo (Placed inside visible range)
    const moonGroup = new THREE.Group();
    moonGroup.position.set(38, 54, -180);

    const moonGeo = new THREE.SphereGeometry(6.5, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moon);

    const haloGeo = new THREE.RingGeometry(7.0, 16.0, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffe89e,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    moonGroup.add(halo);

    this.skyGroup.add(moonGroup);
    this.scene.add(this.skyGroup);
  }

  resize(width, height) {
    const w = width || (this.canvas && this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth);
    const h = height || (this.canvas && this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  onResize() {
    this.resize();
  }

  updateCamera(playerX, dt = 0.016) {
    const targetCamX = playerX * 0.35;
    this.camera.position.x += (targetCamX - this.camera.position.x) * 8.0 * dt;
    this.camera.lookAt(
      targetCamX * 0.4,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_LOOK_Y) ? CONFIG.CAM_LOOK_Y : 1.65,
      (typeof CONFIG !== 'undefined' && CONFIG.CAM_LOOK_Z) ? CONFIG.CAM_LOOK_Z : -18.0
    );

    if (this.playerGlow) {
      this.playerGlow.position.x = playerX;
      this.playerGlow.position.z = (typeof CONFIG !== 'undefined' && CONFIG.PLAYER_Z !== undefined) ? CONFIG.PLAYER_Z + 1.0 : 1.0;
    }
  }

  update(dt, playerX = 0, playerY = 0, isSliding = false) {
    this.updateCamera(playerX, dt);

    if (this.playerGlow) {
      this.playerGlow.position.x = playerX;
      this.playerGlow.position.y = 1.6 + playerY * 0.8;
      this.playerGlow.intensity = 1.10 + Math.sin(Date.now() * 0.012) * 0.12;
    }

    if (this.stars) {
      this.stars.rotation.y += 0.0003 * dt;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================================================
// 6. TRUE 3D ROAD & SIDEWALK MANAGER (Matte Night Asphalt, Clear Lanes & Diyas)
// ============================================================================
class Road3DManager {
  constructor(game) {
    this.game = game;
    this.scene = game.three.scene;
    this.segments = [];
    this.diyaLights = [];

    // Procedural Matte Dark Asphalt Texture
    this.asphaltTexture = this.createDarkAsphaltTexture();

    // Road Material: Deep twilight slate-charcoal (Dark & rich, NEVER pure pitch black!)
    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: this.asphaltTexture,
      roughness: 0.80,
      metalness: 0.04,
      color: 0xffffff
    });

    this.curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x8291a5,
      roughness: 0.68,
      metalness: 0.05
    });

    this.sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d4a61,
      roughness: 0.72,
      metalness: 0.06
    });

    this.diyaClayMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.78
    });

    this.diyaFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffb703
    });

    this.petalMatOrange = new THREE.MeshBasicMaterial({ color: 0xff6b1a });
    this.petalMatYellow = new THREE.MeshBasicMaterial({ color: 0xffd152 });
    this.petalMatRose = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

    this.rangoliMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide
    });

    this.urliMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.25
    });

    this.initRoadSegments();
  }

  createWetAsphaltTexture() {
    return this.createDarkAsphaltTexture();
  }

  createDarkAsphaltTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Deep Midnight Slate Indigo Asphalt Base (Rich textured asphalt, NOT black!)
    ctx.fillStyle = '#242b40';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Subtle Matte Grain Texture
    for (let i = 0; i < 14000; i++) {
      const gx = Math.random() * 1024;
      const gy = Math.random() * 1024;
      const gColor = Math.random() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(10,14,24,0.06)';
      ctx.fillStyle = gColor;
      ctx.fillRect(gx, gy, 2, 2);
    }

    // 3. Subtle Tire Tracks
    ctx.fillStyle = 'rgba(20, 24, 38, 0.45)';
    ctx.fillRect(160, 0, 120, 1024);
    ctx.fillRect(380, 0, 120, 1024);
    ctx.fillRect(560, 0, 120, 1024);
    ctx.fillRect(780, 0, 120, 1024);

    // 4. Solid Crisp White Outer Curb Lines
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(16, 0, 18, 1024);
    ctx.fillRect(990, 0, 18, 1024);

    // 5. Crisp Dashed Lane Dividing Stripes (Golden-Ivory festival lane markers)
    const dashH = 96;
    const gapH = 64;
    const totalStep = dashH + gapH;

    for (let y = 0; y < 1024; y += totalStep) {
      // Left Lane Divider (Crisp Ivory)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(328, y, 15, dashH);

      // Right Lane Divider (Crisp Ivory)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(682, y, 15, dashH);

      // Center Lane Accents (Warm Golden Amber)
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(505, y + 20, 14, dashH * 0.65);
    }

    // 6. Scattered Marigold & Rose Festival Petals on Road
    for (let p = 0; p < 80; p++) {
      const px = Math.random() * 960 + 32;
      const py = Math.random() * 1024;
      const pColor = Math.random() > 0.6 ? '#f97316' : (Math.random() > 0.3 ? '#facc15' : '#e11d48');
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.ellipse(px, py, 3.5, 2.0, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }

  initRoadSegments() {
    const count = (typeof CONFIG !== 'undefined' && CONFIG.ROAD_SEGMENT_COUNT) ? CONFIG.ROAD_SEGMENT_COUNT : 7;
    const length = (typeof CONFIG !== 'undefined' && CONFIG.ROAD_SEGMENT_LENGTH) ? CONFIG.ROAD_SEGMENT_LENGTH : 40.0;

    for (let i = 0; i < count; i++) {
      const z = -i * length + 40.0;
      const seg = this.createRoadSegment(length, z);
      this.segments.push(seg);
      this.scene.add(seg.group);
    }
  }

  createRoadSegment(length, z) {
    const group = new THREE.Group();
    group.position.set(0, 0, z);

    const roadW = (typeof CONFIG !== 'undefined' && CONFIG.ROAD_WIDTH) ? CONFIG.ROAD_WIDTH : 11.5;

    // 1. Main 3-Lane Asphalt Mesh
    const roadGeo = new THREE.PlaneGeometry(roadW, length);
    roadGeo.rotateX(-Math.PI * 0.5);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // 2. Left & Right Stone Curbs
    [-1, 1].forEach(side => {
      const curbGeo = new THREE.BoxGeometry(0.35, 0.28, length);
      const curb = new THREE.Mesh(curbGeo, this.curbMaterial);
      curb.position.set(side * (roadW * 0.5 + 0.175), 0.14, 0);
      curb.receiveShadow = true;
      group.add(curb);

      // Sidewalk Walkway
      const swGeo = new THREE.BoxGeometry(4.8, 0.20, length);
      const sw = new THREE.Mesh(swGeo, this.sidewalkMaterial);
      sw.position.set(side * (roadW * 0.5 + 2.75), 0.10, 0);
      sw.receiveShadow = true;
      group.add(sw);

      // Delicate Clay Diyas Along Curbs
      const diyaSpacing = 4.0;
      const diyaCount = Math.floor(length / diyaSpacing);
      for (let d = 0; d < diyaCount; d++) {
        const dz = -length * 0.5 + d * diyaSpacing + 2.0;
        const diyaGroup = this.createDiyaMesh();
        diyaGroup.position.set(side * (roadW * 0.5 + 0.175), 0.28, dz);
        group.add(diyaGroup);
      }
    });

    // 3. Scattered Festive Flower Petals on Asphalt Surface
    const petalGeo = new THREE.CircleGeometry(0.08, 5);
    petalGeo.rotateX(-Math.PI * 0.5);
    for (let p = 0; p < 24; p++) {
      const pColor = Math.random() > 0.5 ? this.petalMatOrange : (Math.random() > 0.5 ? this.petalMatYellow : this.petalMatRose);
      const petal = new THREE.Mesh(petalGeo, pColor);
      const px = (Math.random() - 0.5) * (roadW - 1.2);
      const pz = (Math.random() - 0.5) * (length - 2.0);
      petal.position.set(px, 0.015, pz);
      petal.rotation.y = Math.random() * Math.PI * 2;
      group.add(petal);
    }

    return { group: group, z: z, length: length };
  }

  createDiyaMesh() {
    const diya = new THREE.Group();

    // Clay Bowl (Terracotta)
    const bowlGeo = new THREE.CylinderGeometry(0.11, 0.06, 0.07, 8);
    const bowl = new THREE.Mesh(bowlGeo, this.diyaClayMat);
    bowl.position.y = 0.035;
    diya.add(bowl);

    // Miniature Golden Flame
    const flameGeo = new THREE.ConeGeometry(0.045, 0.09, 6);
    const flame = new THREE.Mesh(flameGeo, this.diyaFlameMat);
    flame.position.y = 0.10;
    diya.add(flame);

    return diya;
  }

  createRangoliMesh() {
    const rGroup = new THREE.Group();
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.8, 16), this.rangoliMat);
    ring1.rotation.x = -Math.PI * 0.5;
    rGroup.add(ring1);
    return rGroup;
  }

  createUrliMesh() {
    const urli = new THREE.Group();
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.3, 12), this.urliMat);
    bowl.position.y = 0.15;
    urli.add(bowl);
    return urli;
  }

  reset() {
    const length = (typeof CONFIG !== 'undefined' && CONFIG.ROAD_SEGMENT_LENGTH) ? CONFIG.ROAD_SEGMENT_LENGTH : 40.0;
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].group.position.z = -i * length + 40.0;
    }
  }

  update(moveDist) {
    const count = this.segments.length;
    const length = (typeof CONFIG !== 'undefined' && CONFIG.ROAD_SEGMENT_LENGTH) ? CONFIG.ROAD_SEGMENT_LENGTH : 40.0;
    const totalSpan = count * length;

    for (let i = 0; i < count; i++) {
      const seg = this.segments[i];
      seg.group.position.z += moveDist;

      if (seg.group.position.z > 40.0) {
        seg.group.position.z -= totalSpan;
      }
    }
  }
}



// ============================================================================
// 5. TRUE 3D PLAYER CHARACTER (Stylized Human Devotee Runner with Anatomical Geometry)
// ============================================================================
class Player3D {
  constructor(game) {
    this.game = game;
    this.scene = game.three.scene;

    // Single Authoritative Lane Variable (0: Left, 1: Center, 2: Right)
    this.targetLane = 1;
    this.lane = 1;          // Kept synchronized for full backward compatibility
    this.currentX = 0;      // Interpolated 3D X coordinate
    this.jumpY = 0;         // Vertical height off ground
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.runCycle = 0;
    this.invulnerableTimer = 0;

    // PBR-Style Materials - Authentic Indian Festival Devotee Palette
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xba7d56, // Natural warm Indian skin tone
      roughness: 0.58,
      metalness: 0.02
    });

    this.kurtaMat = new THREE.MeshStandardMaterial({
      color: 0xfffefb, // Pure ivory raw silk with realistic fabric matte
      roughness: 0.52,
      metalness: 0.02
    });

    this.kurtaTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd152, // Golden zari embroidered border & button accents
      roughness: 0.30,
      metalness: 0.80,
      emissive: 0x92400e,
      emissiveIntensity: 0.25
    });

    this.dhotiMat = new THREE.MeshStandardMaterial({
      color: 0xea580c, // Ceremonial saffron orange cloth
      roughness: 0.60,
      metalness: 0.03
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x14100c, // Dark cropped hair
      roughness: 0.88
    });

    this.turbanMat = new THREE.MeshStandardMaterial({
      color: 0xd9480f, // Deep festive saffron pagdi cloth
      roughness: 0.58,
      metalness: 0.05
    });

    this.goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd152, // Polished gold kada (bangles) & kalgi brooch
      metalness: 0.88,
      roughness: 0.18,
      emissive: 0x78350f,
      emissiveIntensity: 0.15
    });

    this.shoeMat = new THREE.MeshStandardMaterial({
      color: 0x3d1708, // Traditional burnished leather Mojari
      roughness: 0.46,
      metalness: 0.15
    });

    this.buildCharacterMesh();
  }

  createSoftShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
    grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.32)');
    grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.08)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  buildCharacterMesh() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);

    // Hero scaling factor (+18% for heroic presence and clear gameplay readability)
    this.group.scale.set(1.18, 1.18, 1.18);

    // 1. Soft Dynamic Radial Drop Shadow (Smooth circular gradient, NO rectangular box!)
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.createSoftShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI * 0.5;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);

    // 2. Character Body Root Hierarchy (Centered at hips)
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 0.94; // Natural human hip height
    this.group.add(this.bodyGroup);

    // ---------------- Pelvis & Saffron Pleated Dhoti ----------------
    this.pelvis = new THREE.Group();
    this.bodyGroup.add(this.pelvis);

    // Anatomical Pelvis contour
    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.30, 14);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.dhotiMat);
    pelvisMesh.position.y = -0.05;
    pelvisMesh.castShadow = true;
    this.pelvis.add(pelvisMesh);

    // Front Central Kashta Pleat Drape with subtle taper
    const kashtaGeo = new THREE.BoxGeometry(0.14, 0.44, 0.12);
    const kashta = new THREE.Mesh(kashtaGeo, this.dhotiMat);
    kashta.position.set(0, -0.16, 0.13);
    this.pelvis.add(kashta);

    // Kashta Gold Zari Border
    const kashtaZariGeo = new THREE.BoxGeometry(0.15, 0.04, 0.13);
    const kashtaZari = new THREE.Mesh(kashtaZariGeo, this.kurtaTrimMat);
    kashtaZari.position.set(0, -0.37, 0.13);
    this.pelvis.add(kashtaZari);

    // ---------------- Upper Torso & Ivory Silk Kurta ----------------
    this.torso = new THREE.Group();
    this.torso.position.y = 0.12;
    this.bodyGroup.add(this.torso);

    // Anatomical Chest & Waist with natural athletic taper
    const chestGeo = new THREE.CylinderGeometry(0.26, 0.21, 0.54, 14);
    this.torsoMesh = new THREE.Mesh(chestGeo, this.kurtaMat);
    this.torsoMesh.position.y = 0.27;
    this.torsoMesh.castShadow = true;
    this.torso.add(this.torsoMesh);

    // Kurta Lower Skirt Flare (covering upper thighs naturally)
    const skirtGeo = new THREE.CylinderGeometry(0.23, 0.28, 0.36, 14);
    const skirt = new THREE.Mesh(skirtGeo, this.kurtaMat);
    skirt.position.y = -0.02;
    skirt.castShadow = true;
    this.torso.add(skirt);

    // Gold Zari Hem Border along lower edge of Kurta
    const hemZariGeo = new THREE.CylinderGeometry(0.282, 0.285, 0.045, 14);
    const hemZari = new THREE.Mesh(hemZariGeo, this.kurtaTrimMat);
    hemZari.position.y = -0.19;
    this.torso.add(hemZari);

    // Central Placket with Gold Buttons
    const placketGeo = new THREE.BoxGeometry(0.05, 0.38, 0.03);
    const placket = new THREE.Mesh(placketGeo, this.kurtaMat);
    placket.position.set(0, 0.30, 0.24);
    this.torso.add(placket);

    for (let b = 0; b < 3; b++) {
      const buttonGeo = new THREE.SphereGeometry(0.016, 8, 8);
      const button = new THREE.Mesh(buttonGeo, this.goldMat);
      button.position.set(0, 0.40 - b * 0.10, 0.258);
      this.torso.add(button);
    }

    // Mandarin Nehru Collar
    const collarGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.08, 12);
    const collar = new THREE.Mesh(collarGeo, this.kurtaMat);
    collar.position.y = 0.55;
    this.torso.add(collar);

    // ---------------- Head, Face, Turban & Features ----------------
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.64;
    this.torso.add(this.headGroup);

    // Anatomical Tapered Neck
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.105, 0.14, 12);
    const neck = new THREE.Mesh(neckGeo, this.skinMat);
    neck.position.y = -0.05;
    neck.castShadow = true;
    this.headGroup.add(neck);

    // Sculpted Head Cranium & Jawline
    const craniumGeo = new THREE.SphereGeometry(0.19, 16, 14);
    craniumGeo.scale(1.0, 1.15, 1.05);
    const cranium = new THREE.Mesh(craniumGeo, this.skinMat);
    cranium.position.set(0, 0.11, 0);
    cranium.castShadow = true;
    this.headGroup.add(cranium);

    // Jaw & Chin Definition
    const jawGeo = new THREE.ConeGeometry(0.13, 0.16, 8);
    jawGeo.rotateX(Math.PI);
    const jaw = new THREE.Mesh(jawGeo, this.skinMat);
    jaw.position.set(0, 0.02, 0.05);
    this.headGroup.add(jaw);

    // 3D Nose Bridge & Tip
    const noseGeo = new THREE.ConeGeometry(0.032, 0.09, 6);
    noseGeo.rotateX(-Math.PI * 0.42);
    const nose = new THREE.Mesh(noseGeo, this.skinMat);
    nose.position.set(0, 0.11, 0.195);
    this.headGroup.add(nose);

    // Left & Right Anatomical Ears with Helix & Lobe
    [-1, 1].forEach(side => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.185, 0.11, -0.01);

      const earGeo = new THREE.SphereGeometry(0.045, 8, 8);
      earGeo.scale(0.4, 1.1, 0.8);
      const earMesh = new THREE.Mesh(earGeo, this.skinMat);
      earGroup.add(earMesh);

      const earringGeo = new THREE.TorusGeometry(0.018, 0.006, 6, 12);
      const earring = new THREE.Mesh(earringGeo, this.goldMat);
      earring.position.set(0, -0.04, 0);
      earGroup.add(earring);

      this.headGroup.add(earGroup);
    });

    // Dark Cropped Hair under Turban
    const hairGeo = new THREE.SphereGeometry(0.198, 14, 12);
    hairGeo.scale(1.02, 1.05, 1.08);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.set(0, 0.13, -0.03);
    this.headGroup.add(hair);

    // Red Vermilion Tilak / Chandlo on Forehead
    const tilakGeo = new THREE.BoxGeometry(0.022, 0.065, 0.015);
    const tilakMat = new THREE.MeshBasicMaterial({ color: 0xd90429 });
    const tilak = new THREE.Mesh(tilakGeo, tilakMat);
    tilak.position.set(0, 0.17, 0.192);
    this.headGroup.add(tilak);

    // White Chandan Arc below Tilak
    const chandanGeo = new THREE.BoxGeometry(0.055, 0.016, 0.015);
    const chandanMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    const chandan = new THREE.Mesh(chandanGeo, chandanMat);
    chandan.position.set(0, 0.135, 0.192);
    this.headGroup.add(chandan);

    // ---------------- Multi-Layer Wrapped Saffron Pagdi (Turban) ----------------
    this.turbanGroup = new THREE.Group();
    this.turbanGroup.position.set(0, 0.22, 0);
    this.headGroup.add(this.turbanGroup);

    // Tier 1 Base Band Wrap (Slightly tilted festival wrap)
    const tBand1 = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.065, 12, 24), this.turbanMat);
    tBand1.rotation.x = Math.PI * 0.46;
    tBand1.rotation.y = 0.08;
    tBand1.castShadow = true;
    this.turbanGroup.add(tBand1);

    // Tier 2 Middle Wrap Fold
    const tBand2 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.07, 12, 24), this.turbanMat);
    tBand2.position.set(0, 0.07, -0.01);
    tBand2.rotation.x = Math.PI * 0.48;
    tBand2.rotation.y = -0.06;
    tBand2.castShadow = true;
    this.turbanGroup.add(tBand2);

    // Tier 3 Top Crown Dome
    const tDome = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 12), this.turbanMat);
    tDome.scale.set(1.05, 0.85, 1.15);
    tDome.position.set(0, 0.09, -0.02);
    tDome.castShadow = true;
    this.turbanGroup.add(tDome);

    // Front Central Turban Rosette Pleat Knot
    const knotGeo = new THREE.SphereGeometry(0.065, 10, 10);
    knotGeo.scale(1.2, 0.8, 0.9);
    const knot = new THREE.Mesh(knotGeo, this.turbanMat);
    knot.position.set(0, 0.04, 0.195);
    this.turbanGroup.add(knot);

    // Royal Golden Kalgi (Turban Brooch) with Ruby Gemstone
    const kalgiBaseGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.07, 8);
    const kalgiBase = new THREE.Mesh(kalgiBaseGeo, this.goldMat);
    kalgiBase.position.set(0, 0.08, 0.205);
    this.turbanGroup.add(kalgiBase);

    // Ruby Centerpiece
    const rubyGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.15,
      metalness: 0.35,
      emissive: 0x881337,
      emissiveIntensity: 0.35
    });
    const ruby = new THREE.Mesh(rubyGeo, rubyMat);
    ruby.position.set(0, 0.08, 0.225);
    this.turbanGroup.add(ruby);

    // Golden Kalgi Feathers / Plume Sprig
    const plumeGeo = new THREE.ConeGeometry(0.038, 0.18, 6);
    plumeGeo.rotateZ(0.12);
    const plume = new THREE.Mesh(plumeGeo, this.goldMat);
    plume.position.set(0.015, 0.20, 0.195);
    this.turbanGroup.add(plume);

    // ---------------- Articulated Arms, Sleeves & Hands ----------------
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.29, 0.44, 0);
    this.torso.add(this.leftShoulder);

    const upperArmGeo = new THREE.CylinderGeometry(0.085, 0.072, 0.32, 10);
    const upperArmL = new THREE.Mesh(upperArmGeo, this.kurtaMat);
    upperArmL.position.y = -0.15;
    upperArmL.castShadow = true;
    this.leftShoulder.add(upperArmL);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.set(0, -0.30, 0);
    this.leftShoulder.add(this.leftElbow);

    const forearmGeo = new THREE.CylinderGeometry(0.072, 0.062, 0.28, 10);
    const forearmL = new THREE.Mesh(forearmGeo, this.kurtaMat);
    forearmL.position.y = -0.13;
    forearmL.castShadow = true;
    this.leftElbow.add(forearmL);

    const kadaGeo = new THREE.TorusGeometry(0.068, 0.014, 8, 16);
    const kadaL = new THREE.Mesh(kadaGeo, this.goldMat);
    kadaL.rotation.x = Math.PI * 0.5;
    kadaL.position.y = -0.26;
    this.leftElbow.add(kadaL);

    const handL = new THREE.Group();
    handL.position.set(0, -0.30, 0);

    const palmL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.10, 0.05), this.skinMat);
    palmL.position.y = -0.04;
    palmL.castShadow = true;
    handL.add(palmL);

    const fingersL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), this.skinMat);
    fingersL.position.set(0, -0.105, 0.005);
    handL.add(fingersL);

    const thumbL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.065, 6), this.skinMat);
    thumbL.rotation.z = 0.6;
    thumbL.position.set(0.045, 0.02, 0.03);
    handL.add(thumbL);
    this.leftElbow.add(handL);

    // Right Arm
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.29, 0.44, 0);
    this.torso.add(this.rightShoulder);

    const upperArmR = new THREE.Mesh(upperArmGeo, this.kurtaMat);
    upperArmR.position.y = -0.15;
    upperArmR.castShadow = true;
    this.rightShoulder.add(upperArmR);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.set(0, -0.30, 0);
    this.rightShoulder.add(this.rightElbow);

    const forearmR = new THREE.Mesh(forearmGeo, this.kurtaMat);
    forearmR.position.y = -0.13;
    forearmR.castShadow = true;
    this.rightElbow.add(forearmR);

    const kadaR = new THREE.Mesh(kadaGeo, this.goldMat);
    kadaR.rotation.x = Math.PI * 0.5;
    kadaR.position.y = -0.26;
    this.rightElbow.add(kadaR);

    const handR = new THREE.Group();
    handR.position.set(0, -0.30, 0);

    const palmR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.10, 0.05), this.skinMat);
    palmR.position.y = -0.04;
    palmR.castShadow = true;
    handR.add(palmR);

    const fingersR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), this.skinMat);
    fingersR.position.set(0, -0.105, 0.005);
    handR.add(fingersR);

    const thumbR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, 0.065, 6), this.skinMat);
    thumbR.rotation.z = -0.6;
    thumbR.position.set(-0.045, 0.02, 0.03);
    handR.add(thumbR);
    this.rightElbow.add(handR);

    // ---------------- Articulated Legs & Traditional Mojaris ----------------
    this.leftHip = new THREE.Group();
    this.leftHip.position.set(-0.18, -0.15, 0);
    this.pelvis.add(this.leftHip);

    const thighGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.42, 10);
    const thighL = new THREE.Mesh(thighGeo, this.dhotiMat);
    thighL.position.y = -0.19;
    thighL.castShadow = true;
    this.leftHip.add(thighL);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.set(0, -0.40, 0);
    this.leftHip.add(this.leftKnee);

    const calfGeo = new THREE.CylinderGeometry(0.11, 0.075, 0.40, 10);
    const calfL = new THREE.Mesh(calfGeo, this.dhotiMat);
    calfL.position.y = -0.18;
    calfL.castShadow = true;
    this.leftKnee.add(calfL);

    this.leftFoot = new THREE.Group();
    this.leftFoot.position.set(0, -0.38, 0.04);
    this.leftKnee.add(this.leftFoot);

    const mojariBodyGeo = new THREE.BoxGeometry(0.15, 0.11, 0.34);
    const mojariL = new THREE.Mesh(mojariBodyGeo, this.shoeMat);
    mojariL.position.set(0, 0, 0.02);
    this.leftFoot.add(mojariL);

    const toeCurlGeo = new THREE.ConeGeometry(0.055, 0.13, 6);
    toeCurlGeo.rotateX(-Math.PI * 0.4);
    const toeCurlL = new THREE.Mesh(toeCurlGeo, this.goldMat);
    toeCurlL.position.set(0, 0.04, 0.20);
    this.leftFoot.add(toeCurlL);

    // Right Leg
    this.rightHip = new THREE.Group();
    this.rightHip.position.set(0.18, -0.15, 0);
    this.pelvis.add(this.rightHip);

    const thighR = new THREE.Mesh(thighGeo, this.dhotiMat);
    thighR.position.y = -0.19;
    thighR.castShadow = true;
    this.rightHip.add(thighR);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.set(0, -0.40, 0);
    this.rightHip.add(this.rightKnee);

    const calfR = new THREE.Mesh(calfGeo, this.dhotiMat);
    calfR.position.y = -0.18;
    calfR.castShadow = true;
    this.rightKnee.add(calfR);

    this.rightFoot = new THREE.Group();
    this.rightFoot.position.set(0, -0.38, 0.04);
    this.rightKnee.add(this.rightFoot);

    const mojariR = new THREE.Mesh(mojariBodyGeo, this.shoeMat);
    mojariR.position.set(0, 0, 0.02);
    this.rightFoot.add(mojariR);

    const toeCurlR = new THREE.Mesh(toeCurlGeo, this.goldMat);
    toeCurlR.position.set(0, 0.04, 0.20);
    this.rightFoot.add(toeCurlR);

    // ---------------- 4. POLISHED DIVINE BLESSING SHIELD (Vibrant power-up aura, NO wireframe!) ----------------
    this.shieldGroup = new THREE.Group();
    this.shieldGroup.position.y = 1.0;
    this.shieldGroup.visible = false;

    // A. Vibrant Translucent Energy Dome with Additive Glow
    const shieldSphereGeo = new THREE.SphereGeometry(0.95, 32, 24);
    const shieldSphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.shieldSphere = new THREE.Mesh(shieldSphereGeo, shieldSphereMat);
    this.shieldGroup.add(this.shieldSphere);

    // B. Soft Glowing Amber Rim Shell
    const rimGeo = new THREE.SphereGeometry(0.98, 32, 24);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.24,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.shieldRim = new THREE.Mesh(rimGeo, rimMat);
    this.shieldGroup.add(this.shieldRim);

    // C. Glowing Equatorial Energy Orbit Ring
    const ringGeo = new THREE.TorusGeometry(1.02, 0.035, 12, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd152,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.shieldOrbitRing = new THREE.Mesh(ringGeo, ringMat);
    this.shieldOrbitRing.rotation.x = Math.PI * 0.35;
    this.shieldGroup.add(this.shieldOrbitRing);

    // D. Orbiting Golden Energy Sparkles
    const pCount = 24;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pPos[i * 3] = 0.95 * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = 0.95 * Math.cos(phi);
      pPos[i * 3 + 2] = 0.95 * Math.sin(phi) * Math.sin(theta);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffe082,
      size: 0.35,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending
    });
    this.shieldParticles = new THREE.Points(pGeo, pMat);
    this.shieldGroup.add(this.shieldParticles);

    this.group.add(this.shieldGroup);
    this.shieldMesh = this.shieldGroup;

    // ---------------- Boost Power-Up Effect ----------------
    const boostGeo = new THREE.ConeGeometry(0.65, 1.8, 12);
    const boostMat = new THREE.MeshBasicMaterial({
      color: 0xffd152,
      transparent: true,
      opacity: 0.55
    });
    this.boostMesh = new THREE.Mesh(boostGeo, boostMat);
    this.boostMesh.rotation.x = Math.PI * 0.5;
    this.boostMesh.position.set(0, 1.0, 1.4);
    this.boostMesh.visible = false;
    this.group.add(this.boostMesh);

    this.scene.add(this.group);
  }

  reset() {
    this.lane = 1;
    this.currentX = 0;
    this.jumpY = 0;
    this.velocityY = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.runCycle = 0;
    this.invulnerableTimer = 0;
    this.targetLane = 1;
    this.lane = 1;
    this.currentX = 0;
    this.group.position.set(0, 0, (typeof CONFIG !== 'undefined' && CONFIG.PLAYER_Z !== undefined) ? CONFIG.PLAYER_Z : 0);
    this.group.rotation.set(0, 0, 0);
    this.shieldGroup.visible = false;
  }

  // CENTRAL AUTHORITATIVE MOVEMENT FUNCTION (Phase 1 Requirement)
  // direction = -1 for Left, +1 for Right
  movePlayer(direction) {
    if (direction === -1) {
      if (this.targetLane > 0) {
        this.targetLane--;
        this.lane = this.targetLane;
        if (this.game && this.game.audio) this.game.audio.play('whoosh');
        return true;
      }
    } else if (direction === 1) {
      if (this.targetLane < 2) {
        this.targetLane++;
        this.lane = this.targetLane;
        if (this.game && this.game.audio) this.game.audio.play('whoosh');
        return true;
      }
    }
    return false;
  }

  moveLeft() {
    return this.movePlayer(-1);
  }

  moveRight() {
    return this.movePlayer(1);
  }

  jump() {
    if (!this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.velocityY = (typeof CONFIG !== 'undefined' && CONFIG.JUMP_FORCE) ? CONFIG.JUMP_FORCE : 14.5;
      if (this.game && this.game.audio) this.game.audio.play('jump');
      return true;
    }
    return false;
  }

  slide() {
    if (!this.isSliding) {
      if (this.isJumping) {
        this.velocityY = -18;
      }
      this.isSliding = true;
      this.slideTimer = (typeof CONFIG !== 'undefined' && CONFIG.SLIDE_DURATION) ? CONFIG.SLIDE_DURATION : 0.60;
      if (this.game && this.game.audio) this.game.audio.play('slide');
      return true;
    }
    return false;
  }

  setShield(active) {
    if (this.shieldGroup) {
      this.shieldGroup.visible = !!active;
    }
  }

  update(dt) {
    // 1. Horizontal Smooth Lane Interpolation (Responsive & Crisp Easing)
    this.targetLane = Math.max(0, Math.min(2, Math.round(this.targetLane)));
    this.lane = this.targetLane;

    const lanePositions = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.LANES))
      ? CONFIG.LANES
      : [-3.2, 0, 3.2];
    const targetX = lanePositions[this.targetLane];

    const snapSpeed = 18.0;
    this.currentX += (targetX - this.currentX) * Math.min(1.0, snapSpeed * dt);
    this.group.position.x = this.currentX;

    // Subtle Bank / Lean into turn
    const bankTarget = (targetX - this.currentX) * -0.15;
    this.group.rotation.z += (bankTarget - this.group.rotation.z) * 14.0 * dt;

    // 2. Vertical Jump & Gravity Physics
    if (this.isJumping) {
      this.jumpY += this.velocityY * dt;
      const grav = (typeof CONFIG !== 'undefined' && CONFIG.GRAVITY) ? CONFIG.GRAVITY : -36.0;
      this.velocityY += grav * dt;

      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.velocityY = 0;
        this.isJumping = false;
      }
    }
    this.group.position.y = this.jumpY;

    // Dynamic Shadow Scaling with Height
    if (this.shadowMesh) {
      const maxH = (typeof CONFIG !== 'undefined' && CONFIG.MAX_JUMP_HEIGHT) ? CONFIG.MAX_JUMP_HEIGHT : 2.8;
      const sScale = Math.max(0.4, 1.0 - (this.jumpY / maxH) * 0.55);
      this.shadowMesh.scale.set(sScale, sScale, sScale);
      this.shadowMesh.material.opacity = Math.max(0.12, 0.85 - (this.jumpY / maxH) * 0.55);
    }

    // 3. Slide Timer & Posture
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.slideTimer = 0;
      }
    }

    // 4. Invulnerability Blink
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.group.visible = Math.floor(Date.now() / 60) % 2 === 0;
      if (this.invulnerableTimer <= 0) {
        this.group.visible = true;
      }
    } else {
      this.group.visible = true;
    }

    // 5. Procedural Human Running & Athletic Animation
    const speedRatio = (this.game && this.game.speed && CONFIG.BASE_SPEED) ? (this.game.speed / CONFIG.BASE_SPEED) : 1.0;
    this.runCycle += 13.5 * speedRatio * dt;

    if (this.isSliding) {
      this.bodyGroup.position.y = 0.38;
      this.bodyGroup.rotation.x = -0.72;
      this.torso.rotation.x = -0.15;
      this.leftHip.rotation.x = 0.95;
      this.rightHip.rotation.x = 0.95;
      this.leftKnee.rotation.x = 0.85;
      this.rightKnee.rotation.x = 0.85;
      this.leftShoulder.rotation.x = 0.85;
      this.rightShoulder.rotation.x = 0.85;
    } else if (this.isJumping) {
      this.bodyGroup.position.y = 0.94;
      this.bodyGroup.rotation.x = 0.05;
      this.torso.rotation.x = 0.05;
      this.leftHip.rotation.x = -0.45;
      this.rightHip.rotation.x = 0.35;
      this.leftKnee.rotation.x = 0.75;
      this.rightKnee.rotation.x = 0.25;
      this.leftShoulder.rotation.x = -0.90;
      this.rightShoulder.rotation.x = 0.80;
    } else {
      const legSin = Math.sin(this.runCycle);
      const armSin = -legSin;

      this.bodyGroup.position.y = 0.94 + Math.abs(legSin) * 0.08;
      this.bodyGroup.rotation.x = 0.12;
      this.bodyGroup.rotation.y = legSin * 0.07;
      this.torso.rotation.y = -legSin * 0.06;
      this.torso.rotation.z = legSin * 0.035;

      this.headGroup.rotation.x = -0.05;
      this.headGroup.rotation.y = -legSin * 0.035;

      this.leftHip.rotation.x = legSin * 0.65;
      this.rightHip.rotation.x = -legSin * 0.65;

      this.leftKnee.rotation.x = (legSin < 0) ? -legSin * 0.85 : 0.12;
      this.rightKnee.rotation.x = (legSin > 0) ? legSin * 0.85 : 0.12;

      this.leftFoot.rotation.x = (legSin > 0) ? -0.15 : 0.35;
      this.rightFoot.rotation.x = (legSin < 0) ? -0.15 : 0.35;

      this.leftShoulder.rotation.x = armSin * 0.72;
      this.rightShoulder.rotation.x = -armSin * 0.72;

      this.leftShoulder.rotation.z = -0.12 - Math.abs(armSin) * 0.08;
      this.rightShoulder.rotation.z = 0.12 + Math.abs(armSin) * 0.08;

      this.leftElbow.rotation.x = -0.85 - armSin * 0.35;
      this.rightElbow.rotation.x = -0.85 + armSin * 0.35;
    }

    // Power-Up Aura Updates: Soft pulse and orbit for Shield
    const hasShield = (this.game && this.game.powerUps && this.game.powerUps.hasShield);
    if (this.shieldGroup) {
      this.shieldGroup.visible = hasShield;
      if (hasShield) {
        const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.04;
        this.shieldGroup.scale.set(pulse, pulse, pulse);
        this.shieldGroup.rotation.y += 1.4 * dt;
        if (this.shieldOrbitRing) {
          this.shieldOrbitRing.rotation.z += 2.2 * dt;
        }
        if (this.shieldParticles) {
          this.shieldParticles.rotation.y -= 2.0 * dt;
        }
      }
    }

    if (this.game && this.game.powerUps) {
      this.boostMesh.visible = !!this.game.powerUps.isBoostActive;
      if (this.boostMesh.visible) {
        this.boostMesh.scale.set(
          1.0 + Math.random() * 0.15,
          1.0 + Math.random() * 0.25,
          1.0 + Math.random() * 0.15
        );
      }
    }
  }
}



// ============================================================================
// 6. TRUE 3D OBSTACLES (Proper Perspective Scaling, No Giant Camera Blockers)
// ============================================================================
class Obstacle3DManager {
  constructor(game) {
    this.game = game;
    this.scene = game.three.scene;
    this.obstacles = [];
    this.spawnDistanceCounter = 0;
    this.minWaveGap = 34.0;

    // Shared Reusable Materials
    this.materials = {
      autoYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.12 }),
      autoGreen: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 }),
      truckBody: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45 }),
      metalBlack: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.55 }),
      tireRubber: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 }),
      silverChrome: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.85, roughness: 0.18 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.72 }),
      woodLight: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 }),
      dholCrimson: new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.52 }),
      dholHead: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.62 }),
      goldTrim: new THREE.MeshStandardMaterial({ color: 0xffd152, metalness: 0.75, roughness: 0.25 }),
      marigoldOrange: new THREE.MeshBasicMaterial({ color: 0xff6b1a }),
      marigoldYellow: new THREE.MeshBasicMaterial({ color: 0xffd152 }),
      roseRed: new THREE.MeshBasicMaterial({ color: 0xd62828 }),
      headlightGlow: new THREE.MeshBasicMaterial({ color: 0xfffbeb }),
      hazardBar: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.52 }),
      drummerSkin: new THREE.MeshStandardMaterial({ color: 0xba7d56, roughness: 0.60 }),
      drummerKurta: new THREE.MeshStandardMaterial({ color: 0xfff9ef, roughness: 0.65 }),
      drummerPagdi: new THREE.MeshStandardMaterial({ color: 0xe05619, roughness: 0.60 })
    };
    // Object Pool for Obstacles (Eliminates GC stutter & runtime mesh allocations)
    this.pool = {
      'AUTO_RICKSHAW': [],
      'MINI_TRUCK': [],
      'DHOL_CART': [],
      'FLOWER_CART': [],
      'BARRICADE': [],
      'TORAN': []
    };
    this.initPool();
  }

  initPool() {
    const types = ['AUTO_RICKSHAW', 'MINI_TRUCK', 'DHOL_CART', 'FLOWER_CART', 'BARRICADE', 'TORAN'];
    types.forEach(t => {
      for (let k = 0; k < 6; k++) {
        const mesh = this.buildObstacleMesh(t);
        mesh.visible = false;
        mesh.userData.inUse = false;
        mesh.position.set(0, -200, 0);
        this.scene.add(mesh);
        this.pool[t].push(mesh);
      }
    });
  }

  getPooledMesh(type) {
    let list = this.pool[type];
    if (!list) {
      list = [];
      this.pool[type] = list;
    }
    let mesh = list.find(m => !m.userData.inUse);
    if (!mesh) {
      // Gracefully expand pool if needed (strict zero collision/sharing)
      mesh = this.buildObstacleMesh(type);
      mesh.visible = false;
      mesh.position.set(0, -200, 0);
      this.scene.add(mesh);
      list.push(mesh);
    }
    mesh.userData.inUse = true;
    mesh.visible = true;
    return mesh;
  }

  releaseObstacle(obs) {
    if (obs && obs.mesh) {
      obs.mesh.visible = false;
      obs.mesh.userData.inUse = false;
      obs.mesh.position.set(0, -200, 0);
    }
  }

  reset() {
    this.obstacles.forEach(obs => {
      this.releaseObstacle(obs);
    });
    this.obstacles = [];
    for (const key in this.pool) {
      this.pool[key].forEach(m => {
        m.visible = false;
        m.userData.inUse = false;
        m.position.set(0, -200, 0);
      });
    }
    this.spawnDistanceCounter = 0;
  }

  update(dt, moveDist) {
    this.spawnDistanceCounter += moveDist;

    const currentWaveGap = this.minWaveGap + (this.game.speed - CONFIG.BASE_SPEED) * 0.45;
    if (this.spawnDistanceCounter >= currentWaveGap) {
      this.spawnDistanceCounter = 0;
      this.spawnWave();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.mesh.position.z += moveDist;

      // Near Miss Detection: Thrilling rewards for dodging adjacent lane or jumping/sliding past
      if (!obs.nearMissChecked && obs.mesh.position.z > -0.5 && obs.mesh.position.z < 2.5 && !obs.hit) {
        obs.nearMissChecked = true;
        const laneDiff = Math.abs(this.game.player.currentX - CONFIG.LANES[obs.lane]);
        const dodgedAdjacent = (laneDiff > 1.8 && laneDiff < 3.8);
        const jumpedOrSlidOver = (laneDiff < 1.4 && (this.game.player.jumpY > 1.1 || this.game.player.isSliding));
        if (dodgedAdjacent || jumpedOrSlidOver) {
          this.game.triggerNearMiss(obs);
        }
      }

      // Clean Despawn behind player: Return to pool at z > 4.5 (NEVER enters near camera at z = 9.6)
      if (obs.mesh.position.z > 4.5) {
        this.releaseObstacle(obs);
        this.obstacles.splice(i, 1);
      }
    }
  }

  spawnWave() {
    const types = ['AUTO_RICKSHAW', 'MINI_TRUCK', 'DHOL_CART', 'FLOWER_CART', 'BARRICADE', 'TORAN'];
    const safeLane = Math.floor(Math.random() * 3);
    const allowTwo = this.game.distance > 350 && Math.random() < 0.45;
    const occupiedLanes = [];

    for (let lane = 0; lane < 3; lane++) {
      if (lane !== safeLane) {
        if (!allowTwo && occupiedLanes.length >= 1) break;
        occupiedLanes.push(lane);
      }
    }

    occupiedLanes.forEach(lane => {
      let type = types[Math.floor(Math.random() * types.length)];
      if (type === 'TORAN' && this.game.distance < 200) {
        type = 'BARRICADE';
      }

      const mesh = this.getPooledMesh(type);
      mesh.position.set(CONFIG.LANES[lane], 0, CONFIG.SPAWN_Z);
      mesh.visible = true;

      this.obstacles.push({
        type: type,
        lane: lane,
        mesh: mesh,
        hit: false,
        nearMissChecked: false
      });
    });
  }

  buildObstacleMesh(type) {
    switch (type) {
      case 'AUTO_RICKSHAW':
        return this.createAutoRickshaw();
      case 'MINI_TRUCK':
        return this.createMiniTruck();
      case 'DHOL_CART':
        return this.createDholCart();
      case 'FLOWER_CART':
        return this.createFlowerCart();
      case 'TORAN':
        return this.createToranPortal();
      case 'BARRICADE':
      default:
        return this.createBarricade();
    }
  }

  // Properly Proportioned Indian Auto-Rickshaw (No giant camera obstruction)
  createAutoRickshaw() {
    const group = new THREE.Group();

    // Green Lower Chassis
    const lowerGeo = new THREE.BoxGeometry(1.8, 0.8, 2.6);
    const lower = new THREE.Mesh(lowerGeo, this.materials.autoGreen);
    lower.position.y = 0.58;
    lower.castShadow = true;
    lower.receiveShadow = true;
    group.add(lower);

    // Yellow Canopy Roof
    const roofGeo = new THREE.BoxGeometry(1.7, 0.75, 2.2);
    const roof = new THREE.Mesh(roofGeo, this.materials.autoYellow);
    roof.position.set(0, 1.30, -0.12);
    roof.castShadow = true;
    group.add(roof);

    // Windshield
    const glassGeo = new THREE.BoxGeometry(1.5, 0.65, 0.08);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.60 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.22, 1.0);
    group.add(glass);

    // 3 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.18, 14);
    wheelGeo.rotateZ(Math.PI * 0.5);

    const wheelFront = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    wheelFront.position.set(0, 0.30, 1.05);
    group.add(wheelFront);

    const wheelRearL = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    wheelRearL.position.set(-0.90, 0.30, -0.75);
    group.add(wheelRearL);

    const wheelRearR = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    wheelRearR.position.set(0.90, 0.30, -0.75);
    group.add(wheelRearR);

    // Glowing Round Headlight (Subtle soft glow, no giant 7m beam covering screen)
    const lightGeo = new THREE.SphereGeometry(0.14, 10, 10);
    const headlight = new THREE.Mesh(lightGeo, this.materials.headlightGlow);
    headlight.position.set(0, 0.65, 1.32);
    group.add(headlight);

    // Marigold Garland draped across bumper
    const garlandGeo = new THREE.TorusGeometry(0.72, 0.07, 8, 14, Math.PI);
    garlandGeo.rotateX(Math.PI * 0.5);
    const garland = new THREE.Mesh(garlandGeo, this.materials.marigoldOrange);
    garland.position.set(0, 0.62, 1.30);
    group.add(garland);

    return group;
  }

  createMiniTruck() {
    const group = new THREE.Group();

    // Driver Cab
    const cabGeo = new THREE.BoxGeometry(2.0, 1.5, 1.5);
    const cab = new THREE.Mesh(cabGeo, this.materials.silverChrome);
    cab.position.set(0, 1.05, 1.0);
    cab.castShadow = true;
    group.add(cab);

    // Windshield
    const winGeo = new THREE.BoxGeometry(1.8, 0.65, 0.08);
    const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(0, 1.28, 1.76);
    group.add(win);

    // Flatbed Cargo Area
    const bedGeo = new THREE.BoxGeometry(2.1, 0.55, 2.4);
    const bed = new THREE.Mesh(bedGeo, this.materials.truckBody);
    bed.position.set(0, 0.62, -0.75);
    bed.castShadow = true;
    group.add(bed);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 14);
    wheelGeo.rotateZ(Math.PI * 0.5);
    [
      { x: -1.05, z: 1.0 }, { x: 1.05, z: 1.0 },
      { x: -1.05, z: -1.0 }, { x: 1.05, z: -1.0 }
    ].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
      w.position.set(p.x, 0.34, p.z);
      group.add(w);
    });

    // Dual Headlights
    [-0.65, 0.65].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), this.materials.headlightGlow);
      hl.position.set(hx, 0.70, 1.76);
      group.add(hl);
    });

    // Marigold Garlands on Grill
    const garlandGeo = new THREE.TorusGeometry(0.85, 0.07, 8, 14, Math.PI);
    garlandGeo.rotateX(Math.PI * 0.5);
    const garland = new THREE.Mesh(garlandGeo, this.materials.marigoldOrange);
    garland.position.set(0, 0.70, 1.76);
    group.add(garland);

    // LIVE 3D DHOL DRUMMER ON FLATBED
    const drummerGroup = new THREE.Group();
    drummerGroup.position.set(0, 0.90, -0.75);

    const dTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.60, 10), this.materials.drummerKurta);
    dTorso.position.y = 0.60;
    dTorso.castShadow = true;
    drummerGroup.add(dTorso);

    const dHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), this.materials.drummerSkin);
    dHead.position.y = 1.04;
    drummerGroup.add(dHead);

    const dPagdi = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.18, 12), this.materials.drummerPagdi);
    dPagdi.position.y = 1.14;
    drummerGroup.add(dPagdi);

    // Giant Bass Dhol Drum
    const dholGeo = new THREE.CylinderGeometry(0.44, 0.44, 1.1, 16);
    dholGeo.rotateZ(Math.PI * 0.5);
    const dhol = new THREE.Mesh(dholGeo, this.materials.dholCrimson);
    dhol.position.set(0, 0.60, 0.40);
    drummerGroup.add(dhol);

    [-0.56, 0.56].forEach(dx => {
      const head = new THREE.Mesh(new THREE.CircleGeometry(0.42, 14), this.materials.dholHead);
      head.rotateY(dx > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
      head.position.set(dx, 0.60, 0.40);
      drummerGroup.add(head);
    });

    group.add(drummerGroup);

    return group;
  }

  createDholCart() {
    const group = new THREE.Group();

    const baseGeo = new THREE.BoxGeometry(2.1, 0.32, 2.5);
    const base = new THREE.Mesh(baseGeo, this.materials.woodDark);
    base.position.y = 0.60;
    base.castShadow = true;
    group.add(base);

    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.15, 16);
    wheelGeo.rotateZ(Math.PI * 0.5);
    [-1.15, 1.15].forEach(wx => {
      const w = new THREE.Mesh(wheelGeo, this.materials.woodLight);
      w.position.set(wx, 0.55, 0);
      w.castShadow = true;
      group.add(w);
    });

    [-0.50, 0.50].forEach(dx => {
      const dholGeo = new THREE.CylinderGeometry(0.50, 0.50, 1.5, 14);
      dholGeo.rotateX(Math.PI * 0.5);
      const dhol = new THREE.Mesh(dholGeo, this.materials.woodDark);
      dhol.position.set(dx, 1.25, 0);
      dhol.castShadow = true;
      group.add(dhol);

      [-0.76, 0.76].forEach(hz => {
        const head = new THREE.Mesh(new THREE.CircleGeometry(0.48, 14), this.materials.dholHead);
        if (hz < 0) head.rotateY(Math.PI);
        head.position.set(dx, 1.25, hz);
        group.add(head);
      });
    });

    const drape = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 1.6), this.materials.dholCrimson);
    drape.position.set(0, 1.0, 0);
    group.add(drape);

    return group;
  }

  createFlowerCart() {
    const group = new THREE.Group();

    const cartGeo = new THREE.BoxGeometry(2.0, 0.32, 2.4);
    const cart = new THREE.Mesh(cartGeo, this.materials.woodLight);
    cart.position.y = 0.52;
    cart.castShadow = true;
    group.add(cart);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 14);
    wheelGeo.rotateZ(Math.PI * 0.5);
    [
      { x: -1.05, z: 0.75 }, { x: 1.05, z: 0.75 },
      { x: -1.05, z: -0.75 }, { x: 1.05, z: -0.75 }
    ].forEach(p => {
      const w = new THREE.Mesh(wheelGeo, this.materials.woodDark);
      w.position.set(p.x, 0.32, p.z);
      group.add(w);
    });

    const baskets = [
      { x: -0.50, z: 0.45, color: this.materials.marigoldOrange },
      { x: 0.50, z: 0.45, color: this.materials.marigoldYellow },
      { x: 0, z: -0.45, color: this.materials.roseRed }
    ];

    baskets.forEach(b => {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.28, 0.32, 10), this.materials.woodDark);
      basket.position.set(b.x, 0.82, b.z);
      group.add(basket);

      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 8), b.color);
      mound.position.set(b.x, 1.02, b.z);
      group.add(mound);
    });

    return group;
  }

  createToranPortal() {
    const group = new THREE.Group();

    // Bamboo Side Posts
    [-1.4, 1.4].forEach(px => {
      const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 3.6, 8);
      const pole = new THREE.Mesh(poleGeo, this.materials.woodLight);
      pole.position.set(px, 1.8, 0);
      pole.castShadow = true;
      group.add(pole);

      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), this.materials.goldTrim);
      finial.position.set(px, 3.7, 0);
      group.add(finial);
    });

    // Hanging Garland Arch (Slide under)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.16, 0.16), this.materials.woodDark);
    beam.position.set(0, 2.5, 0);
    group.add(beam);

    const banner = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 0.04), this.materials.marigoldOrange);
    banner.position.set(0, 2.2, 0);
    group.add(banner);

    for (let f = -1.1; f <= 1.1; f += 0.38) {
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 6), this.materials.marigoldYellow);
      tassel.position.set(f, 1.85, 0);
      group.add(tassel);
    }

    return group;
  }

  createBarricade() {
    const group = new THREE.Group();

    const legGeo = new THREE.BoxGeometry(0.14, 1.3, 0.14);
    [-1.1, 1.1].forEach(lx => {
      const leg1 = new THREE.Mesh(legGeo, this.materials.metalBlack);
      leg1.position.set(lx, 0.65, -0.28);
      leg1.rotation.x = 0.2;
      group.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, this.materials.metalBlack);
      leg2.position.set(lx, 0.65, 0.28);
      leg2.rotation.x = -0.2;
      group.add(leg2);
    });

    const boardGeo = new THREE.BoxGeometry(2.6, 0.32, 0.08);
    const board1 = new THREE.Mesh(boardGeo, this.materials.hazardBar);
    board1.position.set(0, 1.05, 0);
    board1.castShadow = true;
    group.add(board1);

    const board2 = new THREE.Mesh(boardGeo, this.materials.hazardBar);
    board2.position.set(0, 0.58, 0);
    board2.castShadow = true;
    group.add(board2);

    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 8), this.materials.marigoldYellow);
    lamp.position.set(0, 1.32, 0);
    group.add(lamp);

    return group;
  }
}



// ============================================================================
// 7. TRUE 3D ENVIRONMENT (Varied Havelis, 3D Shop Products, Crowds & Pandal)
// ============================================================================
class Environment3DManager {
  constructor(game) {
    this.game = game;
    this.scene = game.three.scene;
    this.clusters = [];
    this.overheadWires = [];
    this.fireworks = [];
    this.driftingPetals = [];
    this.animatedDrummers = [];

    // Module configuration: Continuous 16m modules along both sides (272m span)
    this.moduleLength = 16.0;
    this.moduleCount = 17;

    // Shared Materials Palette - Authentic Heritage Indian Festival Architecture
    this.materials = {
      wallSandstone: new THREE.MeshStandardMaterial({ color: 0xc8965e, roughness: 0.65 }),
      wallTerracotta: new THREE.MeshStandardMaterial({ color: 0xb5512d, roughness: 0.64 }),
      wallCrimson: new THREE.MeshStandardMaterial({ color: 0x822137, roughness: 0.62 }),
      wallOchre: new THREE.MeshStandardMaterial({ color: 0xa47035, roughness: 0.66 }),
      wallRose: new THREE.MeshStandardMaterial({ color: 0x8e354f, roughness: 0.62 }),
      wallWhiteTrim: new THREE.MeshStandardMaterial({ color: 0xf5eee4, roughness: 0.52 }),
      wallTeak: new THREE.MeshStandardMaterial({ color: 0x482310, roughness: 0.68 }),
      wallWhitewash: new THREE.MeshStandardMaterial({ color: 0xded8ce, roughness: 0.70 }),
      canopyOrange: new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.48 }),
      canopyGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.42 }),
      canopyCrimson: new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.45 }),
      canopyGreen: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45 }),
      windowGlow: new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.85,
        roughness: 0.25
      }),
      windowFrame: new THREE.MeshStandardMaterial({ color: 0x2e1408, roughness: 0.78 }),
      goldFinial: new THREE.MeshStandardMaterial({
        color: 0xffd152,
        metalness: 0.88,
        roughness: 0.18,
        emissive: 0x78350f,
        emissiveIntensity: 0.20
      }),
      brassMetal: new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.82,
        roughness: 0.20,
        emissive: 0x713f12,
        emissiveIntensity: 0.18
      }),
      silverMetal: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.85, roughness: 0.18 }),
      crowdKurtaSaffron: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.60 }),
      crowdKurtaWhite: new THREE.MeshStandardMaterial({ color: 0xfffefb, roughness: 0.55 }),
      crowdKurtaMaroon: new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.60 }),
      crowdSareeMagenta: new THREE.MeshStandardMaterial({ color: 0xe879f9, roughness: 0.58 }),
      crowdSareeGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.58 }),
      crowdSareeGold: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.55 }),
      crowdSareeRoyalBlue: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.58 }),
      crowdDhoti: new THREE.MeshStandardMaterial({ color: 0xfefbf3, roughness: 0.65 }),
      skin: new THREE.MeshStandardMaterial({ color: 0xba7d56, roughness: 0.55 }),
      hairDark: new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.88 }),
      marigoldOrange: new THREE.MeshBasicMaterial({ color: 0xff6b1a }),
      marigoldYellow: new THREE.MeshBasicMaterial({ color: 0xffd152 }),
      roseRed: new THREE.MeshBasicMaterial({ color: 0xdc2626 }),
      kandilGlow: new THREE.MeshBasicMaterial({ color: 0xff3366 }),
      bulbGlowWarm: new THREE.MeshBasicMaterial({ color: 0xfff3a1 }),
      flagOrange: new THREE.MeshBasicMaterial({ color: 0xff6b1a }),
      flagYellow: new THREE.MeshBasicMaterial({ color: 0xfacc15 }),
      distantCityMat: new THREE.MeshBasicMaterial({ color: 0x181432 })
    };

    // Procedural Devanagari Signboard Textures
    this.signTextures = {
      modak: this.createSignboardTexture('मोदक', 'MODAK SWEETS', '#881337', '#fef08a'),
      sweets: this.createSignboardTexture('श्री गणेश स्वीट्स', 'SHREE GANESH SWEETS', '#78350f', '#facc15'),
      morya: this.createSignboardTexture('गणपति बाप्पा मोरया', 'GANPATI BAPPA MORYA', '#9a3412', '#fef08a'),
      flowers: this.createSignboardTexture('फूल भंडार', 'FLOWER BAZAAR', '#831843', '#fef08a'),
      puja: this.createSignboardTexture('पूजा साहित्य', 'POOJA EMPORIUM', '#701a75', '#fde047'),
      chai: this.createSignboardTexture('अमृततुल्य चाय', 'SPECIAL CHAI & SNACKS', '#451a03', '#fde047')
    };

    this.initContinuousStreet();
    this.initOverheadCanopies();
    this.initDriftingPetals();
    this.initDistantCityscape();
    this.createGrandGaneshPandal();
    this.initFireworksPool();
  }

  createSignboardTexture(mainText, subText, bgColor, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 160);

    ctx.strokeStyle = '#ffd152';
    ctx.lineWidth = 7;
    ctx.strokeRect(8, 8, 496, 144);
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 480, 128);

    ctx.fillStyle = '#fffbeb';
    for (let x = 24; x < 490; x += 28) {
      ctx.beginPath(); ctx.arc(x, 12, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, 148, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.fillStyle = textColor;
    ctx.font = 'bold 44px "Segoe UI", "Noto Sans Devanagari", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 6;
    ctx.fillText(mainText, 256, 68);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(subText, 256, 118);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  createSignboardMesh(tex, width = 4.0, height = 1.25) {
    const group = new THREE.Group();

    const boardMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0.25,
      emissive: 0x451a03,
      emissiveIntensity: 0.35
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(width, height), boardMat);
    group.add(board);

    const frameGeo = new THREE.BoxGeometry(width + 0.25, height + 0.25, 0.14);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.07;
    group.add(frame);

    return group;
  }

  initContinuousStreet() {
    const roadW = (typeof CONFIG !== 'undefined' && CONFIG.ROAD_WIDTH) ? CONFIG.ROAD_WIDTH : 11.5;
    for (let i = 0; i < this.moduleCount; i++) {
      const z = -i * this.moduleLength;
      const leftCluster = this.createHaveliModule(i, true);
      leftCluster.position.set(-roadW * 0.5 - 5.5, 0, z);
      this.scene.add(leftCluster);
      this.clusters.push({ group: leftCluster, z: z, side: 'left' });

      const rightCluster = this.createHaveliModule(i, false);
      rightCluster.position.set(roadW * 0.5 + 5.5, 0, z);
      this.scene.add(rightCluster);
      this.clusters.push({ group: rightCluster, z: z, side: 'right' });
    }
  }

  createHaveliModule(moduleIdx, isLeft) {
    const group = new THREE.Group();
    const styleIdx = (moduleIdx + (isLeft ? 0 : 3)) % 7;

    const heightMap = [21.0, 26.0, 19.5, 24.0, 20.0, 27.0, 22.5];
    const bldgHeight = heightMap[styleIdx];
    const bldgWidth = 10.5;
    const bldgDepth = 15.6;

    const wallColorMap = [
      this.materials.wallSandstone,
      this.materials.wallTerracotta,
      this.materials.wallRose,
      this.materials.wallOchre,
      this.materials.wallTeak,
      this.materials.wallCrimson,
      this.materials.wallWhitewash
    ];
    const wallMat = wallColorMap[styleIdx];

    // 1. Core Haveli Structure
    const bldgGeo = new THREE.BoxGeometry(bldgWidth, bldgHeight, bldgDepth);
    const bldg = new THREE.Mesh(bldgGeo, wallMat);
    bldg.position.set(isLeft ? -5.0 : 5.0, bldgHeight * 0.5, 0);
    bldg.castShadow = true;
    bldg.receiveShadow = true;
    group.add(bldg);

    // Exact street-facing coordinate of the building facade
    const streetFaceX = isLeft ? 0.25 : -0.25;

    // 2. Sandstone Base Plinth
    const plinthGeo = new THREE.BoxGeometry(0.8, 1.2, bldgDepth + 0.2);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.wallWhiteTrim);
    plinth.position.set(streetFaceX + (isLeft ? 0.20 : -0.20), 0.6, 0);
    group.add(plinth);

    // 3. Vertical Pilasters / Columns breaking up flat facades into bays (Part 5)
    [-5.0, 0, 5.0].forEach(pz => {
      const colGeo = new THREE.BoxGeometry(0.40, bldgHeight, 0.40);
      const col = new THREE.Mesh(colGeo, this.materials.wallWhiteTrim);
      col.position.set(streetFaceX + (isLeft ? 0.15 : -0.15), bldgHeight * 0.5, pz);
      col.castShadow = true;
      group.add(col);
    });

    // 4. Multi-Story Stringcourse Ledges & Corbel Brackets
    const floorCount = Math.floor(bldgHeight / 6.0);
    for (let fl = 1; fl <= floorCount; fl++) {
      const ledgeY = fl * 6.0;
      const ledgeGeo = new THREE.BoxGeometry(1.2, 0.40, bldgDepth + 0.4);
      const ledge = new THREE.Mesh(ledgeGeo, this.materials.wallWhiteTrim);
      ledge.position.set(streetFaceX + (isLeft ? 0.45 : -0.45), ledgeY, 0);
      ledge.castShadow = true;
      group.add(ledge);

      for (let bz = -bldgDepth * 0.44; bz <= bldgDepth * 0.44; bz += 2.6) {
        const bracketGeo = new THREE.BoxGeometry(0.35, 0.45, 0.35);
        const bracket = new THREE.Mesh(bracketGeo, this.materials.wallTeak);
        bracket.position.set(streetFaceX + (isLeft ? 0.22 : -0.22), ledgeY - 0.35, bz);
        group.add(bracket);
      }

      // Festive Marigold Garlands draped along ledges
      for (let bz = -bldgDepth * 0.30; bz <= bldgDepth * 0.30; bz += 3.2) {
        const garland = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.06, 6, 12, Math.PI), this.materials.marigoldOrange);
        garland.rotation.y = isLeft ? Math.PI * 0.5 : -Math.PI * 0.5;
        garland.rotation.z = Math.PI;
        garland.position.set(streetFaceX + (isLeft ? 0.50 : -0.50), ledgeY - 0.20, bz);
        group.add(garland);
      }
    }

    // 5. Authentic Carved Jharokha Balcony
    const jharokha = this.createOrnateJharokhaBalcony(isLeft);
    jharokha.position.set(streetFaceX + (isLeft ? 0.45 : -0.45), 8.6, 0);
    group.add(jharokha);

    // 6. Multiple Tiers of Recessed Windows with Wooden Frames, Shutters & Arch Lintels
    [-4.6, -1.8, 1.8, 4.6].forEach(wz => {
      [8.5, 14.5, 20.5].forEach(wy => {
        if (wy < bldgHeight - 2.5 && Math.abs(wz) > 1.0) {
          // Wooden Outer Frame
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.2, 1.6), this.materials.windowFrame);
          frame.position.set(streetFaceX + (isLeft ? 0.10 : -0.10), wy, wz);
          group.add(frame);

          // Glowing Warm Amber Window Pane
          const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.9), this.materials.windowGlow);
          win.position.set(streetFaceX + (isLeft ? 0.16 : -0.16), wy, wz);
          win.rotation.y = isLeft ? Math.PI * 0.5 : -Math.PI * 0.5;
          group.add(win);

          // Arch Lintel
          const archLintel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 1.8), this.materials.wallWhiteTrim);
          archLintel.position.set(streetFaceX + (isLeft ? 0.22 : -0.22), wy + 1.2, wz);
          group.add(archLintel);

          // Wooden Shutters (Open at authentic angle)
          [-0.8, 0.8].forEach((sz, sIdx) => {
            const shutter = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.36), this.materials.wallTeak);
            shutter.position.set(streetFaceX + (isLeft ? 0.18 : -0.18), wy, wz + sz);
            shutter.rotation.y = (sIdx === 0 ? 0.35 : -0.35) * (isLeft ? 1 : -1);
            group.add(shutter);
          });
        }
      });
    });

    // 7. Rooftop Parapets & Chhatris
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, bldgDepth), this.materials.wallWhiteTrim);
    parapet.position.set(streetFaceX + (isLeft ? 0.20 : -0.20), bldgHeight + 0.6, 0);
    group.add(parapet);

    const chhatriDome = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1.8, 10), this.materials.wallSandstone);
    chhatriDome.position.set(streetFaceX + (isLeft ? -1.5 : 1.5), bldgHeight + 2.2, 0);
    group.add(chhatriDome);

    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 8), this.materials.wallTeak);
    flagPole.position.set(streetFaceX, bldgHeight + 1.8, 0);
    group.add(flagPole);

    const flagGeo = new THREE.ConeGeometry(0.65, 1.5, 3);
    flagGeo.rotateZ(Math.PI * 0.5);
    const flag = new THREE.Mesh(flagGeo, this.materials.flagOrange);
    flag.position.set(streetFaceX + (isLeft ? 0.8 : -0.8), bldgHeight + 2.4, 0);
    group.add(flag);

    // 8. Ground Floor Detailed Festival Shops with Actual 3D Products
    let shopMesh, signTex, signW = 4.0, signH = 1.25;

    switch (styleIdx) {
      case 0:
        shopMesh = this.createModakStall();
        signTex = this.signTextures.modak;
        break;
      case 1:
        shopMesh = this.createDholPerformanceStage();
        signTex = this.signTextures.morya;
        signW = 4.8;
        break;
      case 2:
        shopMesh = this.createFlowerStall();
        signTex = this.signTextures.flowers;
        break;
      case 3:
        shopMesh = this.createPujaStall();
        signTex = this.signTextures.puja;
        break;
      case 4:
        shopMesh = this.createChaiStall();
        signTex = this.signTextures.chai;
        break;
      case 5:
        shopMesh = this.createMiniGaneshPandal();
        signTex = this.signTextures.sweets;
        break;
      case 6:
      default:
        shopMesh = this.createModakStall();
        signTex = this.signTextures.modak;
        break;
    }

    if (shopMesh) {
      shopMesh.position.set(streetFaceX + (isLeft ? 1.85 : -1.85), 0, 0);
      group.add(shopMesh);
    }

    if (signTex) {
      const signMesh = this.createSignboardMesh(signTex, signW, signH);
      signMesh.position.set(streetFaceX + (isLeft ? 2.0 : -2.0), 4.8, 0);
      signMesh.rotation.y = isLeft ? Math.PI * 0.5 : -Math.PI * 0.5;
      group.add(signMesh);
    }

    // 9. Living Devotee Crowds on Sidewalks (Real stylized 3D human groups)
    const crowd = this.createCrowdGroup(moduleIdx, isLeft);
    crowd.position.set(streetFaceX + (isLeft ? 2.2 : -2.2), 0, 4.2);
    group.add(crowd);

    return group;
  }

  createOrnateJharokhaBalcony(isLeft) {
    const balcony = new THREE.Group();

    const corbelGeo = new THREE.CylinderGeometry(0.85, 0.20, 0.9, 8);
    const corbel = new THREE.Mesh(corbelGeo, this.materials.wallSandstone);
    corbel.position.set(0, -0.45, 0);
    balcony.add(corbel);

    const floorGeo = new THREE.BoxGeometry(1.2, 0.20, 2.6);
    const floor = new THREE.Mesh(floorGeo, this.materials.wallWhiteTrim);
    floor.position.y = 0.05;
    balcony.add(floor);

    const frontRailGeo = new THREE.BoxGeometry(0.12, 0.75, 2.5);
    const frontRail = new THREE.Mesh(frontRailGeo, this.materials.wallWhiteTrim);
    frontRail.position.set(isLeft ? 0.54 : -0.54, 0.45, 0);
    balcony.add(frontRail);

    [-1.2, 1.2].forEach(sz => {
      const sideRailGeo = new THREE.BoxGeometry(1.1, 0.75, 0.12);
      const sideRail = new THREE.Mesh(sideRailGeo, this.materials.wallWhiteTrim);
      sideRail.position.set(0, 0.45, sz);
      balcony.add(sideRail);
    });

    [-1.15, 1.15].forEach(pz => {
      const pillarGeo = new THREE.CylinderGeometry(0.06, 0.07, 1.45, 8);
      const pillar = new THREE.Mesh(pillarGeo, this.materials.wallTeak);
      pillar.position.set(isLeft ? 0.5 : -0.5, 1.15, pz);
      balcony.add(pillar);
    });

    const roofGeo = new THREE.ConeGeometry(1.4, 0.75, 8);
    roofGeo.scale(0.8, 1.0, 1.6);
    const roof = new THREE.Mesh(roofGeo, this.materials.wallTerracotta);
    roof.position.set(0, 2.15, 0);
    balcony.add(roof);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this.materials.goldFinial);
    finial.position.set(0, 2.6, 0);
    balcony.add(finial);

    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 6), this.materials.bulbGlowWarm);
    lantern.position.set(0, 1.35, 0);
    balcony.add(lantern);

    return balcony;
  }

  createModakStall() {
    const stall = new THREE.Group();

    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.05, 1.8), this.materials.wallTeak);
    counter.position.y = 0.52;
    counter.castShadow = true;
    counter.receiveShadow = true;
    stall.add(counter);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.28, 2.5), this.materials.canopyCrimson);
    canopy.position.set(0, 3.3, 0);
    canopy.rotation.z = -0.12;
    stall.add(canopy);

    [-1.2, 0, 1.2].forEach((tx, idx) => {
      const thali = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.44, 0.08, 12), this.materials.brassMetal);
      thali.position.set(tx, 1.10, 0);
      stall.add(thali);

      const modakCount = 5;
      for (let m = 0; m < modakCount; m++) {
        const modak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 8), this.materials.goldFinial);
        const ang = (m / modakCount) * Math.PI * 2;
        const mr = (m === 0) ? 0 : 0.22;
        modak.position.set(tx + Math.cos(ang) * mr, 1.20, Math.sin(ang) * mr);
        stall.add(modak);
      }
    });

    [-1.6, 1.6].forEach(bx => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.35), this.materials.canopyGold);
      box.position.set(bx, 1.15, 0.55);
      stall.add(box);
    });

    const shopkeeper = this.createStylizedPerson(this.materials.crowdKurtaWhite, this.materials.crowdDhoti, true);
    shopkeeper.position.set(0, 0, -0.65);
    stall.add(shopkeeper);

    return stall;
  }

  createFlowerStall() {
    const stall = new THREE.Group();

    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.05, 1.8), this.materials.wallTeak);
    counter.position.y = 0.52;
    stall.add(counter);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.30, 2.5), this.materials.canopyGold);
    canopy.position.set(0, 3.3, 0);
    canopy.rotation.z = 0.12;
    stall.add(canopy);

    for (let col = -1.8; col <= 1.8; col += 0.40) {
      const flowerMat = (Math.abs(col) % 0.8 < 0.3) ? this.materials.marigoldOrange : this.materials.marigoldYellow;
      for (let gy = 1.3; gy <= 3.0; gy += 0.22) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), flowerMat);
        flower.position.set(col, gy, 1.1);
        stall.add(flower);
      }
    }

    [-1.3, 0, 1.3].forEach((bx, idx) => {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.30, 0.28, 8), this.materials.wallTeak);
      basket.position.set(bx, 1.20, 0);
      stall.add(basket);

      const moundMat = (idx === 0) ? this.materials.roseRed : (idx === 1 ? this.materials.marigoldYellow : this.materials.marigoldOrange);
      const mound = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 8), moundMat);
      mound.position.set(bx, 1.40, 0);
      stall.add(mound);
    });

    const seller = this.createStylizedPerson(this.materials.crowdKurtaSaffron, this.materials.crowdDhoti, true);
    seller.position.set(0, 0, -0.65);
    stall.add(seller);

    return stall;
  }

  createChaiStall() {
    const stall = new THREE.Group();

    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 1.6), this.materials.wallTeak);
    counter.position.y = 0.5;
    stall.add(counter);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.28, 2.4), this.materials.canopyCrimson);
    canopy.position.set(0, 3.2, 0);
    canopy.rotation.z = -0.12;
    stall.add(canopy);

    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.65, 12), this.materials.brassMetal);
    kettle.position.set(-0.9, 1.32, 0);
    stall.add(kettle);

    for (let c = 0; c < 5; c++) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.14, 6), this.materials.wallTerracotta);
      cup.position.set(0.0 + c * 0.20, 1.08, 0.2);
      stall.add(cup);
    }

    const chaiwala = this.createStylizedPerson(this.materials.crowdKurtaWhite, this.materials.crowdDhoti, true);
    chaiwala.position.set(0, 0, -0.65);
    stall.add(chaiwala);

    return stall;
  }

  createPujaStall() {
    const stall = new THREE.Group();

    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 1.8), this.materials.wallSandstone);
    counter.position.y = 0.5;
    stall.add(counter);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.30, 2.5), this.materials.canopyGold);
    canopy.position.set(0, 3.3, 0);
    canopy.rotation.z = -0.15;
    stall.add(canopy);

    [-0.9, 0.9].forEach(kx => {
      const kalashPot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), this.materials.brassMetal);
      kalashPot.position.set(kx, 1.25, 0);
      stall.add(kalashPot);

      const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), this.materials.wallTeak);
      coconut.position.set(kx, 1.46, 0);
      stall.add(coconut);
    });

    const samai = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.20, 1.7, 8), this.materials.brassMetal);
    samai.position.set(1.5, 0.85, 0.7);
    stall.add(samai);

    const samaiFlame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.20, 6), this.materials.marigoldYellow);
    samaiFlame.position.set(1.5, 1.76, 0.7);
    stall.add(samaiFlame);

    return stall;
  }

  createDholPerformanceStage() {
    const stage = new THREE.Group();

    const platform = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.55, 3.2), this.materials.wallTerracotta);
    platform.position.y = 0.28;
    stage.add(platform);

    [-1.1, 1.1].forEach((dx, idx) => {
      const drummer = new THREE.Group();
      drummer.position.set(dx, 0.55, 0);

      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.85, 10), this.materials.crowdKurtaSaffron);
      body.position.y = 0.55;
      drummer.add(body);

      const dhoti = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.60, 10), this.materials.crowdDhoti);
      dhoti.position.y = 0.15;
      drummer.add(dhoti);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), this.materials.skin);
      head.position.y = 1.15;
      drummer.add(head);

      const pagdi = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.18, 10), this.materials.canopyCrimson);
      pagdi.position.y = 1.28;
      drummer.add(pagdi);

      const dhol = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.80, 12), this.materials.wallTeak);
      dhol.rotation.z = Math.PI * 0.5;
      dhol.position.set(0, 0.65, 0.32);
      drummer.add(dhol);

      [-0.38, 0.38].forEach(rx => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 6, 12), this.materials.goldFinial);
        ring.rotation.y = Math.PI * 0.5;
        ring.position.set(rx, 0.65, 0.32);
        drummer.add(ring);
      });

      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.40, 6), this.materials.wallWhiteTrim);
      stick.position.set(0.30, 0.78, 0.36);
      drummer.add(stick);

      stage.add(drummer);
      this.animatedDrummers.push({ mesh: drummer, baseRot: drummer.rotation.x, idx: idx });
    });

    return stage;
  }

  createMiniGaneshPandal() {
    const pandal = new THREE.Group();

    [-1.5, 1.5].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 3.2, 10), this.materials.wallSandstone);
      pillar.position.set(px, 1.6, 0);
      pandal.add(pillar);

      const kalash = new THREE.Mesh(new THREE.SphereGeometry(0.20, 8, 8), this.materials.goldFinial);
      kalash.position.set(px, 3.35, 0);
      pandal.add(kalash);
    });

    const arch = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 1.6), this.materials.canopyCrimson);
    arch.position.set(0, 3.2, 0);
    pandal.add(arch);

    const idolGroup = new THREE.Group();
    idolGroup.position.set(0, 1.1, 0);

    const idolBody = new THREE.Mesh(new THREE.SphereGeometry(0.60, 12, 12), this.materials.goldFinial);
    idolGroup.add(idolBody);

    const idolHead = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 12), this.materials.goldFinial);
    idolHead.position.y = 0.60;
    idolGroup.add(idolHead);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.05, 0.55, 8), this.materials.goldFinial);
    trunk.position.set(0, 0.40, 0.30);
    trunk.rotation.x = -0.5;
    idolGroup.add(trunk);

    const halo = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.15, 16), this.materials.canopyGold);
    halo.position.set(0, 0.60, -0.2);
    idolGroup.add(halo);

    pandal.add(idolGroup);
    return pandal;
  }

  createStylizedPerson(clothingMat, lowerMat, isShopkeeper = false) {
    const person = new THREE.Group();

    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.17, 0.70, 10);
    const torso = new THREE.Mesh(torsoGeo, clothingMat);
    torso.position.y = 0.95;
    person.add(torso);

    const lowerGeo = new THREE.CylinderGeometry(0.20, 0.15, 0.70, 10);
    const lower = new THREE.Mesh(lowerGeo, lowerMat);
    lower.position.y = 0.38;
    person.add(lower);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 8), this.materials.skin);
    neck.position.y = 1.35;
    person.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), this.materials.skin);
    head.position.y = 1.48;
    person.add(head);

    if (isShopkeeper || Math.random() > 0.4) {
      const pagdi = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.15, 10), this.materials.canopyOrange);
      pagdi.position.y = 1.58;
      person.add(pagdi);
    } else {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), this.materials.hairDark);
      hair.position.set(0, 1.52, -0.04);
      person.add(hair);
    }

    [-0.26, 0.26].forEach((ax, idx) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.55, 6), clothingMat);
      arm.position.set(ax, 0.88, 0.05);
      arm.rotation.z = (idx === 0 ? 0.15 : -0.15);
      person.add(arm);
    });

    return person;
  }

  createCrowdGroup(moduleIdx, isLeft) {
    const group = new THREE.Group();

    const cluster = [
      {
        z: -1.4,
        type: 'male',
        topMat: this.materials.crowdKurtaSaffron,
        botMat: this.materials.crowdDhoti,
        hasFlag: true,
        rotY: isLeft ? 1.2 : -1.2
      },
      {
        z: 0.0,
        type: 'female',
        topMat: this.materials.crowdSareeMagenta,
        botMat: this.materials.crowdSareeMagenta,
        hasFlag: false,
        rotY: isLeft ? 0.4 : -0.4
      },
      {
        z: 1.3,
        type: 'male',
        topMat: this.materials.crowdKurtaMaroon,
        botMat: this.materials.crowdDhoti,
        hasFlag: false,
        rotY: isLeft ? 2.0 : -2.0
      }
    ];

    cluster.forEach(pData => {
      const person = this.createStylizedPerson(pData.topMat, pData.botMat, false);
      person.position.set(0, 0, pData.z);
      person.rotation.y = pData.rotY;

      if (pData.hasFlag) {
        const flagStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), this.materials.wallTeak);
        flagStaff.position.set(0.28, 1.1, 0.15);
        person.add(flagStaff);

        const fMesh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.75, 3), this.materials.flagOrange);
        fMesh.rotation.z = Math.PI * 0.5;
        fMesh.position.set(0.65, 1.8, 0.15);
        person.add(fMesh);
      }

      group.add(person);
    });

    return group;
  }

  initOverheadCanopies() {
    const spanSpacing = 28.0;
    for (let z = -15; z >= -240; z -= spanSpacing) {
      const wireGroup = this.createOverheadWireSpan(z);
      this.overheadWires.push({ group: wireGroup, z: z });
      this.scene.add(wireGroup);
    }
  }

  createOverheadWireSpan(z) {
    const group = new THREE.Group();
    group.position.set(0, 11.2, z);

    const cableGeo = new THREE.CylinderGeometry(0.025, 0.025, 28.0, 8);
    cableGeo.rotateZ(Math.PI * 0.5);
    const cable = new THREE.Mesh(cableGeo, this.materials.wallTeak);
    group.add(cable);

    for (let x = -12.0; x <= 12.0; x += 2.0) {
      const sag = -Math.sin(((x + 12) / 24) * Math.PI) * 0.95;
      const bulbGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const bulb = new THREE.Mesh(bulbGeo, this.materials.bulbGlowWarm);
      bulb.position.set(x, sag, 0);
      group.add(bulb);
    }

    [-11.5, 11.5].forEach(kx => {
      const kandil = this.createKandilLantern();
      kandil.position.set(kx, -1.2, 0);
      group.add(kandil);
    });

    return group;
  }

  createKandilLantern() {
    const kGroup = new THREE.Group();

    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), this.materials.kandilGlow);
    kGroup.add(star);

    const streamerGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.85, 4);
    [-0.18, 0, 0.18].forEach(sx => {
      const s = new THREE.Mesh(streamerGeo, this.materials.goldFinial);
      s.position.set(sx, -0.65, 0);
      kGroup.add(s);
    });

    return kGroup;
  }

  initDriftingPetals() {
    const pCount = 90;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 8.5 + 0.5;
      pos[i * 3 + 2] = -Math.random() * 110;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff8c00,
      size: 0.28,
      transparent: true,
      opacity: 0.85
    });

    this.petalSystem = new THREE.Points(geo, mat);
    this.scene.add(this.petalSystem);
  }

  initDistantCityscape() {
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, -220);

    [-70, -50, -32, 32, 50, 70].forEach(cx => {
      const h = Math.random() * 22 + 18;
      const bGeo = new THREE.BoxGeometry(14, h, 14);
      const bMesh = new THREE.Mesh(bGeo, this.materials.distantCityMat);
      bMesh.position.set(cx, h * 0.5, (Math.random() - 0.5) * 30);
      cityGroup.add(bMesh);
    });

    this.scene.add(cityGroup);
  }

  // GRAND GANESH PANDAL (Visual Destination Landmark - Bright & Glorious!)
  createGrandGaneshPandal() {
    const pandal = new THREE.Group();
    pandal.position.set(0, 0, -145.0);

    const archGeo = new THREE.BoxGeometry(28.0, 4.5, 5.0);
    const arch = new THREE.Mesh(archGeo, this.materials.canopyCrimson);
    arch.position.y = 15.0;
    pandal.add(arch);

    [-11.5, -4.5, 4.5, 11.5].forEach(px => {
      const pillarGeo = new THREE.CylinderGeometry(0.85, 1.05, 15.0, 16);
      const pillar = new THREE.Mesh(pillarGeo, this.materials.wallSandstone);
      pillar.position.set(px, 7.5, 0);
      pandal.add(pillar);

      const kalash = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 12), this.materials.goldFinial);
      kalash.position.set(px, 15.8, 0);
      pandal.add(kalash);
    });

    for (let tier = 0; tier < 4; tier++) {
      const sWidth = 19.0 - tier * 3.8;
      const sHeight = 2.5;
      const sGeo = new THREE.BoxGeometry(sWidth, sHeight, 4.0);
      const sMesh = new THREE.Mesh(sGeo, this.materials.wallSandstone);
      sMesh.position.y = 17.5 + tier * 2.4;
      pandal.add(sMesh);
    }

    const spireFinial = new THREE.Mesh(new THREE.ConeGeometry(2.4, 5.5, 16), this.materials.goldFinial);
    spireFinial.position.y = 28.5;
    pandal.add(spireFinial);

    const idolGroup = new THREE.Group();
    idolGroup.position.set(0, 4.5, 0);

    const throneGeo = new THREE.CylinderGeometry(5.8, 6.4, 1.8, 24);
    const throne = new THREE.Mesh(throneGeo, this.materials.canopyGold);
    throne.position.y = 0.9;
    idolGroup.add(throne);

    const bodyGeo = new THREE.SphereGeometry(3.5, 20, 20);
    bodyGeo.scale(1.2, 1.1, 1.1);
    const body = new THREE.Mesh(bodyGeo, this.materials.goldFinial);
    body.position.y = 4.2;
    idolGroup.add(body);

    const pitambaraGeo = new THREE.CylinderGeometry(3.6, 4.4, 2.2, 20);
    const pitambara = new THREE.Mesh(pitambaraGeo, this.materials.canopyOrange);
    pitambara.position.y = 2.4;
    idolGroup.add(pitambara);

    const headGeo = new THREE.SphereGeometry(2.2, 18, 18);
    const head = new THREE.Mesh(headGeo, this.materials.goldFinial);
    head.position.y = 7.6;
    idolGroup.add(head);

    const trunkGeo = new THREE.CylinderGeometry(0.55, 0.28, 3.2, 12);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.goldFinial);
    trunk.position.set(0.3, 5.6, 1.8);
    trunk.rotation.x = -0.65;
    trunk.rotation.z = 0.25;
    idolGroup.add(trunk);

    [-2.4, 2.4].forEach(ex => {
      const earGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.20, 12);
      earGeo.rotateZ(Math.PI * 0.5);
      const ear = new THREE.Mesh(earGeo, this.materials.goldFinial);
      ear.position.set(ex, 7.6, 0.2);
      idolGroup.add(ear);
    });

    const haloGeo = new THREE.RingGeometry(3.8, 6.2, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffd152,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 8.0, -1.2);
    idolGroup.add(halo);

    const crownGeo = new THREE.ConeGeometry(1.8, 4.0, 16);
    const crown = new THREE.Mesh(crownGeo, this.materials.goldFinial);
    crown.position.y = 10.6;
    idolGroup.add(crown);

    pandal.add(idolGroup);

    const pandalLight = new THREE.PointLight(0xffb703, 4.5, 80.0);
    pandalLight.position.set(0, 14.0, 4.0);
    pandal.add(pandalLight);

    this.scene.add(pandal);
    this.horizonPandal = pandal;
    return pandal;
  }

  createHorizonGaneshaSanctum() {
    return this.createGrandGaneshPandal();
  }

  update(moveDist, dt = 0.016) {
    const totalSpan = this.moduleLength * this.moduleCount;

    this.clusters.forEach(c => {
      c.group.position.z += moveDist;
      const despawnZ = (typeof CONFIG !== 'undefined' && CONFIG.DESPAWN_Z) ? CONFIG.DESPAWN_Z : 22.0;
      if (c.group.position.z > despawnZ) {
        c.group.position.z -= totalSpan;
      }
    });

    for (let i = 0; i < this.overheadWires.length; i++) {
      const wire = this.overheadWires[i];
      wire.group.position.z += moveDist;
      if (wire.group.position.z > -8.0) {
        wire.group.position.z -= (this.overheadWires.length * 28.0);
      }
    }

    if (this.petalSystem) {
      const pos = this.petalSystem.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] += moveDist * 0.45;
        pos[i + 1] -= 0.018;
        if (pos[i + 1] < 0.2) pos[i + 1] = 7.5;
        if (pos[i + 2] > 10.0) pos[i + 2] = -95.0;
      }
      this.petalSystem.geometry.attributes.position.needsUpdate = true;
    }

    const time = Date.now() * 0.008;
    this.animatedDrummers.forEach(d => {
      d.mesh.rotation.x = d.baseRot + Math.sin(time * 3.0 + d.idx) * 0.18;
    });

    if (Math.random() < 0.022 && this.fireworkPool) {
      this.spawnFirework();
    }
    this.updateFireworks(dt);
  }

  initFireworksPool() {
    this.fireworkPool = [];
    const pCount = 36;
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(pCount * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: 0xffd152,
        size: 1.8,
        transparent: true,
        opacity: 0
      });
      const mesh = new THREE.Points(geo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.fireworkPool.push({
        mesh: mesh,
        pos: pos,
        vel: Array.from({ length: pCount }, () => new THREE.Vector3()),
        life: 0,
        active: false
      });
    }
  }

  spawnFirework() {
    if (!this.fireworkPool) return;
    const fw = this.fireworkPool.find(f => !f.active);
    if (!fw) return;

    const colors = [0xffd152, 0xd946ef, 0x38bdf8, 0xf97316, 0xec4899];
    fw.mesh.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);

    const origin = {
      x: (Math.random() - 0.5) * 80,
      y: 30 + Math.random() * 20,
      z: -140 - Math.random() * 40
    };

    const pCount = 36;
    for (let i = 0; i < pCount; i++) {
      fw.pos[i * 3] = origin.x;
      fw.pos[i * 3 + 1] = origin.y;
      fw.pos[i * 3 + 2] = origin.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const spd = 5.0 + Math.random() * 8.0;
      fw.vel[i].set(
        spd * Math.sin(phi) * Math.cos(theta),
        spd * Math.cos(phi),
        spd * Math.sin(phi) * Math.sin(theta)
      );
    }

    fw.mesh.geometry.attributes.position.needsUpdate = true;
    fw.mesh.material.opacity = 1.0;
    fw.mesh.visible = true;
    fw.life = 1.0;
    fw.active = true;
  }

  updateFireworks(dt) {
    if (!this.fireworkPool) return;
    for (let i = 0; i < this.fireworkPool.length; i++) {
      const fw = this.fireworkPool[i];
      if (!fw.active) continue;

      fw.life -= dt * 0.9;
      fw.mesh.material.opacity = Math.max(0, fw.life);

      for (let j = 0; j < fw.vel.length; j++) {
        fw.pos[j * 3] += fw.vel[j].x * dt;
        fw.pos[j * 3 + 1] += fw.vel[j].y * dt;
        fw.pos[j * 3 + 2] += fw.vel[j].z * dt;
        fw.vel[j].y -= 4.0 * dt;
      }
      fw.mesh.geometry.attributes.position.needsUpdate = true;

      if (fw.life <= 0) {
        fw.active = false;
        fw.mesh.visible = false;
      }
    }
  }

  reset() {
    for (let i = 0; i < this.clusters.length; i++) {
      const moduleIdx = Math.floor(i / 2);
      this.clusters[i].group.position.z = -moduleIdx * this.moduleLength;
    }
    const spanSpacing = 28.0;
    for (let i = 0; i < this.overheadWires.length; i++) {
      this.overheadWires[i].group.position.z = -15 - i * spanSpacing;
    }
    if (this.fireworkPool) {
      this.fireworkPool.forEach(fw => {
        fw.active = false;
        fw.mesh.visible = false;
      });
    }
  }
}



// ============================================================================
// 8. TRUE 3D COLLECTIBLES (Object Pooled Modaks, Coins & Power-Up Tokens)
// ============================================================================
class Collectible3DManager {
  constructor(game) {
    this.game = game;
    this.scene = game.three.scene;
    this.items = [];
    this.spawnCounter = 0;

    // Shared Reusable Materials (Zero allocation during gameplay)
    this.modakMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.65,
      roughness: 0.22,
      emissive: 0xffba08,
      emissiveIntensity: 0.42
    });

    this.kesarMat = new THREE.MeshBasicMaterial({ color: 0xd62828 });

    this.auraMat = new THREE.MeshBasicMaterial({
      color: 0xffd152,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });

    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffd152,
      metalness: 0.85,
      roughness: 0.18,
      emissive: 0xffb703,
      emissiveIntensity: 0.28
    });

    this.tokenMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.78,
      roughness: 0.20
    });

    // Shared Reusable Geometries (Zero allocation during gameplay)
    this.modakBaseGeo = new THREE.SphereGeometry(0.38, 14, 10);
    this.modakBaseGeo.scale(1.0, 0.8, 1.0);

    this.modakConeGeo = new THREE.ConeGeometry(0.36, 0.65, 12);
    this.kesarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6);

    this.auraGeo = new THREE.RingGeometry(0.42, 0.72, 14);
    this.auraGeo.rotateX(-Math.PI * 0.5);

    this.coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16);
    this.coinGeo.rotateX(Math.PI * 0.5);

    this.tokenGeo = new THREE.SphereGeometry(0.55, 16, 14);

    // Distinct materials for power-up types
    this.tokenMaterials = {
      'SHIELD': new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.65, roughness: 0.2 }),
      'MAGNET': new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x7e22ce, emissiveIntensity: 0.65, roughness: 0.2 }),
      'BOOST': new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.75, roughness: 0.2 }),
      'DOUBLE': new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xc2410c, emissiveIntensity: 0.70, roughness: 0.2 }),
      'SLOW': new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.65, roughness: 0.2 }),
      'HEART': new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.75, roughness: 0.2 })
    };

    // Object Pools (Pre-allocated once)
    this.pool = {
      'MODAK': [],
      'COIN': [],
      'TOKEN': []
    };

    this.initPools();
  }

  initPools() {
    // 1. Pre-allocate 36 Modak Meshes
    for (let i = 0; i < 36; i++) {
      const mesh = this.buildModakMesh();
      mesh.visible = false;
      mesh.userData.inUse = false;
      mesh.position.set(0, -200, 0);
      this.scene.add(mesh);
      this.pool.MODAK.push(mesh);
    }

    // 2. Pre-allocate 36 Coin Meshes
    for (let i = 0; i < 36; i++) {
      const mesh = this.buildCoinMesh();
      mesh.visible = false;
      mesh.userData.inUse = false;
      mesh.position.set(0, -200, 0);
      this.scene.add(mesh);
      this.pool.COIN.push(mesh);
    }

    // 3. Pre-allocate 14 Token Meshes
    for (let i = 0; i < 14; i++) {
      const mesh = this.buildTokenMesh('SHIELD');
      mesh.visible = false;
      mesh.userData.inUse = false;
      mesh.position.set(0, -200, 0);
      this.scene.add(mesh);
      this.pool.TOKEN.push(mesh);
    }
  }

  getPooledMesh(type) {
    const key = (type === 'MODAK' || type === 'COIN') ? type : 'TOKEN';
    let list = this.pool[key];
    if (!list) {
      list = [];
      this.pool[key] = list;
    }
    let mesh = list.find(m => !m.userData.inUse);
    if (!mesh) {
      // Expand pool gracefully if needed
      if (key === 'MODAK') mesh = this.buildModakMesh();
      else if (key === 'COIN') mesh = this.buildCoinMesh();
      else mesh = this.buildTokenMesh(type);
      mesh.visible = false;
      mesh.position.set(0, -200, 0);
      this.scene.add(mesh);
      list.push(mesh);
    }

    if (key === 'TOKEN') {
      this.configureTokenMesh(mesh, type);
    }

    mesh.userData.inUse = true;
    mesh.visible = true;
    return mesh;
  }

  releaseItem(it) {
    if (it && it.mesh) {
      it.mesh.visible = false;
      it.mesh.userData.inUse = false;
      it.mesh.position.set(0, -200, 0);
    }
  }

  reset() {
    for (let i = 0; i < this.items.length; i++) {
      this.releaseItem(this.items[i]);
    }
    this.items = [];
    for (const key in this.pool) {
      this.pool[key].forEach(m => {
        m.visible = false;
        m.userData.inUse = false;
        m.position.set(0, -200, 0);
      });
    }
    this.spawnCounter = 0;
  }

  seedInitialCollectibles() {
    // Immediate starting rows so coins and modaks are visible from second 1
    // 1. Center lane coins leading forward
    for (let k = 0; k < 4; k++) {
      this.createItem('COIN', CONFIG.LANES[1], 0.85, -18.0 - k * 4.5);
    }
    // 2. Modak jump arc
    for (let k = 0; k < 5; k++) {
      const arcY = 0.85 + Math.sin((k / 4) * Math.PI) * 1.8;
      this.createItem('MODAK', CONFIG.LANES[1], arcY, -44.0 - k * 4.0);
    }
    // 3. Lane switching coins
    this.createItem('COIN', CONFIG.LANES[0], 0.85, -74.0);
    this.createItem('COIN', CONFIG.LANES[0], 0.85, -78.5);
    this.createItem('COIN', CONFIG.LANES[1], 0.85, -84.0);
    this.createItem('COIN', CONFIG.LANES[2], 0.85, -90.0);
    this.createItem('COIN', CONFIG.LANES[2], 0.85, -94.5);
  }

  update(dt, moveDist) {
    this.spawnCounter += moveDist;
    if (this.spawnCounter >= 22.0) {
      this.spawnCounter = 0;
      this.spawnPattern();
    }

    const isMagnet = this.game.powerUps.isMagnetActive;
    const playerX = this.game.player.currentX;
    const playerY = this.game.player.jumpY;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      const prevZ = it.mesh.position.z;
      it.mesh.position.z += moveDist;
      const currZ = it.mesh.position.z;

      it.mesh.rotation.y += 3.2 * dt;
      it.mesh.position.y = it.baseY + Math.sin(Date.now() * 0.006 + currZ * 0.1) * 0.20;

      // Magnet attraction for BOTH Modak and Coin
      if (isMagnet && (it.type === 'MODAK' || it.type === 'COIN') && currZ > -45 && currZ < 6) {
        it.mesh.position.x += (playerX - it.mesh.position.x) * Math.min(1.0, 16.0 * dt);
        it.mesh.position.y += ((playerY + 0.85) - it.mesh.position.y) * Math.min(1.0, 16.0 * dt);
      }

      // Swept Player Pickup Collision (Zero tunneling across all speeds)
      const crossedPlayerPlane = (prevZ <= 1.8 && currZ >= -1.8);
      if (!it.collected && crossedPlayerPlane) {
        const dx = Math.abs(playerX - it.mesh.position.x);
        const dy = Math.abs((playerY + 0.85) - it.mesh.position.y);
        if (dx < 1.5 && dy < 1.6) {
          it.collected = true;
          this.game.collectItem(it);
          this.releaseItem(it);
          this.items.splice(i, 1);
          continue;
        }
      }

      // Clean Despawn behind player: return to pool
      if (currZ > 4.5) {
        this.releaseItem(it);
        this.items.splice(i, 1);
      }
    }
  }

  spawnPattern(spawnZ = CONFIG.SPAWN_Z) {
    const patterns = [
      'COIN_LINE',
      'COIN_STAGGER',
      'MODAK_ARC',
      'MODAK_STRAIGHT',
      'COIN_MODAK_MIX',
      'LANE_REWARD_TRIO'
    ];
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    const baseLane = Math.floor(Math.random() * 3);

    if (p === 'COIN_LINE') {
      for (let k = 0; k < 5; k++) {
        this.createItem('COIN', CONFIG.LANES[baseLane], 0.85, spawnZ - k * 4.8);
      }
    } else if (p === 'COIN_STAGGER') {
      const l1 = baseLane;
      const l2 = (baseLane + 1) % 3;
      const l3 = (baseLane + 2) % 3;
      this.createItem('COIN', CONFIG.LANES[l1], 0.85, spawnZ);
      this.createItem('COIN', CONFIG.LANES[l1], 0.85, spawnZ - 4.5);
      this.createItem('COIN', CONFIG.LANES[l2], 0.85, spawnZ - 9.0);
      this.createItem('COIN', CONFIG.LANES[l2], 0.85, spawnZ - 13.5);
      this.createItem('COIN', CONFIG.LANES[l3], 0.85, spawnZ - 18.0);
    } else if (p === 'MODAK_ARC') {
      for (let k = 0; k < 5; k++) {
        const arcY = 0.85 + Math.sin((k / 4) * Math.PI) * 2.0;
        this.createItem('MODAK', CONFIG.LANES[baseLane], arcY, spawnZ - k * 4.5);
      }
    } else if (p === 'MODAK_STRAIGHT') {
      for (let k = 0; k < 4; k++) {
        this.createItem('MODAK', CONFIG.LANES[baseLane], 0.85, spawnZ - k * 5.0);
      }
    } else if (p === 'COIN_MODAK_MIX') {
      for (let k = 0; k < 3; k++) {
        this.createItem('COIN', CONFIG.LANES[baseLane], 0.85, spawnZ - k * 4.5);
      }
      this.createItem('MODAK', CONFIG.LANES[baseLane], 0.85, spawnZ - 14.5);
    } else if (p === 'LANE_REWARD_TRIO') {
      this.createItem('COIN', CONFIG.LANES[0], 0.85, spawnZ);
      this.createItem('MODAK', CONFIG.LANES[1], 0.85, spawnZ - 5.0);
      this.createItem('COIN', CONFIG.LANES[2], 0.85, spawnZ - 10.0);
    }
  }

  createItem(type, x, y, z) {
    const mesh = this.getPooledMesh(type);
    mesh.position.set(x, y, z);
    mesh.visible = true;

    this.items.push({
      type: type,
      mesh: mesh,
      baseY: y,
      collected: false
    });
  }

  createModakMesh() {
    return this.buildModakMesh();
  }

  buildModakMesh() {
    const group = new THREE.Group();

    const baseSphere = new THREE.Mesh(this.modakBaseGeo, this.modakMat);
    baseSphere.position.y = 0.28;
    group.add(baseSphere);

    const cone = new THREE.Mesh(this.modakConeGeo, this.modakMat);
    cone.position.y = 0.58;
    group.add(cone);

    const kesar = new THREE.Mesh(this.kesarGeo, this.kesarMat);
    kesar.position.y = 0.94;
    group.add(kesar);

    const aura = new THREE.Mesh(this.auraGeo, this.auraMat);
    aura.position.y = 0.10;
    group.add(aura);

    return group;
  }

  buildCoinMesh() {
    const group = new THREE.Group();
    const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
    group.add(coin);

    // Inner embossed golden ring for rich festival appearance
    const ringGeo = new THREE.RingGeometry(0.24, 0.38, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb, side: THREE.DoubleSide });
    const ringFront = new THREE.Mesh(ringGeo, ringMat);
    ringFront.position.z = 0.065;
    group.add(ringFront);

    const ringBack = new THREE.Mesh(ringGeo, ringMat);
    ringBack.position.z = -0.065;
    group.add(ringBack);

    return group;
  }

  buildTokenMesh(type = 'SHIELD') {
    const group = new THREE.Group();

    // Central Floating Glowing Orb
    const orb = new THREE.Mesh(this.tokenGeo, this.tokenMaterials[type] || this.tokenMat);
    group.add(orb);

    // Outer Orbiting Power Ring
    const ringGeo = new THREE.TorusGeometry(0.85, 0.08, 8, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.35;
    group.add(ring);

    group.userData.orb = orb;
    group.userData.ring = ring;

    return group;
  }

  configureTokenMesh(mesh, type) {
    if (mesh.userData && mesh.userData.orb) {
      const mat = this.tokenMaterials[type] || this.tokenMat;
      mesh.userData.orb.material = mat;
      if (mesh.userData.ring && mesh.userData.ring.material) {
        mesh.userData.ring.material.color.set(mat.color);
      }
    }
  }
}

// ----------------------------------------------------------------------------
// 9. POWER-UP & COMBO MANAGER
// ----------------------------------------------------------------------------
class PowerUpManager {
  constructor(game) {
    this.game = game;
    this.hasShield = false;
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.isBoostActive = false;
    this.boostTimer = 0;
    this.isDoubleScore = false;
    this.doubleScoreTimer = 0;
    this.isSlowTime = false;
    this.slowTimeTimer = 0;

    this.tokens = [];
    this.spawnTimer = 0;
  }

  reset() {
    this.hasShield = false;
    this.isMagnetActive = false;
    this.magnetTimer = 0;
    this.isBoostActive = false;
    this.boostTimer = 0;
    this.isDoubleScore = false;
    this.doubleScoreTimer = 0;
    this.isSlowTime = false;
    this.slowTimeTimer = 0;
    this.tokens = [];
    this.spawnTimer = 0;
    this.updateHUD();
  }

  update(dt, moveDist) {
    this.spawnTimer += moveDist;
    if (this.spawnTimer >= 85.0) {
      this.spawnTimer = 0;
      this.spawnToken();
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
    const type = types[Math.floor(Math.random() * types.length)];
    const lane = Math.floor(Math.random() * 3);
    this.game.collectibles.createItem(type, CONFIG.LANES[lane], 1.2, CONFIG.SPAWN_Z);
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
}

// ----------------------------------------------------------------------------
// 10. MISSION MANAGER (Task Progression & Achievements)
// ----------------------------------------------------------------------------
class MissionManager {
  constructor(game) {
    this.game = game;
    this.missions = [
      { id: 'MODAK_50', desc: 'Collect 50 Modaks', target: 50, current: 0, completed: false, type: 'MODAK' },
      { id: 'DIST_800', desc: 'Travel 800m', target: 800, current: 0, completed: false, type: 'DISTANCE' },
      { id: 'NEAR_MISS_5', desc: 'Perform 5 Near Misses', target: 5, current: 0, completed: false, type: 'NEAR_MISS' },
      { id: 'COMBO_3', desc: 'Reach 3x Combo', target: 3, current: 0, completed: false, type: 'COMBO' },
      { id: 'POWER_2', desc: 'Grab 2 Power-Ups', target: 2, current: 0, completed: false, type: 'POWER_UP' }
    ];
    this.activeMissions = [];
  }

  generateMissions() {
    this.missions.forEach(m => {
      m.current = 0;
      m.completed = false;
    });
    this.activeMissions = [...this.missions];
    this.updateHUD();
    this.renderStartMissions();
  }

  track(type, value = 1) {
    this.activeMissions.forEach(m => {
      if (m.type === type && !m.completed) {
        if (type === 'COMBO') {
          m.current = Math.max(m.current, value);
        } else {
          m.current += value;
        }

        if (m.current >= m.target) {
          m.completed = true;
          this.game.audio.playPowerUp();
          this.game.showToast(`MISSION COMPLETED: ${m.desc}! 🚩`);
        }
      }
    });
    this.updateHUD();
  }

  updateHUD() {
    const container = document.getElementById('hudMiniTasks');
    if (!container) return;

    let html = '';
    this.activeMissions.slice(0, 2).forEach(m => {
      const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
      html += `
        <div class="mini-task-item ${m.completed ? 'completed' : ''}">
          <span class="task-name">${m.desc}</span>
          <span class="task-val">${Math.min(m.current, m.target)}/${m.target}</span>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  renderStartMissions() {
    const list = document.getElementById('startMissionsList');
    if (!list) return;

    let html = '';
    this.activeMissions.forEach(m => {
      html += `<li>● ${m.desc}</li>`;
    });
    list.innerHTML = html;
  }
}

// ----------------------------------------------------------------------------
// 11. INPUT MANAGER (Keyboard, Mobile Swipe & Pointer Navigation Buttons)
// ----------------------------------------------------------------------------
class InputManager {
  constructor(game) {
    this.game = game;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.minSwipeDist = 28;
    this.maxSwipeTime = 400;

    // Single Authoritative Movement Dispatcher with 100ms debounce
    this.lastMoveTime = 0;
    this.moveDebounceMs = 100;
    this.bound = false;
  }

  // Central authoritative movement handler called by ALL input methods
  // direction: -1 = Left, +1 = Right
  handleMove(direction) {
    const now = performance.now();
    if (now - this.lastMoveTime < this.moveDebounceMs) return false;

    if (this.game.state !== 'PLAYING') return false;

    const moved = this.game.player.movePlayer(direction);
    if (moved) {
      this.lastMoveTime = now;
    }
    return moved;
  }

  bindEvents() {
    if (this.bound) return; // Prevent duplicate listeners on restart
    this.bound = true;

    // 1. Keyboard Controls
    window.addEventListener('keydown', (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();

      if (this.game.state === 'PLAYING') {
        if (code === 'ArrowLeft' || code === 'KeyA' || key === 'arrowleft' || key === 'a') {
          e.preventDefault();
          this.handleMove(-1);
        } else if (code === 'ArrowRight' || code === 'KeyD' || key === 'arrowright' || key === 'd') {
          e.preventDefault();
          this.handleMove(1);
        } else if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space' || key === 'arrowup' || key === 'w' || key === ' ') {
          e.preventDefault();
          this.game.player.jump();
        } else if (code === 'ArrowDown' || code === 'KeyS' || key === 'arrowdown' || key === 's') {
          e.preventDefault();
          this.game.player.slide();
        } else if (code === 'KeyP' || code === 'Escape' || key === 'p' || key === 'escape') {
          this.game.togglePause();
        } else if (code === 'KeyM' || key === 'm') {
          this.toggleSound();
        }
      } else if (code === 'KeyM' || key === 'm') {
        this.toggleSound();
      }
    });

    // 2. Touch & Swipe Controls (Ignore if touch starts on on-screen navigation buttons)
    const onTouchStart = (clientX, clientY, target) => {
      if (target && target.closest && target.closest('#mobileControls')) return;
      this.touchStartX = clientX;
      this.touchStartY = clientY;
      this.touchStartTime = Date.now();
      if (this.game.audio) this.game.audio.init();
    };

    const onTouchEnd = (clientX, clientY, target) => {
      if (target && target.closest && target.closest('#mobileControls')) return;
      if (this.game.state !== 'PLAYING') return;
      const dt = Date.now() - this.touchStartTime;
      if (dt > this.maxSwipeTime) return;

      const dx = clientX - this.touchStartX;
      const dy = clientY - this.touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > this.minSwipeDist) {
          if (dx > 0) {
            this.handleMove(1); // Swipe Right => Move Right (+1)
          } else {
            this.handleMove(-1); // Swipe Left => Move Left (-1)
          }
        }
      } else {
        if (Math.abs(dy) > this.minSwipeDist) {
          if (dy > 0) {
            this.game.player.slide(); // Swipe Down => Slide
          } else {
            this.game.player.jump(); // Swipe Up => Jump
          }
        }
      }
    };

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 0) return;
      onTouchStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      onTouchEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e.target);
    }, { passive: true });

    // Mouse drag swipe fallback for testing
    let isMouseDown = false;
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isMouseDown = true;
        onTouchStart(e.clientX, e.clientY, e.target);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (isMouseDown && e.button === 0) {
        isMouseDown = false;
        onTouchEnd(e.clientX, e.clientY, e.target);
      }
    });

    // 3. On-Screen Buttons with Zero-Latency Pointer Events & Click Deduplication
    this.bindButtons();
  }

  bindButtons() {
    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bindClick('btnStartGame', () => {
      this.game.audio.init();
      this.game.startRun();
    });

    bindClick('btnHowToPlay', () => {
      document.getElementById('modalHowToPlay').classList.add('active');
    });

    bindClick('btnCloseModal', () => {
      document.getElementById('modalHowToPlay').classList.remove('active');
    });

    bindClick('btnPauseToggle', () => this.game.togglePause());
    bindClick('btnResume', () => this.game.resume());
    bindClick('btnRestart', () => this.game.startRun());
    bindClick('btnMenuFromPause', () => this.game.showMenu());
    bindClick('btnRunAgain', () => this.game.startRun());
    bindClick('btnMenuFromGameOver', () => this.game.showMenu());
    bindClick('btnRunAgainFinale', () => this.game.startRun());
    bindClick('btnMenuFromFinale', () => this.game.showMenu());

    bindClick('btnSoundToggle', () => this.toggleSound());
    bindClick('btnToggleSoundStart', () => this.toggleSound());
    bindClick('btnToggleSoundPause', () => this.toggleSound());

    // Navigation Buttons (Left & Right) with Zero-Latency Pointerdown + Click Deduplication
    let lastNavPointerTime = 0;
    const bindNavBtn = (id, direction) => {
      const el = document.getElementById(id);
      if (!el) return;

      const onAction = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const now = performance.now();
        if (now - lastNavPointerTime < 80) return;
        lastNavPointerTime = now;

        if (this.game.audio) this.game.audio.init();
        this.handleMove(direction);
      };

      el.addEventListener('pointerdown', onAction, { passive: false });
      el.addEventListener('click', (e) => {
        // Ignore synthetic click dispatched after pointerdown
        if (performance.now() - lastNavPointerTime < 450) {
          if (e && e.preventDefault) e.preventDefault();
          return;
        }
        onAction(e);
      }, { passive: false });
    };

    bindNavBtn('btnMobileLeft', -1);
    bindNavBtn('btnMobileRight', 1);

    // Jump & Slide Action Buttons with Zero-Latency Pointerdown + Click Deduplication
    let lastActionPointerTime = 0;
    const bindActionBtn = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;

      const onAction = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const now = performance.now();
        if (now - lastActionPointerTime < 80) return;
        lastActionPointerTime = now;

        if (this.game.audio) this.game.audio.init();
        fn();
      };

      el.addEventListener('pointerdown', onAction, { passive: false });
      el.addEventListener('click', (e) => {
        if (performance.now() - lastActionPointerTime < 450) {
          if (e && e.preventDefault) e.preventDefault();
          return;
        }
        onAction(e);
      }, { passive: false });
    };

    bindActionBtn('btnMobileJump', () => this.game.player.jump());
    bindActionBtn('btnMobileSlide', () => this.game.player.slide());

    window.addEventListener('resize', () => {
      this.game.onResize();
    });
  }

  toggleSound() {
    const active = this.game.audio.toggleMute();
    const icon = active ? '🔊' : '🔇';
    const btn = document.getElementById('btnSoundToggle');
    if (btn) btn.textContent = icon;
    const startIcon = document.getElementById('startSoundIcon');
    if (startIcon) startIcon.textContent = icon;
  }
}

// ----------------------------------------------------------------------------
// 12. MASTER GAME ENGINE (Three.js WebGL Core Loop & State Machine)
// ----------------------------------------------------------------------------
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');

    // 1. Initialize Subsystems
    this.audio = new AudioManager();
    this.three = new ThreeSceneManager(this.canvas);
    this.road = new Road3DManager(this);
    this.player = new Player3D(this);
    this.obstacles = new Obstacle3DManager(this);
    this.collectibles = new Collectible3DManager(this);
    this.powerUps = new PowerUpManager(this);
    this.environment = new Environment3DManager(this);
    this.missions = new MissionManager(this);
    this.input = new InputManager(this);

    // 2. Game State & Metrics
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

    this.celebrationTimer = 0;
    this.lastTimestamp = 0;

    this.init();
  }

  init() {
    this.onResize();
    this.input.bindEvents();
    this.missions.generateMissions();

    // Upfront WebGL GPU shader & buffer warmup pass
    this.warmupGPU();

    this.showMenu();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  warmupGPU() {
    const hiddenObjects = [];
    const culledObjects = [];

    this.three.scene.traverse(obj => {
      if (!obj.visible) {
        hiddenObjects.push(obj);
        obj.visible = true;
      }
      if (obj.frustumCulled) {
        culledObjects.push(obj);
        obj.frustumCulled = false;
      }
    });

    // Render 1 frame with camera to upload all geometries and shaders to GPU
    this.three.renderer.render(this.three.scene, this.three.camera);

    // Restore original state cleanly
    for (let i = 0; i < hiddenObjects.length; i++) {
      hiddenObjects[i].visible = false;
    }
    for (let i = 0; i < culledObjects.length; i++) {
      culledObjects[i].frustumCulled = true;
    }

    this.obstacles.reset();
    this.collectibles.reset();
    this.three.render();
  }

  onResize() {
    const container = document.getElementById('game-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.width = width;
    this.height = height;
    this.three.resize(width, height);
  }

  hideAllScreens() {
    document.querySelectorAll('.screen-overlay').forEach(el => el.classList.remove('active'));
  }

  showMenu() {
    this.state = 'MENU';
    this.audio.stopDholRhythm();
    this.hideAllScreens();
    document.getElementById('screenStart').classList.add('active');
    document.getElementById('startHighScore').textContent = Math.floor(this.highScore);
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
    this.lastTimestamp = performance.now();

    this.player.reset();
    this.road.reset();
    this.obstacles.reset();
    this.collectibles.reset();
    this.collectibles.seedInitialCollectibles();
    this.powerUps.reset();
    this.environment.reset();
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
    this.lastTimestamp = performance.now();
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
    this.audio.playFinale();
    this.showBannerAlert("GANAPATI BAPPA MORYA! 🙏", 2200);
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
    if (mContainer) {
      mContainer.textContent = `🚩 Festival Journey Completed: ${compCount} / ${this.missions.activeMissions.length} Tasks • Reached Lord Ganesha! 🙏`;
    }

    document.getElementById('screenFinale').classList.add('active');
  }

  collectItem(item) {
    if (item.type === 'MODAK') {
      this.modaks++;
      this.audio.playModak();
      this.score += 10 * this.comboMultiplier * (this.powerUps.isDoubleScore ? 2 : 1);
      this.missions.track('MODAK', 1);

      this.comboCount++;
      this.comboTimer = 3.6;
      if (this.comboCount >= 5) {
        this.comboMultiplier = Math.min(5, Math.floor(this.comboCount / 5) + 1);
        if (this.comboMultiplier > this.bestCombo) {
          this.bestCombo = this.comboMultiplier;
        }
        this.missions.track('COMBO', this.comboMultiplier);
      }
    } else if (item.type === 'COIN') {
      this.coins++;
      this.audio.playCoin();
      this.score += 5 * (this.powerUps.isDoubleScore ? 2 : 1);
    } else {
      this.powerUps.activate(item.type);
    }

    this.updateHUD();
  }

  triggerNearMiss(obs) {
    this.nearMissCount++;
    this.score += 50 * this.comboMultiplier;
    this.audio.playNearMiss();
    this.missions.track('NEAR_MISS', 1);
    this.showBannerAlert(`NEAR MISS! +${50 * this.comboMultiplier} ✨`, 1200);
    this.updateHUD();
  }

  checkCollisions() {
    if (this.player.invulnerableTimer > 0 || this.state === 'DESTINATION_CELEBRATION') return;

    for (let i = 0; i < this.obstacles.obstacles.length; i++) {
      const obs = this.obstacles.obstacles[i];
      if (obs.hit) continue;

      const dz = Math.abs(obs.mesh.position.z - this.player.group.position.z);
      if (dz < CONFIG.HIT_DEPTH_Z) {
        const dx = Math.abs(this.player.currentX - CONFIG.LANES[obs.lane]);
        if (dx < CONFIG.PLAYER_HIT_W) {
          let isHit = false;

          if (obs.type === 'TORAN') {
            if (!this.player.isSliding) {
              isHit = true;
            }
          } else if (obs.type === 'BARRICADE') {
            if (this.player.jumpY < 1.15) {
              isHit = true;
            }
          } else if (obs.type === 'FLOWER_CART') {
            if (this.player.jumpY < 1.35) {
              isHit = true;
            }
          } else if (obs.type === 'DHOL_CART') {
            if (this.player.jumpY < 1.55) {
              isHit = true;
            }
          } else if (obs.type === 'AUTO_RICKSHAW') {
            if (this.player.jumpY < 1.85) {
              isHit = true;
            }
          } else {
            if (this.player.jumpY < 2.2) {
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
      return;
    }

    if (this.powerUps.hasShield) {
      this.powerUps.hasShield = false;
      this.powerUps.updateHUD();
      this.audio.playShieldBreak();
      this.player.invulnerableTimer = 0.85;
      this.showToast('DIVINE SHIELD ABSORBED HIT! 🛡️');
      return;
    }

    this.lives--;
    this.updateLivesHUD();
    this.audio.playHit();
    this.player.invulnerableTimer = CONFIG.INVULNERABLE_TIME;

    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;

    if (this.lives <= 0) {
      this.gameOver();
    }
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

    const pctEl = document.getElementById('hudJourneyPct');
    const fillEl = document.getElementById('hudJourneyFill');
    if (pctEl && fillEl) {
      const pct = Math.min(100, Math.floor((this.distance / CONFIG.DESTINATION_DISTANCE) * 100));
      pctEl.textContent = `${pct}%`;
      fillEl.style.width = `${pct}%`;
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

  gameLoop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = Math.min(0.05, Math.max(0.001, (timestamp - this.lastTimestamp) / 1000));
    this.lastTimestamp = timestamp;

    if (this.state === 'PLAYING') {
      this.updatePlaying(dt);
    } else if (this.state === 'DESTINATION_CELEBRATION') {
      this.updateCelebration(dt);
    }

    this.three.update(dt, this.player.currentX, this.player.jumpY, this.player.isSliding);
    this.three.render();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  updatePlaying(dt) {
    let targetSpeed = CONFIG.BASE_SPEED + (this.distance * CONFIG.SPEED_ACCEL);
    if (this.powerUps.isBoostActive) targetSpeed *= 1.5;
    if (this.powerUps.isSlowTime) targetSpeed *= 0.55;
    this.speed = Math.min(CONFIG.MAX_SPEED, targetSpeed);

    const moveDist = this.speed * dt;
    this.distance += moveDist * 0.25;
    this.score += moveDist * 0.3 * (this.powerUps.isDoubleScore ? 2 : 1);
    this.missions.track('DISTANCE', Math.floor(moveDist * 0.25));

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.comboTimer = 0;
      }
    }

    if (this.distance >= CONFIG.DESTINATION_DISTANCE) {
      this.triggerGaneshaDestination();
      return;
    }

    this.player.update(dt);
    this.road.update(moveDist);
    this.obstacles.update(dt, moveDist);
    this.collectibles.update(dt, moveDist);
    this.powerUps.update(dt, moveDist);
    this.environment.update(moveDist, dt);

    this.checkCollisions();
    this.updateHUD();
  }

  updateCelebration(dt) {
    this.celebrationTimer -= dt;
    this.speed = Math.max(8.0, this.speed - 12.0 * dt);
    const moveDist = this.speed * dt;
    this.distance += moveDist * 0.25;
    this.score += 40 * dt;

    this.player.update(dt);
    this.road.update(moveDist);
    this.obstacles.update(dt, moveDist);
    this.environment.update(moveDist, dt);

    this.updateHUD();

    if (this.celebrationTimer <= 0) {
      this.showFinaleScreen();
    }
  }
}

// ----------------------------------------------------------------------------
// 13. BOOTSTRAP
// ----------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
