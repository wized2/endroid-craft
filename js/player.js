// player.js - player movement, fly, damage, death, respawn
// ---------- player ----------
const K={},joy={fx:0,fy:0},held={brk:false};
let flyDown=false,lastSpace=0,fallY=P.y,airT=0,stepDist=0,wasInWater=false,inWater=false,walkClock=0,fovCur=75,kbT=0,bob=0;
function toggleFly(){if(surv())return;fly=!fly;P.vy=0;fallY=P.y;toast(fly?'Flying on':'Flying off',900);$('#bDown').style.display=(fly&&touch)?'block':'none';renderInfo()}
function tapSpace(){const n=performance.now();if(!surv()&&n-lastSpace<300)toggleFly();lastSpace=n}
function damagePlayer(n,fx,fz){
 if(!surv()||dead)return;
 if(fx!==undefined)n=Math.max(1,Math.round(n*(1-DMGRED[armorLvl()]))); // armor only helps against melee
 hp=Math.max(0,hp-n);regenCd=7;flash=1;sfxHurt();vib(40);
 if(fx!==undefined){const dx=P.x-fx,dz=P.z-fz,dd=Math.hypot(dx,dz)||1;P.vx=dx/dd*6;P.vz=dz/dd*6;P.vy=Math.max(P.vy,4.5);kbT=.28}
 renderHearts();
 if(hp<=0)die();
}
function die(){
 dead=true;fly=false;held.brk=false;sfxDie();vib(200);
 setRunning(false,false);$('#death').style.display='flex';
 if(!touch&&document.pointerLockElement)document.exitPointerLock();
}
function respawn(){
 hp=20;air=10;dead=false;P.x=spawn[0];P.y=spawn[1];P.z=spawn[2];P.vx=P.vy=P.vz=0;fallY=P.y;
 for(let i=mobs.length-1;i>=0;i--)if(Math.hypot(mobs[i].x-P.x,mobs[i].z-P.z)<30)removeMob(i);
 $('#death').style.display='none';renderHearts();renderAir();
 if(touch)setRunning(true);else renderer.domElement.requestPointerLock();
}
function update(dt){
 const fl=fly&&!surv();
 let fwd=(K.KeyW||K.ArrowUp?1:0)-(K.KeyS||K.ArrowDown?1:0)+joy.fy,str=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+joy.fx;
 const mag=Math.hypot(fwd,str);if(mag>1){fwd/=mag;str/=mag}
 const shift=K.ShiftLeft||K.ShiftRight,sprint=!fl&&(shift||Math.hypot(joy.fx,joy.fy)>.92)&&fwd>.1;
 let sp=fl?8:(touch?4.8:4.3);if(sprint)sp*=1.45;if(inWater&&!fl)sp*=.55;
 const sy=Math.sin(yaw),cy=Math.cos(yaw),tx=(-sy*fwd+cy*str)*sp,tz=(-cy*fwd-sy*str)*sp,k=Math.min(1,dt*(P.onGround||fl?12:4));
 kbT=Math.max(0,kbT-dt);
 if(kbT<=0){P.vx+=(tx-P.vx)*k;P.vz+=(tz-P.vz)*k}
 inWater=getBlock(Math.floor(P.x),Math.floor(P.y+.5),Math.floor(P.z))===9;
 camInWater=getBlock(Math.floor(P.x),Math.floor(P.y+EYE),Math.floor(P.z))===9;
 wetEl.style.display=camInWater?'block':'none';
 if(inWater&&!wasInWater){sfxSplash();vib(20)}
 wasInWater=inWater;
 if(fl){P.vy=((K.Space)?6.5:0)-((shift||K.KeyC||flyDown)?6.5:0)}
 else if(inWater){P.vy=Math.max(P.vy-12*dt,-4);if(K.Space)P.vy=Math.min(P.vy+30*dt,P.wall?7:3.6)}
 else{P.vy=Math.max(P.vy-28*dt,-40);if(K.Space&&P.onGround){P.vy=8.6;sfxJump();vib(10)}}
 P.onGround=false;P.wall=false;
 for(let i=0;i<3;i++)stepBody(P,dt/3,PW,HT);
 if(fl&&P.onGround&&(shift||K.KeyC||flyDown)){fly=false;$('#bDown').style.display='none';renderInfo()}
 if(P.onGround){
  const fd=fallY-P.y;
  if(fd>3.2&&!inWater){if(surv())damagePlayer(Math.ceil(fd-3));sfxLand()}
  fallY=P.y;
  const hs=Math.hypot(P.vx,P.vz);
  if(hs>.8){stepDist+=hs*dt;if(stepDist>(sprint?2.2:1.7)){sfxStep(getBlock(Math.floor(P.x),Math.floor(P.y-.1),Math.floor(P.z)));stepDist=0}}
 }else fallY=(inWater||fl)?P.y:Math.max(fallY,P.y);
 if(camInWater&&surv()){air-=dt;if(air<=0){air=0;airT-=dt;if(airT<=0){airT=1;damagePlayer(2)}}}else air=Math.min(10,air+dt*5);
 const an=air>=9.95?-1:Math.ceil(air);if(an!==lastAirN){lastAirN=an;renderAir()}
 if(surv()&&hp<20&&hp>0){regenCd-=dt;if(regenCd<=0){regenT+=dt;if(regenT>=2.5){regenT=0;hp++;renderHearts()}}}
 flash=Math.max(0,flash-dt*2.2);dmgEl.style.opacity=flash;
 if(P.y<-40){P.x=spawn[0];P.y=spawn[1];P.z=spawn[2];P.vy=0;fallY=P.y}
 const hsp=Math.hypot(P.vx,P.vz);
 if(P.onGround&&hsp>.3)walkClock+=dt*(sprint?12:9);
 bob+=((P.onGround&&hsp>.5?Math.abs(Math.sin(walkClock))*.045:0)-bob)*Math.min(1,dt*14);
 const tf=SET.fov+(sprint&&hsp>3?9:0)+(fl?4:0);fovCur+=(tf-fovCur)*Math.min(1,dt*8);
 if(Math.abs(camera.fov-fovCur)>.05){camera.fov=fovCur;camera.updateProjectionMatrix()}
}

