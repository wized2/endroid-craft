// playermodel.js - the player character (blocky, original design) + camera views.
// view 0 = first person, 1 = third person (behind), 2 = third person (front). Toggle: F5 / V / the person button.
const eye=new THREE.Vector3();
let view=0;
try{view=+localStorage.getItem('endroid-craft-view')||0}catch(e){}
const SKIN=0xe2b48c,HAIR=0x4a2f1d,SHIRT=0x2e9c8f,PANTS=0x3b3f8c,SHOES=0x2a2a2a;
const pm={g:new THREE.Group(),head:null,armL:null,armR:null,legL:null,legR:null,yaw:0,ph:0};
(function(){
 const g=pm.g;
 box(.5,.75,.25,SHIRT,0,1.125,0,g);                       // torso
 pm.head=new THREE.Group();pm.head.position.set(0,1.5,0);g.add(pm.head);
 box(.5,.5,.5,SKIN,0,.25,0,pm.head);                      // head
 box(.52,.14,.52,HAIR,0,.5,0,pm.head);box(.52,.3,.1,HAIR,0,.33,.21,pm.head); // hair cap + back
 box(.1,.1,.03,0xffffff,-.12,.27,-.255,pm.head);box(.1,.1,.03,0xffffff,.12,.27,-.255,pm.head);
 box(.05,.07,.035,0x24324a,-.12,.27,-.27,pm.head);box(.05,.07,.035,0x24324a,.12,.27,-.27,pm.head);
 pm.armL=limb(.2,.7,.2,SKIN,-.35,1.47,0,g);pm.armR=limb(.2,.7,.2,SKIN,.35,1.47,0,g);
 box(.22,.3,.22,SHIRT,0,-.15,0,pm.armL);box(.22,.3,.22,SHIRT,0,-.15,0,pm.armR);  // sleeves
 pm.legL=limb(.24,.75,.24,PANTS,-.13,.75,0,g);pm.legR=limb(.24,.75,.24,PANTS,.13,.75,0,g);
 box(.26,.12,.28,SHOES,0,-.69,-.02,pm.legL);box(.26,.12,.28,SHOES,0,-.69,-.02,pm.legR);
 g.visible=false;scene.add(g);
})();
function setView(v){
 view=((v%3)+3)%3;
 try{localStorage.setItem('endroid-craft-view',view)}catch(e){}
 toast(['First person','Third person','Third person (front)'][view],900);
}
// called every frame after yaw/pitch/P are updated; places the camera and animates the model
function placeCamera(dt){
 eye.set(P.x,P.y+EYE+bob,P.z);
 camera.position.copy(eye);camera.rotation.set(pitch,yaw,0);camera.updateMatrixWorld();
 camera.getWorldDirection(dir);
 if(view>0){
  const sgn=view===1?-1:1;let d=3.6;
  for(let t=.3;t<=3.6;t+=.2){
   const x=eye.x+dir.x*t*sgn,y=eye.y+dir.y*t*sgn,z=eye.z+dir.z*t*sgn;
   if(solidB(getBlock(Math.floor(x),Math.floor(y),Math.floor(z)))){d=Math.max(.4,t-.35);break}
  }
  camera.position.set(eye.x+dir.x*d*sgn,eye.y+dir.y*d*sgn,eye.z+dir.z*d*sgn);
  if(view===2)camera.lookAt(eye);
  camera.updateMatrixWorld();
 }
 handGroup.visible=view===0;
 pm.g.visible=view>0&&!dead;
 if(!pm.g.visible)return;
 // body turns toward where you look (shortest way round), head follows pitch
 let dy=yaw-pm.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));pm.yaw+=dy*Math.min(1,dt*14);
 pm.g.position.set(P.x,P.y,P.z);pm.g.rotation.y=pm.yaw;
 pm.head.rotation.x=Math.max(-1,Math.min(1,pitch));pm.head.rotation.y=Math.max(-.7,Math.min(.7,yaw-pm.yaw));
 const hsp=Math.hypot(P.vx,P.vz),mv=P.onGround&&hsp>.3;
 const sw=mv?Math.sin(walkClock)*Math.min(1,hsp/4)*.95:0;
 pm.ph+=(sw-pm.ph)*Math.min(1,dt*18);
 pm.legL.rotation.x=pm.ph;pm.legR.rotation.x=-pm.ph;
 pm.armL.rotation.x=-pm.ph*.8;
 const arc=Math.sin(swing*Math.PI);
 pm.armR.rotation.x=pm.ph*.8-arc*1.7;
 if(!P.onGround&&!inWater&&!fly){pm.armL.rotation.z=-.5;pm.armR.rotation.z=.5}else{pm.armL.rotation.z=0;pm.armR.rotation.z=0}
 // light like the mobs
 const lm=Math.max(.4,L);
 pm.g.traverse(o=>{if(o.isMesh)o.material.color.copy(o.userData.base).multiplyScalar(lm)});
}
function cycleView(){setView(view+1)}
makeTouchBtn($('#viewBtn'),cycleView);
