// agent.js - AI Lab (/ai): an AI plays the game.
// Loop: observe the world -> send state + goal to the Aariz worker (prompt engineering, JSON-only replies)
// -> run the returned actions with the same inputs/physics a player has -> report results back.
// Survival rules still apply: the AI mines for real, crafts from real recipes and places from its inventory.
const AI_URL='https://ai.endroid.workers.dev/api/v1/';
const AI_ON=/[?&]ai=1\b/.test(location.search);
let aiRun=false,aiStep=0,aiHist=[],aiResults=[];
const AI_SYSTEM=`You are Aariz, an AI that PLAYS a Minecraft-like game (Endroid Craft) by controlling the player. Each turn you get the game state as JSON and the player's goal. Reply with ONLY one JSON object, no prose, no markdown:
{"thought":"<max 15 words>","actions":[ ... up to 4 actions ... ],"done":false}
Set "done":true when the goal is finished (or impossible) and put a short result in "thought".
Actions (x,y,z are world block coordinates; use coordinates from the state, never invent them):
{"a":"collect","block":"Log","n":3}      walk to the nearest such block and mine it, n times (best way to gather)
{"a":"goto","x":10,"z":-4}              walk toward x,z (auto-jumps, ~8s max)
{"a":"mine","x":1,"y":60,"z":2}         face and mine one block (walks closer if needed)
{"a":"attack","type":"zombie"}          fight nearest mob of type: zombie, skeleton, creeper, pig, cow, sheep, chicken, wolf
{"a":"craft","name":"Planks"}           craft a recipe whose name contains the text (needs the materials)
{"a":"place","x":1,"y":61,"z":2,"block":"Planks"}   place a block from inventory (needs to be within 5 blocks)
{"a":"look","yaw":90,"pitch":0}         yaw degrees (0=north/-z, 90=west/-x), pitch -80..80
{"a":"walk","s":2}  {"a":"jump"}  {"a":"wait","s":1}  {"a":"eat"}
Block names: Grass Dirt Stone Log Leaves Sand Planks Brick Glass Coal Gold Iron Ore Diamond Ore Sapling Gravel Furnace Chest Torch Stick Ladder Bone.
Rules: stay alive (eat when food<8, fight only if hp>8, flee/avoid creepers, avoid lava and deep water). It is dangerous at night: build/hide or keep busy near the start. Prefer collect/craft macros over raw walking. Plan tools: Log -> Planks -> Stick -> wooden pickaxe -> Stone -> stone pickaxe. Keep thoughts short. If an action failed, try something different.`;

