// audio.js - Web Audio sound effects + haptics
// ---------- audio ----------
const AudioCtx=window.AudioContext||window.webkitAudioContext;
let actx=null,soundOn=true;
try{soundOn=localStorage.getItem('endroid-craft-snd')!=='0'}catch(e){}
const sndBtn=$('#snd');
function updateSndBtn(){sndBtn.innerHTML=ico(soundOn?'volume-2':'volume-x',20)}
updateSndBtn();
makeTouchBtn(sndBtn,()=>{soundOn=!soundOn;try{localStorage.setItem('endroid-craft-snd',soundOn?'1':'0')}catch(err){}updateSndBtn();if(soundOn)initAudio()});
function initAudio(){if(!actx&&AudioCtx){try{actx=new AudioCtx()}catch(e){}}if(actx&&actx.state==='suspended')actx.resume().catch(()=>{})}
function playTone(f,type,dur,g=.08,ef=null){
 if(!soundOn||!actx)return;
 try{const o=actx.createOscillator(),ga=actx.createGain(),t=actx.currentTime;
  o.type=type;o.frequency.setValueAtTime(f,t);if(ef)o.frequency.exponentialRampToValueAtTime(ef,t+dur);
  ga.gain.setValueAtTime(g,t);ga.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(ga);ga.connect(actx.destination);o.start();o.stop(t+dur)}catch(e){}
}
function playNoise(dur,g=.06,lp=600){
 if(!soundOn||!actx)return;
 try{const len=Math.floor(actx.sampleRate*dur),buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const s=actx.createBufferSource();s.buffer=buf;
  const fl=actx.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(lp,actx.currentTime);
  const ga=actx.createGain();ga.gain.setValueAtTime(g,actx.currentTime);ga.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+dur);
  s.connect(fl);fl.connect(ga);ga.connect(actx.destination);s.start()}catch(e){}
}
const hardB=b=>b===3||b===8||b===12||b===13;
function sfxBreak(b){playNoise(.14,.1,hardB(b)?1200:500);playTone(hardB(b)?170:120,'triangle',.09,.08,60)}
function sfxTick(b){playNoise(.05,.04,hardB(b)?1000:450)}
function sfxPlace(){playTone(220,'sine',.05,.12,280);playNoise(.04,.05,1100)}
function sfxJump(){playTone(160,'triangle',.12,.06,300)}
function sfxStep(b){playNoise(.04,hardB(b)?.05:.035,hardB(b)?900:420)}
function sfxSplash(){playNoise(.25,.12,900);playTone(220,'sine',.15,.06,120)}
function sfxHurt(){playTone(200,'sawtooth',.22,.1,80);playNoise(.1,.06,700)}
function sfxHit(){playNoise(.08,.09,1500);playTone(140,'square',.07,.05,90)}
function sfxGroan(g){playTone(95,'sawtooth',.5,g,60)}
function sfxOink(){playTone(320,'square',.1,.04,220)}
function sfxCraft(){playTone(440,'triangle',.08,.08);setTimeout(()=>playTone(660,'triangle',.12,.08),80)}
function sfxDie(){playTone(220,'sawtooth',.8,.12,40)}
function sfxLand(){playNoise(.1,.1,300)}
const vib=ms=>{if(touch&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};

