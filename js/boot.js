// boot.js - entry point. Loads Three.js, then the game files in order.
// The game files are classic scripts that share one global scope, so each can use
// what earlier files define. ORDER MATTERS: add new files to FILES in the right spot.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
window.THREE=THREE;
const FILES=["config", "touch", "audio", "seed", "noise", "textures", "scene", "world", "hud", "physics", "player", "mobs", "playermodel", "interact", "crafting", "hunger", "sleep", "objectives", "templates", "scripting", "weather", "settings", "input", "save", "main"];
for(const f of FILES){
 const s=document.createElement('script');
 s.src='js/'+f+'.js';
 s.async=false; // keep execution in list order
 s.onerror=()=>console.error('failed to load js/'+f+'.js');
 document.body.appendChild(s);
}
