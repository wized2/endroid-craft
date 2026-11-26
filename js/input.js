// input.js - pointer lock, keyboard, mouse, touch joystick/look, menu buttons
// ---------- input ----------
let running=false,started=false;
const menu=$('#menu'),playBtn=$('#play');
function setRunning(v,showMenu=true){
 running=v;menu.style.display=(v||!showMenu)?'none':'flex';
 if(!v){held.brk=false;flyDown=false;for(const k in K)K[k]=false;joy.fx=joy.fy=0}else initAudio();
}
addEventListener('keydown',e=>{
 if(e.target&&/^(TEXTAREA|INPUT)$/.test(e.target.tagName))return; // typing in the script console
 initAudio();
 if(e.code==='Escape'&&craftOpen){closeCraft();return}
 if(e.code==='KeyF'&&!e.repeat&&started){startEat();return}
 if((e.code==='F5'||e.code==='KeyV')&&!e.repeat&&started){e.preventDefault();cycleView();return}
 if(e.code==='KeyE'&&!e.repeat&&started){if(craftOpen)closeCraft();else if(running)openCraft();return}
 if(e.code==='KeyQ'&&!e.repeat&&started&&running){dropHeld();return}
 K[e.code]=true;
 if(/^Digit[0-9]$/.test(e.code)){const n=+e.code.slice(5);sel(n===0?9:n-1)}
 if(e.code==='Minus')sel(10);
 if(e.code==='Space'&&!e.repeat&&running)tapSpace();
 if(e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{if(e.target&&/^(TEXTAREA|INPUT)$/.test(e.target.tagName))return;K[e.code]=false});
addEventListener('wheel',e=>{if(running)sel(si+(e.deltaY>0?1:-1))},{passive:true});
addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('mousedown',e=>{
 initAudio();if(!running)return;
 if(e.button===0){
  held.brk=true;mineCd=0;atkCd=0;
  if(!surv())creativeBreakOnce(); // creative: break on click, not only while held across frames
 }else if(e.button===2)doPlace();
 else if(e.button===1){e.preventDefault();pickBlock()} // middle-click pick block
});
addEventListener('mouseup',e=>{if(e.button===0)held.brk=false});
addEventListener('mousemove',e=>{
 if(!running||touch||document.pointerLockElement!==renderer.domElement)return;
 yaw-=e.movementX*.0022*SET.sens;pitch=Math.max(-1.55,Math.min(1.55,pitch-e.movementY*.0022*SET.sens));
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
function setMode(m){
 mode=m;applyMode();
 if(!surv()){for(const id of HB)inv[id]=Math.max(inv[id],64);for(let i=1;i<=17;i++)if(i!==9)inv[i]=Math.max(inv[i]|0,64)}
 sel(si);dirtySave=true;toast(m==='survival'?'Survival mode':'Creative mode — middle-click / long-press PLACE to pick blocks',2200)
}
$('#mSurv').addEventListener('click',()=>setMode('survival'));
$('#mCre').addEventListener('click',()=>setMode('creative'));
$('#respawn').addEventListener('click',respawn);
let saveOff=false;
$('#seedCur').textContent=String(SEEDL);
$('#seedCopy').addEventListener('click',()=>{try{navigator.clipboard.writeText(String(SEEDL));toast('Seed copied',1200)}catch(e){toast('Seed: '+SEEDL,3000)}});
$('#reset').addEventListener('click',()=>{
 if(!confirm('Delete your saved world and start a new one?'))return;
 try{localStorage.removeItem(SAVEKEY);localStorage.setItem('endroid-craft-nextseed',$('#seedIn').value)}catch(e){}
 saveOff=true;location.reload();
});
makeTouchBtn($('#pause'),()=>{if(running){setRunning(false);playBtn.textContent='Resume'}});
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
  else if(el&&(el.closest('.ctl')||el.closest('#bar')||el.closest('#ai-lab'))){}
  else if(running&&lookId===null){lookId=t.identifier;lx0=t.clientX;ly0=t.clientY}
 }
 const isCtl=e.target&&e.target.closest&&(e.target.closest('.ctl')||e.target.closest('#bar')||e.target.closest('#ai-lab'));
 if(running&&!isCtl)e.preventDefault();
},{passive:false});
addEventListener('touchmove',e=>{
 for(const t of e.changedTouches){
  if(t.identifier===joyId)updJoy(t);
  else if(t.identifier===lookId){yaw-=(t.clientX-lx0)*.0055*SET.sens;pitch=Math.max(-1.55,Math.min(1.55,pitch-(t.clientY-ly0)*.0055*SET.sens));lx0=t.clientX;ly0=t.clientY}
 }
 if(running&&!(e.target&&e.target.closest&&e.target.closest('#ai-lab')))e.preventDefault();
},{passive:false});
function tend(e){for(const t of e.changedTouches){if(t.identifier===joyId){joyId=null;joy.fx=joy.fy=0;kn.style.transform=''}if(t.identifier===lookId)lookId=null}}
addEventListener('touchend',tend);addEventListener('touchcancel',tend);
bind('#bJump',()=>{K.Space=true;tapSpace()},()=>{K.Space=false});
bind('#bDown',()=>{flyDown=true},()=>{flyDown=false});
bind('#bBreak',()=>{held.brk=true;mineCd=0;atkCd=0;if(!surv())creativeBreakOnce()},()=>{held.brk=false});
makeTouchBtn($('#palBtn'),()=>{if(started)setRunning(true);openPalette()});
makeTouchBtn($('#palClose'),()=>closePalette());

(function(){
 let placeTimer=0;
 bind('#bPlace',()=>{
  if(surv()){doPlace();return}
  clearTimeout(placeTimer);
  placeTimer=setTimeout(()=>{placeTimer=0;pickBlock()},450);
 },()=>{
  if(!surv()&&placeTimer){clearTimeout(placeTimer);placeTimer=0;doPlace()}
 });
})();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});