const aiBlockId=n=>{n=String(n||'').toLowerCase();const i=NAMES.findIndex(x=>x&&x.toLowerCase()===n);return i>0?i:NAMES.findIndex(x=>x&&x.toLowerCase().includes(n))};
const aiSleep=ms=>new Promise(r=>setTimeout(r,ms));
const MOBN={z:'zombie',x:'skeleton',k:'creeper',p:'pig',c:'cow',s:'sheep',h:'chicken',w:'wolf',v:'villager',g:'golem'};
function aiSetKeys(f,s){K.KeyW=f>0;K.KeyS=f<0;K.KeyD=s>0;K.KeyA=s<0}
function aiFace(x,y,z){ // look at a point
 const dx=x-P.x,dz=z-P.z,dy=y-(P.y+1.6);
 yaw=Math.atan2(-dx,-dz);pitch=Math.max(-1.4,Math.min(1.4,Math.atan2(dy,Math.hypot(dx,dz))));
}
function aiDist(x,y,z){return Math.hypot(x+.5-P.x,y+.5-(P.y+1),z+.5-P.z)}
async function aiWalkTo(x,z,maxS=8,stopD=1.2){ // walk with auto-jump, no pathfinding
 let t=0,stuck=0,lx=P.x,lz=P.z;
 while(t<maxS&&aiRun&&!dead){
  const d=Math.hypot(x-P.x,z-P.z);if(d<stopD)break;
  aiFace(x,P.y+1.6,z);pitch=0;aiSetKeys(1,0);held.sprint=d>6&&(!surv()||food>8);
  await aiSleep(150);t+=.15;
  if(Math.hypot(P.x-lx,P.z-lz)<.05){if(++stuck>2){K.Space=true;setTimeout(()=>K.Space=false,200);stuck=0}}else stuck=0;
  lx=P.x;lz=P.z;
 }
 aiSetKeys(0,0);held.sprint=false;return Math.hypot(x-P.x,z-P.z)
}
async function aiMine(x,y,z){
 const id=getBlock(x,y,z);if(id<=0||id===9)return 'no block there';
 if(aiDist(x,y,z)>REACH_B-.4){await aiWalkTo(x+.5,z+.5,8,REACH_B-1.2)}
 if(aiDist(x,y,z)>REACH_B)return 'too far';
 let t=0;
 while(t<8&&aiRun&&!dead&&getBlock(x,y,z)===id){aiFace(x+.5,y+.5,z+.5);held.brk=true;await aiSleep(100);t+=.1}
 held.brk=false;
 return getBlock(x,y,z)===id?(surv()&&typeof canHarvest==='function'&&!canHarvest(id)?'need a better tool':'not broken'):'ok'
}
function aiFind(id,r=14){
 let best=null,bd=1e9;
 for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(let dy=-8;dy<=10;dy++){
  const x=Math.floor(P.x)+dx,y=Math.floor(P.y)+dy,z=Math.floor(P.z)+dz;
  if(getBlock(x,y,z)!==id)continue;const d=dx*dx+dz*dz+dy*dy*2;if(d<bd){bd=d;best=[x,y,z]}
 }
 return best
}
function aiNearMobs(){
 return mobs.filter(m=>!m.dead).map(m=>({type:MOBN[m.type]||m.type,d:Math.hypot(m.x-P.x,m.z-P.z),m})).filter(o=>o.d<20).sort((a,b)=>a.d-b.d).slice(0,6);
}
async function aiDo(a){
 switch(a.a){
  case 'collect':{
   const id=aiBlockId(a.block);if(id<=0)return 'unknown block';
   let got=0;const n=Math.min(8,a.n||1);
   for(let i=0;i<n&&aiRun&&!dead;i++){
    const p=aiFind(id);if(!p)return got?'ok, collected '+got+' (no more nearby)':'none within 14 blocks';
    const r=await aiMine(p[0],p[1],p[2]);if(r!=='ok')return got?'collected '+got+', then: '+r:r;got++;
    await aiSleep(150);
   }
   return 'ok, collected '+got}
  case 'goto':await aiWalkTo(+a.x,+a.z,8);return 'ok, now at '+Math.round(P.x)+','+Math.round(P.z);
  case 'mine':return aiMine(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z));
  case 'attack':{
   const want=String(a.type||'').toLowerCase();let t=0;
   const pick=()=>aiNearMobs().find(o=>o.type===want||want==='');
   if(!pick())return 'no '+want+' nearby';
   while(t<10&&aiRun&&!dead){
    const o=pick();if(!o||o.m.dead||o.m.hp<=0)return 'ok, defeated';
    const m=o.m;aiFace(m.x,m.y+(m.h||1)*.6,m.z);
    if(o.d>REACH_M-.4){aiSetKeys(1,0)}else{aiSetKeys(0,0);if(typeof attack==='function')attack(m)}
    await aiSleep(250);t+=.25;
   }
   aiSetKeys(0,0);return 'fight timed out'}
  case 'craft':{
   if(!surv())return 'crafting only in survival';
   const r=RECIPES.find(x=>x.n.toLowerCase().includes(String(a.name||'').toLowerCase()));
   if(!r)return 'no such recipe';if(!canCraft(r))return 'missing materials: '+Object.entries(r.cost).map(([i,n])=>n+' '+NAMES[i]).join(', ');
   for(const[id,n]of Object.entries(r.cost))inv[id]-=n;
   if(r.tier)tools[r.tier.k]=r.tier.l;else r.give();renderArmor();renderSlots();renderInfo();sfxCraft();return 'ok, crafted '+r.n}
  case 'place':{
   const id=aiBlockId(a.block);const x=Math.floor(a.x),y=Math.floor(a.y),z=Math.floor(a.z);
   if(id<=0)return 'unknown block';if(aiDist(x,y,z)>5.5)return 'too far (>5)';
   if(getBlock(x,y,z)>0&&getBlock(x,y,z)!==9)return 'space occupied';
   if(surv()){if(!(inv[id]>0))return 'you have no '+NAMES[id];inv[id]--}
   aiFace(x+.5,y+.5,z+.5);setBlock(x,y,z,id,true);flushChunks();renderSlots();return 'ok'}
  case 'look':yaw=(+a.yaw||0)*Math.PI/180;pitch=Math.max(-1.4,Math.min(1.4,(+a.pitch||0)*Math.PI/180));return 'ok';
  case 'walk':aiSetKeys(1,0);await aiSleep(Math.min(5,a.s||1)*1000);aiSetKeys(0,0);return 'ok';
  case 'jump':K.Space=true;await aiSleep(250);K.Space=false;return 'ok';
  case 'wait':await aiSleep(Math.min(5,a.s||1)*1000);return 'ok';
  case 'eat':{
   if(!surv())return 'creative: no need';if(!pickFood())return 'no food';
   startEat();await aiSleep(1900);return 'ok'}
 }
 return 'unknown action';
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
 t=String(t).replace(/```json|```/g,'');const i=t.indexOf('{'),j=t.lastIndexOf('}');
 if(i<0||j<=i)throw new Error('no JSON in reply');return JSON.parse(t.slice(i,j+1))
}
async function aiAsk(goal){
 const prompt='GOAL: '+goal+'\nSTATE: '+JSON.stringify(aiObserve());
 const SYS=AI_SYSTEM+'\nRecipes (name: cost): '+RECIPES.map(r=>r.n+': '+Object.entries(r.cost).map(([i,n])=>n+' '+NAMES[i]).join('+')).join(' | ');
 const body={prompt,system:SYS,system_instruction:SYS,instructions:SYS,web_search:false,
  history:aiHist.slice(-6),feature:'',mode:'',client:{name:'EndroidCraft-AI',version:'1'}};
 const ctrl=new AbortController(),tm=setTimeout(()=>ctrl.abort(),60000);
 try{
  const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'text/plain, application/json'},body:JSON.stringify(body),signal:ctrl.signal});
  if(!r.ok)throw new Error('worker '+r.status);
  const ct=(r.headers.get('content-type')||'').toLowerCase();
  let txt=ct.includes('json')?await r.json():await r.text();
  if(typeof txt!=='string')txt=txt.text||txt.response||txt.message||txt.output||JSON.stringify(txt);
  aiHist.push({role:'user',content:prompt.slice(0,3000)},{role:'model',content:txt.slice(0,1500)});
  return aiParse(txt)
 }finally{clearTimeout(tm)}
}
async function aiLoop(goal){
 aiRun=true;aiStep=0;aiHist=[];aiResults=[];aiUI(true);
 try{
  while(aiRun&&aiStep<40){
   if(dead){aiLog('You died - stopping.');break}
   if(!running&&started)setRunning(true);
   aiStep++;
   let plan;
   try{plan=await aiAsk(goal)}catch(e){aiLog('AI error: '+e.message,true);await aiSleep(2500);if(aiStep>3&&/worker|Failed/.test(e.message)){aiLog('Cannot reach the AI worker.',true);break}continue}
   aiLog((plan.thought||'...'));aiResults=[];
   for(const a of (plan.actions||[]).slice(0,4)){
    if(!aiRun)break;
    let r;try{r=await aiDo(a)}catch(e){r='error: '+e.message}
    aiResults.push(JSON.stringify(a)+' -> '+r);aiLog('› '+a.a+(a.block?' '+a.block:a.type?' '+a.type:a.name?' '+a.name:'')+': '+r);
    if(r!=='ok'&&!/^ok/.test(r))break;
   }
   if(plan.done){aiLog('Done: '+(plan.thought||''));break}
  }
 }finally{aiRun=false;aiSetKeys(0,0);held.brk=false;aiUI(false)}
}
// ----- panel -----
let aiPanel,aiLogEl,aiGoal,aiBtn;
function aiLog(t,err){if(!aiLogEl)return;const d=document.createElement('div');d.textContent=t;if(err)d.style.color='#ff9a9a';aiLogEl.appendChild(d);while(aiLogEl.children.length>40)aiLogEl.firstChild.remove();aiLogEl.scrollTop=1e9}
function aiUI(on){if(aiBtn)aiBtn.textContent=on?'Stop':'Start'}
function aiBuild(){
 const s=document.createElement('style');
 s.textContent='#ai-lab{position:fixed;left:8px;bottom:84px;width:min(340px,calc(100vw - 16px));max-height:46vh;background:rgba(14,18,28,.88);color:#e8eefc;border:2px solid #5bb8f5;border-radius:10px;z-index:60;font:12px system-ui,sans-serif;display:flex;flex-direction:column;backdrop-filter:blur(4px)}#ai-lab header{padding:6px 10px;font-weight:700;display:flex;justify-content:space-between;cursor:pointer}#ai-lab .bd{padding:0 8px 8px;display:flex;flex-direction:column;gap:6px;min-height:0}#ai-lab .lg{overflow:auto;max-height:22vh;line-height:1.35;background:#0007;border-radius:6px;padding:6px}#ai-lab .row{display:flex;gap:6px}#ai-lab input{flex:1;min-width:0;padding:7px;border-radius:6px;border:1px solid #456;background:#0b1020;color:#fff;font-size:13px}#ai-lab button{padding:7px 12px;border-radius:6px;border:0;background:#2e7d32;color:#fff;font-weight:700}#ai-lab.min .bd{display:none}';
 document.head.appendChild(s);
 aiPanel=document.createElement('div');aiPanel.id='ai-lab';
 aiPanel.innerHTML='<header><span>🧪 Aariz Lab · AI plays</span><span id="ai-min">–</span></header><div class="bd"><div class="lg"></div><div class="row"><input id="ai-goal" placeholder="Goal, e.g. collect 5 logs and craft a pickaxe" value="Gather 5 logs, craft planks and sticks, then a wooden pickaxe"><button id="ai-go">Start</button></div></div>';
 document.body.appendChild(aiPanel);
 aiLogEl=aiPanel.querySelector('.lg');aiGoal=aiPanel.querySelector('#ai-goal');aiBtn=aiPanel.querySelector('#ai-go');
 aiPanel.querySelector('header').addEventListener('click',()=>aiPanel.classList.toggle('min'));
 aiBtn.addEventListener('click',()=>{if(aiRun){aiRun=false;aiLog('Stopping...')}else if(!started){aiLog('Press Play first, then Start.',true)}else{aiPanel.classList.remove('min');aiLoop(aiGoal.value.trim()||'Explore and survive')}});
 aiGoal.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')aiBtn.click()});
 aiLog('AI Lab ready. Press Play, then Start. The AI sees the world as text and sends actions back.');
}
if(AI_ON)aiBuild();
