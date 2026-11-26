// agent.js - AI Lab (/ai or ?ai=1): an AI plays the game via the Aariz worker.
// Loop: observe -> ask worker for JSON actions -> run with player physics -> report results.
const AI_URL='https://ai.endroid.workers.dev/api/v1/';
const AI_ON=/[?&]ai=1\b/.test(location.search)||/^\/ai\/?$/.test(location.pathname);
let aiRun=false,aiStep=0,aiHist=[],aiResults=[],aiBusy=false;
const AI_SYSTEM=`You are Aariz. You PLAY Endroid Craft (Minecraft-like) by returning JSON actions only.
Reply with ONE JSON object, no markdown, no prose outside JSON:
{"thought":"<max 12 words>","actions":[ ... up to 4 ... ],"done":false}
Set "done":true when the goal is finished or impossible; put the result in "thought".

Allowed actions ONLY (never invent other keys):
{"a":"collect","block":"Log","n":3}
{"a":"goto","x":10,"z":-4}
{"a":"mine","x":1,"y":60,"z":2}
{"a":"attack","type":"zombie"}
{"a":"craft","name":"Planks"}
{"a":"place","x":1,"y":61,"z":2,"block":"Planks"}
{"a":"look","yaw":90,"pitch":0}
{"a":"walk","s":2}
{"a":"jump"}
{"a":"wait","s":1}
{"a":"eat"}

Rules: use coordinates from STATE only. Prefer collect over mine. Stay alive (eat if food<8). Avoid creepers and lava. Tool path: Log -> Planks -> Stick -> wooden pickaxe -> Stone. Keep thoughts short. If an action failed, try a different one.`;

const aiBlockId=n=>{n=String(n||'').toLowerCase();const i=NAMES.findIndex(x=>x&&x.toLowerCase()===n);return i>0?i:NAMES.findIndex(x=>x&&x.toLowerCase().includes(n))};
const aiSleep=ms=>new Promise(r=>setTimeout(r,ms));

