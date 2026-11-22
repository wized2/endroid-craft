// farming.js - farmland, crop growth, planting, harvest (Minecraft-like)
// Blocks: 29 farmland, 30-32 wheat stages. Items: 33 seeds, 34 bread, 35 carrot, 36 potato
const CROP_NEXT={30:31,31:32};
let farmTick=0;
function nearWater(x,y,z){
 for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){
  if(getBlock(x+dx,y,z+dz)===9||getBlock(x+dx,y-1,z+dz)===9)return true;
 }
 return false;
}
function tillSoil(x,y,z){
 const b=getBlock(x,y,z);
 if(b!==1&&b!==2&&b!==38)return false;
 if(getBlock(x,y+1,z)!==0&&!isPlant(getBlock(x,y+1,z)))return false;
 setBlock(x,y,z,29);
 sfxPlace();vib(10);
 return true;
}
function plantCrop(x,y,z,seedId){
 // seedId 33 wheat, 35 carrot (uses wheat stages visually for now)
 if(getBlock(x,y,z)!==29)return false;
 if(getBlock(x,y+1,z)!==0)return false;
 setBlock(x,y+1,z,30);
 if(surv()){inv[seedId]--;renderSlots()}
 sfxPlace();vib(8);
 return true;
}
function harvestCrop(x,y,z){
 const b=getBlock(x,y,z);
 if(b===32){
  setBlock(x,y,z,0);
  if(surv()){inv[33]+=1+((Math.random()*2)|0);inv[34]= (inv[34]|0); /* wheat -> can craft bread */ toast('Harvested wheat',900);renderSlots();renderInfo()}
  else toast('Harvested',700);
  sfxBreak(32);return true;
 }
 if(b===30||b===31){setBlock(x,y,z,0);if(surv()){inv[33]++;renderSlots()}return true}
 return false;
}
function updateFarming(dt){
 farmTick+=dt;
 if(farmTick<2.5)return; // growth check every 2.5s
 farmTick=0;
 // Grow crops near the player (performance)
 const px=Math.floor(P.x),pz=Math.floor(P.z),py=Math.floor(P.y);
 for(let dx=-8;dx<=8;dx++)for(let dz=-8;dz<=8;dz++)for(let dy=-2;dy<=2;dy++){
  const x=px+dx,y=py+dy,z=pz+dz;
  const b=getBlock(x,y,z);
  if(!CROP_NEXT[b])continue;
  const below=getBlock(x,y-1,z);
  if(below!==29)continue;
  // hydrated farmland grows faster
  const chance=nearWater(x,y-1,z)?.45:.18;
  if(Math.random()<chance)setBlock(x,y,z,CROP_NEXT[b],true);
 }
}
// Try farm interaction from place/break hooks
function tryFarmUse(target){
 if(!target)return false;
 const id=HB[si];
 // Seeds on dirt/grass/farmland
 if(id===33||id===35||id===36){
  const tb=getBlock(target.x,target.y,target.z);
  if(tb===1||tb===2||tb===38){
   if(surv()&&inv[id]<=0)return false;
   tillSoil(target.x,target.y,target.z);
   return plantCrop(target.x,target.y,target.z,id===33?33:id);
  }
  if(tb===29){
   if(surv()&&inv[id]<=0)return false;
   return plantCrop(target.x,target.y,target.z,id===33?33:id);
  }
 }
 // Empty hand / hoe-like: till with any tool on dirt (creative always)
 if((id===0||!surv())&&(getBlock(target.x,target.y,target.z)===1||getBlock(target.x,target.y,target.z)===2)){
  return tillSoil(target.x,target.y,target.z);
 }
 return false;
}
