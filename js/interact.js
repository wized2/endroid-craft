// interact.js - raycast, mining, attacking, placing blocks
// ---------- targeting & actions ----------
function raycast(o,d,max){
 let x=Math.floor(o.x),y=Math.floor(o.y),z=Math.floor(o.z);
 const sx=Math.sign(d.x),sy=Math.sign(d.y),sz=Math.sign(d.z);
 const tdx=sx?Math.abs(1/d.x):Infinity,tdy=sy?Math.abs(1/d.y):Infinity,tdz=sz?Math.abs(1/d.z):Infinity;
 let tmx=sx?(sx>0?x+1-o.x:o.x-x)*tdx:Infinity,tmy=sy?(sy>0?y+1-o.y:o.y-y)*tdy:Infinity,tmz=sz?(sz>0?z+1-o.z:o.z-z)*tdz:Infinity;
 let t=0,f=[0,0,0];
 while(t<=max){
  const b=getBlock(x,y,z);
  if(b>0&&b!==9)return{x,y,z,f,b,t};
  if(tmx<tmy&&tmx<tmz){x+=sx;t=tmx;tmx+=tdx;f=[-sx,0,0]}
  else if(tmy<tmz){y+=sy;t=tmy;tmy+=tdy;f=[0,-sy,0]}
  else{z+=sz;t=tmz;tmz+=tdz;f=[0,0,-sz]}
 }
 return null;
}
let target=null,hoverMob=null,mine=null,crackStage=-1,atkCd=0,mineCd=0,swingT=0,swing=0;
const dir=new THREE.Vector3();
function triggerSwing(){swing=1}
// Aim from player look (yaw/pitch), not third-person camera offset
function refreshAim(){
 eye.set(P.x,P.y+EYE+bob,P.z);
 const cp=Math.cos(pitch),sp=Math.sin(pitch),sy=Math.sin(yaw),cy=Math.cos(yaw);
 dir.set(-sy*cp,sp,-cy*cp);
}
// what a block drops (Minecraft-like): glass/leaves/plants drop nothing, grass gives dirt, leaves 0.5% apple
function dropOf(b){if(b===1)return 2;if(b===5)return Math.random()<.005?24:0;if(isPlant(b)||b===9||b===10)return 0;return b}
// needs a pickaxe tier to drop anything: stone/brick/coal need wood (1), gold ore needs stone (2)
const NEEDPICK={3:1,8:1,12:1,13:2},AXEB={4:1,7:1,17:1};
const TIERSPD=[1,2,4];
function canHarvest(b){return !NEEDPICK[b]||tools.pick>=NEEDPICK[b]}
function hardness(b){
 const h=(HARD[b]!=null)?HARD[b]:1;
 let spd=1;
 if(NEEDPICK[b])spd=TIERSPD[tools.pick]||1;else if(AXEB[b])spd=TIERSPD[tools.axe]||1;
 return Math.max(.05,h*(canHarvest(b)?1.5:5)/spd);
}
function breakBlock(h){
 if(!h||h.b<=0)return false;
 if(h.y<=0)return false;
 if(typeof isCrop==='function'&&isCrop(h.b)){harvestCrop(h.x,h.y,h.z);triggerSwing();mine=null;crack.visible=false;if(target&&target.x===h.x&&target.y===h.y&&target.z===h.z)target=null;if(typeof hl!=='undefined')hl.visible=false;return true}
 const bx=h.x,by=h.y,bz=h.z,bb=h.b;
 triggerSwing();
 spawnParticles(bx+.5,by+.5,bz+.5,(typeof tileAvg!=='undefined'&&tileAvg[tileFor(bb,4)])||[.5,.5,.5],12);
 sfxBreak(bb);vib(18);
 setBlock(bx,by,bz,0);
 const ab=getBlock(bx,by+1,bz);if(isPlant(ab))setBlock(bx,by+1,bz,0);
 if(surv()){
  addExh(.005);
  if(!canHarvest(bb))toast(bb===13?'Needs a stone pickaxe':'Needs a pickaxe',1300);
  const dr=canHarvest(bb)?dropOf(bb):0;
  if(dr){inv[dr]++;if(bb===13)toast('Gold!',1200);renderSlots();renderInfo()}
 }
 mine=null;crack.visible=false;
 if(target&&target.x===bx&&target.y===by&&target.z===bz)target=null;
 if(typeof hl!=='undefined')hl.visible=false;
 return true;
}
function giveDrop(id,n){if(n<=0||!surv())return;inv[id]+=n}
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function killMob(m){
 if(m.type==='v'){giveDrop(37,1);toast('Villager dropped an emerald',1200)}
 else if(m.type==='z'){
  kills++;if(m.big)bruteKills++;
  giveDrop(25,m.big?rint(1,3):rint(0,2)); // rotten flesh
  if(Math.random()<(m.big?.1:.025)){inv[13]++;toast('Zombie dropped gold!')} // rare, like Minecraft's iron
 }else if(m.type==='p'){giveDrop(18,rint(1,3));toast('Raw Porkchop',900)}
 else if(m.type==='c'){giveDrop(20,rint(1,3));giveDrop(27,rint(0,2));toast('Raw Beef + leather',1000)}
 else{giveDrop(26,1);giveDrop(22,rint(1,2));toast('Wool + Raw Mutton',1000)}
 spawnParticles(m.x,m.y+m.h*.5,m.z,m.type==='z'?[.35,.58,.29]:m.type==='c'?[.4,.3,.22]:m.type==='s'?[.9,.9,.9]:[.94,.63,.66],m.big?24:14);
 removeMob(mobs.indexOf(m));renderSlots();renderInfo();showMobHp(null);
}
function attack(m){
 if(m.type==='v'){toast('Use PLACE to trade',1000);return}
 triggerSwing();
 // falling hit = critical (x1.5); sprint hit = extra knockback
 const crit=surv()&&!P.onGround&&P.vy<-1&&!inWater&&!fly;
 let dmg=!surv()?30:weaponDmg();if(crit)dmg=Math.round(dmg*1.5);
 m.hp-=dmg;m.hurt=.35;addExh(.1);
 // swords interrupt a zombie's wind-up (brutes only with the gold sword); fists only nudge it
 const wd=weaponDmg();if(wd>=4&&(!m.big||wd>=5)){m.wind=0;m.stun=.4}else m.stun=.12;
 sfxHit();vib(15);
 const dx=m.x-P.x,dz=m.z-P.z,dd=Math.hypot(dx,dz)||1,kb=(Math.hypot(P.vx,P.vz)>5.5?10:7)*(m.big?.6:1);
 m.vx=dx/dd*kb;m.vz=dz/dd*kb;m.vy=5;m.onGround=false;
 if(crit){spawnParticles(m.x,m.y+m.h*.7,m.z,[1,.9,.3],10);toast('Critical hit!',500);sfxHit()}
 if(m.type!=='z')m.flee=3;
 if(m.hp<=0)killMob(m);
}
// Instant creative break (Minecraft: one click destroys). Also used for held continuous break.
function creativeBreakOnce(){
 if(surv()||dead||!running)return false;
 refreshAim();
 // Prefer block under crosshair; only attack mobs if closer than the block
 let bestMob=null,bestMt=REACH_M;
 for(const m of mobs){const t=rayBox(eye,dir,m.x,m.y,m.z,m.w,m.h);if(t!==null&&t<bestMt){bestMt=t;bestMob=m}}
 const t=raycast(eye,dir,REACH_B+.6);
 if(bestMob&&(!t||bestMt<t.t)){if(atkCd<=0){attack(bestMob);atkCd=.25}return true}
 if(!t||t.t>REACH_B||t.y<=0)return false;
 const ok=breakBlock(t);
 if(ok)mineCd=.12;
 return ok;
}
// Survival/creative continuous mining while held.brk
function interact(dt){
 atkCd-=dt;mineCd-=dt;swingT-=dt;
 hoverMob=null;let best=REACH_M;
 if(target&&target.t<best)best=target.t;
 for(const m of mobs){const t=rayBox(eye,dir,m.x,m.y,m.z,m.w,m.h);if(t!==null&&t<best){best=t;hoverMob=m}}
 showMobHp(hoverMob);
 if(!held.brk){mine=null;crack.visible=false;return}
 // Creative: instant break with small cooldown between blocks (hold to clear rows)
 if(!surv()){
  mine=null;crack.visible=false;
  if(hoverMob&&(!target||hoverMob&&best<=(target?target.t:9))){if(atkCd<=0){attack(hoverMob);atkCd=.25}return}
  if(!target||target.t>REACH_B||target.y<=0)return;
  if(mineCd<=0){breakBlock(target);mineCd=.12}
  return;
 }
 if(hoverMob){mine=null;crack.visible=false;if(atkCd<=0){attack(hoverMob);atkCd=.45}return}
 if(!target||target.t>REACH_B||target.y<=0){mine=null;crack.visible=false;return}
 if(!mine||mine.x!==target.x||mine.y!==target.y||mine.z!==target.z)mine={x:target.x,y:target.y,z:target.z,t:0,need:hardness(target.b)};
 mine.t+=dt;
 if(swingT<=0){triggerSwing();swingT=.3;sfxTick(target.b)}
 const st=Math.min(9,Math.floor(mine.t/mine.need*10));
 if(st!==crackStage){crackStage=st;crack.material.map=crackTex[st]}
 crack.visible=true;crack.position.set(mine.x+.5,mine.y+.5,mine.z+.5);
 if(mine.t>=mine.need){const h={x:mine.x,y:mine.y,z:mine.z,b:getBlock(mine.x,mine.y,mine.z)};mine=null;crack.visible=false;if(h.b>0)breakBlock(h)}
}
function doPlace(){
 const h=target;
 // Trade with villager under crosshair
 if(hoverMob&&hoverMob.type==='v'){openTrade(hoverMob);return}
 if(hoverMob&&hoverMob.type==='s'&&tryShear(hoverMob))return
 if(hoverMob&&(hoverMob.type==='p'||hoverMob.type==='c'||hoverMob.type==='s')){if(feedMob(hoverMob))return}
 if(!h||h.t>REACH_B+.2||dead)return;
 if(typeof tryFarmUse==='function'&&tryFarmUse(h))return;
 const look=getBlock(h.x,h.y,h.z);
 if(look===39){openFurnace(h.x,h.y,h.z);return}
 if(look===40){openChest(h.x,h.y,h.z);return}
 if(look===17){useBed(h.x,h.y,h.z);return} // right-click a bed
 const id=HB[si];
 if(surv()&&inv[id]<=0){toast('No '+NAMES[id]+' left',900);return}
 const x=h.x+h.f[0],y=h.y+h.f[1],z=h.z+h.f[2];if(y<0||y>=H)return;
 const b=getBlock(x,y,z);if(b!==0&&b!==9&&!isPlant(b))return;
 if(x+1>P.x-PW&&x<P.x+PW&&y+1>P.y&&y<P.y+HT&&z+1>P.z-PW&&z<P.z+PW)return;
 triggerSwing();sfxPlace();vib(14);
 setBlock(x,y,z,id);
 if(surv()){inv[id]--;renderSlots();nameEl.textContent=NAMES[id]+' ×'+inv[id];nameEl.style.opacity=1;clearTimeout(nameT);nameT=setTimeout(()=>nameEl.style.opacity=0,1000)}
}
// Minecraft creative middle-click: pick the block you're looking at into the hotbar
function pickBlock(){
 if(dead||!running)return;
 refreshAim();
 const t=raycast(eye,dir,REACH_B+.6);
 if(!t||t.b<=0||t.b===9)return;
 const id=t.b===1?1:t.b; // keep grass as grass in creative
 let idx=HB.indexOf(id);
 if(idx<0){
  // swap into selected hotbar slot
  HB[si]=id;idx=si;
  const slots=bar.children;if(slots[si])slots[si].querySelector('i').style.backgroundImage='url('+icon(id)+')';
 }
 if(!surv())inv[id]=Math.max(inv[id],64);
 sel(idx);
 toast(NAMES[id]||('Block '+id),800);
}

// Drop one item from selected hotbar (Minecraft Q)
function dropHeld(){
 if(!running||dead)return;
 const id=HB[si];
 if(surv()){
  if(inv[id]<=0){toast('Nothing to drop',800);return}
  inv[id]--;renderSlots();renderInfo();
 }
 // visual: toss particles of that block color
 const rgb=tileAvg[tileFor(id,4)]||[.7,.7,.7];
 spawnParticles(P.x-Math.sin(yaw)*.8,P.y+EYE*.7,P.z-Math.cos(yaw)*.8,rgb,8);
 toast('Dropped '+(NAMES[id]||'item'),700);vib(10);
}
