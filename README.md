# Endroid Craft

A lightweight, browser-based 3D voxel sandbox game built with [Three.js](https://threejs.org/).

## Features
- **3D Voxel World**: Procedural chunks and blocks (Grass, Dirt, Stone, Wood, Leaves, Sand, Planks, Brick, Water).
- **Smooth Step Climbing (Auto-Step)**: Effortlessly walk up single-block height elevations without constant jumping.
- **Dynamic Celestial Sky**:
  - Orbiting Sun and Moon synchronized with the day/night cycle.
  - Nighttime starfield that fades in smoothly at dusk.
  - Drifting low-poly cloud layer.
- **Underwater Immersion**: Deep blue underwater fog and lighting when the camera is submerged.
- **Interactive First-Person Hand**:
  - Displays the active held block in 3D.
  - Walking bobbing motion and satisfying swinging/punching animations when breaking or placing blocks.
- **Block Break Particles**: Colorful voxel debris explodes outward and falls with physics when blocks are mined.
- **Procedural Sound Effects (Web Audio API)**:
  - Synthesized footsteps, jumping, block breaking, block placing, and water splashes (zero external sound files needed).
  - Sound toggle button (`🔊` / `🔇`) in the HUD.
- **Cross-Platform Controls & Haptics**:
  - **Desktop**: WASD to move, Space to jump/swim, Shift to sprint, Mouse look, Left click to break, Right click to place, Number keys (1-8) or mouse scroll for hotbar selection.
  - **Mobile / Touch**: Virtual joystick, dedicated Jump, Break, Place buttons, touch-to-look camera controls, and subtle tactile haptic vibration feedback.
- **Progressive Web App (PWA) & Fullscreen**:
  - Installable to Home Screen on mobile and desktop as a standalone app.
  - Automatically opens in immersive fullscreen mode (no browser address bars or navigation chrome).
  - Offline gameplay via Service Worker asset caching.
  - Dedicated fullscreen toggle button (`⛶`) on the HUD.
- **Persistent Save System**: Automatically persists world modifications and player coordinates to browser `localStorage`.

## Running Locally
Just open `index.html` in any modern web browser or serve it with any local static HTTP server:
```bash
npx serve .
```

## Deployment
Deployable directly to [Vercel](https://vercel.com/) as a static web application.
