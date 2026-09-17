# 🪔 GANAPATHI RUSH 2.0 🐘
> **"Run • Collect • Celebrate • Reach Visarjan"**

A fast-paced, visually stunning 3-lane festival endless runner built from scratch for the auspicious occasion of **Ganesh Chaturthi**. Developed purely with **HTML5 Canvas 2D**, **Vanilla CSS3**, and the **Web Audio API** — requiring zero dependencies, zero build steps, and zero external assets.

---

## 🌟 Game Concept & Fantasy

In **Ganapathi Rush 2.0**, you guide an enthusiastic festival runner through a lively, evolving Indian street celebration. As the sun sets and the festive night deepens, dodge street barricades, leap over resounding dhol drums, duck beneath hanging marigold torans, collect divine glowing Modaks, activate blessings, and dash towards the grand illuminated **Visarjan Ghat** finale!

---

## 🎮 Controls

### Desktop (Keyboard)
| Action | Primary Key | Secondary Key |
|---|---|---|
| **Move Left** | `←` Left Arrow | `A` |
| **Move Right** | `→` Right Arrow | `D` |
| **Jump** | `↑` Up Arrow | `W` or `Space` |
| **Slide / Quick Drop** | `↓` Down Arrow | `S` |
| **Pause / Resume** | `P` | `Escape` |
| **Mute / Unmute Audio** | `M` | HUD Button `🔊` |

### Mobile (Touch & Gestures)
- **Swipes**:
  - Swipe Left / Right to switch lanes smoothly.
  - Swipe Up to jump over obstacles.
  - Swipe Down to slide under overhead torans or quick-drop from mid-air.
- **On-Screen Touch Buttons**:
  - Left & Right navigation buttons (minimum $54\text{px}$ touch targets).
  - Dedicated **JUMP** and **SLIDE** action buttons placed at thumb reach.

---

## 🍬 Gameplay Features & Mechanics

### 1. 3-Lane Perspective Road
- Mathematically consistent pseudo-3D perspective camera with realistic depth scaling.
- Smooth lane interpolation (`currentLaneX` $\to$ `targetLaneX`) prevents teleports and lane skips.
- Dynamic curb lighting, moving lane dashes, and roadside diya lamp posts.

### 2. Fair & Solvable Obstacle System
The procedural wave spawner follows a strict **fairness guarantee**:
- **At least ONE lane is guaranteed 100% clear in every single obstacle wave.**
- Inter-wave reaction distance dynamically scales with running speed to ensure fair human reaction windows ($\ge 1.8\text{s}$).
- Obstacles:
  - 🚧 **Festival Barricade**: Wooden floral barrier (Jump over or change lane).
  - 🥁 **Large Dhol Drum**: Traditional festival dholak on stand (Jump over or change lane).
  - 🌺 **Overhead Toran**: Hanging marigold archway & mango leaves (Slide under or change lane).
  - 📦 **Offerings Crates**: Fruit and floral crates (Jump over or change lane).
  - 🛺 **Festival Push Cart**: Wide decorative flower cart (Change lane).

### 3. Modak Collectibles & Combo Multipliers
- Floating golden **Modaks** reward $+10$ base score and fill the combo meter.
- **Combo Ladder**:
  - $5\text{ Modaks} \to \times 2$
  - $10\text{ Modaks} \to \times 3$
  - $20\text{ Modaks} \to \times 4$
  - $30\text{ Modaks} \to \times 5$
- Collect Modaks continuously before the timer bar empties to sustain your multiplier.
- Collect **🪙 Festival Coins** for $+50$ points and cosmetic flair.

### 4. 6 Divine Power-Ups
- 🛡️ **Divine Shield**: Protects from one collision with a crystalline shatter shield effect.
- 🧲 **Modak Magnet**: Attracts all nearby modaks smoothly across lanes for 12 seconds.
- ⚡ **Bappa Boost**: Grants blazing speed sprint and invulnerability, plowing through obstacles.
- ⭐ **Double Score**: Multiplies all score gains by $2\times$ for 12 seconds.
- ⏱️ **Slow Time**: Temporarily slows obstacle approach by $50\%$ for 8 seconds.
- ❤️ **Extra Life**: Restores $+1$ heart (up to 3 max).

