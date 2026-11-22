// noise.js - seeded noise + terrain height
// ---------- seeded noise ----------
const SX=(SEED%9973)*13.7,SZ=((SEED>>>3)%9967)*11.3;
function hash(x,z){let h=(Math.imul(x|0,374761393)+Math.imul(z|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
const hsh=(x,z,s)=>hash(x+s*131+(SEED&0xffff),z-s*71+((SEED>>>8)&0xffff));
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);const a=hash(xi,zi),b=hash(xi+1,zi),c=hash(xi,zi+1),d=hash(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,z){let a=1,f=1,s=0,n=0;for(let i=0;i<4;i++){s+=vnoise(x*f,z*f)*a;n+=a;a*=.5;f*=2}return s/n}
function heightAt(x,z){
 const n=fbm(x*.012+SX,z*.012+SZ),m=fbm(x*.004+SX*.5+300,z*.004+SZ*.5+300);
 return Math.min(54,Math.floor(8+Math.pow(n,1.3)*30+Math.max(0,m-.52)*70));
}
function h3(x,y,z){return hash(Math.imul(x,92837111)^Math.imul(y,689287499),(Math.imul(z,283923481)^Math.imul(y,1500450271))+SEED)}
function n3(x,y,z){
 const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
 const l=(a,b,t)=>a+(b-a)*t;
 return l(l(l(h3(xi,yi,zi),h3(xi+1,yi,zi),u),l(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),u),v),l(l(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),u),l(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),u),v),w);
}

