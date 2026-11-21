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

## Run locally
```bash
npx serve .
```

## Deployment
Static site, deploys as-is on [Vercel](https://vercel.com/).