### 5. Skill-Based Near-Miss System
Skim narrowly past an obstacle at the last moment without colliding to trigger **"NEAR MISS!"**, rewarding $+150$ bonus score, a combo boost, and custom sound/particle effects.

### 6. Bappa's Blessing & Dynamic Festival Moments
- **Bappa's Blessing**: Rare divine moment granting a radiant golden screen aura, celestial bell chime, and instant shield + 2x multiplier without interrupting the run.
- **Non-Blocking Dynamic Moments**: Dhol drum rolls, background fireworks, diya lanes, and marigold flower showers keep the world vibrant.

### 7. 4 Progressive Festival Environments
- **Phase 1 (0–500m) — Sunset Festival**: Warm saffron sky, distant temple silhouettes, and fluttering flags.
- **Phase 2 (500–1200m) — Evening Celebration**: Twilight purple sky, glowing curb diyas, and street lamps.
- **Phase 3 (1200–2000m) — Night Festival**: Deep navy starry night, glowing full moon, illuminated pandals, and fireworks.
- **Phase 4 (2000m+) — Visarjan Rush**: Grand illumination, golden confetti, and river reflections leading into the Grand Visarjan Finale.

---

## 🛠️ Technology Stack & Architecture

- **Rendering**: HTML5 Canvas 2D with automatic Device Pixel Ratio (DPR) scaling for sharp rendering on high-DPI displays.
- **Styling**: Vanilla CSS3 using custom CSS tokens, modern glassmorphism HUD, and mobile-friendly responsive breakpoints.
- **Audio**: Web Audio API synthesizing all 12 sound effects (modak chimes, dhol beats, temple bells, whooshes, and crash effects) procedurally in code without loading external MP3/WAV files.
- **Code Architecture**:
  - `AudioManager`: Synthesized procedural sound and rhythmic dholak background beats.
  - `PerspectiveEngine`: Perspective road projection and coordinate transformations.
  - `Player`: Physics, animation states, procedural vector sprite rendering, and fair hitbox.
  - `ObstacleManager`: 5 obstacle types and fair spawner algorithm.
  - `CollectibleManager`: Modaks, coin trails, and magnetic attraction physics.
  - `PowerUpManager`: Active durations, HUD timers, and power-up tokens.
  - `EnvironmentManager`: 4 parallax time phases, road decorations, and fireworks.
  - `MissionManager`: 3 active randomized goals per run with rewards.
  - `ParticleSystem`: High performance object-pooled particle engine (350 particles).
  - `InputManager`: Keyboard, touch buttons, and swipe gesture bindings.
  - `Game`: Single `requestAnimationFrame` coordinator with delta-time capping.

---

## 🚀 How to Run Locally

Because the game is 100% self-contained with no external dependencies or build tools, running it is simple:

### Option 1: Direct File Open
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Safari, Firefox).

### Option 2: Local Static Server
You can also serve it with any local static HTTP server:
```bash
# Python 3
python -m http.server 8000

# or Node.js npx serve
npx -y serve -l 8000 .
```
Then visit `http://localhost:8000` in your web browser.

---

## 🚢 Deployment (GitHub Pages)

To host on **GitHub Pages**:
1. Push `index.html`, `style.css`, `game.js`, and `README.md` to your repository:
   ```bash
   git add .
   git commit -m "Release: Ganapathi Rush 2.0"
   git push origin main
   ```
2. In your GitHub repository, go to **Settings > Pages**.
3. Under **Build and deployment**, select `Deploy from a branch` and choose `main` / `/ (root)`.
4. Your game is live worldwide instantly!

---

## 📜 Credits & Dedication

Crafted with reverence for **Ganesh Chaturthi**.
May Lord Ganesha remove all obstacles and bestow wisdom, health, and prosperity upon you.

**GANAPATI BAPPA MORYA! 🙏🐘**
