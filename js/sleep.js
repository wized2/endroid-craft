// sleep.js - beds: right-click / PLACE on a bed sets your spawn; at night it skips to morning (like Minecraft).
// You can't sleep in daytime or with a zombie within 8 blocks.
let sleepT=0,sleepDone=false,sleeps=(saved&&saved.zs|0)||0;
const SLEEP_LEN=3.2,sleepEl=$('#sleepfx');
function useBed(x,y,z){
 spawn=[x+.5,y+1.01,z+.5];dirtySave=true;
 if(sleepT>0)return;
 if(dayK>=.35){toast('Respawn point set. You can only sleep at night.',2600);return}
 for(const m of mobs)if(m.type==='z'&&Math.abs(m.x-x)<8&&Math.abs(m.z-z)<8&&Math.abs(m.y-y)<5){toast('You may not rest now, there are monsters nearby',2800);return}
 sleepT=SLEEP_LEN;sleepDone=false;toast('Respawn point set',1400);
}
function updateSleep(dt){
 if(sleepT<=0){if(sleepEl.style.opacity!=='0')sleepEl.style.opacity=0;return}
 sleepT-=dt;const k=Math.max(0,sleepT/SLEEP_LEN);
 sleepEl.style.opacity=Math.min(1,Math.sin((1-k)*Math.PI)*1.7);
 if(!sleepDone&&k<.5){
  sleepDone=true;sleeps++;
  clock=(Math.floor(clock/DAY)+1)*DAY+DAY*.1; // next morning
  for(let i=mobs.length-1;i>=0;i--)if(mobs[i].type==='z')removeMob(i);
  if(typeof setRain==='function'){setRain(false);weather.rain=0}
  toast('Good morning!',2200);renderInfo();dirtySave=true;
 }
}
