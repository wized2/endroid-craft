// scripting.js - in-game Script Console: run JS build scripts, templates, saved presets.
// Open with the </> button or the ` key. Script API (all inside an async function):
//   player() -> {x,y,z}      setBlock(x,y,z,id)     getB(x,y,z)
//   fill(x1,y1,z1,x2,y2,z2,id)   tp(x,y,z)          await delay(ms)     log(text)
const PRESETKEY='endroid-craft-presets';
let scrRunning=false,scrAbort=false;
const scrPanel=$('#scr-panel'),scrText=$('#scr-textarea'),scrStatus=$('#scr-status'),scrRun=$('#scr-run'),scrStop=$('#scr-stop'),
 scrClose=$('#scr-close'),scrProg=$('#scr-progress'),scrProgBar=$('#scr-progress-bar'),scrPresets=$('#scr-presets');

function openScr(){
 if(!started)return;
 scrPanel.classList.add('open');
 if(document.pointerLockElement)document.exitPointerLock();
 if(running){setRunning(false,false)}
}
function closeScr(){
 scrPanel.classList.remove('open');
 if(started&&!craftOpen){if(touch)setRunning(true);else{setRunning(false);playBtn.textContent='Resume'}}
}
makeTouchBtn($('#scr-btn'),()=>scrPanel.classList.contains('open')?closeScr():openScr());
makeTouchBtn($('#scr-menu'),openScr);
makeTouchBtn(scrClose,closeScr);
addEventListener('keydown',e=>{
 if(e.code==='Backquote'&&!(e.target&&e.target.tagName==='TEXTAREA')){e.preventDefault();scrPanel.classList.contains('open')?closeScr():openScr()}
 else if(e.code==='Escape'&&scrPanel.classList.contains('open')){closeScr()}
});

// ----- templates -----
$('#scr-examples').addEventListener('click',e=>{
 const tpl=e.target.closest('[data-tpl]');if(!tpl)return;
 const k=tpl.dataset.tpl;
 if(k==='clear'){scrText.value='';scrStatus.textContent='Editor cleared.';return}
 if(TEMPLATES[k]){scrText.value=TEMPLATES[k];scrStatus.textContent='Template loaded - press Run.'}
});

// ----- saved presets (localStorage) -----
function loadPresets(){try{return JSON.parse(localStorage.getItem(PRESETKEY))||{}}catch(e){return {}}}
function storePresets(p){try{localStorage.setItem(PRESETKEY,JSON.stringify(p))}catch(e){}}
function renderPresets(){
 const p=loadPresets(),names=Object.keys(p);
 scrPresets.innerHTML='';
 for(const n of names){
  const c=document.createElement('span');c.className='chip';
  const b=document.createElement('button');b.textContent=n;b.dataset.load=n;
  const x=document.createElement('button');x.className='x';x.dataset.del=n;x.innerHTML=ico('x',12);
  c.append(b,x);scrPresets.appendChild(c);
 }
}
scrPresets.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const p=loadPresets();
 if(b.dataset.load&&p[b.dataset.load]!==undefined){scrText.value=p[b.dataset.load];scrStatus.textContent='Loaded preset "'+b.dataset.load+'".'}
 else if(b.dataset.del){delete p[b.dataset.del];storePresets(p);renderPresets();scrStatus.textContent='Preset deleted.'}
});
$('#scr-save').addEventListener('click',()=>{
 const code=scrText.value.trim();if(!code){scrStatus.textContent='Nothing to save.';return}
 const n=(prompt('Preset name:','')||'').trim().slice(0,24);if(!n)return;
 const p=loadPresets();p[n]=code;storePresets(p);renderPresets();scrStatus.textContent='Saved preset "'+n+'".';
});
renderPresets();

// ----- runner -----
function scrLog(m){scrStatus.textContent+='\n'+String(m);scrStatus.scrollTop=scrStatus.scrollHeight}
const scrDelay=ms=>new Promise(r=>setTimeout(r,Math.max(0,ms||0)));
function scrAbortCheck(){if(scrAbort)throw new Error('Script stopped by user.')}
async function runScript(code){
 if(!code){scrStatus.textContent='Write or load a script first.';return}
 scrRunning=true;scrAbort=false;
 scrRun.style.display='none';scrStop.style.display='inline-flex';
 scrStatus.textContent='Running...';scrProg.style.display='block';scrProgBar.style.width='0%';
 let pct=0;const timer=setInterval(()=>{pct=Math.min(pct+2,90);scrProgBar.style.width=pct+'%';flushChunks()},120);
 let ops=0;
 const sb=(x,y,z,id)=>{scrAbortCheck();setBlock(Math.round(x),Math.round(y),Math.round(z),id|0,true);if(++ops%400===0)flushChunks()};
 try{
  const fn=new Function('setBlock','player','getB','delay','log','fill','tp','"use strict";return (async()=>{\n'+code+'\n})();');
  await fn(
   sb,
   ()=>({x:Math.floor(P.x),y:Math.floor(P.y),z:Math.floor(P.z)}),
   (x,y,z)=>getBlock(Math.round(x),Math.round(y),Math.round(z)),
   async ms=>{scrAbortCheck();flushChunks();await scrDelay(ms);scrAbortCheck()},
   scrLog,
   (x1,y1,z1,x2,y2,z2,id)=>{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let z=Math.min(z1,z2);z<=Math.max(z1,z2);z++)sb(x,y,z,id)},
   (x,y,z)=>{P.x=x+.5;P.y=y;P.z=z+.5;P.vx=P.vy=P.vz=0;fallY=P.y}
  );
  scrProgBar.style.width='100%';scrStatus.textContent+='\nScript finished.';
 }catch(err){
  scrProgBar.style.width='0%';
  scrStatus.textContent+='\n'+(err.message==='Script stopped by user.'?'Stopped.':'Error: '+err.message);
 }finally{
  clearInterval(timer);flushChunks();dirtySave=true;
  setTimeout(()=>{scrProg.style.display='none';scrProgBar.style.width='0%'},800);
  scrRun.style.display='inline-flex';scrStop.style.display='none';scrRunning=false;scrAbort=false;
 }
}
makeTouchBtn(scrRun,()=>{if(!scrRunning)runScript(scrText.value.trim())});
makeTouchBtn(scrStop,()=>{if(scrRunning)scrAbort=true});
scrText.addEventListener('keydown',e=>{
 if(e.key==='Tab'){e.preventDefault();const s=scrText.selectionStart,v=scrText.value;scrText.value=v.slice(0,s)+'  '+v.slice(scrText.selectionEnd);scrText.selectionStart=scrText.selectionEnd=s+2}
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();if(!scrRunning)runScript(scrText.value.trim())}
});
