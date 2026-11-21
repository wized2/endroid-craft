// touch.js - touch/mouse button helper + fullscreen
function makeTouchBtn(el,onDown,onUp){
 if(!el)return;
 // a tap fires touchstart AND an emulated mousedown/mouseup ~300ms later; ignore the emulated ones
 let lastTouch=-1e9;
 const emu=()=>performance.now()-lastTouch<800;
 el.addEventListener('touchstart',e=>{lastTouch=performance.now();e.stopPropagation();initAudio();if(onDown)onDown()},{passive:true});
 if(onUp){el.addEventListener('touchend',e=>{lastTouch=performance.now();e.stopPropagation();onUp()},{passive:true});el.addEventListener('touchcancel',e=>{lastTouch=performance.now();e.stopPropagation();onUp()},{passive:true})}
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
