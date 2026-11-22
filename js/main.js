// main.js - game loop (runs last)
// ---------- main loop ----------
let shotReq=false;
applyMode();document.body.classList.toggle('bigctl',!!SET.bigCtl);renderAir();sel(0);
updateChunks(40);
// make sure the player starts somewhere sensible (not inside a tree / underwater / in rock)
{
 const inBlock=()=>solidB(getBlock(Math.floor(P.x),Math.floor(P.y+.5),Math.floor(P.z)))||solidB(getBlock(Math.floor(P.x),Math.floor(P.y+1.5),Math.floor(P.z)));
 if(!(saved&&saved.spawn)||inBlock()){
  const s=findSafeSpawn(P.x,P.z);
  if(s){if(!(saved&&saved.spawn))spawn=s;P.x=s[0];P.y=s[1];P.z=s[2];P.vx=P.vy=P.vz=0;fallY=P.y}
 }
}
playBtn.textContent='Play';
setSky();renderInfo();
let last=performance.now(),fc=0,ft=0,lastDay=Math.floor(clock/DAY);
function frame(now){
 requestAnimationFrame(frame);
 const dt=Math.min((now-last)/1000,.05);last=now;
 if(running){update(dt);clock+=dt;const dn=Math.floor(clock/DAY);if(dn!==lastDay){lastDay=dn;if(surv())toast('Day '+(dn+1)+' — you survived the night!',2600)}}
 updateChunks(touch?1:2);
updateWeather(dt);
updateSleep(dt);
updateHunger(dt);
if(running&&typeof updateFarming==='function')updateFarming(dt);
if(running&&typeof tickFurnaces==='function')tickFurnaces(dt);
if(running)updateObjectives(dt);
 placeCamera(dt);
 refreshAim();target=raycast(eye,dir,REACH_B+.6);
 if(running){
  interact(dt);updateMobs(dt);spawnMobs(dt);
  if(P.onGround&&Math.hypot(P.vx,P.vz)>.3){}
  if(swing>0)swing=Math.max(0,swing-dt*5.5);
  const arc=Math.sin(swing*Math.PI),bobY=Math.abs(Math.sin(walkClock))*.015,bobX=Math.cos(walkClock)*.012;
  handGroup.position.set(.32+bobX-arc*.08,-.26+bobY-arc*.06,-.48-arc*.14);
  handGroup.rotation.set(.2-arc*.5,-.35+arc*.3,.1-arc*.4);
 }
 for(const p of particles){
  if(p.life<=0)continue;
  p.life-=dt;
  if(p.life<=0){p.mesh.visible=false;continue}
  p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.vy-=16*dt;
  p.mesh.scale.setScalar(Math.max(.01,p.life/p.maxLife));
 }
 if(target&&running&&!hoverMob&&target.t<=5.2){hl.visible=true;hl.position.set(target.x+.5,target.y+.5,target.z+.5)}else hl.visible=false;
 setSky();
 renderer.render(scene,camera);
 if(shotReq){shotReq=false;try{const a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='endroid-craft-'+Date.now()+'.png';a.click();toast('Screenshot saved',1400)}catch(e){toast('Screenshot failed',1400)}}
 fc++;ft+=dt;
 if(ft>=.5){fpsTxt=Math.round(fc/ft)+' fps  |  '+Math.floor(P.x)+', '+Math.floor(P.y)+', '+Math.floor(P.z);fc=0;ft=0;renderInfo()}
}
requestAnimationFrame(frame);
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
