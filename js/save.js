// save.js - localStorage save
// ---------- save ----------
function save(){
 if(saveOff)return;
 try{
  localStorage.setItem(SAVEKEY,JSON.stringify({v:2,s:SEED,mode,hp,clock,kills,inv,tools,spawn,
   e:Object.fromEntries([...edits].map(([k,m])=>[k,Object.fromEntries(m)])),
   p:dead?[spawn[0],spawn[1],spawn[2],0,0]:[P.x,P.y,P.z,yaw,pitch]}));
 }catch(e){}
 dirtySave=false;
}
setInterval(()=>{if(running||dirtySave)save()},5000);
addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});