// Creative block palette (phone-friendly)
const PLACEABLE=[1,2,3,4,5,6,7,8,10,11,12,13,14,15,16,17,26,29,30,32,33,38,39,40,41,44,45,48,49,50,51,57];
function buildPalette(){
 const g=$('#palGrid');if(!g)return;g.innerHTML='';
 for(const id of PLACEABLE){
  const b=document.createElement('button');
  b.style.backgroundImage='url('+icon(id)+')';
  b.title=NAMES[id]||('#'+id);
  b.className=HB[si]===id?'sel':'';
  makeTouchBtn(b,()=>{
   let idx=HB.indexOf(id);
   if(idx<0){HB[si]=id;idx=si;const slots=bar.children;if(slots[si])slots[si].querySelector('i').style.backgroundImage='url('+icon(id)+')'}
   if(!surv())inv[id]=Math.max(inv[id]|0,64);
   sel(idx);closePalette();
  });
  g.appendChild(b);
 }
}
function openPalette(){if(surv())return;buildPalette();$('#palette').classList.add('open')}
function closePalette(){$('#palette').classList.remove('open')}
function togglePalette(){if($('#palette').classList.contains('open'))closePalette();else openPalette()}

// Hotbar swipe to change slot (touch)
(function(){
 const el=$('#bar');if(!el)return;
 let x0=0,i0=0,active=false;
 el.addEventListener('touchstart',e=>{if(!e.changedTouches[0])return;active=true;x0=e.changedTouches[0].clientX;i0=si},{passive:true});
 el.addEventListener('touchmove',e=>{
  if(!active||!e.changedTouches[0])return;
  const dx=e.changedTouches[0].clientX-x0;
  if(Math.abs(dx)>28){const n=i0+(dx>0?-1:1);sel(n);x0=e.changedTouches[0].clientX;i0=si;vib(6)}
 },{passive:true});
 el.addEventListener('touchend',()=>{active=false});
})();

// Pause when app backgrounded (phones)
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){setRunning(false);toast('Paused',900)}});

makeTouchBtn($('#tradeClose'),()=>{closeTrade();if(started)setRunning(true)});

makeTouchBtn($('#furnClose'),()=>{closeFurnace();if(started)setRunning(true)});
makeTouchBtn($('#furnFeed'),()=>furnFeed());
makeTouchBtn($('#furnTake'),()=>furnTake());
makeTouchBtn($('#chestClose'),()=>{closeChest();if(started)setRunning(true)});
makeTouchBtn($('#chestDep'),()=>chestDeposit());
