// crafting.js - recipes + crafting UI
// ---------- crafting ----------
const RECIPES=[
 {ic:'layers',n:'Planks ×4',cost:{4:1},give(){inv[7]+=4}},
 {ic:'pickaxe',n:'Stone Pickaxe',cost:{7:3,3:3},once:'pick',give(){tools.pick=true},note:'Mines much faster'},
 {ic:'sword',n:'Stone Sword',cost:{7:2,3:2},once:'sword',give(){tools.sword=true},note:'Damage 5'},
 {ic:'bed',n:'Bed',cost:{7:3,5:3},give(){inv[17]++},note:'Sleep at night, set spawn (leaves = wool)'},
 {ic:'sword',n:'Gold Sword',cost:{13:3,7:1},once:'gsword',give(){tools.gsword=true},note:'Damage 6, best'},
 {ic:'shield',n:'Stone Armor',cost:{3:8,7:2},once:'a1',give(){tools.a1=true},note:'-25% melee damage'},
 {ic:'shield',n:'Gold Armor',cost:{13:6},once:'a2',give(){tools.a2=true},note:'-45% melee damage'},
 {ic:'box',n:'Bricks ×4',cost:{3:4},give(){inv[8]+=4}},
 {ic:'square',n:'Glass ×2',cost:{6:2,12:1},give(){inv[10]+=2}},
 {ic:'apple',n:'Golden Apple',cost:{13:3},give(){hp=20;renderHearts()},note:'Restores all health'}
];
const craftEl=$('#craft'),recsEl=$('#recs');
let craftOpen=false;
const canCraft=r=>Object.entries(r.cost).every(([id,n])=>inv[id]>=n)&&!(r.once&&tools[r.once]);
function renderCraft(){
 recsEl.innerHTML='';
 if(!surv()){recsEl.innerHTML='<div class="rec">Creative mode has unlimited blocks. Switch to Survival in the menu to craft.</div>';return}
 for(const r of RECIPES){
  const d=document.createElement('div'),ok=canCraft(r);d.className='rec'+(ok?'':' no');
  const owned=r.once&&tools[r.once];
  d.innerHTML='<div><div class="rn">'+ico(r.ic||'box',18)+r.n+'</div><small>'+Object.entries(r.cost).map(([id,n])=>n+' '+NAMES[id]+' ('+inv[id]+')').join(' + ')+(r.note?' · '+r.note:'')+'</small></div>';
  const b=document.createElement('button');b.textContent=owned?'Owned':'Craft';b.disabled=!ok;
  b.addEventListener('click',()=>{
   if(!canCraft(r))return;
   for(const[id,n]of Object.entries(r.cost))inv[id]-=n;
   r.give();renderArmor();sfxCraft();toast('Crafted '+r.n,1200);renderSlots();renderInfo();renderCraft();
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

