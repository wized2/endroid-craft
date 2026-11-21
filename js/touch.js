// touch.js - touch/mouse button helper + fullscreen
function makeTouchBtn(el,onDown,onUp){
 if(!el)return;
 el.addEventListener('touchstart',e=>{e.stopPropagation();initAudio();if(onDown)onDown()},{passive:true});
 if(onUp){el.addEventListener('touchend',e=>{e.stopPropagation();onUp()},{passive:true});el.addEventListener('touchcancel',e=>{e.stopPropagation();onUp()},{passive:true})}
 el.addEventListener('mousedown',e=>{if(e.button===0){e.stopPropagation();initAudio();if(onDown)onDown()}});
 if(onUp){el.addEventListener('mouseup',e=>{e.stopPropagation();onUp()});el.addEventListener('mouseleave',()=>onUp())}
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
