// scripting.js - in-game Script Console: run JS build scripts, templates, saved presets.
// Extra helpers: site(r) finds a flat, dry, tree-free spot ahead and levels it; facing() -> {x,z} unit direction.
// Open with the </> button or the ` key. Script API (all inside an async function):
//   player() -> {x,y,z}      setBlock(x,y,z,id)     getB(x,y,z)
//   fill(x1,y1,z1,x2,y2,z2,id)   tp(x,y,z)          await delay(ms)     log(text)
const PRESETKEY='endroid-craft-presets';
let scrRunning=false,scrAbort=false;
const scrPanel=$('#scr-panel'),scrText=$('#scr-textarea'),scrStatus=$('#scr-status'),scrRun=$('#scr-run'),scrStop=$('#scr-stop'),
 scrClose=$('#scr-close'),scrProg=$('#scr-progress'),scrProgBar=$('#scr-progress-bar'),scrPresets=$('#scr-presets');

function openScr(){
 if(!started)return;
 if(surv()){toast('Script console is creative-only',1500);return}
 scrPanel.classList.add('open');
 if(document.pointerLockElement)document.exitPointerLock();
 if(running){setRunning(false,false)}
}
function closeScr(){
 scrPanel.classList.remove('open');
 if(started&&!craftOpen){if(touch)setRunning(true);else{setRunning(false);playBtn.textContent='Resume'}}
}
makeTouchBtn($('#scr-menu'),openScr);
makeTouchBtn(scrClose,closeScr);
addEventListener('keydown',e=>{
 if(e.code==='Backquote'&&surv()&&!scrPanel.classList.contains('open'))return;
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

// ----- build-site finder: flat, dry, tree-free spot ahead of the player -----
const clearable=b=>b===4||b===5||b===14||b===15||b===16;
function groundYAt(x,z){for(let y=H-1;y>0;y--){const b=getBlock(x,y,z);if(b===-1)return -1;if(b===9)return -2;if(b!==0&&!clearable(b))return y}return -1}
function facingDir(){const fx=-Math.sin(yaw),fz=-Math.cos(yaw);return Math.abs(fx)>Math.abs(fz)?{x:Math.sign(fx),z:0}:{x:0,z:Math.sign(fz)}}
function siteFree(cx,cz,r){
 let lo=1e9,hi=-1e9;
 for(let dx=-r-1;dx<=r+1;dx+=2)for(let dz=-r-1;dz<=r+1;dz+=2){
  const g=groundYAt(cx+dx,cz+dz);if(g<SEA+1)return null;
  if(g<lo)lo=g;if(g>hi)hi=g;if(hi-lo>2)return null;
 }
 return hi;
}
function findSite(r,sb){
 const f=facingDir(),px=Math.floor(P.x),pz=Math.floor(P.z),c=[];
 for(let d=r+3;d<=r+45;d+=2)for(let l=-30;l<=30;l+=3)c.push([d,l,d+Math.abs(l)*.9]);
 c.sort((a,b)=>a[2]-b[2]);
 let best=null,top=0;
 for(const[d,l]of c){
  const cx=px+f.x*d+f.z*l,cz=pz+f.z*d-f.x*l,h=siteFree(cx,cz,r);
  if(h!==null){best=[cx,cz];top=h;break}
 }
 let ok=true;
 if(!best){ok=false;const d=r+3;best=[px+f.x*d,pz+f.z*d];top=Math.max(groundYAt(best[0],best[1]),SEA+1)}
 const[cx,cz]=best;
 // clear trees/plants (footprint + 1 margin) and level the footprint up to the highest ground
 for(let dx=-r-1;dx<=r+1;dx++)for(let dz=-r-1;dz<=r+1;dz++){
  const x=cx+dx,z=cz+dz,g=groundYAt(x,z);if(g<0)continue;
  for(let y=g+1;y<=g+18;y++)if(clearable(getBlock(x,y,z)))sb(x,y,z,0);
  if(Math.abs(dx)<=r&&Math.abs(dz)<=r&&g<top){for(let y=g+1;y<top;y++)sb(x,y,z,2);sb(x,top,z,1)}
 }
 return{x:cx,y:top+1,z:cz,ok};
}

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
 let ops=0;const hist=[];
 const speed=+($('#scr-speed')||{value:1}).value;let dl=0;
 const sb=(x,y,z,id)=>{scrAbortCheck();x=Math.round(x);y=Math.round(y);z=Math.round(z);id|=0;
  const old=getBlock(x,y,z);if(old===-1)return;
  if(old!==id&&hist.length<300000)hist.push(x,y,z,old);
  setBlock(x,y,z,id,true);if(++ops%400===0)flushChunks()};
 lastRun=hist;
 try{
  const fn=new Function('setBlock','player','getB','delay','log','fill','tp','site','facing','"use strict";return (async()=>{\n'+code+'\n})();');
  await fn(
   sb,
   ()=>({x:Math.floor(P.x),y:Math.floor(P.y),z:Math.floor(P.z)}),
   (x,y,z)=>getBlock(Math.round(x),Math.round(y),Math.round(z)),
   async ms=>{scrAbortCheck();flushChunks();if(speed===0){if(++dl%25===0)await scrDelay(0)}else await scrDelay(ms*speed);scrAbortCheck()},
   scrLog,
   (x1,y1,z1,x2,y2,z2,id)=>{for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let z=Math.min(z1,z2);z<=Math.max(z1,z2);z++)sb(x,y,z,id)},
   (x,y,z)=>{P.x=x+.5;P.y=y;P.z=z+.5;P.vx=P.vy=P.vz=0;fallY=P.y},
   (r=5)=>{const s=findSite(Math.max(1,Math.min(14,r|0)),sb);if(!s.ok)scrLog('No flat dry spot nearby - building right ahead of you.');return{x:s.x,y:s.y,z:s.z}},
   facingDir
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
let lastRun=[];
$('#scr-undo').addEventListener('click',()=>{
 if(scrRunning){scrStatus.textContent+='\nStop the script first.';return}
 if(!lastRun.length){scrStatus.textContent='Nothing to undo.';return}
 const h=lastRun;lastRun=[];
 for(let i=h.length-4;i>=0;i-=4)setBlock(h[i],h[i+1],h[i+2],h[i+3],true);
 flushChunks();dirtySave=true;scrStatus.textContent='Undid last script ('+(h.length/4)+' blocks).';
});
makeTouchBtn(scrStop,()=>{if(scrRunning)scrAbort=true});
scrText.addEventListener('keydown',e=>{
 if(e.key==='Tab'){e.preventDefault();const s=scrText.selectionStart,v=scrText.value;scrText.value=v.slice(0,s)+'  '+v.slice(scrText.selectionEnd);scrText.selectionStart=scrText.selectionEnd=s+2}
 if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();if(!scrRunning)runScript(scrText.value.trim())}
});
