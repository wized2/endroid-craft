// weather.js - rain: falling streaks, darker sky, soft noise. Random showers every few minutes.
const weather={rain:0,target:0,t:50+Math.random()*60};
const RN=700,rainPos=new Float32Array(RN*6),rainGeo=new THREE.BufferGeometry();
for(let i=0;i<RN;i++){rainPos[i*6]=P.x+(Math.random()-.5)*32;rainPos[i*6+1]=P.y+Math.random()*16-4;rainPos[i*6+2]=P.z+(Math.random()-.5)*32}
rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rainMat=new THREE.LineBasicMaterial({color:0xaac4ff,transparent:true,opacity:0,fog:false,depthWrite:false});
const rainMesh=new THREE.LineSegments(rainGeo,rainMat);rainMesh.frustumCulled=false;rainMesh.visible=false;scene.add(rainMesh);
let rainSnd=0;
function setRain(on){weather.target=on?1:0;weather.t=on?40+Math.random()*50:90+Math.random()*150}
function updateWeather(dt){
 if(running){weather.t-=dt;if(weather.t<=0){const on=weather.target===0&&Math.random()<.6;setRain(on);if(on)toast('It starts to rain...',2000);else if(weather.rain>.5)toast('The rain stops',1800)}}
 weather.rain+=(weather.target-weather.rain)*Math.min(1,dt*.5);
 if(Math.abs(weather.target-weather.rain)<.01)weather.rain=weather.target;
 const r=weather.rain;
 rainMesh.visible=r>.02&&!camInWater;
 if(!rainMesh.visible)return;
 rainMat.opacity=.55*r;
 const n=Math.floor(RN*Math.min(1,r*1.2));
 rainGeo.setDrawRange(0,n*2);
 for(let i=0;i<RN;i++){
  const o=i*6;
  rainPos[o+1]-=26*dt;
  if(rainPos[o+1]<P.y-8||Math.abs(rainPos[o]-P.x)>17||Math.abs(rainPos[o+2]-P.z)>17){
   rainPos[o]=P.x+(Math.random()-.5)*32;rainPos[o+1]=P.y+8+Math.random()*8;rainPos[o+2]=P.z+(Math.random()-.5)*32;
  }
  rainPos[o+3]=rainPos[o]+.04;rainPos[o+4]=rainPos[o+1]+.55;rainPos[o+5]=rainPos[o+2];
 }
 rainGeo.attributes.position.needsUpdate=true;
 rainSnd-=dt;if(rainSnd<=0&&running){rainSnd=.12;playNoise(.1,.012*r,2500)}
}
