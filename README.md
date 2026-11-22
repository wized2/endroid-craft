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

## Goals
- A guided objective list (10 goals: logs, planks, stone, pickaxe, sword, first night, zombies, gold, armor, Brute) shows under the info text in Survival. Progress is saved.

## Days, beds, numbers
- A day+night lasts 10 minutes. Craft a Bed (3 planks + 3 leaves) and place it. PLACE/right-click it to set your spawn; at night (no zombie within 8 blocks) it sleeps through to morning.
- Minecraft-style values: walk 4.3 / sprint 5.6 blocks/s, fall damage after 3 blocks, 15 s of air, regen about 1 HP per 4 s after 10 s without damage, zombie 20 HP / 3 damage, stone sword 5, gold sword 6.

## Combat
- Weapons: fists 2, Stone Sword 5, Gold Sword 6. Falling hits are critical (x1.5); sprint hits knock back further.
- Armor: Stone (-25% melee damage) and Gold (-45%), shown next to your hearts.
- Zombies wind up before swiping (arms rise): dodge, back off, or hit them to interrupt. Walls 2 high stop them.
- Brute zombies from day 3: bigger, 45 HP, hit for 5, better drops. More zombies as days pass.
- Health bar for the mob you're aiming at, and a warning at dusk.

## More
- Player character with walk/swing animation. Switch camera view (first person / behind / front) with `V`, `F5` or the person button.
- Rain showers with darker skies and soft rain sound.
- Settings (menu): render distance, look sensitivity, FOV, volume, info text. Saved automatically.
- Screenshot: F2 or the menu button.
- You always spawn on open ground, never inside a tree or water.

## Script Console & seeds
- Open with the `</>` button or the `` ` `` key. Run JS build scripts (`player()`, `setBlock`, `getB`, `fill`, `tp`, `await delay`, `log`).
- 16 templates (house, castle, maze, dome...), plus your own saved presets. Ctrl+Enter runs.
- `site(r)` finds a flat, dry, tree-free spot ahead of you, clears trees/plants and levels the ground, so builds never end up in or on trees.
- Undo the last script, and a Normal/Fast/Instant speed switch.
- Seeds follow Minecraft Java rules: blank = random 64-bit, a number up to 64-bit is used as is, anything else becomes Java's `String.hashCode()`, then feeds `java.util.Random`. Type one in the menu before New world; tap the seed button to copy it. The terrain is Endroid Craft's own generator, so a seed does not give the same land as Minecraft.

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
js/sleep.js  seed.js  objectives.js  templates.js  scripting.js  weather.js  settings.js  audio.js  noise.js  textures.js  scene.js  world.js
js/hud.js  physics.js  player.js  mobs.js  playermodel.js  interact.js  crafting.js
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
