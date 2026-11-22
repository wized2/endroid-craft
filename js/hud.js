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
 if(surv())l3='\nGold '+inv[13]+' · Coal '+inv[12]+' · Kills '+kills+(tools.pick?' · Pickaxe':'')+(tools.sword?' · Sword':'');
 else if(fly)l3='\nFlying';
 info.style.display=SET.info?'block':'none';
 info.textContent=fpsTxt+(weather.rain>.3?' | Rain':'')+'\n'+(surv()?'Survival':'Creative')+' · '+ph+' '+day+' · seed '+SEED+l3;
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
 renderHearts();renderSlots();renderInfo();
}

