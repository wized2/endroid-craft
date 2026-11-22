// seed.js - Minecraft-style world seeds.
// Same parsing rules as Minecraft Java: empty = random 64-bit; a number in the signed 64-bit range is used as is;
// anything else (words, huge numbers) becomes Java's String.hashCode(). The seed then feeds java.util.Random.
// NOTE: terrain is Endroid Craft's own generator, so the same seed does NOT give the same land as Minecraft.
const javaHash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h};
function parseSeedText(t){
 t=String(t==null?'':t).trim();
 if(t==='')return BigInt.asIntN(64,crypto.getRandomValues(new BigUint64Array(1))[0]);
 if(/^[+-]?\d+$/.test(t)){const n=BigInt(t.replace(/^\+/,''));if(n>=-(2n**63n)&&n<2n**63n)return n}
 return BigInt(javaHash(t));
}
// java.util.Random (48-bit LCG)
class JavaRandom{
 constructor(seed){this.s=(BigInt.asUintN(64,BigInt(seed))^0x5DEECE66Dn)&0xFFFFFFFFFFFFn}
 next(bits){this.s=(this.s*0x5DEECE66Dn+0xBn)&0xFFFFFFFFFFFFn;return Number(BigInt.asIntN(32,this.s>>BigInt(48-bits)))}
 nextInt(){return this.next(32)}
}
let pendingSeed=null;try{pendingSeed=localStorage.getItem('endroid-craft-nextseed');localStorage.removeItem('endroid-craft-nextseed')}catch(e){}
let SEEDL; // the Minecraft-style 64-bit seed (BigInt)
if(saved&&saved.sl)SEEDL=BigInt(saved.sl);
else if(saved&&typeof saved.s==='number')SEEDL=BigInt(saved.s); // worlds saved before 64-bit seeds
else SEEDL=parseSeedText(pendingSeed);
// 32-bit value used by the noise functions
let SEED=(saved&&!saved.sl&&typeof saved.s==='number')?saved.s:(new JavaRandom(SEEDL).nextInt()>>>0);
