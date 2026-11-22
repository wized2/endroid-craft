// mobs.js - zombies and pigs: models, AI, spawning
// ---------- mobs ----------
const mobs=[],RED=new THREE.Color(1,.15,.15),ORANGE=new THREE.Color(1,.55,.1);
function box(w,h,d,col,x,y,z,par){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:col}));m.position.set(x,y,z);m.userData.base=new THREE.Color(col);par.add(m);return m}
function limb(w,h,d,col,x,y,z,par){const g=new THREE.Group();g.position.set(x,y,z);box(w,h,d,col,0,-h/2,0,g);par.add(g);return g}
function makeMob(type,x,y,z){
 const g=new THREE.Group(),m={type,g,x,y,z,vx:0,vy:0,vz:0,onGround:false,wall:false,wallPrev:false,hurt:0,cd:1,yaw:Math.random()*6.28,ph:0,wt:0,dirx:0,dirz:0,flee:0,gT:3+Math.random()*4,legs:[],arms:[],burn:false};
 if(type==='z'){
  m.hp=20;m.w=.3;m.h=1.8;m.spd=3.5;m.dmg=3;m.wind=0;m.stun=0;
  box(.5,.75,.25,0x2f6f9f,0,1.125,0,g);box(.5,.5,.5,0x5b9449,0,1.75,0,g);
  box(.1,.08,.03,0x111111,-.12,1.78,-.26,g);box(.1,.08,.03,0x111111,.12,1.78,-.26,g);
  m.arms.push(limb(.2,.7,.2,0x5b9449,-.35,1.47,0,g),limb(.2,.7,.2,0x5b9449,.35,1.47,0,g));
  m.arms.forEach(a=>a.rotation.x=1.45);
  m.legs.push(limb(.24,.75,.24,0x3a3a8c,-.13,.75,0,g),limb(.24,.75,.24,0x3a3a8c,.13,.75,0,g));
 }else if(type==='c'){
  m.hp=10;m.w=.5;m.h=1.35;m.spd=1.1;const B=0x4e3b2c,W=0xe9e4dc;
  box(.7,.7,1.2,B,0,.95,0,g);box(.3,.3,.4,W,.18,1.02,.1,g);box(.5,.5,.45,0x3f2f23,0,1.1,-.78,g);box(.3,.2,.1,0xd9b99b,0,1.02,-1.02,g);
  box(.08,.2,.08,W,-.22,1.42,-.7,g);box(.08,.2,.08,W,.22,1.42,-.7,g);
  box(.06,.06,.02,0x111111,-.14,1.16,-1.01,g);box(.06,.06,.02,0x111111,.14,1.16,-1.01,g);
  for(const[px,pz]of[[-.22,-.45],[.22,-.45],[-.22,.45],[.22,.45]])m.legs.push(limb(.2,.6,.2,B,px,.6,pz,g));
 }else if(type==='s'){
  m.hp=8;m.w=.45;m.h=1.1;m.spd=1.1;const Wl=0xe8e6e0;
  box(.7,.65,1,Wl,0,.9,0,g);box(.4,.4,.4,0xc9a98a,0,1.05,-.68,g);box(.44,.14,.44,Wl,0,1.3,-.66,g);
  box(.06,.06,.02,0x111111,-.1,1.08,-.89,g);box(.06,.06,.02,0x111111,.1,1.08,-.89,g);
  for(const[px,pz]of[[-.2,-.32],[.2,-.32],[-.2,.32],[.2,.32]])m.legs.push(limb(.18,.55,.18,0xcdb8a0,px,.55,pz,g));
 }else{
  m.hp=10;m.w=.45;m.h=.9;m.spd=1.1;
  box(.55,.5,.9,0xf0a0a8,0,.6,0,g);box(.42,.4,.4,0xf0a0a8,0,.72,-.62,g);box(.22,.16,.1,0xdc8a94,0,.66,-.85,g);
  box(.06,.06,.02,0x111111,-.12,.78,-.83,g);box(.06,.06,.02,0x111111,.12,.78,-.83,g);
  for(const[px,pz]of[[-.17,-.3],[.17,-.3],[-.17,.3],[.17,.3]])m.legs.push(limb(.18,.35,.18,0xf0a0a8,px,.35,pz,g));
 }
 m.maxhp=m.hp;
 g.position.set(x,y,z);scene.add(g);return m;
}
function removeMob(i){
 if(i<0)return;const m=mobs[i];scene.remove(m.g);
 m.g.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});mobs.splice(i,1);
}
// Brute zombies appear from day 3: bigger, tougher, hit harder, better drops
function bigify(m){m.big=true;m.hp=m.maxhp=45;m.dmg=5;m.w=.4;m.h=2.3;m.spd=3;m.g.scale.setScalar(1.3);m.g.traverse(o=>{if(o.isMesh)o.userData.base.multiplyScalar(.72)})}
function trySpawn(type){
 for(let t=0;t<6;t++){
  const a=Math.random()*Math.PI*2,r=type==='z'?18+Math.random()*12:14+Math.random()*14,x=Math.floor(P.x+Math.cos(a)*r),z=Math.floor(P.z+Math.sin(a)*r);
  let y=-1;
  for(let yy=H-1;yy>0;yy--){const b=getBlock(x,yy,z);if(b===0||isPlant(b))continue;if(b===-1)break;if(b===1||b===2||b===6||b===11||b===3)y=yy+1;break}
  if(y<0)continue;
  const nm=makeMob(type,x+.5,y,z+.5);
  if(type==='z'&&Math.floor(clock/DAY)>=2&&Math.random()<.22)bigify(nm);
  mobs.push(nm);return;
 }
}
let spawnT=0,warned=false;
function spawnMobs(dt){
 spawnT-=dt;if(spawnT>0)return;spawnT=1.5;
 let nz=0;for(const m of mobs)if(m.type==='z')nz++;
 const np=mobs.length-nz,night=dayK<.32;
 const cap=(touch?3:5)+Math.min(4,Math.floor(clock/DAY));
 if(surv()&&dayK<.45&&!warned){warned=true;toast('Night is falling - build a shelter or grab a sword!',3200)}else if(dayK>.6)warned=false;
 if(surv()&&night&&nz<cap)trySpawn('z');
 else if(!night&&np<8&&Math.random()<.6){const r=Math.random();trySpawn(r<.35?'p':r<.7?'c':'s')}
}
function updateMobs(dt){
 for(let i=mobs.length-1;i>=0;i--){
  const m=mobs[i],dx=P.x-m.x,dz=P.z-m.z,dist=Math.hypot(dx,dz)||.001;
  if(dist>64||(!surv()&&m.type==='z')){removeMob(i);continue}
  if(getBlock(Math.floor(m.x),Math.floor(m.y),Math.floor(m.z))===-1)continue;
  m.hurt=Math.max(0,m.hurt-dt);m.cd-=dt;
  const ux=dx/dist,uz=dz/dist;let spd=0;
  if(m.type==='z'){
   if(dist<26&&dist>.9){m.dirx=ux;m.dirz=uz;spd=m.spd}else{m.dirx=m.dirz=0}
   // attack: short wind-up you can dodge or interrupt by hitting it, then a swipe
   if(m.stun>0)m.stun-=dt;
   if(m.wind>0){m.wind-=dt;if(m.wind<=0){if(dist<1.9&&Math.abs(P.y-m.y)<1.7&&!dead)damagePlayer(m.dmg,m.x,m.z);m.cd=1.0}}
   else if(dist<1.5&&Math.abs(P.y-m.y)<1.6&&m.cd<=0&&m.stun<=0&&!dead)m.wind=.42;
   if(m.wind>0||m.stun>0)m.dirx=m.dirz=0;
   m.burn=dayK>.5;
   if(m.burn){m.hp-=2.5*dt;if(m.hp<=0){spawnParticles(m.x,m.y+1,m.z,[.3,.3,.3],8);removeMob(i);continue}}
   m.gT-=dt;if(m.gT<=0){m.gT=4+Math.random()*5;if(dist<20)sfxGroan(.07*(1-dist/20))}
  }else{
   m.wt-=dt;
   if(m.wt<=0){m.wt=2+Math.random()*4;if(Math.random()<.4){m.dirx=m.dirz=0}else{const a=Math.random()*6.28;m.dirx=Math.cos(a);m.dirz=Math.sin(a)}}
   if(m.flee>0){m.flee-=dt;m.dirx=-ux;m.dirz=-uz;spd=2.6}else if(m.dirx||m.dirz)spd=m.spd;
   m.gT-=dt;if(m.gT<=0){m.gT=6+Math.random()*8;if(dist<16)sfxOink()}
  }
  const k=Math.min(1,dt*(m.onGround?8:2));
  if(m.hurt<.22){m.vx+=(m.dirx*spd-m.vx)*k;m.vz+=(m.dirz*spd-m.vz)*k}
  const inW=getBlock(Math.floor(m.x),Math.floor(m.y+.3),Math.floor(m.z))===9;
  if(inW)m.vy=Math.min(m.vy+22*dt-12*dt,2);else m.vy=Math.max(m.vy-28*dt,-30);
  if(m.wallPrev&&m.onGround&&spd>0)m.vy=7.5;
  m.onGround=false;m.wall=false;
  for(let s=0;s<3;s++)stepBody(m,dt/3,m.w,m.h);
  m.wallPrev=m.wall;
  if(m.y<-30){removeMob(i);continue}
  const hs=Math.hypot(m.vx,m.vz);
  if(hs>.25){const ty=Math.atan2(-m.vx,-m.vz);let dy=ty-m.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));m.yaw+=dy*Math.min(1,dt*10)}
  m.ph+=hs*dt*4;
  const sw=Math.sin(m.ph)*Math.min(1,hs);
  if(m.type==='z'){m.legs[0].rotation.x=sw*.7;m.legs[1].rotation.x=-sw*.7;const ar=m.wind>0?2.4:1.45;m.arms[0].rotation.x=ar+Math.sin(m.ph*.5)*.08;m.arms[1].rotation.x=ar-Math.sin(m.ph*.5)*.08}
  else{m.legs[0].rotation.x=m.legs[3].rotation.x=sw*.7;m.legs[1].rotation.x=m.legs[2].rotation.x=-sw*.7}
  m.g.position.set(m.x,m.y,m.z);m.g.rotation.y=m.yaw;
  const lm=Math.max(.35,L);
  m.g.traverse(o=>{
   if(!o.isMesh)return;const c=o.material.color;c.copy(o.userData.base).multiplyScalar(lm);
   if(m.hurt>0)c.lerp(RED,Math.min(1,m.hurt*3));else if(m.burn)c.lerp(ORANGE,.4+.25*Math.sin(clock*18));
  });
 }
}
function rayBox(o,d,cx,cy,cz,hw,h){
 let tmin=0,tmax=8;
 const mn=[cx-hw,cy,cz-hw],mx=[cx+hw,cy+h,cz+hw],oo=[o.x,o.y,o.z],dd=[d.x,d.y,d.z];
 for(let i=0;i<3;i++){
  if(Math.abs(dd[i])<1e-8){if(oo[i]<mn[i]||oo[i]>mx[i])return null;continue}
  let t1=(mn[i]-oo[i])/dd[i],t2=(mx[i]-oo[i])/dd[i];if(t1>t2){const t=t1;t1=t2;t2=t}
  tmin=Math.max(tmin,t1);tmax=Math.min(tmax,t2);if(tmin>tmax)return null;
 }
 return tmin;
}

