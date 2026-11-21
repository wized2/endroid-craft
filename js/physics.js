// physics.js - AABB collision + body stepping
// ---------- physics ----------
function hitBox(x,y,z,w,h){
 const x0=Math.floor(x-w),x1=Math.floor(x+w),y0=Math.floor(y),y1=Math.floor(y+h-.001),z0=Math.floor(z-w),z1=Math.floor(z+w);
 for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++)for(let k=z0;k<=z1;k++)if(solidB(getBlock(i,j,k)))return true;
 return false;
}
function stepBody(b,dt,w,h){
 let d=b.vx*dt;b.x+=d;
 if(hitBox(b.x,b.y,b.z,w,h)){if(b.onGround&&!hitBox(b.x,b.y+1.05,b.z,w,h))b.y+=1;else{b.x-=d;b.vx=0;b.wall=true}}
 d=b.vz*dt;b.z+=d;
 if(hitBox(b.x,b.y,b.z,w,h)){if(b.onGround&&!hitBox(b.x,b.y+1.05,b.z,w,h))b.y+=1;else{b.z-=d;b.vz=0;b.wall=true}}
 d=b.vy*dt;b.y+=d;
 if(hitBox(b.x,b.y,b.z,w,h)){b.y-=d;if(d<0)b.onGround=true;b.vy=0}
}

