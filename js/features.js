// features.js - TNT & explosions, falling blocks, lava, random ticks (saplings, grass spread), lightning, hotbar auto-slot
// ---------- falling blocks (sand, gravel) ----------
const fallQ=[];
const isFaller=b=>b===6||b===49;
const _setBlock=setBlock;
setBlock=function(x,y,z,id,lazy){
 _setBlock(x,y,z,id,lazy);
 if(id===0||id===9||isPlant(id))fallQ.push([x,y+1,z,.1]);
 if(isFaller(id))fallQ.push([x,y,z,.12]);
};
function updateFalling(dt){
 for(let i=fallQ.length-1;i>=0;i--){
  const f=fallQ[i];f[3]-=dt;if(f[3]>0)continue;
  fallQ.splice(i,1);
  const[x,y,z]=f,b=getBlock(x,y,z);
  if(!isFaller(b))continue;
  const u=getBlock(x,y-1,z);
  if(u===0||u===9||u===50||(u>0&&isPlant(u))){
   _setBlock(x,y,z,0);_setBlock(x,y-1,z,b);
   fallQ.push([x,y-1,z,.07],[x,y+1,z,.07]);
   if(Math.hypot(x-P.x,z-P.z)<20)playNoise(.05,.03,500);
  }else if(y>0&&Math.hypot(x-P.x,z-P.z)<20&&u!==-1)spawnParticles(x+.5,y+.2,z+.5,tileAvg[tileFor(b,4)]||[.6,.6,.6],4);
 }
}
// ---------- TNT & explosions ----------
const tnts=[];
function igniteTnt(x,y,z,fuse){
 if(tnts.some(t=>t.x===x&&t.y===y&&t.z===z))return;
 tnts.push({x,y,z,t:fuse});playNoise(.8,.1,3500);
 if(fuse>1)toast('Ssss...',900);
}
function explode(cx,cy,cz,r,pdmg){
 const R=Math.ceil(r);
 for(let dx=-R;dx<=R;dx++)for(let dy=-R;dy<=R;dy++)for(let dz=-R;dz<=R;dz++){
  const d=Math.hypot(dx,dy,dz);if(d>r*(.8+Math.random()*.35))continue;
  const x=Math.floor(cx)+dx,y=Math.floor(cy)+dy,z=Math.floor(cz)+dz,b=getBlock(x,y,z);
  if(b<=0||y<=0||b===9||b===50)continue;
  if(b===48){setBlock(x,y,z,0,true);igniteTnt(x,y,z,.4+Math.random()*.6);continue}
  if(surv()&&Math.random()<.3&&Math.hypot(P.x-cx,P.z-cz)<10&&canHarvest(b)){const dr=dropOf(b);if(dr)giveDrop(dr,1)}
  setBlock(x,y,z,0,true);
 }
 flushChunks();
 for(let i=0;i<30;i++)spawnParticles(cx+(Math.random()-.5)*r,cy+(Math.random()-.5)*r,cz+(Math.random()-.5)*r,i%3?[.35,.35,.35]:[1,.6,.15],3);
 const pd=Math.hypot(P.x-cx,P.y+1-cy,P.z-cz);
 if(pd<r*2){
  const dmg=Math.max(1,Math.round((1-pd/(r*2))*pdmg));
  damagePlayer(dmg,cx,cz);
  flash=1;
 }
 playNoise(1.1,.4,700);playTone(70,'sawtooth',.5,.22,28);vib(120);
 const sh=Math.max(0,1-pd/22);if(sh>0)shakeT=.5*sh;
 for(let i=mobs.length-1;i>=0;i--){
  const m=mobs[i],d=Math.hypot(m.x-cx,m.y+m.h/2-cy,m.z-cz);
  if(d<r*2){
   m.hp-=Math.round((1-d/(r*2))*pdmg);m.hurt=.4;
   const dd=d||1;m.vx+=(m.x-cx)/dd*6;m.vz+=(m.z-cz)/dd*6;m.vy=5;
   if(m.hp<=0)killMob(m);
  }
 }
}
let shakeT=0;
function updateBooms(dt){
 while(pendingBooms.length){const b=pendingBooms.shift();explode(b[0],b[1],b[2],b[3],b[4])}
 for(let i=tnts.length-1;i>=0;i--){
  const t=tnts[i];t.t-=dt;
  if(t.t<=0){tnts.splice(i,1);if(getBlock(t.x,t.y,t.z)===48)setBlock(t.x,t.y,t.z,0);explode(t.x+.5,t.y+.5,t.z+.5,4,22)}
  else if(Math.random()<dt*10)spawnParticles(t.x+.5,t.y+1.05,t.z+.5,[.9,.8,.3],1);
 }
}
function applyShake(dt){if(shakeT>0){shakeT-=dt;camera.position.x+=(Math.random()-.5)*.3*shakeT;camera.position.y+=(Math.random()-.5)*.3*shakeT}}
// ---------- lava ----------
let lavaT=0;
function updateLava(dt){
 if(dead)return;
 const fx=Math.floor(P.x),fz=Math.floor(P.z),a=getBlock(fx,Math.floor(P.y+.2),fz),b=getBlock(fx,Math.floor(P.y+1),fz);
 if(a===50||b===50){
  P.vy*=Math.pow(.02,dt);fallY=P.y;
  lavaT-=dt;if(lavaT<=0){lavaT=.5;damagePlayer(4);toast('You are burning!',500)}
 }
}
// ---------- random ticks: saplings grow into trees, grass spreads ----------
function growTree(x,y,z){
 const th=4+((Math.random()*2)|0);
 for(let i=0;i<th;i++){const b=getBlock(x,y+i,z);if(b!==0&&!(i===0&&b===51))return false}
 for(let dy=th-2;dy<=th+1;dy++){const r=dy>=th?1:2;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
  if(Math.abs(dx)===r&&Math.abs(dz)===r&&(dy>=th||Math.random()<.5))continue;
  if(getBlock(x+dx,y+dy,z+dz)===0)setBlock(x+dx,y+dy,z+dz,5,true)}}
 for(let i=0;i<th;i++)setBlock(x,y+i,z,4,true);
 flushChunks();return true;
}
function randomTicks(){
 for(let n=0;n<24;n++){
  const x=Math.floor(P.x+(Math.random()-.5)*40),z=Math.floor(P.z+(Math.random()-.5)*40),c=chunks.get(ck(x>>4,z>>4));
  if(!c)continue;
  const h=c.hs[(x&15)+CS*(z&15)];
  for(let y=h+1;y>=h-1&&y>0;y--){
   const b=getBlock(x,y,z);
   if(b===51&&Math.random()<.08){growTree(x,y,z)}
   else if(b===2&&getBlock(x,y+1,z)===0&&Math.random()<.15){
    const nb=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,d])=>getBlock(x+a,y,z+d)===1);
    if(nb)setBlock(x,y,z,1,true);
   }
  }
 }
 flushChunks();
}
// ---------- lightning ----------
let boltT=10+Math.random()*20,flashEl=null,thunderAt=-1;
function updateLightning(dt){
 if(!flashEl){flashEl=document.createElement('div');flashEl.style.cssText='position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:6;transition:opacity .35s';document.body.appendChild(flashEl)}
 if(weather.rain>.8&&running){
  boltT-=dt;
  if(boltT<=0){
   boltT=8+Math.random()*22;
   flashEl.style.transition='none';flashEl.style.opacity=.85;
   requestAnimationFrame(()=>requestAnimationFrame(()=>{flashEl.style.transition='opacity .5s';flashEl.style.opacity=0}));
   thunderAt=performance.now()+700+Math.random()*1200;
  }
 }
 if(thunderAt>0&&performance.now()>=thunderAt){thunderAt=-1;playNoise(1.6,.35,260);playTone(55,'sawtooth',.9,.18,30)}
}
// ---------- hotbar: crafted/collected placeables get a slot ----------
const HB_PLACE=[39,40,41,48,49,51,57];
function ensureHotbar(){
 if(!surv())return;
 for(const id of HB_PLACE){
  if(inv[id]>0&&HB.indexOf(id)<0){
   let j=-1;for(let k=HB.length-1;k>=0;k--){if(k!==si&&!(inv[HB[k]]>0)&&!HB_PLACE.includes(HB[k])){j=k;break}}
   if(j<0)for(let k=HB.length-1;k>=0;k--){if(k!==si&&!(inv[HB[k]]>0)){j=k;break}}
   if(j<0)continue;
   HB[j]=id;const s=bar.children[j];if(s)s.querySelector('i').style.backgroundImage='url('+icon(id)+')';
  }
 }
}
const _renderSlots=renderSlots;
renderSlots=function(){ensureHotbar();_renderSlots()};
function updateLadder(dt){
 if(dead||!surv()&&fly)return;
 const fx=Math.floor(P.x),fz=Math.floor(P.z);
 if(getBlock(fx,Math.floor(P.y+.3),fz)===57||getBlock(fx,Math.floor(P.y+1.2),fz)===57){
  if(K.Space)P.vy=4.2;else if(K.KeyC||held.sneak||typeof flyDown!=='undefined'&&flyDown)P.vy=-4;else P.vy=Math.max(P.vy,-1.2);
  fallY=P.y;
 }
}
function updateFeatures(dt){
 updateLadder(dt);
 updateFalling(dt);updateBooms(dt);updateLava(dt);updateArrows(dt);
 if(running){randomTicks();updateLightning(dt)}
}

