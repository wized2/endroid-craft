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
// what a block drops (Minecraft-like): glass/leaves/plants drop nothing, grass gives dirt, leaves 0.5% apple
function dropOf(b){if(b===1)return 2;if(b===5)return Math.random()<.005?24:0;if(isPlant(b)||b===9||b===10)return 0;return b}
// needs a pickaxe tier to drop anything: stone/brick/coal need wood (1), gold ore needs stone (2, no iron here)
const NEEDPICK={3:1,8:1,12:1,13:2},AXEB={4:1,7:1,17:1};
const TIERSPD=[1,2,4];
// Minecraft break time: hardness*1.5/speed with the right tool, hardness*5/speed without
function canHarvest(b){return !NEEDPICK[b]||tools.pick>=NEEDPICK[b]}
function hardness(b){
 const h=HARD[b];let spd=1;
 if(NEEDPICK[b])spd=TIERSPD[tools.pick];else if(AXEB[b])spd=TIERSPD[tools.axe];
 return Math.max(.05,h*(canHarvest(b)?1.5:5)/spd);
}
function breakBlock(h){
 triggerSwing();
 spawnParticles(h.x+.5,h.y+.5,h.z+.5,tileAvg[tileFor(h.b,4)],12);
 sfxBreak(h.b);vib(18);
 setBlock(h.x,h.y,h.z,0);
 if(surv()){
  addExh(.005);
  if(!canHarvest(h.b))toast(h.b===13?'Needs a stone pickaxe':'Needs a pickaxe',1300);
  const dr=canHarvest(h.b)?dropOf(h.b):0;
  if(dr){inv[dr]++;if(h.b===13)toast('Gold!',1200);renderSlots();renderInfo()}
 }
 const ab=getBlock(h.x,h.y+1,h.z);if(isPlant(ab))setBlock(h.x,h.y+1,h.z,0);
}
function drop(id,n){if(n<=0||!surv())return;inv[id]+=n}
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function killMob(m){
 if(m.type==='z'){
  kills++;if(m.big)bruteKills++;
  drop(25,m.big?rint(1,3):rint(0,2)); // rotten flesh
  if(Math.random()<(m.big?.1:.025)){inv[13]++;toast('Zombie dropped gold!')} // rare, like Minecraft's iron
 }else if(m.type==='p'){drop(18,rint(1,3));toast('Raw Porkchop',900)}
 else if(m.type==='c'){drop(20,rint(1,3));drop(27,rint(0,2));toast('Raw Beef + leather',1000)}
 else{drop(26,1);drop(22,rint(1,2));toast('Wool + Raw Mutton',1000)}
 spawnParticles(m.x,m.y+m.h*.5,m.z,m.type==='z'?[.35,.58,.29]:m.type==='c'?[.4,.3,.22]:m.type==='s'?[.9,.9,.9]:[.94,.63,.66],m.big?24:14);
 removeMob(mobs.indexOf(m));renderSlots();renderInfo();showMobHp(null);
}
function attack(m){
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
function interact(dt){
 atkCd-=dt;mineCd-=dt;swingT-=dt;
 hoverMob=null;let best=REACH_M;
 if(target&&target.t<best)best=target.t;
 for(const m of mobs){const t=rayBox(eye,dir,m.x,m.y,m.z,m.w,m.h);if(t!==null&&t<best){best=t;hoverMob=m}}
 showMobHp(hoverMob);
 if(!held.brk){mine=null;crack.visible=false;return}
 if(hoverMob){mine=null;crack.visible=false;if(atkCd<=0){attack(hoverMob);atkCd=.45}return}
 if(!target||target.t>REACH_B||target.y<=0){mine=null;crack.visible=false;return}
 if(!surv()){if(mineCd<=0){breakBlock(target);mineCd=.2}return}
 if(!mine||mine.x!==target.x||mine.y!==target.y||mine.z!==target.z)mine={x:target.x,y:target.y,z:target.z,t:0,need:hardness(target.b)};
 mine.t+=dt;
 if(swingT<=0){triggerSwing();swingT=.3;sfxTick(target.b)}
 const st=Math.min(9,Math.floor(mine.t/mine.need*10));
 if(st!==crackStage){crackStage=st;crack.material.map=crackTex[st]}
 crack.visible=true;crack.position.set(mine.x+.5,mine.y+.5,mine.z+.5);
 if(mine.t>=mine.need){const h={x:mine.x,y:mine.y,z:mine.z,b:getBlock(mine.x,mine.y,mine.z)};mine=null;crack.visible=false;if(h.b>0)breakBlock(h)}
}
function doPlace(){
 const h=target;if(!h||h.t>REACH_B+.2||dead)return;
 if(getBlock(h.x,h.y,h.z)===17){useBed(h.x,h.y,h.z);return} // right-click a bed
 const id=HB[si];
 if(surv()&&inv[id]<=0){toast('No '+NAMES[id]+' left',900);return}
 const x=h.x+h.f[0],y=h.y+h.f[1],z=h.z+h.f[2];if(y<0||y>=H)return;
 const b=getBlock(x,y,z);if(b!==0&&b!==9&&!isPlant(b))return;
 if(x+1>P.x-PW&&x<P.x+PW&&y+1>P.y&&y<P.y+HT&&z+1>P.z-PW&&z<P.z+PW)return;
 triggerSwing();sfxPlace();vib(14);
 setBlock(x,y,z,id);
 if(surv()){inv[id]--;renderSlots();nameEl.textContent=NAMES[id]+' ×'+inv[id];nameEl.style.opacity=1;clearTimeout(nameT);nameT=setTimeout(()=>nameEl.style.opacity=0,1000)}
}

