# 🪔 GANAPATHI RUSH 2.0 🐘
> **"Run • Collect • Celebrate • Reach Bappa"**

A fast-paced, visually rich 3-lane festival endless runner built from scratch for the auspicious occasion of **Ganesh Chaturthi**. Developed purely with **HTML5 Canvas 2D**, **Vanilla CSS3**, and the **Web Audio API** — zero dependencies, zero build steps, zero external assets, and fully playable offline.

---

## 🌟 Game Concept: The Festival Journey

In **Ganapathi Rush 2.0**, you embark on a sacred festive pilgrimage towards Lord Ganesha's grand pandal. Starting at the celebratory **Festival Entrance**, dash through lively street celebrations, past fragrant flower bazaars, sweet modak stalls, dhol-tasha drummers, and cheering crowds waving saffron flags. 

Your ultimate mission is to **complete festival tasks, survive the run, and reach the Grand Ganesha Destination** for the celebratory finale!

---

## 🎮 Controls

### Mobile (Clean & Unobstructed Swipe Controls)
The mobile layout offers a completely unobstructed view of the road without on-screen buttons covering gameplay.
- **Swipe Left (`←`)**: Move one lane left.
- **Swipe Right (`→`)**: Move one lane right.
- **Swipe Up (`↑`)**: Jump over barricades, drums, and crates.
- **Swipe Down (`↓`)**: Slide under hanging torans or quick-drop from mid-air.
- *Tip*: An elegant, non-intrusive swipe hint appears during your first run and automatically fades away after a few seconds.

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

## 🛕 Festival Landmarks Along the Route

As you sprint toward Lord Ganesha, you will cross iconic celebration landmarks:
1. 📍 **Festival Entrance** ($0\text{m}$): Warm sunset sky, entrance torans, and early street diyas.
2. 📍 **Dhol Chowk** ($500\text{m}$): Thumping dhol-tasha beats, enthusiastic crowds, and large festival banners.
3. 📍 **Flower Bazaar** ($1100\text{m}$): Twilight purple evening sky, hanging marigold garland stalls, and rose petal offerings.
4. 📍 **Grand Pandal Street** ($1700\text{m}$): Deep starry night sky, illuminated multi-tier pandals, hanging kandil lanterns, and fireworks.
5. 📍 **Ganesha Destination** ($2300\text{m}\text{--}2400\text{m}$): The grand celebration destination where the giant illuminated idol awaits!

---

## 🌺 Detailed Roadside Festival Atmosphere

Both the left and right sides of the road are filled with lively procedural festival scenery:
- **🍬 Modak Sweet Stalls**: Wooden festival stalls with red-and-yellow striped cloth canopies, tiered golden modak platters, and glowing diyas.
- **🌼 Flower Bazaar Stalls**: Bamboo stalls draped in hanging orange and yellow marigold garlands and rose baskets.
- **🥁 Dhol-Tasha Drummers**: Animated drummers in traditional saffron kurtas and pagdis whose arms beat drumsticks in rhythm with the game's music!
- **🚩 Cheering Devotees**: Silhouettes waving sacred saffron flags and raising hands in celebration.
- **🛕 Pandal Pillars**: Carved golden columns with green banana stems and coconuts.
- **🌸 Floor Rangoli**: Colorful geometric floral rangoli artwork on the pedestrian walkways.
- **🏮 Hanging Kandil Lanterns**: Star-shaped glowing lanterns and strings of fairy lights.

---

## 🌅 Early Visible Ganesha Destination on Horizon

You do not have to wait until the very end to catch a glimpse of Lord Ganesha!
- **$0\text{--}600\text{m}$**: A radiant golden silhouette of Lord Ganesha with crown (Mukut), ears, curved trunk, and halo sits upon the horizon.
- **$600\text{--}1400\text{m}$**: An illuminated pandal structure emerges around Ganesha with glowing spires and saffron flags.
- **$1400\text{--}2200\text{m}$**: The pandal and idol grow larger, glowing with thousands of lights, floating diyas, and fireworks.
- **$2400\text{m}+$**: The player arrives at the grand celebratory arena, triggering a 4-second grand celebration sequence with fireworks, flower showers, and **"GANAPATI BAPPA MORYA! 🙏"** before the Results Screen.

---

## 🏆 Dual Ending System

- **Ending A: Failed Run (Lives reach 0)**:
  - Displays "RUN OVER" with final stats, festival tasks completed, and a prompt to run again with Bappa's blessings.
- **Ending B: Journey Complete (Reached Grand Ganesha)**:
  - Displays "FESTIVAL COMPLETE!", chanting **"GANAPATI BAPPA MORYA! 🙏"**, with high-score summary, journey celebration, and score sharing.

---

## 🍬 Collectibles, Combos & Power-Ups

- **Modaks**: Golden pleated sweets granting $+10$ points and powering your combo multiplier ($5 \to \times 2, 10 \to \times 3, 20 \to \times 4, 30 \to \times 5$).
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

## 🛠️ Technology & Single-Loop Performance

- **Rendering**: HTML5 Canvas 2D with dynamic Device Pixel Ratio (DPR) scaling.
- **Styling**: Vanilla CSS3 with glassmorphic tokens, zero external CSS libraries.
- **Audio**: Procedural Web Audio API synthesizing all 12 sound effects and the background dholak rhythm without loading any MP3/WAV files.
- **Main Loop**: Exactly ONE `requestAnimationFrame` loop with delta-time capping ($\le 0.1\text{s}$) to maintain silky 60 FPS performance.

---

## 🚀 How to Run Locally

Double-click `index.html` or run with any static HTTP server:
```bash
# Node.js
npx -y serve -l 8000 .
```
Then visit `http://localhost:8000`.

---

## 📜 Credits & Dedication

Crafted with devotion for **Ganesh Chaturthi**.
May Lord Ganesha remove all obstacles and bring joy, health, and prosperity!

**GANAPATI BAPPA MORYA! 🙏🐘**
