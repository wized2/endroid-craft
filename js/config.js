// config.js - constants, tunables, saved-game state, inventory
const $=s=>document.querySelector(s);
const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window;
if(touch)document.body.classList.add('touch');
const CS=16,H=64,SEA=17,HT=1.8,EYE=1.62,PW=0.3,DAY=600; // one full day+night = 10 min (Minecraft: 20)
const isPlant=b=>b>=14&&b<=16;
const SAVEKEY='endroid-craft-v2';
let saved=null;try{saved=JSON.parse(localStorage.getItem(SAVEKEY))}catch(e){}
const NAMES=['','Grass','Dirt','Stone','Log','Leaves','Sand','Planks','Brick','Water','Glass','Snow','Coal','Gold','Rose','Dandelion','Tall grass','Bed'];
const HARD=[0,.6,.5,2.2,1.4,.25,.5,1.2,2.4,0,.4,.35,3,3.5,.05,.05,.05,.6];
const HB=[1,2,3,4,5,6,7,8,10,11,17];
let mode=(saved&&saved.mode==='creative')?'creative':'survival';
const surv=()=>mode==='survival';
let clock=(saved&&typeof saved.clock==='number')?saved.clock:DAY*.1;
let hp=(saved&&saved.hp>0)?saved.hp:20,air=10,regenCd=0,regenT=0,flash=0,dead=false,fly=false,kills=(saved&&saved.kills)||0;
const inv={};for(let i=0;i<=17;i++)inv[i]=0;
if(saved&&saved.inv)for(const k in saved.inv)inv[k]=saved.inv[k]|0;
const tools={pick:!!(saved&&saved.tools&&saved.tools.pick),sword:!!(saved&&saved.tools&&saved.tools.sword),gsword:!!(saved&&saved.tools&&saved.tools.gsword),a1:!!(saved&&saved.tools&&saved.tools.a1),a2:!!(saved&&saved.tools&&saved.tools.a2)};
// combat: weapon damage and armor damage reduction
const weaponDmg=()=>tools.gsword?6:tools.sword?5:2; // Minecraft: stone 5, iron 6; fists nerfed-up 1->2
const armorLvl=()=>tools.a2?2:tools.a1?1:0,DMGRED=[0,.25,.45];


// ---------- user settings (saved in localStorage) ----------
const SETKEY='endroid-craft-settings';
const SET={rd:touch?4:6,sens:1,fov:75,vol:1,info:true};
try{Object.assign(SET,JSON.parse(localStorage.getItem(SETKEY)))}catch(e){}
let R=Math.max(2,Math.min(10,SET.rd|0));
function saveSettings(){try{localStorage.setItem(SETKEY,JSON.stringify(SET))}catch(e){}}
