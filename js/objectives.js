// objectives.js - guided goals shown under the info text (survival). Progress is saved.
const OBJECTIVES=[
 {t:'Punch a tree: collect 3 logs',ok:()=>inv[4]>=3||inv[7]>=1||tools.pick>=1},
 {t:'Open crafting (E / hammer) and make planks',ok:()=>inv[7]>=1||tools.pick>=1},
 {t:'Craft a Wooden Pickaxe (5 planks)',ok:()=>tools.pick>=1},
 {t:'Mine 3 stone (needs the pickaxe to drop)',ok:()=>inv[3]>=3||tools.pick>=2},
 {t:'Craft a Stone Pickaxe and a sword',ok:()=>tools.pick>=2&&tools.sword>=1},
 {t:'Hunt an animal, cook the meat with coal, and eat (F / EAT)',ok:()=>ate>=1},
 {t:'Survive your first night (build a shelter!)',ok:()=>Math.floor(clock/DAY)>=1},
 {t:'Craft a Bed (3 wool from sheep + 3 planks) and sleep',ok:()=>sleeps>=1},
 {t:'Defeat 3 zombies',ok:()=>kills>=3},
 {t:'Craft armor (leather from cows, or gold)',ok:()=>tools.a1||tools.a2},
 {t:'Defeat a Brute zombie (from day 3)',ok:()=>bruteKills>=1},
];
let objI=(saved&&saved.o|0)||0,bruteKills=(saved&&saved.bk|0)||0,objT=0;
const questEl=$('#quest');
function renderQuest(){
 if(!surv()||objI<0){questEl.style.display='none';return}
 questEl.style.display='block';
 questEl.innerHTML=objI>=OBJECTIVES.length?ico('check',14)+' All goals done - keep surviving and building!':ico('target',14)+' <b>'+(objI+1)+'/'+OBJECTIVES.length+'</b> '+OBJECTIVES[objI].t;
}
function updateObjectives(dt){
 objT-=dt;if(objT>0)return;objT=.5;
 if(objI<OBJECTIVES.length&&surv()&&OBJECTIVES[objI].ok()){
  const done=OBJECTIVES[objI].t;objI++;sfxCraft();toast('Goal complete! '+(objI<OBJECTIVES.length?'Next: '+OBJECTIVES[objI].t:'You are a survivor!'),3000);renderQuest();dirtySave=true;
 }
}
renderQuest();
