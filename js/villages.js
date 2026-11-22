// villages.js - plains villages (per-chunk), villagers, emerald trades
const villagesDone=new Set();

function villageChance(cx,cz){
 return hsh(cx*17+3,cz*13+9,7)<.05;
}
function surfaceY(x,z){
 for(let y=H-2;y>0;y--){const b=getBlock(x,y,z);if(b>0&&b!==9&&!isPlant(b)&&b!==-1)return y}
 return SEA;
}
function putV(x,y,z,b){
 if(y<=0||y>=H-1)return;
 if(getBlock(x,y,z)===-1)return;
 setBlock(x,y,z,b,true);
}
function buildHouseInChunk(cx,cz,lx,lz){
 // lx,lz local 0-11 so house fits in chunk
 const x0=cx*CS+lx,z0=cz*CS+lz;
 const y0=Math.min(H-6,Math.max(SEA+1,surfaceY(x0+1,z0+1)));
 for(let dx=0;dx<=3;dx++)for(let dz=0;dz<=3;dz++){
  const x=x0+dx,z=z0+dz;
  for(let yy=y0-2;yy<=y0;yy++)if(yy>0)putV(x,yy,z,yy===y0?7:2);
  for(let yy=y0+1;yy<=y0+4;yy++)putV(x,yy,z,0);
 }
 for(let dx=0;dx<=3;dx++)for(let dz=0;dz<=3;dz++){
  if(dx===0||dx===3||dz===0||dz===3){
   for(let h=1;h<=2;h++)putV(x0+dx,y0+h,z0+dz,(dx%3===0&&dz%3===0)?4:7);
  }
 }
 putV(x0+1,y0+1,z0,0);putV(x0+1,y0+2,z0,0);
 putV(x0+2,y0+1,z0,0);putV(x0+2,y0+2,z0,0);
 for(let dx=0;dx<=3;dx++)for(let dz=0;dz<=3;dz++)putV(x0+dx,y0+3,z0+dz,4);
 putV(x0+2,y0+1,z0+2,17);
 putV(x0+3,y0+2,z0+1,10);
 return [x0+1.5,y0+1,z0+1.5];
}
function buildFarmInChunk(cx,cz,lx,lz){
 const x0=cx*CS+lx,z0=cz*CS+lz;
 const y0=Math.min(H-4,Math.max(SEA+1,surfaceY(x0+2,z0+1)));
 for(let dx=0;dx<=4;dx++)for(let dz=0;dz<=3;dz++){
  if(lx+dx>15||lz+dz>15)continue;
  const x=x0+dx,z=z0+dz;
  for(let yy=y0-1;yy<=y0;yy++)if(yy>0)putV(x,yy,z,2);
  if(dz===1&&dx>=1&&dx<=3){putV(x,y0,z,9);putV(x,y0+1,z,0)}
  else{putV(x,y0,z,29);putV(x,y0+1,z,Math.random()<.75?(30+((Math.random()*3)|0)):0)}
 }
}
function tryGenVillage(cx,cz){
 const key=ck(cx,cz);if(villagesDone.has(key))return;villagesDone.add(key);
 if(!villageChance(cx,cz))return;
 const ox=cx*CS+2,oz=cz*CS+2;
 const h=heightAt(ox+4,oz+4);
 if(h<=SEA+2||h>=36)return;
 const spots=[];
 spots.push(buildHouseInChunk(cx,cz,2,8));
 if(CS>=16)spots.push(buildHouseInChunk(cx,cz,9,9));
 buildFarmInChunk(cx,cz,3,2);
 // path strip
 for(let i=2;i<=12;i++){const x=cx*CS+i,z=cz*CS+7;const y=surfaceY(x,z);putV(x,y,z,38)}
 flushChunks();
 setTimeout(()=>{
  for(const s of spots){
   if(!s)continue;
   const m=spawnMob('v',s[0],s[1],s[2]);
   if(m){m.home=s;m.prof=['farmer','shepherd','mason'][(Math.random()*3)|0]}
  }
  toast('You found a village!',2200);
 },80);
}

let tradeOpen=false,tradeMob=null;
const TRADES={
 farmer:[
  {give:34,giveN:3,take:37,takeN:1,name:'3 Bread → Emerald'},
  {give:33,giveN:16,take:37,takeN:1,name:'16 Seeds → Emerald'},
  {give:37,giveN:1,take:34,takeN:5,name:'Emerald → 5 Bread'},
  {give:37,giveN:1,take:33,takeN:8,name:'Emerald → 8 Seeds'}
 ],
 shepherd:[
  {give:26,giveN:8,take:37,takeN:1,name:'8 Wool → Emerald'},
  {give:37,giveN:1,take:26,takeN:4,name:'Emerald → 4 Wool'}
 ],
 mason:[
  {give:3,giveN:20,take:37,takeN:1,name:'20 Stone → Emerald'},
  {give:37,giveN:1,take:8,takeN:6,name:'Emerald → 6 Bricks'}
 ]
};
function openTrade(m){
 tradeMob=m;tradeOpen=true;
 const el=$('#trade');if(!el)return;
 const list=$('#tradeList');list.innerHTML='';
 const prof=m.prof||'farmer';
 $('#tradeTitle').textContent='Villager — '+prof;
 for(const t of (TRADES[prof]||TRADES.farmer)){
  const row=document.createElement('button');row.className='mc small';row.style.display='block';row.style.width='100%';row.style.margin='6px 0';
  row.textContent=t.name;
  makeTouchBtn(row,()=>{
   if(surv()){
    if((inv[t.give]|0)<t.giveN){toast('Not enough items',1200);return}
    inv[t.give]-=t.giveN;inv[t.take]=(inv[t.take]|0)+t.takeN;
   }else inv[t.take]=(inv[t.take]|0)+t.takeN;
   renderSlots();renderInfo();toast('Trade done!',900);vib(12);
  });
  list.appendChild(row);
 }
 el.style.display='flex';
 if(running)setRunning(false,false);
}
function closeTrade(){
 tradeOpen=false;tradeMob=null;
 const el=$('#trade');if(el)el.style.display='none';
}
function tryTradeNearest(){
 let best=null,bd=3.5;
 for(const m of mobs){
  if(m.type!=='v')continue;
  const d=Math.hypot(m.x-P.x,m.y-P.y,m.z-P.z);
  if(d<bd){bd=d;best=m}
 }
 if(best){openTrade(best);return true}
 return false;
}
