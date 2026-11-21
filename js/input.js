// input.js - pointer lock, keyboard, mouse, touch joystick/look, menu buttons
// ---------- input ----------
let running=false,started=false;
const menu=$('#menu'),playBtn=$('#play');
function setRunning(v,showMenu=true){
 running=v;menu.style.display=(v||!showMenu)?'none':'flex';
 if(!v){held.brk=false;flyDown=false;for(const k in K)K[k]=false;joy.fx=joy.fy=0}else initAudio();
}
addEventListener('keydown',e=>{
 initAudio();
 if(e.code==='Escape'&&craftOpen){closeCraft();return}
 if(e.code==='KeyE'&&!e.repeat&&started){if(craftOpen)closeCraft();else if(running)openCraft();return}
 K[e.code]=true;
 if(/^Digit[0-9]$/.test(e.code)){const n=+e.code.slice(5);sel(n===0?9:n-1)}
 if(e.code==='Space'&&!e.repeat&&running)tapSpace();
 if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{K[e.code]=false});
addEventListener('wheel',e=>{if(running)sel(si+(e.deltaY>0?1:-1))},{passive:true});
addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('mousedown',e=>{
 initAudio();if(!running)return;
 if(e.button===0){held.brk=true;mineCd=0;atkCd=0}else if(e.button===2)doPlace();
});
addEventListener('mouseup',e=>{if(e.button===0)held.brk=false});
addEventListener('mousemove',e=>{
 if(!running||touch||document.pointerLockElement!==renderer.domElement)return;
 yaw-=e.movementX*.0022;pitch=Math.max(-1.55,Math.min(1.55,pitch-e.movementY*.0022));
});
document.addEventListener('pointerlockchange',()=>{
 if(touch)return;
 const locked=document.pointerLockElement===renderer.domElement;
 if(locked){if(!craftOpen&&!dead&&started)setRunning(true)}
 else if(craftOpen||dead)setRunning(false,false);
 else if(started&&running)setRunning(false,true);
});
playBtn.addEventListener('click',()=>{
 initAudio();started=true;enterFullscreenAuto();
 if(touch)setRunning(true);else renderer.domElement.requestPointerLock();
});
function setMode(m){mode=m;applyMode();sel(si);dirtySave=true;toast(m==='survival'?'Survival mode':'Creative mode',1200)}
$('#mSurv').addEventListener('click',()=>setMode('survival'));
$('#mCre').addEventListener('click',()=>setMode('creative'));
$('#respawn').addEventListener('click',respawn);
let saveOff=false;
$('#reset').addEventListener('click',()=>{if(confirm('Delete your saved world and start a new one?')){try{localStorage.removeItem(SAVEKEY)}catch(e){}saveOff=true;location.reload()}});
makeTouchBtn($('#pause'),()=>{setRunning(false);playBtn.textContent='Resume'});
makeTouchBtn($('#fs'),()=>toggleFullscreen());
// touch controls
let joyId=null,lookId=null,lx0=0,ly0=0;
const jEl=$('#joy'),kn=$('#knob');
function updJoy(t){
 const r=jEl.getBoundingClientRect(),mx=r.width/2,dx=t.clientX-(r.left+mx),dy=t.clientY-(r.top+r.height/2);
 const m=Math.min(1,Math.hypot(dx,dy)/mx),a=Math.atan2(dy,dx),mm=m<.15?0:m;
 joy.fx=Math.cos(a)*mm;joy.fy=-Math.sin(a)*mm;
 kn.style.transform='translate('+Math.cos(a)*m*mx*.7+'px,'+Math.sin(a)*m*mx*.7+'px)';
}
addEventListener('touchstart',e=>{
 initAudio();
 for(const t of e.changedTouches){
  const el=t.target&&t.target.closest?t.target:null;
  if(el&&el.closest('#joy')){joyId=t.identifier;updJoy(t)}
  else if(el&&(el.closest('.ctl')||el.closest('#bar'))){}
  else if(running&&lookId===null){lookId=t.identifier;lx0=t.clientX;ly0=t.clientY}
 }
 const isCtl=e.target&&e.target.closest&&(e.target.closest('.ctl')||e.target.closest('#bar'));
 if(running&&!isCtl)e.preventDefault();
},{passive:false});
addEventListener('touchmove',e=>{
 for(const t of e.changedTouches){
  if(t.identifier===joyId)updJoy(t);
  else if(t.identifier===lookId){yaw-=(t.clientX-lx0)*.0055;pitch=Math.max(-1.55,Math.min(1.55,pitch-(t.clientY-ly0)*.0055));lx0=t.clientX;ly0=t.clientY}
 }
 if(running)e.preventDefault();
},{passive:false});
function tend(e){for(const t of e.changedTouches){if(t.identifier===joyId){joyId=null;joy.fx=joy.fy=0;kn.style.transform=''}if(t.identifier===lookId)lookId=null}}
addEventListener('touchend',tend);addEventListener('touchcancel',tend);
bind('#bJump',()=>{K.Space=true;tapSpace()},()=>{K.Space=false});
bind('#bDown',()=>{flyDown=true},()=>{flyDown=false});
bind('#bBreak',()=>{held.brk=true;mineCd=0;atkCd=0},()=>{held.brk=false});
bind('#bPlace',()=>doPlace());
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});

