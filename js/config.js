// config.js - constants, tunables, saved-game state, inventory
const $=s=>document.querySelector(s);
const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
if(touch)document.body.classList.add('touch');
const CS=16,H=64,SEA=17,HT=1.8,EYE=1.62,PW=0.3,DAY=1200; // one full day+night = 20 min, like Minecraft
const isPlant=b=>(b>=14&&b<=16)||(b>=30&&b<=32)||b===41||b===51||b===57; // flowers, grass, wheat stages
const isCrop=b=>b>=30&&b<=32;
const isFarmland=b=>b===29;
const SAVEKEY='endroid-craft-v2';
let saved=null;try{saved=JSON.parse(localStorage.getItem(SAVEKEY))}catch(e){}
const NAMES=['','Grass','Dirt','Stone','Log','Leaves','Sand','Planks','Brick','Water','Glass','Snow','Coal','Gold','Rose','Dandelion','Tall grass','Bed','Raw Porkchop','Cooked Porkchop','Raw Beef','Steak','Raw Mutton','Cooked Mutton','Apple','Rotten Flesh','Wool','Leather','Golden Apple','Farmland','Wheat (young)','Wheat (mid)','Wheat (grown)','Seeds','Bread','Carrot','Potato','Emerald','Path','Furnace','Chest','Torch','Stick','Shears','Iron Ore','Diamond Ore','Iron Ingot','Diamond','TNT','Gravel','Lava','Sapling','Gunpowder','Raw Chicken','Cooked Chicken','Flint & Steel','Bone','Ladder'];
const HARD=[0,.6,.5,1.5,2,.2,.5,2,2,0,.3,.2,3,3,.05,.05,.05,.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,.6,999,.05,0,0,.4]; // by block id // hardness by block id
const HB=[1,2,3,4,5,6,7,8,10,11,17];
let mode=(saved&&saved.mode==='creative')?'creative':'survival';
const surv=()=>mode==='survival';
let clock=(saved&&typeof saved.clock==='number')?saved.clock:DAY*.1;
let hp=(saved&&saved.hp>0)?saved.hp:20,air=10,regenCd=0,regenT=0,flash=0,dead=false,fly=false,kills=(saved&&saved.kills)||0;
const inv={};for(let i=0;i<=64;i++)inv[i]=0;
if(saved&&saved.inv)for(const k in saved.inv)inv[k]=saved.inv[k]|0;
else{inv[33]=8;inv[2]=16;inv[1]=8} // new world: seeds + dirt starter
// tool tiers: 0 none, 1 wood, 2 stone (old saves with a stone tool migrate)
const tl=k=>{const t=saved&&saved.tools;if(!t)return 0;if(t[k]===true)return 2;return +t[k]||0};
const tools={pick:tl('pick'),axe:tl('axe'),sword:Math.max(tl('sword'),tl('gsword')),a1:!!(saved&&saved.tools&&saved.tools.a1),a2:!!(saved&&saved.tools&&saved.tools.a2),a3:!!(saved&&saved.tools&&saved.tools.a3),a4:!!(saved&&saved.tools&&saved.tools.a4)};
// combat: weapon damage (Minecraft: fist 1, wood 4, stone 5; fists 2 here) and armor reduction (leather set 28%, gold set 44%)
const weaponDmg=()=>[2,4,5,6,7][tools.sword];
const armorLvl=()=>tools.a4?4:tools.a3?3:tools.a2?2:tools.a1?1:0,DMGRED=[0,.28,.44,.6,.8];
// food: 0-20, saturation, exhaustion (Minecraft hunger rules)
let food=(saved&&typeof saved.f==='number')?saved.f:20,sat=(saved&&typeof saved.sa==='number')?saved.sa:5,exh=0,ate=(saved&&saved.ate|0)||0;
const REACH_B=touch?5:4.5,REACH_M=touch?3.6:3; // Minecraft reach: block 4.5, entity 3


// ---------- user settings (saved in localStorage) ----------
const SETKEY='endroid-craft-settings';
const SET={rd:touch?4:6,sens:1,fov:75,vol:1,info:false,autoJump:!!touch,bigCtl:!!touch};
try{Object.assign(SET,JSON.parse(localStorage.getItem(SETKEY)))}catch(e){}
let R=Math.max(2,Math.min(10,SET.rd|0));
function saveSettings(){try{localStorage.setItem(SETKEY,JSON.stringify(SET))}catch(e){}}
