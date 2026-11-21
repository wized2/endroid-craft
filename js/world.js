// world.js - chunks, terrain/cave/tree generation, meshing, setBlock, streaming
// ---------- world ----------
const chunks=new Map();
const ck=(x,z)=>((x&0xffff)<<16)|(z&0xffff);
const edits=new Map();
if(saved&&saved.e)for(const k in saved.e)edits.set(+k,new Map(Object.entries(saved.e[k]).map(([i,v])=>[+i,v])));
function getBlock(x,y,z){if(y<0)return 3;if(y>=H)return 0;const c=chunks.get(ck(x>>4,z>>4));if(!c)return -1;return c.d[(x&15)+CS*((z&15)+CS*y)]}
const solidB=b=>b===-1||(b>0&&b!==9&&b<14);
function treeAt(wx,wz,h){
 if(h<=SEA+1||h>=40)return 0;
 const fd=fbm(wx*.02+SX+777,wz*.02+SZ-555),prob=fd>.58?.035:.004;
 if(hsh(wx,wz,2)>=prob)return 0;
 return 4+((hsh(wx,wz,3)*3)|0);
}
function genChunk(cx,cz){
 const d=new Uint8Array(CS*CS*H),hs=new Uint8Array(CS*CS),I=(x,y,z)=>x+CS*(z+CS*y),ext=new Int16Array(400);
 let topH=SEA;
 for(let z=-2;z<CS+2;z++)for(let x=-2;x<CS+2;x++){const h=heightAt(cx*CS+x,cz*CS+z);ext[(x+2)+20*(z+2)]=h;if(h>topH)topH=h}
 for(let z=0;z<CS;z++)for(let x=0;x<CS;x++){
  const wx=cx*CS+x,wz=cz*CS+z,h=ext[(x+2)+20*(z+2)],beach=h<=SEA+1,snow=h>=40;
  hs[x+CS*z]=h;
  for(let y=0;y<=h;y++){
   let b;if(y===h)b=beach?6:(snow?11:1);else if(y>h-4)b=beach?6:2;else b=3;
   d[I(x,y,z)]=b;
  }
  const lim=beach?h-4:h;
  for(let y=3;y<=lim;y++){
   const a=n3(wx*.06,y*.09,wz*.06),b2=n3(wx*.06+100,y*.09+50,wz*.06+100);
   if(Math.abs(a-.5)<.05&&Math.abs(b2-.5)<.05)d[I(x,y,z)]=0;
  }
  for(let y=1;y<h-2;y++){
   if(d[I(x,y,z)]!==3)continue;
   const r=hsh(wx*3+y,wz*5+y*7,1);
   if(r<.003&&y<26)d[I(x,y,z)]=13;else if(r<.02&&y<46)d[I(x,y,z)]=12;
  }
  for(let y=h+1;y<=SEA;y++)d[I(x,y,z)]=9;
 }
 for(let tz=-2;tz<CS+2;tz++)for(let tx=-2;tx<CS+2;tx++){
  const wx=cx*CS+tx,wz=cz*CS+tz,h=ext[(tx+2)+20*(tz+2)],th=treeAt(wx,wz,h);
  if(!th)continue;
  const y=h+1,put=(x,yy,z,b,onlyAir)=>{if(x<0||x>=CS||z<0||z>=CS||yy>=H)return;if(onlyAir&&d[I(x,yy,z)]!==0)return;d[I(x,yy,z)]=b};
  for(let i=0;i<th;i++)put(tx,y+i,tz,4,false);
  for(let dy=th-2;dy<=th+1;dy++){
   const r=dy>=th?1:2;
   for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
    if(Math.abs(dx)===r&&Math.abs(dz)===r&&(dy>=th||hash(wx+dx*31+dy,wz+dz*17)>.5))continue;
    put(tx+dx,y+dy,tz+dz,5,true);
   }
  }
  if(y+th+2>topH)topH=y+th+2;
 }
 for(let z=0;z<CS;z++)for(let x=0;x<CS;x++){
  const h=hs[x+CS*z];if(h>=H-2||d[I(x,h,z)]!==1||d[I(x,h+1,z)]!==0)continue;
  const r=hsh(cx*CS+x,cz*CS+z,4);
  if(r<.1)d[I(x,h+1,z)]=16;else if(r<.108)d[I(x,h+1,z)]=14;else if(r<.116)d[I(x,h+1,z)]=15;
 }
 const e=edits.get(ck(cx,cz));if(e)for(const[i,v]of e)d[i]=v;
 chunks.set(ck(cx,cz),{cx,cz,d,hs,top:Math.min(H-1,topH+9),mO:null,mW:null,mG:null,dirty:true});
}
const AX=[[1,2],[1,2],[0,2],[0,2],[0,1],[0,1]];
const SHD=[.82,.82,1,.55,.92,.72],AOV=[.5,.68,.84,1],E1=[0,0,0],E2=[0,0,0];
const PQ=[[[0,0,0],[1,0,1],[1,1,1],[0,1,0]],[[1,0,0],[0,0,1],[0,1,1],[1,1,0]]];
const isOp=b=>b>0&&b!==9&&b!==10&&b<14;
function build(c){
 const{cx,cz,d}=c,mkb=()=>({p:[],c:[],u:[],i:[]}),B=[mkb(),mkb(),mkb()];
 const get=(x,y,z)=>{
  if(y<0)return 3;if(y>=H)return 0;let a=d;
  if(x<0||x>=CS||z<0||z>=CS){const n=chunks.get(ck(cx+(x<0?-1:x>=CS?1:0),cz+(z<0?-1:z>=CS?1:0)));if(!n)return 0;a=n.d;x=(x+CS)%CS;z=(z+CS)%CS}
  return a[x+CS*(z+CS*y)];
 };
 const colH=(x,z)=>{
  if(x>=0&&x<CS&&z>=0&&z<CS)return c.hs[x+CS*z];
  const n=chunks.get(ck(cx+(x<0?-1:x>=CS?1:0),cz+(z<0?-1:z>=CS?1:0)));return n?n.hs[((x+CS)%CS)+CS*((z+CS)%CS)]:0;
 };
 const ao=[0,0,0,0];
 for(let y=0;y<=c.top;y++)for(let z=0;z<CS;z++)for(let x=0;x<CS;x++){
  const b=d[x+CS*(z+CS*y)];if(!b)continue;
  if(b>=14){
   const[u0,v0,u1,v1]=tileUV(tileFor(b,0)),buf=B[0],jx=(hash(x+cx*CS,z+cz*CS)-.5)*.3,jz=(hash(z+cz*CS+7,x+cx*CS-3)-.5)*.3;
   for(const quad of PQ){
    const base=buf.p.length/3;
    for(let k=0;k<4;k++){const q=quad[k];buf.p.push(x+q[0]+jx,y+q[1],z+q[2]+jz);buf.c.push(.95,.95,.95);buf.u.push(k===0||k===3?u0:u1,k<2?v0:v1)}
    buf.i.push(base,base+1,base+2,base,base+2,base+3,base,base+3,base+2,base,base+2,base+1);
   }
   continue;
  }
  const buf=B[b===9?1:(b===10?2:0)],plain=b===9||b===10;
  for(let f=0;f<6;f++){
   const F=FACES[f],nx=x+F.n[0],ny=y+F.n[1],nz=z+F.n[2],nb=get(nx,ny,nz);
   if(b===9){if(nb!==0&&nb<14)continue}
   else if(b===10){if(nb===10||isOp(nb))continue}
   else if(isOp(nb))continue;
   let dk=1;
   if(!plain){const dep=colH(nx,nz)-ny;if(dep>2)dk=Math.max(.34,1-(dep-2)*.09)}
   if(plain){ao[0]=ao[1]=ao[2]=ao[3]=3}
   else{
    const a1=AX[f][0],a2=AX[f][1];
    for(let v=0;v<4;v++){
     const q=F.v[v];E1[0]=E1[1]=E1[2]=0;E2[0]=E2[1]=E2[2]=0;E1[a1]=q[a1]*2-1;E2[a2]=q[a2]*2-1;
     const s1=isOp(get(nx+E1[0],ny+E1[1],nz+E1[2]))?1:0,s2=isOp(get(nx+E2[0],ny+E2[1],nz+E2[2]))?1:0,cc=isOp(get(nx+E1[0]+E2[0],ny+E1[1]+E2[1],nz+E1[2]+E2[2]))?1:0;
     ao[v]=(s1&&s2)?0:3-(s1+s2+cc);
    }
   }
   const[u0,v0,u1,v1]=tileUV(tileFor(b,f)),base=buf.p.length/3,jit=.96+.04*hash(cx*CS+x+y*7,cz*CS+z+f*13);
   for(let v=0;v<4;v++){
    const q=F.v[v],s=SHD[f]*AOV[ao[v]]*dk*jit;
    buf.p.push(x+q[0],y+q[1],z+q[2]);buf.c.push(s,s,s);buf.u.push((v===1||v===2)?u1:u0,v<2?v0:v1);
   }
   if(ao[0]+ao[2]<ao[1]+ao[3])buf.i.push(base+1,base+2,base+3,base+1,base+3,base);
   else buf.i.push(base,base+1,base+2,base,base+2,base+3);
  }
 }
 return B;
}
function mk(B,mat,c,ro){
 if(!B.i.length)return null;
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));
 g.setAttribute('color',new THREE.Float32BufferAttribute(B.c,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));
 g.setIndex(B.i);g.computeBoundingSphere();
 const m=new THREE.Mesh(g,mat);m.position.set(c.cx*CS,0,c.cz*CS);m.renderOrder=ro;scene.add(m);return m;
}
function drop(m){if(m){scene.remove(m);m.geometry.dispose()}}
function rebuild(c){drop(c.mO);drop(c.mW);drop(c.mG);const B=build(c);c.mO=mk(B[0],matO,c,0);c.mW=mk(B[1],matW,c,1);c.mG=mk(B[2],matG,c,2);c.dirty=false}
function nbRebuild(cx,cz){const c=chunks.get(ck(cx,cz));if(c)rebuild(c)}
let dirtySave=false;
function setBlock(x,y,z,id){
 const cx=x>>4,cz=z>>4,c=chunks.get(ck(cx,cz));if(!c||y<0||y>=H)return;
 const lx=x&15,lz=z&15,i=lx+CS*(lz+CS*y);c.d[i]=id;
 if(y+1>c.top)c.top=Math.min(H-1,y+1);
 let m=edits.get(ck(cx,cz));if(!m){m=new Map();edits.set(ck(cx,cz),m)}m.set(i,id);dirtySave=true;
 rebuild(c);
 if(lx===0)nbRebuild(cx-1,cz);if(lx===15)nbRebuild(cx+1,cz);if(lz===0)nbRebuild(cx,cz-1);if(lz===15)nbRebuild(cx,cz+1);
}
let spawn=saved&&saved.spawn?saved.spawn.slice():null;
if(!spawn){let s=0;for(let r=0;r<600;r+=4){const h=heightAt(r,r);if(h>SEA+1&&h<38){s=r;break}}spawn=[s+.5,heightAt(s,s)+3,s+.5]}
const P={x:spawn[0],y:spawn[1],z:spawn[2],vx:0,vy:0,vz:0,onGround:false,wall:false};
let yaw=0,pitch=0;
if(saved&&saved.p&&saved.p.length>=5){[P.x,P.y,P.z,yaw,pitch]=saved.p}
let needed=[],lastPC=null;
function updateChunks(budget){
 const pcx=Math.floor(P.x/CS),pcz=Math.floor(P.z/CS);
 if(!lastPC||lastPC[0]!==pcx||lastPC[1]!==pcz){
  lastPC=[pcx,pcz];needed=[];
  for(let dx=-R;dx<=R;dx++)for(let dz=-R;dz<=R;dz++)if(dx*dx+dz*dz<=R*R+1)needed.push([pcx+dx,pcz+dz,dx*dx+dz*dz]);
  needed.sort((a,b)=>a[2]-b[2]);
  for(const[k,c]of chunks){if((c.cx-pcx)**2+(c.cz-pcz)**2>(R+2)**2){drop(c.mO);drop(c.mW);drop(c.mG);chunks.delete(k)}}
 }
 let n=0;
 for(const[x,z]of needed){
  if(chunks.has(ck(x,z)))continue;
  genChunk(x,z);
  for(const[ox,oz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=chunks.get(ck(x+ox,z+oz));if(nc)nc.dirty=true}
  if(++n>=budget)break;
 }
 let m=0;
 for(const[x,z]of needed){const c=chunks.get(ck(x,z));if(c&&c.dirty){rebuild(c);if(++m>=budget)break}}
}

const FACES=[
{n:[1,0,0],v:[[1,0,1],[1,0,0],[1,1,0],[1,1,1]]},
{n:[-1,0,0],v:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]]},
{n:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]]},
{n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]},
{n:[0,0,1],v:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]},
{n:[0,0,-1],v:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]]}];

