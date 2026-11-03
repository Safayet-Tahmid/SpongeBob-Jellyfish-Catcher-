# SpongeBob: Jellyfish Catcher 🧽🌊

A premium, playable, browser-based arcade game set in the underwater world of Bikini Bottom’s Jellyfish Fields.

## 🎮 Game Overview

Grab your jellyfishing net, step into the shoes of SpongeBob SquarePants, and catch as many jellyfish as you can while dodging dangerous electric stings!

### Game Modes
- **Classic Mode**: 90-second round, 3 Krabby Patty lives, multi-level progression (Levels 1 to 5), high-score chase.
- **Time Attack**: 60-second high-speed swarm blitz! Focus on maximum score combos.
- **Relax Mode**: Infinite time, infinite lives, hazard-free jellyfishing in Bikini Bottom.

### Jellyfish Species & Scoring
- **🌸 Pink Jellyfish**: +10 points (common, gentle swimmers)
- **💧 Blue Jellyfish**: +20 points (faster, darting swimming patterns)
- **✨ Golden Jellyfish**: +50 points (rare, radiant shimmer with bonus fanfare)
- **⚡ Electric Jellyfish**: HAZARD! Avoid contact or lose a life (causes electrocuting cartoon animation)
- **🌈 Rainbow Jellyfish**: +100 points (ultra-rare prismatic trophy with shifting spectrum aura)

### Power-Ups
- **Super Net (8s)**: Expands net radius to easily scoop up entire jellyfish clusters.
- **Speed Boost (7s)**: Sprint through the water with trailing bubbles.
- **Jellyfish Magnet (8s)**: Gently pulls nearby gentle jellyfish toward SpongeBob.
- **Bubble Shield (6s)**: Iridescent protective forcefield that deflects electric shocks harmlessly.
- **Double Points (10s)**: 2X multiplier on all caught jellyfish!

### Cameo Appearances & Random Events
- **Patrick Star**: Floats across waving and drops bonus items!
- **Squidward Tentacles**: Grumpily walks across the seafloor telling you to keep the noise down.
- **Sandy Cheeks**: Swims across in her diving suit dropping powerups!
- **Plankton**: Scurries across the seafloor holding the secret Krabby Patty formula bottle.

---

## 🕹️ Controls

### Desktop
- **Move / Swim**: `WASD` or `Arrow Keys`
- **Swing Net**: `Spacebar` or Left Mouse Click
- **Pause / Resume**: `P` or `Escape`

### Mobile & Touchscreen
- **Virtual Touch Joystick**: Positioned on the bottom-left for responsive thumb steering.
- **Dedicated Catch Button**: Large tactile button on the bottom-right for instant net swings.
- **Multi-Touch**: Supported simultaneously with safe area respect and zero gesture zoom/scroll.

---

## 🛠️ Technology Stack & Architecture

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 + Google Fonts (`Fredoka` & `Plus Jakarta Sans`)
- **Engine**: Pure 60 FPS HTML5 Canvas engine with delta-time movement, sub-pixel physics, and retina high-DPI scaling
- **Sound**: Real-time synthesized cartoon sound effects & tropical background soundtrack via browser Web Audio API
- **Persistence**: Browser `localStorage` for high scores, total caught jellyfish, games played, and audio/control preferences

---

## 🚀 Development & Build Instructions

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📜 Credits & Disclaimer

- **Disclaimer**: *SpongeBob SquarePants* and all related titles, logos, and characters are trademarks of Viacom International Inc. / Nickelodeon. This project is an independent, non-commercial fan tribute created for educational and entertainment purposes.
- **Created by**: Built with Google AI Studio.
