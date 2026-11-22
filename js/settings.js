// settings.js - settings panel (sliders) + screenshot. Values live in SET (config.js).
const setPanel=$('#set-panel');
const SLIDERS=[
 {id:'rd',label:'Render distance',min:2,max:10,step:1,fmt:v=>v+' chunks',apply(){R=SET.rd|0;lastPC=null}},
 {id:'sens',label:'Look sensitivity',min:.3,max:2.5,step:.1,fmt:v=>(+v).toFixed(1)+'x'},
 {id:'fov',label:'Field of view',min:55,max:100,step:1,fmt:v=>v+'\u00b0'},
 {id:'vol',label:'Volume',min:0,max:1,step:.05,fmt:v=>Math.round(v*100)+'%'}
];
function buildSettings(){
 const box=$('#set-rows');box.innerHTML='';
 for(const s of SLIDERS){
  const row=document.createElement('label');row.className='srow';
  row.innerHTML='<span>'+s.label+'</span><b></b><input type="range" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'">';
  const inp=row.querySelector('input'),out=row.querySelector('b');
  inp.value=SET[s.id];out.textContent=s.fmt(SET[s.id]);
  inp.addEventListener('input',()=>{SET[s.id]=+inp.value;out.textContent=s.fmt(SET[s.id]);if(s.apply)s.apply();saveSettings();renderInfo()});
  box.appendChild(row);
 }
 const c=document.createElement('label');c.className='srow chk';
 c.innerHTML='<span>Show info text (fps, seed)</span><input type="checkbox">';
 const ci=c.querySelector('input');ci.checked=SET.info;
 ci.addEventListener('change',()=>{SET.info=ci.checked;saveSettings();renderInfo()});
 box.appendChild(c);
}
function openSettings(){buildSettings();setPanel.classList.add('open')}
function closeSettings(){setPanel.classList.remove('open')}
$('#set-menu').addEventListener('click',openSettings);
$('#set-close').addEventListener('click',closeSettings);
$('#shot-menu').addEventListener('click',()=>{shotReq=true});
addEventListener('keydown',e=>{
 if(e.code==='F2'){e.preventDefault();shotReq=true}
 if(e.code==='Escape'&&setPanel.classList.contains('open'))closeSettings();
});
