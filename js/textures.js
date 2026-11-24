// textures.js - procedural pixel-art texture atlas + block icons
// ---------- texture atlas (procedural pixel art) ----------
const TS=16,AC=8,ac=document.createElement('canvas');ac.width=ac.height=TS*AC;
const tc=ac.getContext('2d');
let rs=987654321;const rnd=()=>{rs=(Math.imul(rs,1664525)+1013904223)>>>0;return rs/4294967296};
const tileAvg=[];
const TI={grassTop:0,grassSide:1,dirt:2,stone:3,logSide:4,logTop:5,leaves:6,sand:7,planks:8,brick:9,water:10,glass:11,snow:12,coal:13,gold:14,flowerR:15,flowerY:16,tall:17,bedTop:18,bedSide:19,farmland:20,wheat0:21,wheat1:22,wheat2:23,path:24,emerald:25,furnace:26,chest:27,torch:28,iron:29,diamond:30,tntSide:31,tntTop:32,gravel:33,lava:34,sapling:35,ladder:36};
function paint(i,fn){
 const im=tc.createImageData(TS,TS);let r=0,g=0,b=0,n=0;
 for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){
  const c=fn(x,y)||[0,0,0,0],o=(y*TS+x)*4,a=c[3]===undefined?255:c[3];
  im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=a;
  if(a>40){r+=c[0];g+=c[1];b+=c[2];n++}
 }
 tc.putImageData(im,(i%AC)*TS,((i/AC)|0)*TS);
 tileAvg[i]=n?[r/n/255,g/n/255,b/n/255]:[.5,.5,.5];
}
const vr=(c,a)=>{const d=(rnd()-.5)*a;return[c[0]+d,c[1]+d,c[2]+d]};
const stoneFn=()=>{let c=vr([128,128,132],34);if(rnd()<.07)c=[c[0]-28,c[1]-28,c[2]-28];return c};
paint(TI.grassTop,()=>vr(rnd()<.12?[70,140,48]:[98,168,64],30));
const ge=[];for(let x=0;x<TS;x++)ge[x]=3+((rnd()*3)|0);
paint(TI.grassSide,(x,y)=>y<ge[x]?vr([98,168,64],30):vr(rnd()<.1?[110,78,48]:[134,96,60],30));
paint(TI.dirt,()=>vr(rnd()<.12?[108,76,46]:[134,96,60],30));
paint(TI.stone,stoneFn);
paint(TI.logSide,(x)=>{const s=((x*7)%4)*9;return vr([104-s*.4,78-s*.3,44-s*.2],18)});
paint(TI.logTop,(x,y)=>{const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));if(d>6.6)return vr([98,72,40],14);return vr(Math.floor(d)%2?[170,134,78]:[150,114,64],14)});
paint(TI.leaves,()=>rnd()<.1?[0,0,0,0]:(rnd()<.25?vr([36,100,30],24):vr([58,136,44],34)));
paint(TI.sand,()=>vr([222,208,152],22));
paint(TI.planks,(x,y)=>{let c=vr([178,138,82],16);if(y%4===3)c=[c[0]-34,c[1]-30,c[2]-24];else if(((x+(y>>2)*5)%8)===0)c=[c[0]-14,c[1]-12,c[2]-10];return c});
paint(TI.brick,(x,y)=>{const off=((y>>2)%2)*4;if(y%4===3||((x+off)%8)===0)return vr([188,184,172],16);return vr([160,72,56],26)});
paint(TI.water,()=>vr([48,104,214],16));
paint(TI.glass,(x,y)=>{if(x===0||y===0||x===15||y===15)return[206,238,248,255];if(x===y||(x===y+1&&x<8))return[255,255,255,150];return[190,228,240,46]});
paint(TI.snow,()=>vr([240,244,252],12));
const blobs=[[3,4],[10,3],[7,10],[12,12],[4,12]];
const oreFn=col=>(x,y)=>{for(const b of blobs){if((x-b[0])**2+(y-b[1])**2<=3.5)return vr(col,22)}return stoneFn()};
paint(TI.coal,oreFn([34,34,38]));
paint(TI.gold,oreFn([236,200,60]));
const flower=(pet,mid)=>(x,y)=>{
 if((x===7||x===8)&&y>=7)return vr([60,140,40],20);
 if((x===6&&y===11)||(x===9&&y===12)||(x===5&&y===10)||(x===10&&y===11))return vr([60,150,40],20);
 const d=Math.hypot(x-7.5,y-4.5);if(d<=1.3)return mid;if(d<=3.2)return vr(pet,24);return null;
};
paint(TI.flowerR,flower([220,40,50],[250,210,60]));
paint(TI.flowerY,flower([250,215,40],[240,140,30]));
const bh=[];for(let x=0;x<TS;x++)bh[x]=(x%3===2)?0:5+((rnd()*9)|0);
paint(TI.tall,(x,y)=>y>=16-bh[x]?vr(y<18-bh[x]?[120,190,70]:[70,150,45],24):null);
paint(TI.bedTop,(x,y)=>{if(y<5)return vr([240,238,230],10);if(y===5)return vr([200,196,186],10);return vr([196,40,44],18)});
paint(TI.bedSide,(x,y)=>{if(y>=11)return vr([150,112,64],14);if(y===10)return vr([100,70,40],10);return vr([196,40,44],18)});
paint(TI.farmland,(x,y)=>y>11?vr([90,60,32],14):vr([110,72,40],18));
paint(TI.path,(x,y)=>vr(rnd()<.15?[150,120,70]:[168,134,82],16));
paint(TI.wheat0,(x,y)=>{if(x<5||x>10)return null;return y>12?vr([90,140,40],20):null});
paint(TI.wheat1,(x,y)=>{if(x<4||x>11)return null;return y>8?vr(y>12?[180,160,50]:[100,150,45],18):null});
paint(TI.wheat2,(x,y)=>{if(x<3||x>12)return null;return y>4?vr(y>10?[210,180,55]:[120,150,50],16):null});
paint(TI.emerald,(x,y)=>{const d=Math.hypot(x-7.5,y-7.5);if(d>6.5)return vr([40,40,42],10);return vr(d<3?[80,220,120]:[40,160,80],18)});
paint(TI.furnace,(x,y)=>{if(y<3||y>13)return vr([60,60,60],12);if(x>4&&x<11&&y>5&&y<11)return vr([20,12,8],10);return vr([90,90,90],16)});
paint(TI.chest,(x,y)=>{if(y===7||y===8)return vr([80,55,20],12);return vr([150,100,40],18)});
paint(TI.torch,(x,y)=>{if(x<6||x>9)return null;if(y>11)return vr([255,200,80],20);return vr([120,80,40],14)});
paint(TI.iron,oreFn([214,170,140]));
paint(TI.diamond,oreFn([90,226,232]));
paint(TI.tntSide,(x,y)=>{if(y>=5&&y<=10)return(x%4<2&&y>5&&y<10)?vr([40,40,40],10):vr([226,224,214],12);return vr([200,44,34],20)});
paint(TI.tntTop,(x,y)=>{const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));if(d<1.6)return vr([30,30,30],8);return vr([186,150,100],18)});
paint(TI.gravel,()=>{const r=rnd();return r<.25?vr([96,92,92],20):r<.5?vr([150,146,144],24):vr([124,120,118],26)});
paint(TI.lava,()=>{const r=rnd();return r<.18?vr([255,214,70],30):r<.55?vr([240,120,24],40):vr([206,70,10],40)});
paint(TI.sapling,(x,y)=>{if((x===7||x===8)&&y>=9)return vr([100,70,40],14);const d=Math.hypot(x-7.5,y-6);if(d<4.2&&rnd()>.15)return vr([54,140,44],30);return null});
paint(TI.ladder,(x,y)=>{if(x===3||x===4||x===11||x===12)return vr([130,92,52],14);if((y===2||y===6||y===10||y===14)&&x>4&&x<11)return vr([150,108,62],14);return null});
const EP=.0008;
function tileUV(i){const c=i%AC,r=(i/AC)|0;return[c/AC+EP,1-(r+1)/AC+EP,(c+1)/AC-EP,1-r/AC-EP]}
function tileFor(b,f){
 switch(b){
  case 1:return f===2?TI.grassTop:(f===3?TI.dirt:TI.grassSide);
  case 2:return TI.dirt;case 3:return TI.stone;
  case 4:return(f===2||f===3)?TI.logTop:TI.logSide;
  case 5:return TI.leaves;case 6:return TI.sand;case 7:return TI.planks;case 8:return TI.brick;
  case 9:return TI.water;case 10:return TI.glass;case 11:return TI.snow;case 12:return TI.coal;case 13:return TI.gold;
  case 17:return(f===2)?TI.bedTop:(f===3?TI.planks:TI.bedSide);
  case 14:return TI.flowerR;case 15:return TI.flowerY;case 16:return TI.tall;
  case 29:return TI.farmland;case 30:return TI.wheat0;case 31:return TI.wheat1;case 32:return TI.wheat2;
  case 38:return TI.path;
  case 33:return TI.wheat0;case 34:return TI.wheat2;case 35:return TI.flowerR;case 36:return TI.flowerY;case 37:return TI.emerald;
  case 44:return TI.iron;case 45:return TI.diamond;case 48:return(f===2||f===3)?TI.tntTop:TI.tntSide;case 49:return TI.gravel;case 50:return TI.lava;case 51:return TI.sapling;case 57:return TI.ladder;
  case 39:return TI.furnace;case 40:return TI.chest;case 41:return TI.torch;case 42:return TI.planks;case 43:return TI.stone;
 }
 return 0;
}
const atlasTex=new THREE.CanvasTexture(ac);
atlasTex.magFilter=atlasTex.minFilter=THREE.NearestFilter;atlasTex.generateMipmaps=false;atlasTex.colorSpace=THREE.SRGBColorSpace;
const crackTex=[];
{
 const pts=[];
 for(let w=0;w<2;w++){let px=8,py=8;for(let i=0;i<45;i++){pts.push([px|0,py|0]);px=Math.max(0,Math.min(15,px+(rnd()-.5)*3.4));py=Math.max(0,Math.min(15,py+(rnd()-.5)*3.4))}}
 for(let s=0;s<10;s++){
  const cv=document.createElement('canvas');cv.width=cv.height=16;const x2=cv.getContext('2d');x2.fillStyle='rgba(0,0,0,.75)';
  const n=Math.floor(pts.length*(s+1)/10);for(let i=0;i<n;i++)x2.fillRect(pts[i][0],pts[i][1],1,1);
  const t=new THREE.CanvasTexture(cv);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;crackTex.push(t);
 }
}
function icon(b){
 const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 const src=t=>[(t%AC)*TS,((t/AC)|0)*TS];
 let[sx,sy]=src(tileFor(b,2));x.setTransform(1,.5,-1,.5,16,0);x.drawImage(ac,sx,sy,16,16,0,0,16,16);
 [sx,sy]=src(tileFor(b,4));x.setTransform(1,.5,0,1,0,8);x.drawImage(ac,sx,sy,16,16,0,0,16,16);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,0,16,16);
 [sx,sy]=src(tileFor(b,0));x.setTransform(1,-.5,0,1,16,16);x.drawImage(ac,sx,sy,16,16,0,0,16,16);x.fillStyle='rgba(0,0,0,.42)';x.fillRect(0,0,16,16);
 return c.toDataURL();
}

