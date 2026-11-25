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
 let t=0;
 while(t<maxS&&aiRun&&!dead){
  const d=Math.hypot(x-P.x,z-P.z);if(d<stopD)break;
  aiFace(x,P.y+1.6,z);pitch=0;aiSetKeys(1,0);held.sprint=d>6&&(!surv()||food>8);
  await aiSleep(150);t+=.15;
 }
 aiSetKeys(0,0);held.sprint=false;return Math.hypot(x-P.x,z-P.z)
}
async function aiMine(x,y,z){
 x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);
 const id=getBlock(x,y,z);if(!id)return 'air / already gone';
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
function aiNearMobs(){
 return (mobs||[]).map(m=>({m,type:(m.type||m.kind||'').toLowerCase(),d:Math.hypot(m.x-P.x,m.y-P.y,m.z-P.z)}))
  .filter(o=>o.d<18).sort((a,b)=>a.d-b.d)
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
   if(typeof tryCraft==='function'){const ok=tryCraft(r);return ok?'ok':'missing materials'}
   return 'craft unavailable'}
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
 t=String(t).replace(/```json|```/g,'').trim();
 const i=t.indexOf('{'),j=t.lastIndexOf('}');
 if(i<0||j<=i)throw new Error('no JSON in reply');
 const o=JSON.parse(t.slice(i,j+1));
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
async function aiLoop(goal){
 aiRun=true;aiStep=0;aiHist=[];aiResults=[];aiUI(true);aiStatus('Running…');
 try{
  while(aiRun&&aiStep<40){
   if(dead){aiLog('You died — stopping.');break}
   if(!running&&started)setRunning(true);
   aiStep++;aiStatus('Thinking · step '+aiStep);
   let plan;
   try{plan=await aiAsk(goal)}catch(e){
    aiLog('AI error: '+e.message,true);aiStatus('Error');
    await aiSleep(2500);
    if(aiStep>3&&/worker|Failed|abort/i.test(e.message)){aiLog('Cannot reach the AI worker.',true);break}
    continue
   }
   aiLog((plan.thought||'…'));aiResults=[];aiStatus('Acting · step '+aiStep);
   for(const a of (plan.actions||[]).slice(0,4)){
    if(!aiRun)break;
    let r;try{r=await aiDo(a)}catch(e){r='error: '+e.message}
    aiResults.push(JSON.stringify(a)+' -> '+r);
    aiLog('› '+(a.a||'?')+(a.block?' '+a.block:a.type?' '+a.type:a.name?' '+a.name:a.x!=null?' '+a.x+','+a.y+','+a.z:'')+': '+r);
    if(r!=='ok'&&!/^ok/.test(r))break;
   }
   if(plan.done){aiLog('Done: '+(plan.thought||''));break}
  }
 }finally{aiRun=false;aiSetKeys(0,0);held.brk=false;aiUI(false);aiStatus('Idle')}
}
// ----- panel -----
let aiPanel,aiLogEl,aiGoal,aiBtn,aiStatEl;
function aiLog(t,err){
 if(!aiLogEl)return;
 const d=document.createElement('div');d.textContent=t;if(err)d.className='err';
 aiLogEl.appendChild(d);while(aiLogEl.children.length>50)aiLogEl.firstChild.remove();aiLogEl.scrollTop=1e9
}
function aiStatus(t){if(aiStatEl)aiStatEl.textContent=t}
function aiUI(on){
 if(aiBtn){aiBtn.textContent=on?'Stop':'Start';aiBtn.classList.toggle('stop',!!on)}
 if(aiGoal)aiGoal.disabled=!!on;
 if(aiPanel)aiPanel.classList.toggle('running',!!on)
}
function aiBuild(){
 const s=document.createElement('style');
 s.textContent=`
#ai-lab{position:fixed;left:max(8px,env(safe-area-inset-left));right:max(8px,env(safe-area-inset-right));
  bottom:max(72px,calc(env(safe-area-inset-bottom) + 64px));width:auto;max-width:380px;
  max-height:min(48vh,420px);background:rgba(14,18,28,.92);color:#e8eefc;
  border:2px solid #5bb8f5;border-radius:12px;z-index:80;font:13px/1.35 system-ui,-apple-system,sans-serif;
  display:flex;flex-direction:column;backdrop-filter:blur(6px);box-shadow:0 8px 28px #0008}
#ai-lab header{padding:10px 12px;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none}
#ai-lab header .ttl{display:flex;align-items:center;gap:8px;min-width:0}
#ai-lab header .ttl span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ai-lab #ai-stat{font-weight:600;font-size:11px;color:#9ad;margin-left:auto;padding-right:6px}
#ai-lab.running{border-color:#7dcea0}
#ai-lab.running #ai-stat{color:#8f8}
#ai-lab .bd{padding:0 10px 10px;display:flex;flex-direction:column;gap:8px;min-height:0}
#ai-lab .lg{overflow:auto;-webkit-overflow-scrolling:touch;max-height:22vh;line-height:1.4;background:#0008;border-radius:8px;padding:8px;font-size:12px}
#ai-lab .lg .err{color:#ff9a9a}
#ai-lab .row{display:flex;gap:8px;align-items:stretch}
#ai-lab input{flex:1;min-width:0;min-height:44px;padding:10px 12px;border-radius:8px;border:1px solid #456;background:#0b1020;color:#fff;font-size:15px}
#ai-lab button{min-height:44px;min-width:72px;padding:10px 14px;border-radius:8px;border:0;background:#2e7d32;color:#fff;font-weight:700;font-size:14px;touch-action:manipulation}
#ai-lab button.stop{background:#c62828}
#ai-lab .hint{font-size:11px;color:#9ab;padding:0 2px}
#ai-lab.min .bd{display:none}
#ai-lab.min{max-height:none}
@media (max-width:520px){
  #ai-lab{max-width:none;bottom:max(88px,calc(env(safe-area-inset-bottom) + 80px))}
  #menu:not([style*="display: none"]) ~ #ai-lab, body:has(#menu:not([hidden])) #ai-lab{/* keep above fold when menu open */}
}
/* keep game keys from firing while typing a goal */
body.ai-typing #stick,body.ai-typing #pad{pointer-events:none;opacity:.35}
`;
 document.head.appendChild(s);
 aiPanel=document.createElement('div');aiPanel.id='ai-lab';
 aiPanel.innerHTML=`
<header>
  <div class="ttl"><span>Aariz Lab · AI plays</span></div>
  <span id="ai-stat">Idle</span>
  <span id="ai-min" aria-label="Minimize">–</span>
</header>
<div class="bd">
  <div class="hint">Press Play, set a goal, then Start. The AI sees the world as text and acts with the same physics you do.</div>
  <div class="lg" id="ai-log"></div>
  <div class="row">
    <input id="ai-goal" enterkeyhint="go" autocomplete="off" placeholder="Goal, e.g. collect 5 logs and craft a pickaxe" value="Gather 5 logs, craft planks and sticks, then a wooden pickaxe">
    <button id="ai-go" type="button">Start</button>
  </div>
</div>`;
 document.body.appendChild(aiPanel);
 aiLogEl=aiPanel.querySelector('#ai-log');aiGoal=aiPanel.querySelector('#ai-goal');aiBtn=aiPanel.querySelector('#ai-go');aiStatEl=aiPanel.querySelector('#ai-stat');
 const toggleMin=()=>aiPanel.classList.toggle('min');
 aiPanel.querySelector('header').addEventListener('click',e=>{if(e.target.closest('#ai-go'))return;toggleMin()});
 const startOrStop=()=>{
  if(aiRun){aiRun=false;aiLog('Stopping…');aiStatus('Stopping…');return}
  if(!started){aiLog('Press Play first, then Start.',true);return}
  aiPanel.classList.remove('min');
  aiLoop(aiGoal.value.trim()||'Explore and survive')
 };
 aiBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();startOrStop()});
 aiGoal.addEventListener('keydown',e=>{
  e.stopPropagation();
  if(e.key==='Enter'){e.preventDefault();startOrStop()}
 });
 // stop WASD / hotkeys while the goal field is focused
 const setTyping=on=>document.body.classList.toggle('ai-typing',!!on);
 aiGoal.addEventListener('focus',()=>setTyping(true));
 aiGoal.addEventListener('blur',()=>setTyping(false));
 // prevent touch scroll of the page from eating the log panel
 aiLogEl.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
 aiLog('AI Lab ready. Press Play, then Start.');
 // mark body so CSS can adapt
 document.body.classList.add('ai-mode');
}
if(AI_ON){
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',aiBuild);
 else aiBuild();
}
