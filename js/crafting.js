// crafting.js - recipes + crafting UI
// ---------- crafting ----------
const tier=(k,l)=>({k,l});
const RECIPES=[
 {ic:'layers',n:'Planks ×4',cost:{4:1},give(){inv[7]+=4}},
 {ic:'pickaxe',n:'Wooden Pickaxe',cost:{7:5},tier:tier('pick',1),note:'Mines stone, coal'},
 {ic:'sword',n:'Wooden Sword',cost:{7:3},tier:tier('sword',1),note:'Damage 4'},
 {ic:'hammer',n:'Wooden Axe',cost:{7:5},tier:tier('axe',1),note:'Chops 2x faster'},
 {ic:'pickaxe',n:'Stone Pickaxe',cost:{7:2,3:3},tier:tier('pick',2),note:'Mines gold ore, 2x faster'},
 {ic:'sword',n:'Stone Sword',cost:{7:1,3:2},tier:tier('sword',2),note:'Damage 5'},
 {ic:'hammer',n:'Stone Axe',cost:{7:2,3:3},tier:tier('axe',2),note:'Chops 4x faster'},
 {ic:'drumstick',n:'Cook 2 Porkchops',cost:{18:2,12:1},give(){inv[19]+=2},note:'Coal as fuel. Heals 8 food'},
 {ic:'drumstick',n:'Cook 2 Steaks',cost:{20:2,12:1},give(){inv[21]+=2},note:'Coal as fuel. Heals 8 food'},
 {ic:'drumstick',n:'Cook 2 Mutton',cost:{22:2,12:1},give(){inv[23]+=2},note:'Coal as fuel. Heals 6 food'},
 {ic:'bed',n:'Bed',cost:{7:3,26:3},give(){inv[17]++},note:'Sleep at night, set spawn'},
 {ic:'shield',n:'Leather Armor',cost:{27:8},once:'a1',give(){tools.a1=true},note:'-28% melee damage'},
 {ic:'shield',n:'Gold Armor',cost:{13:8},once:'a2',give(){tools.a2=true},note:'-44% melee damage'},
 {ic:'apple',n:'Golden Apple',cost:{13:8,24:1},give(){inv[28]++},note:'Heals 4 HP + food (eat with F)'},
 {ic:'box',n:'Bricks ×4',cost:{3:4},give(){inv[8]+=4}},
 {ic:'square',n:'Glass ×2',cost:{6:2,12:1},give(){inv[10]+=2}}
];
const craftEl=$('#craft'),recsEl=$('#recs');
let craftOpen=false;
const owns=r=>(r.once&&tools[r.once])||(r.tier&&tools[r.tier.k]>=r.tier.l);
const canCraft=r=>Object.entries(r.cost).every(([id,n])=>inv[id]>=n)&&!owns(r);
function renderCraft(){
 recsEl.innerHTML='';
 if(!surv()){recsEl.innerHTML='<div class="rec">Creative mode has unlimited blocks. Switch to Survival in the menu to craft.</div>';return}
 for(const r of RECIPES){
  const d=document.createElement('div'),ok=canCraft(r);d.className='rec'+(ok?'':' no');
  const owned=owns(r);
  d.innerHTML='<div><div class="rn">'+ico(r.ic||'box',18)+r.n+'</div><small>'+Object.entries(r.cost).map(([id,n])=>n+' '+NAMES[id]+' ('+inv[id]+')').join(' + ')+(r.note?' · '+r.note:'')+'</small></div>';
  const b=document.createElement('button');b.textContent=owned?'Owned':'Craft';b.disabled=!ok;
  b.addEventListener('click',()=>{
   if(!canCraft(r))return;
   for(const[id,n]of Object.entries(r.cost))inv[id]-=n;
   if(r.tier)tools[r.tier.k]=r.tier.l;else r.give();renderArmor();sfxCraft();toast('Crafted '+r.n,1200);renderSlots();renderInfo();renderCraft();
  });
  d.appendChild(b);recsEl.appendChild(d);
 }
}
function openCraft(){
 if(dead||!started)return;
 craftOpen=true;renderCraft();craftEl.style.display='flex';setRunning(false,false);
 if(!touch&&document.pointerLockElement)document.exitPointerLock();
}
function closeCraft(){
 craftOpen=false;craftEl.style.display='none';
 if(touch)setRunning(true);else renderer.domElement.requestPointerLock();
}
$('#craftClose').addEventListener('click',closeCraft);
makeTouchBtn($('#craftBtn'),()=>{craftOpen?closeCraft():openCraft()});

