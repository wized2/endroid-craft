# Endroid Craft

A browser voxel survival game built with [Three.js](https://threejs.org/). One HTML file, no build step, plays on desktop and phone.

## Gameplay
- **Survival**: punch trees, craft planks, a stone pickaxe and a stone sword, mine ore, build a shelter before night. Hearts, fall damage, drowning, regeneration, death and respawn.
- **Creative**: unlimited blocks, instant breaking, double-tap Space (or JUMP) to fly. No damage, no zombies.
- **Mobs**: zombies spawn at night and burn at dawn. Pigs wander in the day and heal you when killed.
- **Crafting** (`E` or the hammer button): planks, pickaxe, sword, bricks, glass (sand + coal), golden apple (3 gold, full heal).
- **Mining with progress**: crack overlay, block hardness, tools speed things up. Blocks drop into your inventory.

## World
- Infinite procedural terrain from a random seed: oceans, beaches, forests, mountains with snow caps.
- Caves and tunnels, coal and gold ore, flowers and tall grass.
- Pixel-art textures generated in code, ambient occlusion, darker caves, day/night cycle with sun, moon, stars and blocky clouds.
- Procedural sound effects (Web Audio) and mobile haptics.
- World, inventory and progress save automatically to `localStorage`.

## Controls
| Desktop | Mobile |
|---|---|
| WASD move, Space jump/swim, Shift sprint | Left stick move (push far to sprint) |
| Mouse look | Drag the right side to look |
| Hold left click mine / attack | Hold BREAK |
| Right click place | PLACE |
| 1-9, 0 or scroll select block | Tap a hotbar slot |
| E crafting, Esc pause | Hammer button, menu button |

## Install & fullscreen
- Installable as a PWA (manifest + service worker), opens fullscreen, works offline after the first load.
- Fullscreen toggle button on the HUD.

## Project structure
```
index.html        markup only
css/              base, hud, controls, menus, icons
js/boot.js        entry: loads Three.js, then the files below IN ORDER (edit FILES to add one)
js/icons.js       Lucide icons as inline SVG: ico('name', size) or <i data-icon="name">
js/config.js      constants, saved state, inventory
js/touch.js       touch/mouse button helper, fullscreen
js/audio.js  noise.js  textures.js  scene.js  world.js
js/hud.js  physics.js  player.js  mobs.js  interact.js  crafting.js
js/input.js  save.js  main.js (game loop)
```
Files are classic scripts sharing one scope, so a file can use anything defined above it in `FILES`.
To add a feature: create `js/yourfeature.js`, add it to `FILES` in `js/boot.js` and to `ASSETS` in `sw.js`.
To add an icon: copy its inner SVG elements from [lucide.dev](https://lucide.dev) into `ICONS` in `js/icons.js`.

## Run locally
```bash
npx serve .
```

## Deployment
Static site, deploys as-is on [Vercel](https://vercel.com/).
