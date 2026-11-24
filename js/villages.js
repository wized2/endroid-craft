// villages.js - Minecraft-style villages: region-placed clusters (well, paths, houses, farms), villagers
const villagesDone=new Set(),spawnedPlots=new Set(),announced=new Set();
const VR=6; // region size in chunks
const vCache=new Map();
function villageAt(rx,rz){
 const k=rx+','+rz;if(vCache.has(k))return vCache.get(k);
 let v=null;
 if(hsh(rx*7+1,rz*11+5,23)<.5&&!(rx===0&&rz===0)){
  const vx=rx*VR+1+Math.floor(hsh(rx,rz,21)*4),vz=rz*VR+1+Math.floor(hsh(rx,rz,22)*4);
  const x=vx*CS+8,z=vz*CS+8,h=heightAt(x,z);
  if(h>SEA+2&&h<34)v={cx:vx,cz:vz,x,z,y:h};
 }
 vCache.set(k,v);return v;
}
function villageOfChunk(cx,cz){
 const rx=Math.floor(cx/VR),rz=Math.floor(cz/VR);
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){
  const v=villageAt(rx+a,rz+b);
  if(v&&Math.abs(cx-v.cx)<=1&&Math.abs(cz-v.cz)<=1)return v;
 }
 return null;
}
function nearestVillage(x,z,maxD){
 const rx=Math.floor(x/CS/VR),rz=Math.floor(z/CS/VR);let best=null,bd=maxD;
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){
  const v=villageAt(rx+a,rz+b);if(!v)continue;
  const d=Math.hypot(v.x-x,v.z-z);if(d<bd){bd=d;best=v}
 }
 return best;
}
function vSurfaceY(x,z){
 for(let y=H-2;y>0;y--){const b=getBlock(x,y,z);if(b>0&&b!==9&&b!==4&&b!==5&&!isPlant(b)&&b!==-1)return y}
 return SEA;
}
function putV(x,y,z,b){
 if(y<=0||y>=H-1)return;
 if(getBlock(x,y,z)===-1)return;
 setBlock(x,y,z,b,true);
}
// frame helper: a along village axis, b across; swap for z-axis chunks
function mkFrame(cx,cz,swap){
 return (a,b)=>swap?[cx*CS+b,cz*CS+a]:[cx*CS+a,cz*CS+b];
}
function buildHouse(F,a0,b0,y0,kind,prof){
 // 5x5 house, door on low-b side
 const P=(a,b,y,id)=>{const[x,z]=F(a,b);putV(x,y,z,id)};
 for(let da=0;da<5;da++)for(let db=0;db<5;db++){
  const a=a0+da,b=b0+db;
  for(let yy=y0-1;yy>y0-7;yy--){const [x,z]=F(a,b);if(getBlock(x,yy,z)>0&&getBlock(x,yy,z)!==9)break;P(a,b,yy,3)}
  P(a,b,y0,7);
  for(let yy=y0+1;yy<=y0+7;yy++)P(a,b,yy,0);
 }
 for(let da=0;da<5;da++)for(let db=0;db<5;db++){
  if(da&&da<4&&db&&db<4)continue;
  const corner=(da%4===0&&db%4===0);
  for(let h=1;h<=3;h++)P(a0+da,b0+db,y0+h,corner?4:7);
 }
 // door (2 tall) and windows
 P(a0+2,b0,y0+1,0);P(a0+2,b0,y0+2,0);
 P(a0+2,b0,y0,38);
 P(a0,b0+2,y0+2,10);P(a0+4,b0+2,y0+2,10);P(a0+2,b0+4,y0+2,10);
 // roof
 for(let da=-1;da<=5;da++)for(let db=-1;db<=5;db++)if(da>=0&&da<5&&db>=0&&db<5||(da===-1||da===5)&&db>=0&&db<5||(db===-1||db===5)&&da>=0&&da<5)P(a0+da,b0+db,y0+4,(da<0||da>4||db<0||db>4)?4:7);
 for(let da=1;da<4;da++)for(let db=1;db<4;db++)P(a0+da,b0+db,y0+5,7);
 P(a0+2,b0+2,y0+6,4);
 // interior
 P(a0+3,b0+3,y0+1,17);P(a0+1,b0+3,y0+1,41);
 if(prof==='farmer')P(a0+1,b0+1,y0+1,40);
 else if(prof==='mason')P(a0+1,b0+1,y0+1,39);
 else P(a0+1,b0+1,y0+1,40);
 const[ax,az]=F(a0+2,b0+2);
 return[ax+.5,y0+1,az+.5];
}
function buildFarm(F,a0,b0,y0,cx,cz){
 const P=(a,b,y,id)=>{const[x,z]=F(a,b);putV(x,y,z,id)};
 for(let da=0;da<7;da++)for(let db=0;db<5;db++){
  const a=a0+da,b=b0+db;
  const [x,z]=F(a,b);
  for(let yy=y0-1;yy>y0-6;yy--){if(getBlock(x,yy,z)>0&&getBlock(x,yy,z)!==9)break;P(a,b,yy,2)}
  P(a,b,y0-1,2);
  for(let yy=y0+1;yy<=y0+3;yy++)P(a,b,yy,0);
  const edge=da===0||da===6||db===0||db===4;
  if(edge){P(a,b,y0,4);continue}
  if(db===2){P(a,b,y0,9);continue}
  P(a,b,y0,29);
  const r=hsh(x,z,31);
  P(a,b,y0+1,r<.12?0:r<.4?30:r<.7?31:32);
 }
 P(a0,b0,y0+1,41);P(a0+6,b0+4,y0+1,41);
}
function buildWell(cx,cz,y0){
 const bx=cx*CS+6,bz=cz*CS+6;
 for(let dx=0;dx<5;dx++)for(let dz=0;dz<5;dz++){
  const x=bx+dx,z=bz+dz;
  for(let yy=y0-1;yy>y0-6;yy--){if(getBlock(x,yy,z)>0&&getBlock(x,yy,z)!==9)break;putV(x,yy,z,3)}
  for(let yy=y0+1;yy<=y0+6;yy++)putV(x,yy,z,0);
  putV(x,y0,z,38);
 }
 for(let dx=1;dx<4;dx++)for(let dz=1;dz<4;dz++)putV(bx+dx,y0,bz+dz,3);
 putV(bx+2,y0,bz+2,9);putV(bx+2,y0-1,bz+2,9);
 for(const[dx,dz]of[[1,1],[3,1],[1,3],[3,3]]){putV(bx+dx,y0+1,bz+dz,4);putV(bx+dx,y0+2,bz+dz,4)}
 for(let dx=1;dx<4;dx++)for(let dz=1;dz<4;dz++)putV(bx+dx,y0+3,bz+dz,7);
 putV(bx+2,y0+4,bz+2,4);
}
function tryGenVillage(cx,cz){
 const key=ck(cx,cz);if(villagesDone.has(key))return;villagesDone.add(key);
 const V=villageOfChunk(cx,cz);if(!V)return;
 const dx=cx-V.cx,dz=cz-V.cz;
 const hc=heightAt(cx*CS+8,cz*CS+8);
 if(Math.abs(hc-V.y)>4||hc<=SEA+1)return;
 const fresh=!edits.has(key); // already built (edits stored) → do not rebuild
 const y0=Math.min(H-9,Math.max(SEA+1,hc));
 const spots=[];
 if(dx===0&&dz===0){
  if(fresh){
   buildWell(cx,cz,y0);
   for(let i=0;i<CS;i++){for(const[x,z]of[[cx*CS+i,cz*CS+7],[cx*CS+i,cz*CS+8],[cx*CS+7,cz*CS+i],[cx*CS+8,cz*CS+i]]){if(i>=5&&i<=10&&((x>=cx*CS+6&&x<=cx*CS+10)&&(z>=cz*CS+6&&z<=cz*CS+10)))continue;putV(x,vSurfaceY(x,z),z,38)}}
  }
  spots.push([cx*CS+4.5,y0+1,cz*CS+4.5,'farmer']);
  spots.push([cx*CS+10.5,y0+1,cz*CS+10.5,'golem']);
 }else if(dx===0||dz===0){
  const swap=dx===0; // chunk above/below center: axis is z
  const F=mkFrame(cx,cz,swap);
  const flip=(swap?dz:dx)>0; // path runs from chunk edge nearest center
  const prof=['farmer','shepherd','mason'][Math.floor(hsh(cx,cz,41)*3)];
  const fa=(a)=>flip?a:15-a; // map so that a increases away from center in frame? keep symmetric
  if(fresh){
   for(let a=0;a<CS;a++)for(const b of[7,8]){const[x,z]=F(a,b);putV(x,vSurfaceY(x,z),z,38)}
   buildFarm(F,fa(2)<fa(8)?2:2,1,y0,cx,cz);
  }
  const hy=y0;
  if(fresh)buildHouse(F,6,10,hy,'house',prof);
  const[hx,hz]=F(8,12);
  spots.push([hx+.5,hy+1,hz+.5,prof]);
  const[fx,fz]=F(5,3);
  spots.push([fx+.5,y0+1,fz+.5,'farmer']);
 }else{
  const F=mkFrame(cx,cz,false);
  const farm=hsh(cx,cz,43)<.45;
  if(farm){
   if(fresh)buildFarm(F,4,4,y0,cx,cz);
   const[fx,fz]=F(7,7);spots.push([fx+.5,y0+1,fz+.5,'farmer']);
  }else{
   const prof=['shepherd','mason','farmer'][Math.floor(hsh(cx,cz,44)*3)];
   if(fresh)buildHouse(F,5,5,y0,'house',prof);
   const[hx,hz]=F(7,7);spots.push([hx+.5,y0+1,hz+.5,prof]);
  }
 }
 flushChunks();
 setTimeout(()=>{
  for(const s of spots){
   const sk=key+':'+s[0]+':'+s[2];if(spawnedPlots.has(sk))continue;spawnedPlots.add(sk);
   const gol=s[3]==='golem',m=spawnMob(gol?'g':'v',s[0],s[1],s[2]);
   if(m){m.home=[s[0],s[1],s[2]];m.prof=s[3]}
  }
 },80);
}
// announce when the player really gets near a village
setInterval(()=>{
 if(typeof P==='undefined'||typeof dead==='undefined')return;
 const v=nearestVillage(P.x,P.z,34);
 if(!v)return;
 const k=v.cx+','+v.cz;if(announced.has(k))return;
 announced.add(k);toast('You found a village!',2200);
},1500);

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
