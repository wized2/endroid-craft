// hunger.js - food, hunger, saturation, exhaustion, starvation, eating (Minecraft Java rules).
// food 0-20 (10 drumsticks), saturation, exhaustion: at 4 exhaustion -> -1 saturation (or -1 food if none left).
// food>=18: heal 1 HP / 4 s; food=20 with saturation: 1 HP / 0.5 s (each HP costs 6 exhaustion).
// food=0: starvation 1 HP / 4 s down to half a heart. Sprint needs food > 6. Eating takes 1.6 s.
const FOODS={18:[3,1.8],19:[8,12.8],20:[3,1.8],21:[8,12.8],22:[2,1.2],23:[6,9.6],24:[4,2.4],25:[4,.8],28:[4,9.6],34:[5,6],35:[3,3.6],36:[1,0.6]}; // bread, carrot, potato
let starveT=0,eatT=0,eatId=0;
const foodEl=$('#food'),eatBar=$('#eatbar'),eatFill=eatBar.querySelector('i');
let lastFood=-1;
function addExh(x){if(surv())exh+=x}
function renderFood(){
 let s='';for(let i=0;i<10;i++){const v=food-i*2;s+='<span class="hr fd '+(v>=2?'full':v===1?'half':'empty')+'">'+ico('drumstick',17,'','currentColor')+'<span class="f">'+ico('drumstick',17,'','currentColor')+'</span></span>'}
 foodEl.innerHTML=surv()?s:'';
}
function pickFood(){
 const miss=20-food,own=Object.keys(FOODS).map(Number).filter(i=>inv[i]>0);
 if(!own.length)return 0;
 const safe=own.filter(i=>i!==25&&i!==28);
 if(inv[28]>0&&hp<=8)return 28; // golden apple when badly hurt
 const pool=safe.length?safe:own.filter(i=>i===25);
 if(!pool.length)return 0;
 pool.sort((a,b)=>FOODS[b][0]-FOODS[a][0]);
 return pool.find(i=>FOODS[i][0]<=miss+2)||pool[pool.length-1];
}
function startEat(){
 if(!surv()||dead||eatT>0||sleepT>0)return;
 const id=pickFood();
 if(!id){toast(Object.keys(FOODS).some(i=>inv[i]>0)?'Not hungry':'No food - hunt a pig, cow or sheep',1600);return}
 if(food>=20&&id!==28){toast('Not hungry',1000);return}
 eatId=id;eatT=1.6;eatBar.style.opacity=1;
}
function updateHunger(dt){
 if(!surv()||dead){eatBar.style.opacity=0;return}
 // eating
 if(eatT>0){
  eatT-=dt;eatFill.style.width=Math.min(100,(1-eatT/1.6)*100)+'%';
  if(Math.floor(eatT*5)!==Math.floor((eatT+dt)*5))sfxTick(7);
  if(eatT<=0){
   eatBar.style.opacity=0;
   if(inv[eatId]>0){
    inv[eatId]--;const f=FOODS[eatId];food=Math.min(20,food+f[0]);sat=Math.min(food,sat+f[1]);
    if(eatId===28){hp=Math.min(20,hp+4);renderHearts()}
    ate++;sfxCraft();toast('Ate '+NAMES[eatId],1100);renderSlots();renderInfo();dirtySave=true;
   }
  }
 }
 // exhaustion -> saturation -> food
 while(exh>=4){exh-=4;if(sat>0)sat=Math.max(0,sat-1);else if(food>0)food--}
 // natural regeneration / starvation
 if(hp>0&&hp<20&&food>=18){
  regenT+=dt;const iv=(food>=20&&sat>0)?.5:4;
  if(regenT>=iv){regenT=0;hp++;exh+=6;renderHearts()}
 }else regenT=0;
 if(food<=0){starveT+=dt;if(starveT>=4){starveT=0;if(hp>1){hp--;flash=1;sfxHurt();renderHearts()}}}else starveT=0;
 if(food!==lastFood){lastFood=food;renderFood()}
}
makeTouchBtn($('#bEat'),startEat);
