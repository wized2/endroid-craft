// templates.js - example build scripts for the Script Console (adapted from wized2's scripting set).
// Block ids: 1 Grass 2 Dirt 3 Stone 4 Log 5 Leaves 6 Sand 7 Planks 8 Brick 9 Water 10 Glass 11 Snow 12 Coal 13 Gold, 0 = air.
// Add one: add an entry here AND a <button data-tpl="name"> in index.html (#scr-examples).
const TEMPLATES={
  house: `// 🏠 Wooden House — built at your feet
const p = player();
const x0 = p.x, y0 = p.y, z0 = p.z;
const W = 7, D = 7, WALL = 8/*Brick*/, FLOOR = 7/*Planks*/, ROOF = 4/*Log*/;
// Floor
for(let dx=0;dx<W;dx++) for(let dz=0;dz<D;dz++) {
  setBlock(x0+dx, y0-1, z0+dz, FLOOR);
}
await delay(80);
// Walls (4 sides, 4 tall)
for(let h=0;h<4;h++) for(let dx=0;dx<W;dx++) for(let dz=0;dz<D;dz++) {
  if(dx===0||dx===W-1||dz===0||dz===D-1)
    setBlock(x0+dx, y0+h, z0+dz, WALL);
  await delay(12);
}
// Roof ridge
for(let dx=0;dx<W;dx++) setBlock(x0+dx, y0+4, z0+Math.floor(D/2), ROOF), await delay(30);
// Door gap
setBlock(x0+Math.floor(W/2), y0,   z0, 0);
setBlock(x0+Math.floor(W/2), y0+1, z0, 0);
log('🏠 House built!');`,

  pyramid: `// 🔺 Stone Pyramid — built at your feet
const p = player();
const BASE = 11, BLOCK = 3/*Stone*/;
for(let layer=0; layer<Math.ceil(BASE/2); layer++) {
  const h = p.y - 1 + layer;
  const half = Math.floor(BASE/2) - layer;
  for(let dx=-half; dx<=half; dx++) for(let dz=-half; dz<=half; dz++) {
    setBlock(p.x+dx, h, p.z+dz, BLOCK);
    await delay(8);
  }
}
log('🔺 Pyramid done!');`,

  sphere: `// ⬤ Sphere of Leaves — radius 6, centred above you
const p = player();
const R = 6, BLOCK = 5/*Leaves*/;
for(let dx=-R; dx<=R; dx++) for(let dy=-R; dy<=R; dy++) for(let dz=-R; dz<=R; dz++) {
  if(dx*dx+dy*dy+dz*dz <= R*R)
    setBlock(p.x+dx, p.y+dy+R+2, p.z+dz, BLOCK);
  await delay(2);
}
log('⬤ Sphere complete!');`,

  tower: `// 🗼 Stone Tower — 20 blocks tall
const p = player();
const H = 20, R = 3, BLOCK = 3/*Stone*/, TOP = 8/*Brick*/;
for(let y=0; y<H; y++) {
  for(let dx=-R; dx<=R; dx++) for(let dz=-R; dz<=R; dz++) {
    const wall = Math.abs(dx)===R || Math.abs(dz)===R;
    if(wall) setBlock(p.x+dx, p.y+y, p.z+dz, y>=H-2?TOP:BLOCK);
  }
  await delay(40);
}
// Battlements
for(let dx=-R; dx<=R; dx+=2) {
  setBlock(p.x+dx,   p.y+H, p.z-R, TOP); setBlock(p.x+dx,   p.y+H, p.z+R, TOP);
  setBlock(p.x-R, p.y+H, p.z+dx, TOP);   setBlock(p.x+R, p.y+H, p.z+dx, TOP);
}
// Hollow centre — door gap
setBlock(p.x, p.y, p.z-R, 0); setBlock(p.x, p.y+1, p.z-R, 0);
log('🗼 Tower done!');`,

  fill: `// 📦 Fill a box — edit coords below
const p = player();
const BLOCK = 1/*Grass*/;
// Fills a 5×3×5 box starting at player feet
const x0=p.x, y0=p.y, z0=p.z, W=5, H=3, D=5;
for(let dy=0;dy<H;dy++) for(let dx=0;dx<W;dx++) for(let dz=0;dz<D;dz++) {
  setBlock(x0+dx, y0+dy, z0+dz, BLOCK);
  await delay(15);
}
log('📦 Box filled!');`,

  flatten: `// 🟫 Flatten 15×15 area around you to y=your feet
const p = player();
const SIZE = 15, Y = p.y - 1, BLOCK = 2/*Dirt*/;
for(let dx=-SIZE;dx<=SIZE;dx++) for(let dz=-SIZE;dz<=SIZE;dz++) {
  // Fill down to y, clear above
  setBlock(p.x+dx, Y, p.z+dz, BLOCK);
  for(let dy=1;dy<=4;dy++) setBlock(p.x+dx, Y+dy, p.z+dz, 0);
  await delay(5);
}
log('🟫 Flattened!');`,

  checkers: `// ♟ Checkerboard floor — 2 block types
const p = player();
const SIZE = 8;
for(let dx=0;dx<SIZE;dx++) for(let dz=0;dz<SIZE;dz++) {
  const id = (dx+dz)%2===0 ? 7/*Planks*/ : 8/*Brick*/;
  setBlock(p.x+dx, p.y-1, p.z+dz, id);
  await delay(20);
}
log('♟ Checkerboard done!');`,

  clear: ``,

  castle: `// 🏰 Castle — 4 corner towers + curtain walls
const p = player();
const S = 19, WALL = 3/*Stone*/, TOP = 8/*Brick*/;
const x0 = p.x, y0 = p.y, z0 = p.z;
for(let h=0; h<6; h++) {
  for(let i=0;i<S;i++) {
    for(const [x,z] of [[i,0],[i,S-1],[0,i],[S-1,i]]) setBlock(x0+x, y0+h, z0+z, WALL);
  }
  await delay(30);
}
for(const [cx,cz] of [[0,0],[S-1,0],[0,S-1],[S-1,S-1]]) {
  for(let h=0; h<10; h++) for(let dx=-1;dx<=1;dx++) for(let dz=-1;dz<=1;dz++) {
    if(dx||dz||h===9) setBlock(x0+cx+dx, y0+h, z0+cz+dz, h>=8?TOP:WALL);
  }
  await delay(60);
}
for(let i=0;i<S;i+=2) { setBlock(x0+i,y0+6,z0,TOP); setBlock(x0+i,y0+6,z0+S-1,TOP); setBlock(x0,y0+6,z0+i,TOP); setBlock(x0+S-1,y0+6,z0+i,TOP); }
setBlock(x0+9,y0,z0,0); setBlock(x0+9,y0+1,z0,0); setBlock(x0+9,y0+2,z0,0);
log('🏰 Castle built! Gate faces -Z.');`,

  trees: `// 🌳 Plant a forest — 25 random trees around you
const p = player();
for(let n=0;n<25;n++) {
  const x = p.x + Math.floor(Math.random()*41)-20;
  const z = p.z + Math.floor(Math.random()*41)-20;
  let y = p.y + 12;
  while(y>0 && getB(x,y,z)===0) y--;
  if(getB(x,y,z)!==1 && getB(x,y,z)!==2) continue;
  const th = 4 + Math.floor(Math.random()*2);
  for(let i=1;i<=th;i++) setBlock(x,y+i,z,4);
  for(let dx=-2;dx<=2;dx++) for(let dz=-2;dz<=2;dz++) for(let dy=th-1;dy<=th+1;dy++) {
    if(Math.abs(dx)+Math.abs(dz)+Math.max(0,dy-th)<=3 && getB(x+dx,y+dy,z+dz)===0) setBlock(x+dx,y+dy,z+dz,5);
  }
  await delay(40);
}
log('🌳 Forest planted!');`,

  pool: `// 🏊 Swimming pool — 9×9, 3 deep, glass rim
const p = player();
const W = 9, D = 3;
for(let dx=0;dx<W;dx++) for(let dz=0;dz<W;dz++) {
  for(let dy=1;dy<=D;dy++) setBlock(p.x+dx, p.y-dy, p.z+dz, 9/*Water*/);
  setBlock(p.x+dx, p.y-D-1, p.z+dz, 3/*Stone*/);
  if(dx===0||dz===0||dx===W-1||dz===W-1) setBlock(p.x+dx, p.y, p.z+dz, 10/*Glass*/);
  await delay(8);
}
log('🏊 Pool ready!');`,

  bridge: `// 🌉 Bridge — 16 blocks long, 3 wide, facing +Z from player
const p = player();
const DECK = 7/*Planks*/, RAIL = 4/*Log*/;
for(let i = 0; i < 16; i++) {
  for(let w = -1; w <= 1; w++) setBlock(p.x+w, p.y-1, p.z+i, DECK);
  // Side rails
  setBlock(p.x-2, p.y,   p.z+i, RAIL);
  setBlock(p.x+2, p.y,   p.z+i, RAIL);
  // Posts every 4 blocks
  if(i % 4 === 0) {
    setBlock(p.x-2, p.y+1, p.z+i, RAIL);
    setBlock(p.x+2, p.y+1, p.z+i, RAIL);
  }
  await delay(40);
}
log('🌉 Bridge built! (16 blocks long, +Z direction)');`,

  spiral: `// 🌀 Spiral Staircase — 2 full turns, 24 steps rising
const p = player();
const STEP = 8/*Brick*/, R = 4;
for(let s = 0; s < 24; s++) {
  const angle = (s / 12) * Math.PI; // 2 full rotations over 24 steps
  const x = Math.round(p.x + Math.cos(angle) * R);
  const z = Math.round(p.z + Math.sin(angle) * R);
  const y = p.y + s;
  setBlock(x, y,   z, STEP); // step surface
  setBlock(x, y-1, z, STEP); // step support
  await delay(55);
}
log('🌀 Spiral staircase complete! (24 steps, 2 turns)');`,

  dome: `// 🌐 Hollow Dome — radius 7, open bottom
const p = player();
const R = 7, SHELL = 5/*Leaves*/;
for(let dx = -R; dx <= R; dx++)
for(let dy =  0; dy <= R; dy++)
for(let dz = -R; dz <= R; dz++) {
  const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
  if(d >= R-0.5 && d <= R+0.5)
    setBlock(p.x+dx, p.y+dy, p.z+dz, SHELL);
  await delay(1);
}
// Door gap
setBlock(p.x, p.y, p.z-R, 0);
setBlock(p.x, p.y+1, p.z-R, 0);
log('🌐 Dome done! (R=7, door faces -Z)');`,

  maze: `// 🗺 Procedural Maze — 21×21, recursive backtracker
const p = player();
const SZ = 21; // must be odd
const WALL = 3/*Stone*/, FLOOR = 7/*Planks*/;
const ox = p.x, oy = p.y - 1, oz = p.z;
// Init: all walls
const g = Array.from({length:SZ}, ()=>Array(SZ).fill(1));
// Carve passages
function carve(x, z) {
  g[x][z] = 0;
  const dirs = [[0,2],[0,-2],[2,0],[-2,0]].sort(()=>Math.random()-.5);
  for(const [dx,dz] of dirs) {
    const nx=x+dx, nz=z+dz;
    if(nx>=0&&nx<SZ&&nz>=0&&nz<SZ&&g[nx][nz]===1) {
      g[x+dx/2][z+dz/2] = 0;
      carve(nx, nz);
    }
  }
}
carve(0, 0);
// Place blocks
for(let x = 0; x < SZ; x++) for(let z = 0; z < SZ; z++) {
  setBlock(ox+x, oy, oz+z, g[x][z] ? WALL : FLOOR);
  await delay(4);
}
// Entrance + Exit
setBlock(ox,       oy+1, oz,       0); setBlock(ox,       oy+2, oz,       0);
setBlock(ox+SZ-1, oy+1, oz+SZ-1, 0); setBlock(ox+SZ-1, oy+2, oz+SZ-1, 0);
log('🗺 Maze generated! Enter top-left, exit bottom-right.');`,

  wall: `// 🧱 Stone Wall — 20 wide, 5 tall, facing +X from player
const p = player();
const BLOCK = 8/*Brick*/;
for(let h = 0; h < 5; h++) {
  for(let i = 0; i < 20; i++) {
    setBlock(p.x+i, p.y+h, p.z, BLOCK);
    await delay(18);
  }
}
log('🧱 Wall built! (20×5 brick)');`
};
