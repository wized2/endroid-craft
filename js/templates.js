// templates.js - example build scripts for the Script Console.
// They build on a clear, flat spot found by site(radius): in front of you, never on/inside trees or in water.
// site() also clears trees/plants in the footprint and levels the ground. Returns {x,y,z}: x,z = centre, y = standing level (floor = y-1).
// Block ids: 1 Grass 2 Dirt 3 Stone 4 Log 5 Leaves 6 Sand 7 Planks 8 Brick 9 Water 10 Glass 11 Snow 12 Coal 13 Gold, 0 = air.
// Add one: add an entry here AND a <button data-tpl="name"> in index.html (#scr-examples).
const TEMPLATES={
  house: `// 🏠 Wooden House — 7x7, built on a clear spot ahead of you
const p = site(5);
const W = 7, D = 7, WALL = 8/*Brick*/, FLOOR = 7/*Planks*/, ROOF = 4/*Log*/;
const x0 = p.x - 3, y0 = p.y, z0 = p.z - 3;
for(let dx=0;dx<W;dx++) for(let dz=0;dz<D;dz++) setBlock(x0+dx, y0-1, z0+dz, FLOOR);
await delay(80);
for(let h=0;h<4;h++) for(let dx=0;dx<W;dx++) for(let dz=0;dz<D;dz++) {
  if(dx===0||dx===W-1||dz===0||dz===D-1) { setBlock(x0+dx, y0+h, z0+dz, WALL); await delay(12); }
}
for(let dx=0;dx<W;dx++) for(let dz=0;dz<D;dz++) setBlock(x0+dx, y0+4, z0+dz, ROOF);
await delay(60);
fill(x0+3, y0, z0, x0+3, y0+1, z0, 0);          // door (north side)
setBlock(x0, y0+1, z0+3, 10); setBlock(x0+W-1, y0+1, z0+3, 10); // side windows
log('🏠 House built at '+p.x+', '+p.y+', '+p.z);`,

  pyramid: `// 🔺 Stone Pyramid
const p = site(6);
const BASE = 11, BLOCK = 3/*Stone*/;
for(let layer=0; layer<Math.ceil(BASE/2); layer++) {
  const half = Math.floor(BASE/2) - layer;
  fill(p.x-half, p.y-1+layer, p.z-half, p.x+half, p.y-1+layer, p.z+half, BLOCK);
  await delay(60);
}
log('🔺 Pyramid done!');`,

  sphere: `// ⬤ Sphere of Leaves — radius 6, floating above a clear spot
const p = site(7);
const R = 6, BLOCK = 5/*Leaves*/;
for(let dy=-R; dy<=R; dy++) {
  for(let dx=-R; dx<=R; dx++) for(let dz=-R; dz<=R; dz++)
    if(dx*dx+dy*dy+dz*dz <= R*R) setBlock(p.x+dx, p.y+dy+R+2, p.z+dz, BLOCK);
  await delay(25);
}
log('⬤ Sphere complete!');`,

  tower: `// 🗼 Stone Tower — 20 blocks tall
const p = site(4);
const H = 20, R = 3, BLOCK = 3/*Stone*/, TOP = 8/*Brick*/;
for(let y=0; y<H; y++) {
  for(let dx=-R; dx<=R; dx++) for(let dz=-R; dz<=R; dz++) {
    if(Math.abs(dx)===R || Math.abs(dz)===R) setBlock(p.x+dx, p.y+y, p.z+dz, y>=H-2?TOP:BLOCK);
  }
  await delay(40);
}
for(let dx=-R; dx<=R; dx+=2) {
  setBlock(p.x+dx, p.y+H, p.z-R, TOP); setBlock(p.x+dx, p.y+H, p.z+R, TOP);
  setBlock(p.x-R, p.y+H, p.z+dx, TOP); setBlock(p.x+R, p.y+H, p.z+dx, TOP);
}
fill(p.x, p.y, p.z-R, p.x, p.y+1, p.z-R, 0);   // door
log('🗼 Tower done!');`,

  castle: `// 🏰 Castle — 4 corner towers + curtain walls
const p = site(11);
const S = 19, WALL = 3/*Stone*/, TOP = 8/*Brick*/;
const x0 = p.x - 9, y0 = p.y, z0 = p.z - 9;
for(let h=0; h<6; h++) {
  for(let i=0;i<S;i++) for(const [x,z] of [[i,0],[i,S-1],[0,i],[S-1,i]]) setBlock(x0+x, y0+h, z0+z, WALL);
  await delay(30);
}
for(const [cx,cz] of [[0,0],[S-1,0],[0,S-1],[S-1,S-1]]) {
  for(let h=0; h<10; h++) for(let dx=-1;dx<=1;dx++) for(let dz=-1;dz<=1;dz++)
    if(dx||dz||h===9) setBlock(x0+cx+dx, y0+h, z0+cz+dz, h>=8?TOP:WALL);
  await delay(60);
}
for(let i=0;i<S;i+=2) { setBlock(x0+i,y0+6,z0,TOP); setBlock(x0+i,y0+6,z0+S-1,TOP); setBlock(x0,y0+6,z0+i,TOP); setBlock(x0+S-1,y0+6,z0+i,TOP); }
fill(x0+8, y0, z0, x0+10, y0+2, z0, 0);          // gate
log('🏰 Castle built! Gate faces north (-Z).');`,

  fill: `// 📦 Box — 5x3x5 grass block, edit the numbers
const p = site(3);
const BLOCK = 1/*Grass*/, W = 5, H = 3, D = 5;
fill(p.x-2, p.y, p.z-2, p.x-3+W, p.y+H-1, p.z-3+D, BLOCK);
log('📦 Box filled!');`,

  flatten: `// 🟫 Flatten a 31x31 area around you to your feet level (clears trees too)
const p = player();
const SIZE = 15, Y = p.y - 1;
for(let dx=-SIZE;dx<=SIZE;dx++) {
  for(let dz=-SIZE;dz<=SIZE;dz++) {
    for(let dy=-3;dy<0;dy++) if(getB(p.x+dx,Y+dy,p.z+dz)===0) setBlock(p.x+dx, Y+dy, p.z+dz, 2);
    setBlock(p.x+dx, Y, p.z+dz, 1);
    fill(p.x+dx, Y+1, p.z+dz, p.x+dx, Y+14, p.z+dz, 0);
  }
  await delay(10);
}
log('🟫 Flattened!');`,

  checkers: `// ♟ Checkerboard floor — 2 block types
const p = site(4);
const SIZE = 8;
for(let dx=0;dx<SIZE;dx++) { for(let dz=0;dz<SIZE;dz++) {
  setBlock(p.x-4+dx, p.y-1, p.z-4+dz, (dx+dz)%2===0 ? 7/*Planks*/ : 8/*Brick*/);
} await delay(30); }
log('♟ Checkerboard done!');`,

  bridge: `// 🌉 Bridge — 16 long, 3 wide, from your feet toward the direction you face
const p = player(), f = facing();
const DECK = 7/*Planks*/, RAIL = 4/*Log*/;
for(let i = 1; i <= 16; i++) {
  const cx = p.x + f.x*i, cz = p.z + f.z*i;
  for(let w = -1; w <= 1; w++) setBlock(cx + f.z*w, p.y-1, cz - f.x*w, DECK);
  for(const s of [-2, 2]) {
    setBlock(cx + f.z*s, p.y, cz - f.x*s, RAIL);
    if(i % 4 === 0) setBlock(cx + f.z*s, p.y+1, cz - f.x*s, RAIL);
  }
  await delay(40);
}
log('🌉 Bridge built!');`,

  spiral: `// 🌀 Spiral Staircase — 2 turns, 24 steps rising
const p = site(5);
const STEP = 8/*Brick*/, R = 4;
for(let s = 0; s < 24; s++) {
  const a = (s / 12) * Math.PI;
  const x = Math.round(p.x + Math.cos(a) * R), z = Math.round(p.z + Math.sin(a) * R), y = p.y + s;
  setBlock(x, y, z, STEP); setBlock(x, y-1, z, STEP);
  await delay(55);
}
log('🌀 Spiral staircase complete!');`,

  dome: `// 🌐 Hollow Dome — radius 7, open bottom, glass shell
const p = site(8);
const R = 7, SHELL = 10/*Glass*/;
for(let dy = 0; dy <= R; dy++) {
  for(let dx = -R; dx <= R; dx++) for(let dz = -R; dz <= R; dz++) {
    const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    if(d >= R-0.5 && d <= R+0.5) setBlock(p.x+dx, p.y+dy, p.z+dz, SHELL);
  }
  await delay(40);
}
fill(p.x, p.y, p.z-R, p.x, p.y+1, p.z-R, 0);
log('🌐 Dome done! (door faces north)');`,

  maze: `// 🗺 Maze — 21x21, recursive backtracker
const p = site(11);
const SZ = 21, WALL = 3/*Stone*/, FLOOR = 7/*Planks*/;
const ox = p.x - 10, oy = p.y - 1, oz = p.z - 10;
const g = Array.from({length:SZ}, ()=>Array(SZ).fill(1));
function carve(x, z) {
  g[x][z] = 0;
  for(const [dx,dz] of [[0,2],[0,-2],[2,0],[-2,0]].sort(()=>Math.random()-.5)) {
    const nx=x+dx, nz=z+dz;
    if(nx>=0&&nx<SZ&&nz>=0&&nz<SZ&&g[nx][nz]===1) { g[x+dx/2][z+dz/2] = 0; carve(nx, nz); }
  }
}
carve(0, 0);
for(let x = 0; x < SZ; x++) {
  for(let z = 0; z < SZ; z++) {
    setBlock(ox+x, oy, oz+z, g[x][z] ? WALL : FLOOR);
    if(g[x][z]) fill(ox+x, oy+1, oz+z, ox+x, oy+2, oz+z, WALL);
  }
  await delay(25);
}
fill(ox, oy+1, oz, ox, oy+2, oz, 0); fill(ox+SZ-1, oy+1, oz+SZ-1, ox+SZ-1, oy+2, oz+SZ-1, 0);
log('🗺 Maze ready: enter top-left, exit bottom-right.');`,

  wall: `// 🧱 Brick wall — 20 wide, 5 tall, across the spot ahead of you
const p = site(10);
for(let h = 0; h < 5; h++) {
  for(let i = -10; i < 10; i++) setBlock(p.x+i, p.y+h, p.z, 8/*Brick*/);
  await delay(80);
}
log('🧱 Wall built! (20x5)');`,

  trees: `// 🌳 Plant a forest — 25 random trees around you
const p = player();
for(let n=0;n<25;n++) {
  const x = p.x + Math.floor(Math.random()*41)-20, z = p.z + Math.floor(Math.random()*41)-20;
  let y = p.y + 12;
  while(y>0 && getB(x,y,z)===0) y--;
  if(getB(x,y,z)!==1 && getB(x,y,z)!==2) continue;
  const th = 4 + Math.floor(Math.random()*2);
  for(let i=1;i<=th;i++) setBlock(x,y+i,z,4);
  for(let dx=-2;dx<=2;dx++) for(let dz=-2;dz<=2;dz++) for(let dy=th-1;dy<=th+1;dy++)
    if(Math.abs(dx)+Math.abs(dz)+Math.max(0,dy-th)<=3 && getB(x+dx,y+dy,z+dz)===0) setBlock(x+dx,y+dy,z+dz,5);
  await delay(40);
}
log('🌳 Forest planted!');`,

  pool: `// 🏊 Swimming pool — 9x9, 3 deep, glass rim
const p = site(5);
const W = 9, D = 3, x0 = p.x - 4, z0 = p.z - 4;
for(let dx=0;dx<W;dx++) { for(let dz=0;dz<W;dz++) {
  fill(x0+dx, p.y-D, z0+dz, x0+dx, p.y-1, z0+dz, 9/*Water*/);
  setBlock(x0+dx, p.y-D-1, z0+dz, 3/*Stone*/);
  if(dx===0||dz===0||dx===W-1||dz===W-1) setBlock(x0+dx, p.y, z0+dz, 10/*Glass*/);
} await delay(30); }
log('🏊 Pool ready!');`,

  clear: ``
};
