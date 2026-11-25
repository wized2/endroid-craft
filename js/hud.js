// hud.js - hearts, air, hotbar, toast, info text, mode switch
// ---------- HUD ----------
const info=$('#info'),toastEl=$('#toast'),nameEl=$('#name'),heartsEl=$('#hearts'),airEl=$('#air'),dmgEl=$('#dmg'),wetEl=$('#wet');
let toastT=0,nameT=0,lastAirN=-1,fpsTxt='';
function toast(msg,ms=2200){toastEl.textContent=msg;toastEl.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>toastEl.style.opacity=0,ms)}
function renderHearts(){let s='';for(let i=0;i<10;i++){const v=hp-i*2;s+='<span class="hr '+(v>=2?'full':v===1?'half':'empty')+'">'+ico('heart',18,'','currentColor')+'<span class="f">'+ico('heart',18,'','currentColor')+'</span></span>'}heartsEl.innerHTML=s}
function renderAir(){const n=Math.ceil(air);airEl.innerHTML=air<9.95?ico('droplet',16,'','currentColor').repeat(Math.max(0,n)):''}
function renderInfo(){
 const day=Math.floor(clock/DAY)+1,ph=dayK>.55?'Day':(dayK<.3?'Night':'Dusk');
 let l3='';
 if(!surv()&&fly)l3='\nFlying';
 info.style.display=SET.info?'block':'none';
 const tm=((clock/DAY%1)*24+6)%24,clk=String(Math.floor(tm)).padStart(2,'0')+':'+String(Math.floor(tm%1*60)).padStart(2,'0');
 info.textContent=fpsTxt+' | '+clk+(weather.rain>.3?' | Rain':'')+'\n'+(surv()?'Survival':'Creative')+' · '+ph+' '+day+' · seed '+SEEDL+l3;
}
let si=0;
const bar=$('#bar');
HB.forEach((b,i)=>{
 const s=document.createElement('div');s.className='slot';s.innerHTML='<i></i><b></b>';
 s.firstChild.style.backgroundImage='url('+icon(b)+')';
 makeTouchBtn(s,()=>{sel(i);vib(8)});
 bar.appendChild(s);
});
function renderSlots(){
 [...bar.children].forEach((e,i)=>{const n=inv[HB[i]];e.querySelector('b').textContent=n>0?n:'';e.classList.toggle('zero',surv()&&n<=0);e.classList.toggle('sel',i===si)});
}
function sel(i){
 si=(i+HB.length)%HB.length;renderSlots();
 nameEl.textContent=NAMES[HB[si]]+(surv()?' ×'+inv[HB[si]]:'');nameEl.style.opacity=1;
 clearTimeout(nameT);nameT=setTimeout(()=>nameEl.style.opacity=0,1400);
 updateHandBlock(HB[si]);
}
function applyMode(){
 document.body.classList.toggle('creative',!surv());
 if(surv())fly=false;
 $('#mSurv').classList.toggle('sel',surv());$('#mCre').classList.toggle('sel',!surv());
 $('#bDown').style.display=(fly&&!surv()&&touch)?'block':'none';
 renderHearts();renderArmor();renderFood();renderSlots();renderInfo();
 if(typeof renderQuest==='function')renderQuest();
}


function renderArmor(){const e=$('#armor'),l=armorLvl();e.innerHTML=(l&&surv())?ico('shield',16,'','currentColor')+'<span>-'+Math.round(DMGRED[l]*100)+'%</span>':''}
const mobhpEl=$('#mobhp'),mobhpBar=mobhpEl.querySelector('i'),mobhpTxt=mobhpEl.querySelector('span');
function showMobHp(m){
 if(!m){mobhpEl.style.opacity=0;return}
 mobhpEl.style.opacity=1;mobhpTxt.textContent=(m.type==='w'?(m.tamed?'Wolf (tamed)':'Wolf'):m.type==='g'?'Iron Golem':m.type==='k'?'Creeper':m.type==='x'?'Skeleton':m.type==='h'?'Chicken':m.type==='p'?'Pig':m.type==='c'?'Cow':m.type==='s'?'Sheep':m.big?'Brute Zombie':'Zombie')+'  '+Math.max(0,Math.ceil(m.hp));
 mobhpBar.style.width=Math.max(0,Math.min(100,m.hp/(m.maxhp||m.hp)*100))+'%';
}
