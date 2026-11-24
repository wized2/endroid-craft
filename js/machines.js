// machines.js - furnace smelting + chest storage (Minecraft-like)
// Block ids: 39 furnace, 40 chest, 41 torch
const SMELT={12:/*coal stays*/null,18:19,20:21,22:23,13:37,44:46}; // raw meats -> cooked; gold ore -> emerald (stand-in for ingot)
// gold ore to emerald is a simplification for "valuable smelt"
const furnaces=new Map(); // key "x,y,z" -> {fuel,prog,inId,outId}
const chests=new Map();

function posKey(x,y,z){return x+','+y+','+z}
function openFurnace(x,y,z){
 const k=posKey(x,y,z);if(!furnaces.has(k))furnaces.set(k,{fuel:0,prog:0,inId:0,outId:0,outN:0});
 const f=furnaces.get(k);
 const el=$('#furnace');if(!el)return;
 $('#furnStatus').textContent=f.fuel>0?('Fuel '+f.fuel.toFixed(1)+'s · smelt '+(f.prog*100|0)+'%'):'Add coal (hotbar) then raw food / ore';
 el.style.display='flex';
 if(running)setRunning(false,false);
 window._furnPos=[x,y,z];
}
function closeFurnace(){const el=$('#furnace');if(el)el.style.display='none';window._furnPos=null}
function tickFurnaces(dt){
 for(const[k,f]of furnaces){
  if(f.fuel>0)f.fuel-=dt;
  if(f.inId&&SMELT[f.inId]&&f.fuel>0){
   f.prog+=dt/8; // 8s smelt
   if(f.prog>=1){
    f.prog=0;const out=SMELT[f.inId];
    if(out){f.outId=out;f.outN=(f.outN||0)+1}
    f.inId=0;
   }
  }else f.prog=0;
 }
}
function furnFeed(){
 if(!window._furnPos)return;
 const[x,y,z]=window._furnPos;const f=furnaces.get(posKey(x,y,z));if(!f)return;
 const id=HB[si];
 if(id===12){ // coal as fuel
  if(surv()&&inv[12]<=0){toast('No coal',900);return}
  if(surv())inv[12]--;f.fuel+=40;renderSlots();toast('Fueled furnace',900);return;
 }
 if(SMELT[id]){
  if(f.inId){toast('Furnace busy',900);return}
  if(surv()&&inv[id]<=0)return;
  if(surv())inv[id]--;f.inId=id;f.prog=0;renderSlots();toast('Smelting '+NAMES[id],900);
 }
}
function furnTake(){
 if(!window._furnPos)return;
 const f=furnaces.get(posKey(...window._furnPos));if(!f||!f.outN){toast('Nothing ready',900);return}
 if(surv())inv[f.outId]=(inv[f.outId]|0)+f.outN;
 toast('Took '+f.outN+'× '+(NAMES[f.outId]||'?'),1000);
 f.outN=0;f.outId=0;renderSlots();
}
function openChest(x,y,z){
 const k=posKey(x,y,z);if(!chests.has(k))chests.set(k,{});
 const c=chests.get(k);
 const el=$('#chest');if(!el)return;
 const list=$('#chestList');list.innerHTML='';
 const keys=Object.keys(c).filter(i=>c[i]>0);
 if(!keys.length)list.innerHTML='<p style="opacity:.7">Empty — use Deposit to store hotbar item</p>';
 for(const id of keys){
  const row=document.createElement('button');row.className='mc small';row.style.display='block';row.style.width='100%';row.style.margin='4px 0';
  row.textContent=(NAMES[id]||id)+' ×'+c[id];
  makeTouchBtn(row,()=>{
   if(surv()){inv[id]=(inv[id]|0)+c[id]}c[id]=0;renderSlots();openChest(x,y,z);
  });
  list.appendChild(row);
 }
 el.style.display='flex';
 if(running)setRunning(false,false);
 window._chestPos=[x,y,z];
}
function closeChest(){const el=$('#chest');if(el)el.style.display='none';window._chestPos=null}
function chestDeposit(){
 if(!window._chestPos)return;
 const k=posKey(...window._chestPos);const c=chests.get(k)||{};chests.set(k,c);
 const id=HB[si];if(!id)return;
 if(surv()){
  if(inv[id]<=0){toast('Nothing to deposit',900);return}
  const n=inv[id];inv[id]=0;c[id]=(c[id]|0)+n;renderSlots();
 }else c[id]=(c[id]|0)+64;
 toast('Deposited',800);openChest(...window._chestPos);
}
// Sheep shear with shears (43) or any when creative
function tryShear(m){
 if(!m||m.type!=='s'||m.sheared)return false;
 const id=HB[si];
 if(surv()&&id!==43&&tools.axe<1){toast('Need shears (craft) or axe',1200);return false}
 m.sheared=true;m.g.traverse(o=>{if(o.isMesh&&o.userData.base)o.userData.base.setRGB(.85,.75,.7)});
 if(surv()){inv[26]=(inv[26]|0)+1+((Math.random()*2)|0);renderSlots()}
 toast('Sheared wool',900);return true;
}
