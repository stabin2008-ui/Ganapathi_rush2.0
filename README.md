# 🪔 GANAPATHI RUSH 2.0 🐘
> **"Run • Collect • Celebrate • Reach Bappa"**
> **Cinematic True 3D Indian Ganesh Chaturthi Endless Runner**

A visually stunning, cinematic 3-lane festival endless runner built for the auspicious occasion of **Ganesh Chaturthi**. Powered by **Three.js (WebGL)**, **Vanilla CSS3**, and the **Web Audio API** — featuring full volumetric 3D meshes, dynamic PCF soft shadow maps, wet asphalt reflections, stylized human anatomical runner character, rich Indian heritage Havelis, and a magnificent Lord Ganesha sanctum on the horizon.

---

## 🌟 Visual Quality & Atmosphere

Inspired by the grand celebrations of Ganesh Chaturthi in Maharashtra and across India:
- **Athletic Human Devotee Runner**: Fully articulated 3D character with realistic proportions, layered saffron pagdi (turban) with jeweled Kalgi plume, cream silk kurta with embroidered mandarin collar and gold hem, pleated saffron dhoti, traditional pointed Mojari shoes with curled tips, and natural running kinematics.
- **Cinematic Wet Reflective Street**: Dark asphalt with aggregate grain, damp patches, and specular reflections mirroring festival streetlights, vehicle headlights, and golden modaks.
- **Rich Heritage Havelis**: 2-to-4 story architecture with sandstone jharokha balconies, carved pillars, and glowing jali windows emitting warm candlelight.
- **Illuminated Marquee Signboards**: High-resolution signage in authentic Devanagari script ("मोदक / Modak Stall", "श्री गणेश स्वीट्स", "गणपति बाप्पा मोरया").
- **Overhead Festival Canopy**: Sagging catenary fairy light strings, festive bunting flags, hanging 3D Akash Kandil star lanterns, and brass bells spanning across the street.
- **Decorated Vehicles**: Authentic green/yellow Auto-Rickshaws and festival pickup trucks ("Chhota Hathi") carrying live 3D Dhol drummers.
- **Distant Lord Ganesha Sanctum**: Colossal illuminated temple pandal on the far horizon with a seated 4-armed Lord Ganesha idol and radiant Prabhavali sunburst halo.
- **Night Sky & Fireworks**: Deep twilight celestial sky with 3D glowing moon, starfield, floating marigold petals, and bursts of colorful fireworks.

---

## 🎮 Controls

### Mobile (Clean & Unobstructed Swipe Controls)
- **Swipe Left (`←`)**: Move one lane left.
- **Swipe Right (`→`)**: Move one lane right.
- **Swipe Up (`↑`)**: Jump over barricades, drums, and carts.
- **Swipe Down (`↓`)**: Slide under hanging torans or quick-drop from mid-air.

### Desktop (Keyboard)
| Action | Primary Key | Secondary Key |
|---|---|---|
| **Move Left** | `←` Left Arrow | `A` |
| **Move Right** | `→` Right Arrow | `D` |
| **Jump** | `↑` Up Arrow | `W` or `Space` |
| **Slide / Quick Drop** | `↓` Down Arrow | `S` |
| **Pause / Resume** | `P` | `Escape` |
| **Mute / Unmute Audio** | `M` | HUD Button `🔊` |

---

## 🍬 Collectibles, Combos & Power-Ups

- **Pleated Golden Modaks**: Fluted 3D sweets with saffron kesar strand granting $+10$ points and powering your combo multiplier ($5 \to \times 2, 10 \to \times 3, 20 \to \times 4, 30 \to \times 5$).
- **🪙 Festival Coins**: Collectible tokens granting $+50$ bonus points.
- **Near Misses**: Narrowly skim past obstacles to earn $+150$ bonus score and a combo boost.
- **6 Divine Power-Ups**:
  - 🛡️ **Divine Shield**: Absorbs one obstacle impact.
  - 🧲 **Modak Magnet**: Attracts nearby modaks across all lanes for 12s.
  - ⚡ **Bappa Boost**: Temporary invulnerable sprint that plows through obstacles for 6s.
  - ⭐ **Double Score**: Multiplies score gain by $2\times$ for 12s.
  - ⏱️ **Slow Time**: Slows obstacle approach by $50\%$ for 8s.
  - ❤️ **Extra Life**: Restores one lost heart (up to 3 max).

---

## 🛠️ Technology Stack

- **Renderer**: Three.js (WebGL) with `THREE.WebGLRenderer`, `PCFSoftShadowMap`, `THREE.PerspectiveCamera`, and exponential depth fog.
- **Lighting Hierarchy**: Ambient midnight fill, warm hemisphere ground bounce (`0xf59e0b`), directional moonlight with shadow maps, player rim lighting, and moving point lights.
- **Styling**: Vanilla CSS3 with glassmorphic tokens, zero external CSS dependencies.
- **Audio**: Procedural Web Audio API synthesizing all sound effects and rhythmic dholak percussion without external sound files.

---

## 🚀 How to Run Locally

Double-click `index.html` or run with any local static HTTP server:
```bash
# Node.js
node -e "const http=require('http'),fs=require('fs'),path=require('path'); const mime={'html':'text/html','js':'application/javascript','css':'text/css'}; http.createServer((q,s)=>{ let p=q.url.split('?')[0]; if(p==='/'||p==='') p='/index.html'; const f=path.join(__dirname,p); if(!fs.existsSync(f)) return s.writeHead(404).end('Not Found'); s.writeHead(200,{'Content-Type':mime[path.extname(f).slice(1)]||'text/plain'}); fs.createReadStream(f).pipe(s); }).listen(3000,()=>console.log('Running at http://localhost:3000'));"
```
Then visit `http://localhost:3000`.

---

## 📜 Dedication

Crafted with devotion for **Ganesh Chaturthi**.
May Lord Ganesha remove all obstacles and bring joy, health, and prosperity!

**GANAPATI BAPPA MORYA! 🙏🐘**
