// crafting.js - recipes + crafting UI
// ---------- crafting ----------
const tier=(k,l)=>({k,l});
const RECIPES=[
 {ic:'layers',n:'Planks ×4',cost:{4:1},give(){inv[7]+=4}},
 {ic:'stick',n:'Sticks ×4',cost:{7:2},give(){inv[42]=(inv[42]|0)+4},note:'For torches & tools'},
 {ic:'torch',n:'Torch ×4',cost:{42:1,12:1},give(){inv[41]=(inv[41]|0)+4},note:'Stick + coal'},
 {ic:'chest',n:'Chest',cost:{7:8},give(){inv[40]=(inv[40]|0)+1},note:'Store items'},
 {ic:'furnace',n:'Furnace',cost:{3:8},give(){inv[39]=(inv[39]|0)+1},note:'Smelt food & ore'},
 {ic:'shears',n:'Shears',cost:{3:2},give(){inv[43]=(inv[43]|0)+1},note:'Shear sheep'},
 {ic:'bread',n:'Bread ×1',cost:{33:3},give(){inv[34]=(inv[34]|0)+1},note:'3 seeds of wheat → bread'},
 {ic:'bread',n:'Bread ×4',cost:{33:10},give(){inv[34]=(inv[34]|0)+4},note:'Bake a loaf stack'},
 {ic:'pickaxe',n:'Wooden Pickaxe',cost:{7:5},tier:tier('pick',1),note:'Mines stone, coal'},
 {ic:'sword',n:'Wooden Sword',cost:{7:3},tier:tier('sword',1),note:'Damage 4'},
 {ic:'axe',n:'Wooden Axe',cost:{7:5},tier:tier('axe',1),note:'Chops 2x faster'},
 {ic:'pickaxe',n:'Stone Pickaxe',cost:{7:2,3:3},tier:tier('pick',2),note:'Mines gold ore, 2x faster'},
 {ic:'sword',n:'Stone Sword',cost:{7:1,3:2},tier:tier('sword',2),note:'Damage 5'},
 {ic:'axe',n:'Stone Axe',cost:{7:2,3:3},tier:tier('axe',2),note:'Chops 4x faster'},
 {ic:'gem',n:'Smelt Iron Ingot',cost:{44:1,12:1},give(){inv[46]=(inv[46]|0)+1},note:'Iron ore + coal'},
 {ic:'pickaxe',n:'Iron Pickaxe',cost:{42:2,46:3},tier:tier('pick',3),note:'Mines diamond, 6x faster'},
 {ic:'sword',n:'Iron Sword',cost:{42:1,46:2},tier:tier('sword',3),note:'Damage 6'},
 {ic:'axe',n:'Iron Axe',cost:{42:2,46:3},tier:tier('axe',3),note:'Chops 6x faster'},
 {ic:'pickaxe',n:'Diamond Pickaxe',cost:{42:2,47:3},tier:tier('pick',4),note:'8x faster'},
 {ic:'sword',n:'Diamond Sword',cost:{42:1,47:2},tier:tier('sword',4),note:'Damage 7'},
 {ic:'axe',n:'Diamond Axe',cost:{42:2,47:3},tier:tier('axe',4),note:'Chops 8x faster'},
 {ic:'shield',n:'Iron Armor',cost:{46:8},once:'a3',give(){tools.a3=true},note:'-60% melee damage'},
 {ic:'shield',n:'Diamond Armor',cost:{47:8},once:'a4',give(){tools.a4=true},note:'-80% melee damage'},
 {ic:'torch',n:'Flint & Steel',cost:{46:1,49:1},give(){inv[55]=(inv[55]|0)+1},note:'Right-click TNT to light it'},
 {ic:'box',n:'Ladder x3',cost:{42:7},give(){inv[57]=(inv[57]|0)+3},note:'Hold JUMP to climb'},
 {ic:'box',n:'TNT',cost:{52:5,6:4},give(){inv[48]=(inv[48]|0)+1},note:'5 gunpowder + 4 sand'},
 {ic:'steak',n:'Cook 2 Chicken',cost:{53:2,12:1},give(){inv[54]=(inv[54]|0)+2},note:'Coal as fuel. Heals 6 food'},
 {ic:'porkchop',n:'Cook 2 Porkchops',cost:{18:2,12:1},give(){inv[19]+=2},note:'Coal as fuel. Heals 8 food'},
 {ic:'steak',n:'Cook 2 Steaks',cost:{20:2,12:1},give(){inv[21]+=2},note:'Coal as fuel. Heals 8 food'},
 {ic:'mutton',n:'Cook 2 Mutton',cost:{22:2,12:1},give(){inv[23]+=2},note:'Coal as fuel. Heals 6 food'},
 {ic:'bed',n:'Bed',cost:{7:3,26:3},give(){inv[17]++},note:'Sleep at night, set spawn'},
 {ic:'leather',n:'Leather Armor',cost:{27:8},once:'a1',give(){tools.a1=true},note:'-28% melee damage'},
 {ic:'shield',n:'Gold Armor',cost:{13:8},once:'a2',give(){tools.a2=true},note:'-44% melee damage'},
 {ic:'golden-apple',n:'Golden Apple',cost:{13:8,24:1},give(){inv[28]++},note:'Heals 4 HP + food (eat with F)'},
 {ic:'box',n:'Bricks ×4',cost:{3:4},give(){inv[8]+=4}},
 {ic:'square',n:'Glass ×2',cost:{6:2,12:1},give(){inv[10]+=2}}
];
const craftEl=$('#craft'),recsEl=$('#recs');
let craftOpen=false;
const owns=r=>(r.once&&tools[r.once])||(r.tier&&tools[r.tier.k]>=r.tier.l);
const canCraft=r=>Object.entries(r.cost).every(([id,n])=>inv[id]>=n)&&!owns(r);
const BAG=[[12,'Coal','box'],[13,'Gold','gem'],[37,'Emerald','emerald'],[26,'Wool','wool'],[27,'Leather','leather'],[33,'Seeds','seeds'],[34,'Bread','bread'],[18,'Raw Pork','porkchop'],[19,'Cooked Pork','porkchop'],[20,'Raw Beef','steak'],[21,'Steak','steak'],[22,'Raw Mutton','mutton'],[23,'Mutton','mutton'],[24,'Apple','apple'],[28,'Golden Apple','golden-apple'],[25,'Rotten Flesh','drumstick'],[42,'Sticks','stick'],[41,'Torch','torch'],[39,'Furnace','furnace'],[40,'Chest','chest'],[43,'Shears','shears'],[44,'Iron Ore','gem'],[46,'Iron Ingot','gem'],[47,'Diamond','gem'],[52,'Gunpowder','box'],[48,'TNT','box'],[49,'Gravel','box'],[51,'Sapling','apple'],[53,'Raw Chicken','drumstick'],[54,'Cooked Chicken','drumstick'],[55,'Flint & Steel','torch'],[56,'Bone','box'],[57,'Ladder','box']];
function backpackHTML(){
 const T=['','Wooden','Stone','Iron','Diamond'],gear=[];
 if(tools.pick)gear.push(ico('pickaxe',14)+T[tools.pick]);if(tools.axe)gear.push(ico('axe',14)+T[tools.axe]);if(tools.sword)gear.push(ico('sword',14)+T[tools.sword]);if(armorLvl())gear.push(ico('shield',14)+['','Leather','Gold','Iron','Diamond'][armorLvl()]);
 const items=BAG.filter(b=>inv[b[0]]>0).map(b=>'<span class="bagi" title="'+b[1]+'">'+ico(b[2],14)+b[1]+' <b>'+inv[b[0]]+'</b></span>');
 const all=gear.map(g=>'<span class="bagi">'+g+'</span>').concat(items);
 return '<div class="rec bag"><div><div class="rn">'+ico('layers',18)+'Backpack</div><div class="bagl">'+(all.join('')||'<small>Empty</small>')+'</div></div></div>';
}
function renderCraft(){
 recsEl.innerHTML='';
 if(surv())recsEl.insertAdjacentHTML('beforeend',backpackHTML());
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

