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
function dropOf(b){if(b===1)return 2;if(b===5)return Math.random()<.3?5:0;if(b>=14||b===9)return 0;return b}
function hardness(b){
 let h=HARD[b];
 if(tools.pick)h/=hardB(b)?4:1.6;
 return Math.max(.05,h);
}
function breakBlock(h){
 triggerSwing();
 spawnParticles(h.x+.5,h.y+.5,h.z+.5,tileAvg[tileFor(h.b,4)],12);
 sfxBreak(h.b);vib(18);
 setBlock(h.x,h.y,h.z,0);
 if(surv()){
  const dr=dropOf(h.b);
  if(dr){inv[dr]++;if(h.b===13)toast('Gold!',1200);renderSlots();renderInfo()}
 }
 const ab=getBlock(h.x,h.y+1,h.z);if(ab>=14)setBlock(h.x,h.y+1,h.z,0);
}
function killMob(m){
 if(m.type==='z'){
  kills++;
  if(Math.random()<(m.big?.85:.3)){const n=m.big?1+(Math.random()<.5):1;inv[13]+=n;toast('Zombie dropped gold!')}else if(Math.random()<.4){inv[12]++}
 }else if(surv()&&hp<20){hp=Math.min(20,hp+4);renderHearts();toast('+2 \u2665',1200)}
 spawnParticles(m.x,m.y+m.h*.5,m.z,m.type==='z'?[.35,.58,.29]:[.94,.63,.66],m.big?24:14);
 removeMob(mobs.indexOf(m));renderSlots();renderInfo();showMobHp(null);
}
function attack(m){
 triggerSwing();
 // falling hit = critical (x1.5); sprint hit = extra knockback
 const crit=surv()&&!P.onGround&&P.vy<-1&&!inWater&&!fly;
 let dmg=!surv()?30:weaponDmg();if(crit)dmg=Math.round(dmg*1.5);
 m.hp-=dmg;m.hurt=.35;m.wind=0;m.stun=.55; // hitting a zombie interrupts its attack wind-up
 sfxHit();vib(15);
 const dx=m.x-P.x,dz=m.z-P.z,dd=Math.hypot(dx,dz)||1,kb=(Math.hypot(P.vx,P.vz)>5.5?10:7)*(m.big?.6:1);
 m.vx=dx/dd*kb;m.vz=dz/dd*kb;m.vy=5;m.onGround=false;
 if(crit){spawnParticles(m.x,m.y+m.h*.7,m.z,[1,.9,.3],10);toast('Critical hit!',500);sfxHit()}
 if(m.type==='p')m.flee=3;
 if(m.hp<=0)killMob(m);
}
function interact(dt){
 atkCd-=dt;mineCd-=dt;swingT-=dt;
 hoverMob=null;let best=3.6;
 if(target&&target.t<best)best=target.t;
 for(const m of mobs){const t=rayBox(eye,dir,m.x,m.y,m.z,m.w,m.h);if(t!==null&&t<best){best=t;hoverMob=m}}
 showMobHp(hoverMob);
 if(!held.brk){mine=null;crack.visible=false;return}
 if(hoverMob){mine=null;crack.visible=false;if(atkCd<=0){attack(hoverMob);atkCd=.45}return}
 if(!target||target.t>5||target.y<=0){mine=null;crack.visible=false;return}
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
 const h=target;if(!h||h.t>5.2||dead)return;
 const id=HB[si];
 if(surv()&&inv[id]<=0){toast('No '+NAMES[id]+' left',900);return}
 const x=h.x+h.f[0],y=h.y+h.f[1],z=h.z+h.f[2];if(y<0||y>=H)return;
 const b=getBlock(x,y,z);if(b!==0&&b!==9&&b<14)return;
 if(x+1>P.x-PW&&x<P.x+PW&&y+1>P.y&&y<P.y+HT&&z+1>P.z-PW&&z<P.z+PW)return;
 triggerSwing();sfxPlace();vib(14);
 setBlock(x,y,z,id);
 if(surv()){inv[id]--;renderSlots();nameEl.textContent=NAMES[id]+' ×'+inv[id];nameEl.style.opacity=1;clearTimeout(nameT);nameT=setTimeout(()=>nameEl.style.opacity=0,1000)}
}