function aiSetKeys(f,s){K.KeyW=f>0;K.KeyS=f<0;K.KeyD=s>0;K.KeyA=s<0}
function aiFace(x,y,z){
 const dx=x-P.x,dz=z-P.z,dy=y-(P.y+1.6);
 yaw=Math.atan2(-dx,-dz);pitch=Math.max(-1.4,Math.min(1.4,Math.atan2(dy,Math.hypot(dx,dz))))
}
function aiDist(x,y,z){return Math.hypot(x+.5-P.x,y+.5-(P.y+1),z+.5-P.z)}
async function aiWalkTo(x,z,maxS=8,stopD=1.2){
 let t=0,stuck=0,lx=P.x,lz=P.z;
 while(t<maxS&&aiRun&&!dead){
  const d=Math.hypot(x-P.x,z-P.z);if(d<stopD)break;
  aiFace(x,P.y+1.6,z);pitch=0;aiSetKeys(1,0);held.sprint=d>6&&(!surv()||food>8);
  await aiSleep(150);t+=.15;
  if(Math.hypot(P.x-lx,P.z-lz)<.05){if(++stuck>2){K.Space=true;setTimeout(()=>K.Space=false,220);stuck=0}}else stuck=0; // auto-jump when blocked
  lx=P.x;lz=P.z;
 }
 aiSetKeys(0,0);held.sprint=false;return Math.hypot(x-P.x,z-P.z)
}
async function aiMine(x,y,z){
 x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);
 const id=getBlock(x,y,z);if(id<=0||id===9)return 'nothing to mine there';
 if(aiDist(x,y,z)>REACH_B-.4){await aiWalkTo(x+.5,z+.5,8,REACH_B-1.2)}
 if(aiDist(x,y,z)>REACH_B)return 'too far';
 let t=0;
 while(t<8&&aiRun&&!dead&&getBlock(x,y,z)===id){aiFace(x+.5,y+.5,z+.5);held.brk=true;await aiSleep(100);t+=.1}
 held.brk=false;return getBlock(x,y,z)===id?'still there':'ok'
}
function aiFind(id,r=14){
 const px=Math.floor(P.x),py=Math.floor(P.y),pz=Math.floor(P.z);
 let best=null,bd=1e9;
 for(let dx=-r;dx<=r;dx++)for(let dy=-4;dy<=6;dy++)for(let dz=-r;dz<=r;dz++){
  const x=px+dx,y=py+dy,z=pz+dz;if(getBlock(x,y,z)!==id)continue;
  const d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;best=[x,y,z]}
 }
 return best
}
const MOBN={z:'zombie',x:'skeleton',k:'creeper',p:'pig',c:'cow',s:'sheep',h:'chicken',w:'wolf',v:'villager',g:'golem'};
function aiNearMobs(){
 return (mobs||[]).filter(m=>!m.dead).map(m=>({m,type:MOBN[m.type]||String(m.type),d:Math.hypot(m.x-P.x,m.y-P.y,m.z-P.z)}))
  .filter(o=>o.d<18).sort((a,b)=>a.d-b.d)
}
function aiCraft(r){
 if(!surv())return 'crafting only in survival';
 if(!canCraft(r))return 'missing: '+Object.entries(r.cost).map(([i,n])=>n+' '+NAMES[i]).join(', ');
 for(const[id,n]of Object.entries(r.cost))inv[id]-=n;
 if(r.tier)tools[r.tier.k]=r.tier.l;else r.give();
 renderArmor();renderSlots();renderInfo();sfxCraft();return 'ok, crafted '+r.n
}
/** Normalize model output into the fixed action schema. */
function aiNorm(a){
 if(!a||typeof a!=='object')return null;
 let act=String(a.a||a.action||a.type||'').toLowerCase();
 // common model mistakes
 if(act==='break'||act==='destroy'||act==='dig'||act==='harvest')act='mine';
 if(act==='move'||act==='go'||act==='path')act='goto';
 if(act==='fight'||act==='hit'||act==='kill')act='attack';
 if(act==='build'||act==='put')act='place';
 if(act==='gather'||act==='get'||act==='pickup')act='collect';
 if(act==='turn'||act==='face')act='look';
 if(act==='sleep'||act==='idle')act='wait';
 const out={a:act};
 if(Array.isArray(a.target)&&a.target.length>=3){out.x=+a.target[0];out.y=+a.target[1];out.z=+a.target[2]}
 if(Array.isArray(a.pos)&&a.pos.length>=3){out.x=+a.pos[0];out.y=+a.pos[1];out.z=+a.pos[2]}
 if(a.x!=null)out.x=+a.x;if(a.y!=null)out.y=+a.y;if(a.z!=null)out.z=+a.z;
 if(a.block!=null)out.block=a.block;if(a.name!=null)out.name=a.name;
 if(a.type!=null&&act==='attack')out.type=a.type;
 if(a.n!=null)out.n=+a.n;if(a.s!=null)out.s=+a.s;
 if(a.yaw!=null)out.yaw=+a.yaw;if(a.pitch!=null)out.pitch=+a.pitch;
 // collect with coordinates -> mine once
 if(act==='collect'&&out.x!=null&&out.y!=null&&out.z!=null&&!out.block){out.a='mine'}
 return out.a?out:null
}
async function aiDo(raw){
 const a=aiNorm(raw);if(!a)return 'unknown action';
 switch(a.a){
  case 'collect':{
   const id=aiBlockId(a.block);if(id<=0)return 'unknown block';
   let got=0,n=Math.min(8,Math.max(1,a.n||1));
   for(let i=0;i<n&&aiRun&&!dead;i++){
    const p=aiFind(id);if(!p)return got?'ok, collected '+got+' (no more nearby)':'none within 14 blocks';
    const r=await aiMine(p[0],p[1],p[2]);if(r!=='ok')return got?'collected '+got+', then: '+r:r;got++;
    await aiSleep(150);
   }
   return 'ok'}
  case 'goto':await aiWalkTo(+a.x,+a.z,8);return 'ok, now at '+Math.round(P.x)+','+Math.round(P.z);
  case 'mine':return aiMine(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z));
  case 'attack':{
   const want=String(a.type||'').toLowerCase();
   const pick=()=>aiNearMobs().find(o=>!want||o.type===want||o.type.includes(want));
   let t=0;
   while(t<10&&aiRun&&!dead){
    const o=pick();if(!o)return 'no target nearby';
    const m=o.m;aiFace(m.x,m.y+(m.h||1)*.6,m.z);
    if(o.d>REACH_M-.4){aiSetKeys(1,0)}else{aiSetKeys(0,0);if(typeof attack==='function')attack(m)}
    await aiSleep(250);t+=.25;
   }
   aiSetKeys(0,0);return 'fight timed out'}
  case 'craft':{
   const q=String(a.name||'').toLowerCase();
   const r=RECIPES.find(x=>x.n.toLowerCase().includes(q));
   if(!r)return 'no recipe matching '+a.name;
   return aiCraft(r)}
  case 'place':{
   const id=aiBlockId(a.block);const x=Math.floor(a.x),y=Math.floor(a.y),z=Math.floor(a.z);
   if(id<=0)return 'unknown block';if(aiDist(x,y,z)>5.5)return 'too far (>5)';
   if(surv()&&!(inv[id]>0))return 'not in inventory';
   if(surv())inv[id]--;
   aiFace(x+.5,y+.5,z+.5);setBlock(x,y,z,id,true);flushChunks();renderSlots();return 'ok'}
  case 'look':
   if(a.yaw!=null)yaw=(+a.yaw)*Math.PI/180;
   if(a.pitch!=null)pitch=Math.max(-1.4,Math.min(1.4,(+a.pitch)*Math.PI/180));
   return 'ok';
  case 'walk':aiSetKeys(1,0);await aiSleep(Math.min(5,a.s||1)*1000);aiSetKeys(0,0);return 'ok';
  case 'jump':K.Space=true;await aiSleep(250);K.Space=false;return 'ok';
  case 'wait':await aiSleep(Math.min(5,a.s||1)*1000);return 'ok';
  case 'eat':
   if(typeof startEat!=='function')return 'eat unavailable';
   startEat();await aiSleep(1900);return 'ok';
  default:return 'unknown action: '+a.a
 }
}
function aiObserve(){
 const here=[];
 for(const [n,id] of [['Log',4],['Stone',3],['Coal',12],['Iron Ore',44],['Diamond Ore',45],['Sand',6],['Water',9],['Sapling',51]]){const p=aiFind(id);if(p)here.push(n+' at '+p.join(','))}
 const inv2={};for(let i=1;i<NAMES.length;i++)if(inv[i]>0)inv2[NAMES[i]]=inv[i];
 const tg=typeof target!=='undefined'&&target?NAMES[target.b]+' at '+target.x+','+target.y+','+target.z:null;
 return {mode:surv()?'survival':'creative',pos:[+P.x.toFixed(1),+P.y.toFixed(1),+P.z.toFixed(1)],yawDeg:Math.round(yaw*180/Math.PI),hp,food,
  time:dayK>.5?'day':dayK<.3?'night':'dusk/dawn',tools:{pick:tools.pick,axe:tools.axe,sword:tools.sword},inventory:inv2,crosshair:tg,
  nearbyBlocks:here,mobs:aiNearMobs().map(o=>o.type+' '+o.d.toFixed(0)+'m'),lastResults:aiResults}
}
function aiParse(t){
 // Models sometimes emit markdown fences or raw control chars inside strings.
 t=String(t).replace(/```json|```/g,'').replace(/[\u0000-\u001F]+/g,' ').trim();
 const i=t.indexOf('{'),j=t.lastIndexOf('}');
 if(i<0||j<=i)throw new Error('no JSON in reply');
 let raw=t.slice(i,j+1);
 // Fix illegal newlines inside JSON string values by collapsing whitespace runs outside braces carefully:
 try{var o=JSON.parse(raw)}catch(e1){
  raw=raw.replace(/\n/g,' ').replace(/\r/g,' ');
  try{o=JSON.parse(raw)}catch(e2){throw new Error('bad JSON: '+e2.message)}
 }
 if(Array.isArray(o.actions))o.actions=o.actions.map(aiNorm).filter(Boolean);
 return o
}
async function aiAsk(goal){
 const prompt='GOAL: '+goal+'\nSTATE: '+JSON.stringify(aiObserve())+'\nReturn only the JSON object with actions from the allowed list.';
 const SYS=AI_SYSTEM+'\nRecipes (name: cost): '+RECIPES.map(r=>r.n+': '+Object.entries(r.cost).map(([i,n])=>n+' '+NAMES[i]).join('+')).join(' | ');
 const body={prompt,system:SYS,system_instruction:SYS,instructions:SYS,web_search:false,
  history:aiHist.slice(-6),feature:'',mode:'',client:{name:'EndroidCraft-AI',version:'2'}};
 const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),60000);
 try{
  const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/plain, application/json'},body:JSON.stringify(body),signal:ctrl.signal});
  if(!r.ok)throw new Error('worker '+r.status);
  const ct=(r.headers.get('content-type')||'').toLowerCase();
  let txt=ct.includes('json')?await r.json():await r.text();
  if(typeof txt!=='string')txt=txt.text||txt.response||txt.message||txt.output||JSON.stringify(txt);
  aiHist.push({role:'user',content:prompt.slice(0,3000)},{role:'model',content:String(txt).slice(0,1500)});
  return aiParse(txt)
 }finally{clearTimeout(tm)}
}
function aiFmtAct(a){
 if(!a)return '…';
 let s=a.a||'?';
 if(a.block)s+=' '+a.block;else if(a.name)s+=' '+a.name;else if(a.type)s+=' '+a.type;
 if(a.x!=null)s+=' @'+Math.floor(a.x)+','+Math.floor(a.y??0)+','+Math.floor(a.z);
 if(a.n>1)s+=' ×'+a.n;
 return s
}
async function aiLoop(goal){
 aiRun=true;aiStep=0;aiHist=[];aiResults=[];aiUI(true);
 aiNow('Starting','Sending your goal to Aariz…');
 aiLog('Goal: '+goal,'meta');
 try{
  while(aiRun&&aiStep<40){
   if(dead){aiLog('You died — stopping.',true);aiNow('Stopped','Player died');break}
   if(!running&&started)setRunning(true);
   aiStep++;
   aiNow('Thinking','Step '+aiStep+' · asking the model…');
   aiLog('Step '+aiStep+' · thinking…','meta');
   let plan;
   try{plan=await aiAsk(goal)}catch(e){
    aiLog('AI error: '+e.message,true);
    aiNow('Error',e.message);
    await aiSleep(2500);
    if(aiStep>3&&/worker|Failed|abort/i.test(e.message)){aiLog('Cannot reach the AI worker.',true);aiNow('Offline','Worker unreachable');break}
    continue
   }
   const thought=(plan.thought||'').trim()||'(no thought)';
   aiLog('Thought: '+thought);
   aiResults=[];
   const acts=(plan.actions||[]).slice(0,4);
   if(!acts.length){
    aiLog(plan.done?'No more actions.':'Model returned no actions.','meta');
    aiNow(plan.done?'Done':('Step '+aiStep),thought);
   }
   for(let i=0;i<acts.length;i++){
    if(!aiRun)break;
    const a=acts[i];
    const label=aiFmtAct(a);
    aiNow('Acting','Step '+aiStep+' · '+label+(acts.length>1?' ('+(i+1)+'/'+acts.length+')':''));
    aiLog('→ '+label+' …','meta');
    let r;try{r=await aiDo(a)}catch(e){r='error: '+e.message}
    aiResults.push(JSON.stringify(a)+' -> '+r);
    const ok=r==='ok'||/^ok/.test(r);
    aiLog((ok?'✓ ':'✗ ')+label+': '+r,ok?false:true);
    if(!ok)break;
   }
   if(plan.done){aiLog('Done: '+thought);aiNow('Done',thought);break}
  }
  if(aiRun&&aiStep>=40){aiLog('Stopped after 40 steps.','meta');aiNow('Stopped','Step limit reached')}
 }finally{
  aiRun=false;aiSetKeys(0,0);held.brk=false;aiUI(false);
  if(aiStatEl&&!/Done|Stopped|Offline|Error/.test(aiStatEl.textContent))aiNow('Idle','Edit the goal and press Start');
 }
}
// ----- panel -----
let aiPanel,aiLogEl,aiGoal,aiBtn,aiStatEl,aiNowEl;
function aiLog(t,kind){
 if(!aiLogEl)return;
 const d=document.createElement('div');
 d.textContent=t;
 if(kind===true||kind==='err')d.className='err';
 else if(kind==='meta')d.className='meta';
 else if(kind==='ok')d.className='ok';
 aiLogEl.appendChild(d);
 while(aiLogEl.children.length>60)aiLogEl.firstChild.remove();
 aiLogEl.scrollTop=1e9
}
function aiNow(phase,detail){
 if(aiStatEl)aiStatEl.textContent=phase||'Idle';
 if(aiNowEl){
  aiNowEl.innerHTML='';
  const b=document.createElement('b');b.textContent=(phase||'Idle')+'. ';
  aiNowEl.appendChild(b);
  aiNowEl.appendChild(document.createTextNode(detail||''));
 }
 if(aiPanel)aiPanel.dataset.phase=(phase||'Idle').toLowerCase();
}
function aiUI(on){
 if(aiBtn){aiBtn.textContent=on?'Stop':'Start';aiBtn.classList.toggle('stop',!!on);aiBtn.setAttribute('aria-pressed',on?'true':'false')}
 // Goal stays editable — change it anytime; Start uses the current text
 if(aiPanel)aiPanel.classList.toggle('running',!!on)
}
function aiBuild(){
 if(document.getElementById('ai-lab'))return;
 const s=document.createElement('style');
 s.textContent=`
#ai-lab{position:fixed;left:max(8px,env(safe-area-inset-left));right:max(8px,env(safe-area-inset-right));
  bottom:max(72px,calc(env(safe-area-inset-bottom) + 64px));width:auto;max-width:400px;
  max-height:min(56vh,480px);background:rgba(14,18,28,.94);color:#e8eefc;
  border:2px solid #5bb8f5;border-radius:12px;z-index:80;font:13px/1.35 system-ui,-apple-system,sans-serif;
  display:flex;flex-direction:column;backdrop-filter:blur(6px);box-shadow:0 8px 28px #0008}
#ai-lab header{padding:10px 12px 6px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none}
#ai-lab header .ttl{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ai-lab #ai-stat{font-weight:700;font-size:12px;color:#9ad;flex:0 0 auto;padding:2px 8px;border-radius:999px;background:#ffffff12}
#ai-lab[data-phase="thinking"] #ai-stat{color:#9cf;background:#3a7bd422}
#ai-lab[data-phase="acting"] #ai-stat,#ai-lab[data-phase="starting"] #ai-stat{color:#8f8;background:#2e7d3228}
#ai-lab[data-phase="done"] #ai-stat{color:#b8f;background:#6a5acd28}
#ai-lab[data-phase="error"] #ai-stat,#ai-lab[data-phase="offline"] #ai-stat,#ai-lab[data-phase="stopped"] #ai-stat{color:#f99;background:#c6282822}
#ai-lab.running{border-color:#7dcea0}
#ai-lab .now{margin:0 10px 6px;padding:8px 10px;border-radius:8px;background:#00000066;border:1px solid #ffffff14;font-size:12px;color:#cde;min-height:2.6em}
#ai-lab .now b{color:#fff;font-weight:700}
#ai-lab .bd{padding:0 10px 10px;display:flex;flex-direction:column;gap:8px;min-height:0}
#ai-lab .lg{overflow:auto;-webkit-overflow-scrolling:touch;max-height:20vh;line-height:1.4;background:#0008;border-radius:8px;padding:8px;font-size:12px}
#ai-lab .lg .err{color:#ff9a9a}
#ai-lab .lg .meta{color:#9ab}
#ai-lab .lg .ok{color:#9d9}
#ai-lab .chips{display:flex;flex-wrap:wrap;gap:6px}
#ai-lab .chips button{min-height:32px;padding:6px 10px;border-radius:999px;border:1px solid #456;background:#152038;color:#dce;font-size:12px;font-weight:600;touch-action:manipulation}
#ai-lab .row{display:flex;gap:8px;align-items:stretch}
#ai-lab textarea{
  flex:1;min-width:0;min-height:56px;max-height:120px;padding:10px 12px;border-radius:8px;border:1px solid #456;
  background:#0b1020;color:#fff;font-size:15px;resize:vertical;font-family:inherit;line-height:1.3}
#ai-lab button#ai-go{min-height:44px;min-width:76px;padding:10px 14px;border-radius:8px;border:0;background:#2e7d32;color:#fff;font-weight:700;font-size:14px;touch-action:manipulation}
#ai-lab button#ai-go.stop{background:#c62828}
#ai-lab .hint{font-size:11px;color:#9ab;padding:0 2px}
#ai-lab.min .bd{display:none}#ai-lab.min .now{margin-bottom:8px}
#ai-lab.min{max-height:none}
@media (pointer:coarse) and (min-width:700px){
  #ai-lab{top:max(8px,env(safe-area-inset-top));bottom:auto;left:50%;right:auto;transform:translateX(-50%);width:min(440px,calc(100vw - 340px));max-height:calc(100vh - 16px)}
  #ai-lab .lg{max-height:16vh}
}
@media (pointer:coarse) and (max-width:699px){
  #ai-lab{top:auto;bottom:max(190px,calc(env(safe-area-inset-bottom) + 180px));left:8px;right:8px;width:auto;max-width:none}
}
@media (max-width:520px){
  #ai-lab{max-width:none;bottom:max(88px,calc(env(safe-area-inset-bottom) + 80px))}
}
body.ai-typing #stick,body.ai-typing #pad{pointer-events:none;opacity:.35}
`;
 document.head.appendChild(s);
 aiPanel=document.createElement('div');aiPanel.id='ai-lab';aiPanel.dataset.phase='idle';
 aiPanel.innerHTML=`
<header>
  <span class="ttl">Aariz Lab · AI plays</span>
  <span id="ai-stat">Idle</span>
  <span id="ai-min" aria-label="Minimize">–</span>
</header>
<div class="now" id="ai-now"><b>Ready.</b> Edit the goal below, then Start.</div>
<div class="bd">
  <div class="hint">Goal is always editable. Start runs the text below; Stop cancels. Ctrl+Enter also starts.</div>
  <div class="lg" id="ai-log" aria-live="polite"></div>
  <div class="chips" id="ai-chips">
    <button type="button" data-g="Collect 3 logs">3 logs</button>
    <button type="button" data-g="Gather 5 logs, craft planks and sticks, then a wooden pickaxe">Wooden pickaxe</button>
    <button type="button" data-g="Explore nearby and stay alive">Explore</button>
  </div>
  <div class="row">
    <textarea id="ai-goal" rows="2" enterkeyhint="go" autocomplete="off" placeholder="Type what the AI should do…">Gather 5 logs, craft planks and sticks, then a wooden pickaxe</textarea>
    <button id="ai-go" type="button">Start</button>
  </div>
</div>`;
 document.body.appendChild(aiPanel);
 aiLogEl=aiPanel.querySelector('#ai-log');
 aiGoal=aiPanel.querySelector('#ai-goal');
 aiBtn=aiPanel.querySelector('#ai-go');
 aiStatEl=aiPanel.querySelector('#ai-stat');
 aiNowEl=aiPanel.querySelector('#ai-now');
 aiPanel.querySelector('header').addEventListener('click',e=>{if(e.target.closest('#ai-go'))return;aiPanel.classList.toggle('min')});
 const startOrStop=()=>{
  if(aiRun){aiRun=false;aiLog('Stopping…','meta');aiNow('Stopping','Finishing current action…');return}
  if(!started){aiLog('Press Play on the main menu first, then Start.',true);aiNow('Need Play','Open the menu, press Play, then Start');return}
  const goal=(aiGoal.value||'').trim()||'Explore and survive';
  if(matchMedia('(pointer:coarse)').matches)aiPanel.classList.add('min');else aiPanel.classList.remove('min');
  aiLoop(goal)
 };
 aiBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();startOrStop()});
 aiGoal.addEventListener('keydown',e=>{
  e.stopPropagation();
  if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();startOrStop()}
 });
 aiGoal.addEventListener('keyup',e=>e.stopPropagation());
 aiGoal.addEventListener('keypress',e=>e.stopPropagation());
 const setTyping=on=>document.body.classList.toggle('ai-typing',!!on);
 aiGoal.addEventListener('focus',()=>setTyping(true));
 aiGoal.addEventListener('blur',()=>setTyping(false));
 aiPanel.querySelector('#ai-chips').addEventListener('click',e=>{
  const b=e.target.closest('button[data-g]');if(!b)return;
  e.preventDefault();e.stopPropagation();
  aiGoal.value=b.getAttribute('data-g');
  aiGoal.focus();
  aiNow('Goal set',aiGoal.value+(aiRun?' · applies on next Start':' · press Start'));
 });
 aiLogEl.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
 aiLog('AI Lab ready. Edit the goal (or tap a chip), then Start.','meta');
 document.body.classList.add('ai-mode');
 // keep the panel out of the way of the main menu (it used to cover the Play button on phones)
 const sync=()=>{let on=false;try{on=started&&getComputedStyle(menu).display==='none'&&!dead}catch(e){} // game scripts may not be ready yet
  aiPanel.style.display=on?'flex':'none'};
 sync();setInterval(sync,250);
}
if(AI_ON){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',aiBuild);
 else aiBuild();
}
