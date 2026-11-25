// mobs.js - zombies and pigs: models, AI, spawning
// ---------- mobs ----------
const mobs=[],pendingBooms=[],WHITE=new THREE.Color(1,1,1),RED=new THREE.Color(1,.15,.15),ORANGE=new THREE.Color(1,.55,.1);
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
 }else if(type==='k'){
  m.hp=20;m.w=.3;m.h=1.7;m.spd=2.7;m.fuse=0;const G=0x5fb04a;
  box(.5,.75,.3,G,0,.95,0,g);box(.5,.5,.5,G,0,1.55,0,g);
  box(.1,.12,.03,0x111111,-.12,1.6,-.26,g);box(.1,.12,.03,0x111111,.12,1.6,-.26,g);box(.12,.2,.03,0x111111,0,1.45,-.26,g);
  for(const[px,pz]of[[-.13,-.18],[.13,-.18],[-.13,.18],[.13,.18]])m.legs.push(limb(.22,.5,.22,G,px,.5,pz,g));
 }else if(type==='h'){
  m.hp=4;m.w=.22;m.h=.7;m.spd=1.0;
  box(.4,.35,.55,0xf4f4f0,0,.5,0,g);box(.22,.28,.22,0xf4f4f0,0,.8,-.28,g);box(.1,.08,.14,0xe89a2c,0,.78,-.44,g);box(.06,.1,.06,0xcc2222,0,.68,-.4,g);
  box(.06,.06,.02,0x111111,-.07,.86,-.39,g);box(.06,.06,.02,0x111111,.07,.86,-.39,g);
  const l1=limb(.06,.3,.06,0xe8b030,-.1,.3,0,g),l2=limb(.06,.3,.06,0xe8b030,.1,.3,0,g);m.legs.push(l1,l2,l2,l1);
 }else if(type==='w'){
  m.hp=8;m.maxhp=8;m.w=.3;m.h=.85;m.spd=2.4;m.dmg=3;m.tamed=false;m.wt=0;const C=0xd8d4cc;
  box(.36,.36,.72,C,0,.62,0,g);box(.3,.3,.3,C,0,.82,-.46,g);box(.16,.14,.18,0xe8e4dc,0,.76,-.66,g);box(.07,.07,.02,0x111111,-.08,.86,-.62,g);box(.07,.07,.02,0x111111,.08,.86,-.62,g);
  box(.08,.12,.06,C,-.1,1.04,-.44,g);box(.08,.12,.06,C,.1,1.04,-.44,g);box(.08,.08,.36,C,0,.8,.52,g);
  for(const[px,pz]of[[-.11,-.26],[.11,-.26],[-.11,.26],[.11,.26]])m.legs.push(limb(.12,.45,.12,C,px,.45,pz,g));
 }else if(type==='g'){
  m.hp=m.maxhp=100;m.w=.7;m.h=2.7;m.spd=2.2;m.dmg=15;m.wt=0;const C=0xc9c4b8;
  box(1.1,1.0,.6,C,0,1.7,0,g);box(.7,.6,.6,0xb8b3a6,0,1.4,0,g);box(.5,.5,.5,C,0,2.45,-.05,g);box(.12,.2,.12,0x8a7a6a,0,2.4,-.32,g);
  box(.1,.06,.02,0x992222,-.12,2.52,-.31,g);box(.1,.06,.02,0x992222,.12,2.52,-.31,g);
  box(.18,.5,.1,0x4a8a3a,.3,1.6,.31,g);
  m.arms.push(limb(.28,1.5,.3,C,-.7,2.1,0,g),limb(.28,1.5,.3,C,.7,2.1,0,g));
  m.legs.push(limb(.34,.9,.34,0xb8b3a6,-.25,.9,0,g),limb(.34,.9,.34,0xb8b3a6,.25,.9,0,g));
 }else if(type==='s'){
  m.hp=8;m.w=.45;m.h=1.1;m.spd=1.1;const Wl=0xe8e6e0;
  box(.7,.65,1,Wl,0,.9,0,g);box(.4,.4,.4,0xc9a98a,0,1.05,-.68,g);box(.44,.14,.44,Wl,0,1.3,-.66,g);
  box(.06,.06,.02,0x111111,-.1,1.08,-.89,g);box(.06,.06,.02,0x111111,.1,1.08,-.89,g);
  for(const[px,pz]of[[-.2,-.32],[.2,-.32],[-.2,.32],[.2,.32]])m.legs.push(limb(.18,.55,.18,0xcdb8a0,px,.55,pz,g));
 }else if(type==='v'){
  m.hp=20;m.w=.3;m.h=1.85;m.spd=1.15;m.prof='farmer';m.love=0;
  box(.5,.75,.3,0x6b5344,0,1.1,0,g); // robe
  box(.48,.48,.48,0xc49a6c,0,1.72,0,g); // head
  box(.12,.2,.2,0xc49a6c,0,1.6,-.28,g); // nose
  box(.08,.06,.02,0x2e8b57,-.12,1.78,-.24,g);box(.08,.06,.02,0x2e8b57,.12,1.78,-.24,g);
  box(.52,.12,.52,0xc9a227,0,2.0,0,g); // straw hat brim
  box(.36,.14,.36,0xd4b84a,0,2.08,0,g);
  m.arms.push(limb(.18,.65,.18,0xc49a6c,-.34,1.42,0,g),limb(.18,.65,.18,0xc49a6c,.34,1.42,0,g));
  m.legs.push(limb(.22,.7,.22,0x3d3d5c,-.12,.7,0,g),limb(.22,.7,.22,0x3d3d5c,.12,.7,0,g));
 }else{
  m.hp=10;m.w=.45;m.h=.9;m.spd=1.1;
  box(.55,.5,.9,0xf0a0a8,0,.6,0,g);box(.42,.4,.4,0xf0a0a8,0,.72,-.62,g);box(.22,.16,.1,0xdc8a94,0,.66,-.85,g);
  box(.06,.06,.02,0x111111,-.12,.78,-.83,g);box(.06,.06,.02,0x111111,.12,.78,-.83,g);
  for(const[px,pz]of[[-.17,-.3],[.17,-.3],[-.17,.3],[.17,.3]])m.legs.push(limb(.18,.35,.18,0xf0a0a8,px,.35,pz,g));
 }
 m.maxhp=m.hp;
 g.position.set(x,y,z);scene.add(g);return m;
}
function spawnMob(type,x,y,z){const m=makeMob(type,x,y,z);mobs.push(m);return m}
function removeMob(i){
 if(i<0)return;const m=mobs[i];scene.remove(m.g);
 m.g.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});mobs.splice(i,1);
}
// Brute zombies appear from day 3: bigger, tougher, hit harder, better drops
function bigify(m){m.big=true;m.hp=m.maxhp=45;m.dmg=5;m.w=.4;m.h=2.3;m.spd=3;m.g.scale.setScalar(1.3);m.g.traverse(o=>{if(o.isMesh)o.userData.base.multiplyScalar(.72)})}
function trySpawn(type){
 for(let t=0;t<6;t++){
  const a=Math.random()*Math.PI*2,r=(type==='z'||type==='k')?18+Math.random()*12:14+Math.random()*14,x=Math.floor(P.x+Math.cos(a)*r),z=Math.floor(P.z+Math.sin(a)*r);
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
 let nz=0;for(const m of mobs)if(m.type==='z'||m.type==='k')nz++;
 const np=mobs.length-nz,night=dayK<.32;
 const cap=(touch?3:5)+Math.min(4,Math.floor(clock/DAY));
 if(surv()&&dayK<.45&&!warned){warned=true;toast('Night is falling - build a shelter or grab a sword!',3200)}else if(dayK>.6)warned=false;
 if(surv()&&night&&nz<cap)trySpawn(Math.random()<.25?'k':'z');
 else if(!night&&np<8&&Math.random()<.6){const r=Math.random();trySpawn(r<.22?'p':r<.44?'c':r<.66?'s':r<.92?'h':'w')}
}
function nearestHostile(m,range){let b=null,bd=range;for(const o of mobs){if(o.type!=='z'&&o.type!=='k'||o.dead)continue;const d=Math.hypot(o.x-m.x,o.z-m.z);if(d<bd&&Math.abs(o.y-m.y)<3){bd=d;b=o}}return b}
function mobStrike(m,t,dmg){t.hp-=dmg;t.hurt=.4;const dx=t.x-m.x,dz=t.z-m.z,dd=Math.hypot(dx,dz)||1;t.vx=dx/dd*6;t.vz=dz/dd*6;t.vy=m.type==='g'?9:5;if(t.hp<=0)t.dead=true}
function updateMobs(dt){
 for(let i=mobs.length-1;i>=0;i--){
  const m=mobs[i],dx=P.x-m.x,dz=P.z-m.z,dist=Math.hypot(dx,dz)||.001;
  if(m.dead){spawnParticles(m.x,m.y+1,m.z,[.4,.4,.4],8);removeMob(i);continue}
  if(dist>80||(!surv()&&(m.type==='z'||m.type==='k'))){removeMob(i);continue}
  if(getBlock(Math.floor(m.x),Math.floor(m.y),Math.floor(m.z))===-1)continue;
  m.hurt=Math.max(0,m.hurt-dt);m.cd-=dt;
  if(m.baby&&m.grow!=null){m.grow-=dt;if(m.grow<=0){m.baby=false;m.g.scale.setScalar(1);m.hp=m.maxhp}}
  const ux=dx/dist,uz=dz/dist;let spd=0;
  if(m.type==='k'){
   if(dist<24&&dist>.9){m.dirx=ux;m.dirz=uz;spd=m.fuse>0?m.spd*.3:m.spd}else{m.dirx=m.dirz=0}
   if(dist<3&&Math.abs(P.y-m.y)<2.2&&!dead){if(m.fuse===0)playNoise(.9,.12,3500);m.fuse+=dt}
   else m.fuse=Math.max(0,m.fuse-dt*.6);
   const sw2=1+(m.fuse>0?Math.sin(m.fuse*30)*.08+m.fuse*.25:0);m.g.scale.set(sw2,sw2,sw2);
   if(m.fuse>=1.5){pendingBooms.push([m.x,m.y+.7,m.z,3,18]);removeMob(i);continue}
   m.burn=false;m.flash=m.fuse>0&&Math.floor(m.fuse*8)%2===0;
  }else if(m.type==='z'){
   let vt=null,vd=12;for(const o of mobs)if(o.type==='v'&&!o.dead){const d=Math.hypot(o.x-m.x,o.z-m.z);if(d<vd){vd=d;vt=o}}
   if(vt&&(vd<dist||dist>=26)){ // zombies go for villagers too
    const cx=vt.x-m.x,cz=vt.z-m.z,cd=Math.hypot(cx,cz)||1;m.dirx=cx/cd;m.dirz=cz/cd;spd=m.spd;
    if(cd<1.4&&m.cd<=0){mobStrike(m,vt,3);m.cd=1}
   }else if(dist<26&&dist>.9){m.dirx=ux;m.dirz=uz;spd=m.spd}else{m.dirx=m.dirz=0}
   // attack: short wind-up you can dodge or interrupt by hitting it, then a swipe
   if(m.stun>0)m.stun-=dt;
   if(m.wind>0){m.wind-=dt;if(m.wind<=0){if(dist<1.9&&Math.abs(P.y-m.y)<1.7&&!dead)damagePlayer(m.dmg,m.x,m.z);m.cd=1.0}}
   else if(dist<1.5&&Math.abs(P.y-m.y)<1.6&&m.cd<=0&&m.stun<=0&&!dead)m.wind=.42;
   if(m.wind>0||m.stun>0)m.dirx=m.dirz=0;
   m.burn=dayK>.5;
   if(m.burn){m.hp-=2.5*dt;if(m.hp<=0){spawnParticles(m.x,m.y+1,m.z,[.3,.3,.3],8);removeMob(i);continue}}
   m.gT-=dt;if(m.gT<=0){m.gT=4+Math.random()*5;if(dist<20)sfxGroan(.07*(1-dist/20))}
  }else if(m.type==='w'||m.type==='g'){
   m.wt-=dt;m.cd=m.cd||0;
   const gol=m.type==='g',tame=m.tamed;
   const tg=(gol||tame)?nearestHostile(m,gol?16:14):null;
   let chase=null;
   if(tg)chase=tg;
   if(chase){
    const cx=chase.x-m.x,cz=chase.z-m.z,cd=Math.hypot(cx,cz)||1;
    m.dirx=cx/cd;m.dirz=cz/cd;spd=m.spd*1.4;
    if(cd<(gol?2:1.5)&&m.cd<=0){mobStrike(m,chase,gol?m.dmg:4);m.cd=gol?1.2:1;if(gol)m.arms[0].rotation.x=-2}
   }else if(m.aggro&&!tame&&!gol){
    if(dist<20&&dist>.9){m.dirx=ux;m.dirz=uz;spd=m.spd*1.3}else{m.dirx=m.dirz=0}
    if(dist<1.4&&m.cd<=0&&!dead&&Math.abs(P.y-m.y)<1.6){damagePlayer(m.dmg,m.x,m.z);m.cd=1}
   }else if(tame){
    if(dist>26){m.x=P.x+Math.cos(Math.random()*6.28)*2;m.z=P.z+Math.sin(Math.random()*6.28)*2;m.y=P.y+1}
    if(dist>5){m.dirx=ux;m.dirz=uz;spd=dist>10?m.spd*1.5:m.spd}else{m.dirx=m.dirz=0}
   }else{
    if(m.wt<=0){m.wt=2+Math.random()*3;if(Math.random()<.4){m.dirx=m.dirz=0}else{const a=Math.random()*6.28;m.dirx=Math.cos(a);m.dirz=Math.sin(a)}}
    if(m.dirx||m.dirz)spd=m.spd*.7;
    if(gol&&m.home&&Math.hypot(m.x-m.home[0],m.z-m.home[2])>16){m.dirx=Math.sign(m.home[0]-m.x);m.dirz=Math.sign(m.home[2]-m.z);spd=m.spd}
   }
  }else if(m.type==='v'){
   m.wt-=dt;m.love=Math.max(0,(m.love||0)-dt);
   if(m.wt<=0){m.wt=2+Math.random()*3;if(Math.random()<.35){m.dirx=m.dirz=0}else{const a=Math.random()*6.28;m.dirx=Math.cos(a);m.dirz=Math.sin(a)}}
   if(m.dirx||m.dirz)spd=m.spd;
   // stay near home if set
   if(m.home&&Math.hypot(m.x-m.home[0],m.z-m.home[2])>14){m.dirx=Math.sign(m.home[0]-m.x);m.dirz=Math.sign(m.home[2]-m.z);spd=m.spd}
   const thr=nearestHostile(m,9);const fl=!!thr;
   if(thr){const fx=m.x-thr.x,fz=m.z-thr.z,fd=Math.hypot(fx,fz)||1;m.dirx=fx/fd;m.dirz=fz/fd;spd=m.spd*1.5}
   if(m.home&&!fl){
    const hd=Math.hypot(m.x-m.home[0],m.z-m.home[2]);
    if(dayK<.3){ // night: go home and stay put
     if(hd>1.2){const ux2=(m.home[0]-m.x)/hd,uz2=(m.home[2]-m.z)/hd;m.dirx=ux2;m.dirz=uz2;spd=m.spd}else{m.dirx=m.dirz=0;spd=0}
    }else if(m.prof==='farmer'){
     m.ft=(m.ft||0)-dt;
     if(m.ft<=0){ // look for ripe wheat near home
      m.ft=2.5;m.crop=null;let bd=99;
      const hx=Math.floor(m.home[0]),hy=Math.floor(m.home[1]),hz=Math.floor(m.home[2]);
      for(let x=hx-9;x<=hx+9;x++)for(let z=hz-9;z<=hz+9;z++)for(let y=hy-2;y<=hy+1;y++){
       if(getBlock(x,y,z)===32){const d=Math.hypot(x+.5-m.x,z+.5-m.z);if(d<bd){bd=d;m.crop=[x,y,z]}}
      }
     }
     if(m.crop){
      const[cx2,cy2,cz2]=m.crop,d=Math.hypot(cx2+.5-m.x,cz2+.5-m.z);
      if(getBlock(cx2,cy2,cz2)!==32)m.crop=null;
      else if(d<1.3){setBlock(cx2,cy2,cz2,30,true);spawnParticles(cx2+.5,cy2+.5,cz2+.5,[.85,.75,.3],6);m.crop=null;m.ft=1.2;m.dirx=m.dirz=0}
      else{m.dirx=(cx2+.5-m.x)/d;m.dirz=(cz2+.5-m.z)/d;spd=m.spd}
     }
    }
   }
  }else{
   m.wt-=dt;
   if(m.wt<=0){m.wt=2+Math.random()*4;if(Math.random()<.4){m.dirx=m.dirz=0}else{const a=Math.random()*6.28;m.dirx=Math.cos(a);m.dirz=Math.sin(a)}}
   if(m.flee>0){m.flee-=dt;m.dirx=-ux;m.dirz=-uz;spd=2.6}else if(m.dirx||m.dirz)spd=m.spd;
   m.gT-=dt;if(m.gT<=0){m.gT=6+Math.random()*8;if(dist<16)sfxOink()}
   // breeding hearts
   if(m.love>0){m.love-=dt;if(Math.random()<.05)spawnParticles(m.x,m.y+m.h,m.z,[1,.4,.6],2)}
  }
  const k=Math.min(1,dt*(m.onGround?8:2));
  if(m.hurt<.22){m.vx+=(m.dirx*spd-m.vx)*k;m.vz+=(m.dirz*spd-m.vz)*k}
  const inW=getBlock(Math.floor(m.x),Math.floor(m.y+.3),Math.floor(m.z))===9;
  if(inW)m.vy=Math.min(m.vy+22*dt-12*dt,2);else m.vy=Math.max(m.vy-28*dt,-30);
  if(m.wallPrev&&m.onGround&&spd>0)m.vy=7.5;
  if(m.type==='h'&&m.vy<-3)m.vy=-3; // chickens flutter down
  m.onGround=false;m.wall=false;
  for(let s=0;s<3;s++)stepBody(m,dt/3,m.w,m.h);
  m.wallPrev=m.wall;
  if(m.y<-30){removeMob(i);continue}
  const hs=Math.hypot(m.vx,m.vz);
  if(hs>.25){const ty=Math.atan2(-m.vx,-m.vz);let dy=ty-m.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));m.yaw+=dy*Math.min(1,dt*10)}
  m.ph+=hs*dt*4;
  const sw=Math.sin(m.ph)*Math.min(1,hs);
  if(m.type==='z'){m.legs[0].rotation.x=sw*.7;m.legs[1].rotation.x=-sw*.7;const ar=m.wind>0?2.4:1.45;m.arms[0].rotation.x=ar+Math.sin(m.ph*.5)*.08;m.arms[1].rotation.x=ar-Math.sin(m.ph*.5)*.08}
  else if(m.type==='w'){m.legs[0].rotation.x=m.legs[3].rotation.x=sw*.8;m.legs[1].rotation.x=m.legs[2].rotation.x=-sw*.8}
  else if(m.type==='g'){m.legs[0].rotation.x=sw*.5;m.legs[1].rotation.x=-sw*.5;m.arms[0].rotation.x*=.9;m.arms[1].rotation.x=-sw*.2}
  else if(m.type==='k'){m.legs[0].rotation.x=m.legs[3].rotation.x=sw*.7;m.legs[1].rotation.x=m.legs[2].rotation.x=-sw*.7}
  else if(m.type==='v'){m.legs[0].rotation.x=sw*.6;m.legs[1].rotation.x=-sw*.6;if(m.arms[0]){m.arms[0].rotation.x=sw*.3;m.arms[1].rotation.x=-sw*.3}}
  else{m.legs[0].rotation.x=m.legs[3].rotation.x=sw*.7;m.legs[1].rotation.x=m.legs[2].rotation.x=-sw*.7}
  m.g.position.set(m.x,m.y,m.z);m.g.rotation.y=m.yaw;
  const lm=Math.max(.35,L);
  m.g.traverse(o=>{
   if(!o.isMesh)return;const c=o.material.color;c.copy(o.userData.base).multiplyScalar(lm);
   if(m.flash)c.lerp(WHITE,.7);else if(m.hurt>0)c.lerp(RED,Math.min(1,m.hurt*3));else if(m.burn)c.lerp(ORANGE,.4+.25*Math.sin(clock*18));
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


// Feed passive mobs (wheat 34? seeds 33 for chickens-we use pigs/cows/sheep with wheat bread or seeds)
// Wheat item is harvested as bread ingredient; use seeds 33 or bread 34 or wheat-like: seeds work for all for simplicity
function feedMob(m){
 if(m&&m.type==='w'){
  if(m.tamed||!(inv[56]>0||!surv()))return false;
  if(surv())inv[56]--;
  if(Math.random()<.4){m.tamed=true;m.aggro=false;m.maxhp=20;m.hp=20;box(.32,.1,.32,0xcc2222,0,.72,-.3,m.g);spawnParticles(m.x,m.y+m.h,m.z,[1,.4,.5],10);toast('You tamed the wolf!',1500);vib(30)}
  else{spawnParticles(m.x,m.y+m.h,m.z,[.6,.6,.6],5);toast('The wolf is not convinced...',900)}
  return true;
 }
 if(!m||m.type==='z'||m.type==='v'||m.type==='k'||m.type==='g')return false;
 const id=HB[si];
 if(id!==33&&id!==34&&id!==35)return false;
 if(surv()&&inv[id]<=0)return false;
 if(surv()){inv[id]--;renderSlots()}
 m.love=8;
 spawnParticles(m.x,m.y+m.h,m.z,[1,.45,.7],6);
 // find nearby loved mate
 for(const o of mobs){
  if(o===m||o.type!==m.type||(o.love||0)<=0)continue;
  if(Math.hypot(o.x-m.x,o.z-m.z)<3.5){
   m.love=0;o.love=0;
   const baby=makeMob(m.type,(m.x+o.x)/2,m.y,(m.z+o.z)/2);
   baby.hp=Math.max(4,m.hp/2);baby.maxhp=baby.hp;baby.g.scale.setScalar(.55);
   baby.baby=true;baby.grow=120; // seconds to adult
   mobs.push(baby);
   toast('A baby was born!',1400);vib(20);
   return true;
  }
 }
 toast('In love!',800);
 return true;
}
