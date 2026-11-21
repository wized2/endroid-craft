# Endroid Craft

A lightweight, browser-based 3D voxel sandbox game built with [Three.js](https://threejs.org/).

## Features
- **3D Voxel World**: Procedural chunks and blocks (Grass, Dirt, Stone, Wood, Leaves, Bricks, Sand, Glass, etc.).
- **Dynamic Lighting & Day/Night Cycle**: Sun, sky shaders, and ambient lighting.
- **Cross-Platform Controls**:
  - **Desktop**: WASD to move, Space to jump, Left Click to break, Right Click to place, Number keys (1-9) for inventory.
  - **Mobile / Touch**: On-screen virtual joystick, jump, break, and place buttons with touch-to-look camera controls.
- **Save System**: Automatically persists world modifications and player state to localStorage.

## Running Locally
Just open `index.html` in any modern web browser or serve it with any local static HTTP server:
```bash
npx serve .
```

## Deployment
Deployable directly to [Vercel](https://vercel.com/) as a static web application.