// ----- experience: kills and ores give XP; every level heals a little -----
let xp=0,xpLvl=0;
function xpNeed(l){return 8+l*5}
function addXp(n){
 if(!surv()||!n)return;xp+=n;
 while(xp>=xpNeed(xpLvl)){xp-=xpNeed(xpLvl);xpLvl++;hp=Math.min(20,hp+4);toast('Level '+xpLvl+'!',1400);if(typeof sfxPlace==='function')sfxPlace()}
 renderInfo();
}
const _killMob=killMob;
killMob=function(m){_killMob(m);addXp(m.type==='z'?(m.big?9:5):m.type==='x'?6:m.type==='k'?6:m.type==='v'?0:2)};
const _setBlockXp=setBlock;
setBlock=function(x,y,z,id,lazy){const o=getBlock(x,y,z);_setBlockXp(x,y,z,id,lazy);if(id===0&&(o===44||o===45||o===12||o===13))addXp(o===45?7:o===13?4:o===44?3:2)};
const _renderInfo=renderInfo;
renderInfo=function(){_renderInfo();if(surv())info.textContent+=' · XP '+xpLvl+' ('+xp+'/'+xpNeed(xpLvl)+')'};

// ----- skeleton arrows -----
const arrows=[];
function fireArrow(m,ux,uz,dist){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.5),new THREE.MeshBasicMaterial({color:0x8a6a3a}));
 const sx=m.x,sy=m.y+1.5,sz=m.z,t=dist/14,dy=(P.y+1.2-sy)/t+4.9*t*.5;
 mesh.position.set(sx,sy,sz);scene.add(mesh);
 arrows.push({mesh,x:sx,y:sy,z:sz,vx:ux*14,vy:dy,vz:uz*14,life:3});
 playTone(520,'triangle',.08,.08,260);
}
function updateArrows(dt){
 for(let i=arrows.length-1;i>=0;i--){
  const a=arrows[i];a.vy-=9.8*.5*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;a.z+=a.vz*dt;a.life-=dt;
  a.mesh.position.set(a.x,a.y,a.z);a.mesh.lookAt(a.x+a.vx,a.y+a.vy,a.z+a.vz);
  let done=a.life<=0||getBlock(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z))>0&&!isPlant(getBlock(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z)))&&getBlock(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z))!==9;
  if(!done&&Math.abs(a.x-P.x)<.45&&Math.abs(a.z-P.z)<.45&&a.y>P.y&&a.y<P.y+1.8){damagePlayer(3,a.vx,a.vz);done=true}
  if(done){scene.remove(a.mesh);a.mesh.geometry.dispose();a.mesh.material.dispose();arrows.splice(i,1)}
 }
}
