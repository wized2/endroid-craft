// scene.js - renderer, camera, sky, clouds, hand, particles
// ---------- renderer & scene ----------
const renderer=new THREE.WebGLRenderer({antialias:!touch});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,touch?1.5:2));
renderer.setSize(innerWidth,innerHeight);
document.body.prepend(renderer.domElement);
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x87ceeb,R*CS*.5,R*CS*.92);
const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,220);
camera.rotation.order='YXZ';
scene.add(camera);
const matO=new THREE.MeshBasicMaterial({map:atlasTex,vertexColors:true,alphaTest:.5});
const matW=new THREE.MeshBasicMaterial({map:atlasTex,vertexColors:true,transparent:true,opacity:.68,depthWrite:false});
const matG=new THREE.MeshBasicMaterial({map:atlasTex,vertexColors:true,transparent:true,depthWrite:false});
const dayC=new THREE.Color(0x87ceeb),nightC=new THREE.Color(0x070b1c),sky=new THREE.Color(),waterFogC=new THREE.Color(0x0e4368);
let L=1,dayK=1,camInWater=false;
const sun=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshBasicMaterial({color:0xfff2a0,side:THREE.DoubleSide,fog:false}));
const moon=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshBasicMaterial({color:0xd8e8ff,side:THREE.DoubleSide,fog:false}));
scene.add(sun);scene.add(moon);
const starPos=[];
for(let i=0;i<220;i++){const r=140+Math.random()*40,th=Math.random()*Math.PI*2,ph=Math.acos(Math.random()*.85);starPos.push(r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph),r*Math.sin(ph)*Math.sin(th))}
const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
const starMat=new THREE.PointsMaterial({color:0xffffff,size:2,transparent:true,opacity:0,fog:false});
const stars=new THREE.Points(starGeo,starMat);scene.add(stars);
// blocky clouds
const CSZ=384;
const cloudTex=(()=>{
 const cv=document.createElement('canvas');cv.width=cv.height=48;const x=cv.getContext('2d');
 for(let j=0;j<48;j++)for(let i=0;i<48;i++){const n=fbm(i*.11+9,j*.11+4);if(n>.56){x.fillStyle='rgba(255,255,255,'+Math.min(.9,(n-.5)*4)+')';x.fillRect(i,j,1,1)}}
 const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=false;return t;
})();
const cloudGeo=new THREE.PlaneGeometry(CSZ,CSZ);cloudGeo.rotateX(-Math.PI/2);
const cloudMat=new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,depthWrite:false,opacity:.85});
const clouds=new THREE.Mesh(cloudGeo,cloudMat);scene.add(clouds);
const handMats=[];
function setSky(){
 const s=Math.sin(clock/DAY*Math.PI*2),k=Math.max(0,Math.min(1,s*1.5+.5));dayK=k;
 const ang=(clock/DAY)*Math.PI*2;
 sun.position.set(P.x+Math.sin(ang)*120,P.y+Math.cos(ang)*120,P.z+20);sun.lookAt(P.x,P.y,P.z);
 moon.position.set(P.x-Math.sin(ang)*120,P.y-Math.cos(ang)*120,P.z-20);moon.lookAt(P.x,P.y,P.z);
 stars.position.set(P.x,P.y,P.z);starMat.opacity=Math.max(0,(.35-k)*2.5);
 clouds.position.set(P.x,62,P.z);cloudTex.offset.set(P.x/CSZ+clock*.0016,-P.z/CSZ);
 if(camInWater){scene.background=waterFogC;scene.fog.color.copy(waterFogC);scene.fog.near=1;scene.fog.far=18;L=.55}
 else{sky.lerpColors(nightC,dayC,k);if(weather.rain>.01)sky.multiplyScalar(1-.35*weather.rain);scene.background=sky;scene.fog.color.copy(sky);scene.fog.near=R*CS*.5;scene.fog.far=R*CS*.92;L=(.28+.72*k)*(1-.2*weather.rain)}
 matO.color.setScalar(L);matW.color.setScalar(L);matG.color.setScalar(L);cloudMat.color.setScalar(.35+.65*k);
 for(const m of handMats)m.color.setScalar(Math.max(.5,L));
}
const hl=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004)),new THREE.LineBasicMaterial({color:0x000000}));
hl.visible=false;scene.add(hl);
const crack=new THREE.Mesh(new THREE.BoxGeometry(1.005,1.005,1.005),new THREE.MeshBasicMaterial({map:crackTex[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
crack.visible=false;scene.add(crack);
// first-person held block
const handGroup=new THREE.Group();camera.add(handGroup);
const handGeo=new THREE.BoxGeometry(.18,.18,.18);
const handMat=new THREE.MeshBasicMaterial({map:atlasTex,alphaTest:.5});handMats.push(handMat);
const handMesh=new THREE.Mesh(handGeo,handMat);handMesh.rotation.set(.2,.4,0);handGroup.add(handMesh);
handGroup.position.set(.32,-.26,-.48);
function updateHandBlock(b){
 const uv=handGeo.attributes.uv;
 for(let f=0;f<6;f++){const[u0,v0,u1,v1]=tileUV(tileFor(b,f));for(let k=0;k<4;k++)uv.setXY(f*4+k,(k%2)?u1:u0,k<2?v1:v0)}
 uv.needsUpdate=true;
}
// particles
const particles=[];
const pGeo=new THREE.BoxGeometry(.09,.09,.09);
for(let i=0;i<48;i++){const m=new THREE.Mesh(pGeo,new THREE.MeshBasicMaterial({color:0xffffff}));m.visible=false;scene.add(m);particles.push({mesh:m,vx:0,vy:0,vz:0,life:0,maxLife:.4})}
function spawnParticles(x,y,z,rgb,n){
 let c=0;
 for(const p of particles){
  if(p.life>0)continue;
  const j=.8+Math.random()*.4;p.mesh.material.color.setRGB(Math.min(1,rgb[0]*j*L),Math.min(1,rgb[1]*j*L),Math.min(1,rgb[2]*j*L));
  p.mesh.position.set(x+(Math.random()-.5)*.6,y+(Math.random()-.5)*.6,z+(Math.random()-.5)*.6);
  p.mesh.scale.setScalar(1);p.mesh.visible=true;
  p.vx=(Math.random()-.5)*4;p.vy=Math.random()*3+1.2;p.vz=(Math.random()-.5)*4;p.maxLife=p.life=.35+Math.random()*.25;
  if(++c>=n)break;
 }
}

