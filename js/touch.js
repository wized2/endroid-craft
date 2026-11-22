// touch.js - touch/mouse button helper + fullscreen
// A tap on a game button fires touchstart, then touchend, then an emulated mousedown/mouseup/click ~300ms later.
// Buttons act on touchstart, so we swallow the emulated events (otherwise toggles fire twice, and the click can
// land on a panel that just opened under the finger).
let lastTouchAny=-1e9,eatFlag=false,eatUntil=0;
addEventListener('touchstart',()=>{lastTouchAny=performance.now()},{capture:true,passive:true});
addEventListener('touchend',()=>{const n=performance.now();lastTouchAny=n;if(eatFlag){eatFlag=false;eatUntil=n+700}},{capture:true,passive:true});
addEventListener('touchcancel',()=>{eatFlag=false},{capture:true,passive:true});
for(const t of['mousedown','mouseup','click'])addEventListener(t,e=>{if(performance.now()<eatUntil){e.stopPropagation();e.preventDefault()}},true);
function makeTouchBtn(el,onDown,onUp){
 if(!el)return;
 const emu=()=>performance.now()-lastTouchAny<1000;
 el.addEventListener('touchstart',e=>{eatFlag=true;e.stopPropagation();initAudio();if(onDown)onDown()},{passive:true});
 if(onUp){el.addEventListener('touchend',e=>{e.stopPropagation();onUp()},{passive:true});el.addEventListener('touchcancel',e=>{e.stopPropagation();onUp()},{passive:true})}
 el.addEventListener('mousedown',e=>{if(e.button===0&&!emu()){e.stopPropagation();initAudio();if(onDown)onDown()}});
 if(onUp){el.addEventListener('mouseup',e=>{if(!emu()){e.stopPropagation();onUp()}});el.addEventListener('mouseleave',()=>{if(!emu())onUp()})}
}
const bind=(id,down,up)=>makeTouchBtn($(id),down,up);
function enterFullscreenAuto(){
 const el=document.documentElement;
 if(!document.fullscreenElement&&!document.webkitFullscreenElement){
  if(el.requestFullscreen)el.requestFullscreen().catch(()=>{});else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
 }
}
function toggleFullscreen(){
 if(!document.fullscreenElement&&!document.webkitFullscreenElement)enterFullscreenAuto();
 else if(document.exitFullscreen)document.exitFullscreen().catch(()=>{});else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
}
