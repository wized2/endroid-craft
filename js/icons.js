// icons.js - Lucide icons (https://lucide.dev, ISC license) as inline SVG.
// Add one: paste the inner SVG elements (no <svg> wrapper) into ICONS below.
// Use: ico('name',size) -> SVG string, or <i data-icon="name"></i> in HTML (see hydrateIcons).
const ICONS={
 'terminal':"<polyline points='4 17 10 11 4 5'/> <line x1='12' x2='20' y1='19' y2='19'/>",
 'play':"<polygon points='6 3 20 12 6 21 6 3'/>",
 'save':"<path d='M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'/> <path d='M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7'/> <path d='M7 3v4a1 1 0 0 0 1 1h7'/>",
 'trash-2':"<path d='M3 6h18'/> <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/> <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/> <line x1='10' x2='10' y1='11' y2='17'/> <line x1='14' x2='14' y1='11' y2='17'/>",
 'dices':"<rect width='12' height='12' x='2' y='10' rx='2' ry='2'/> <path d='m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6'/> <path d='M6 18h.01'/> <path d='M10 14h.01'/> <path d='M15 6h.01'/> <path d='M18 9h.01'/>",
 'volume-2':"<path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'/> <path d='M16 9a5 5 0 0 1 0 6'/> <path d='M19.364 18.364a9 9 0 0 0 0-12.728'/>",
 'volume-x':"<path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'/> <line x1='22' x2='16' y1='9' y2='15'/> <line x1='16' x2='22' y1='9' y2='15'/>",
 'maximize':"<path d='M8 3H5a2 2 0 0 0-2 2v3'/> <path d='M21 8V5a2 2 0 0 0-2-2h-3'/> <path d='M3 16v3a2 2 0 0 0 2 2h3'/> <path d='M16 21h3a2 2 0 0 0 2-2v-3'/>",
 'minimize':"<path d='M8 3v3a2 2 0 0 1-2 2H3'/> <path d='M21 8h-3a2 2 0 0 1-2-2V3'/> <path d='M3 16h3a2 2 0 0 1 2 2v3'/> <path d='M16 21v-3a2 2 0 0 1 2-2h3'/>",
 'hammer':"<path d='m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9'/> <path d='m18 15 4-4'/> <path d='m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5'/>",
 'menu':"<line x1='4' x2='20' y1='12' y2='12'/> <line x1='4' x2='20' y1='6' y2='6'/> <line x1='4' x2='20' y1='18' y2='18'/>",
 'heart':"<path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/>",
 'arrow-up':"<path d='m5 12 7-7 7 7'/> <path d='M12 19V5'/>",
 'arrow-down':"<path d='M12 5v14'/> <path d='m19 12-7 7-7-7'/>",
 'pickaxe':"<path d='M14.531 12.469 6.619 20.38a1 1 0 1 1-3-3l7.912-7.912'/> <path d='M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393'/> <path d='M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z'/> <path d='M19.686 8.314a12.501 12.501 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.319'/>",
 'box':"<path d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'/> <path d='m3.3 7 8.7 5 8.7-5'/> <path d='M12 22V12'/>",
 'droplet':"<path d='M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'/>",
 'x':"<path d='M18 6 6 18'/> <path d='m6 6 12 12'/>",
 'skull':"<path d='m12.5 17-.5-1-.5 1h1z'/> <path d='M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z'/> <circle cx='15' cy='12' r='1'/> <circle cx='9' cy='12' r='1'/>",
 'sword':"<polyline points='14.5 17.5 3 6 3 3 6 3 17.5 14.5'/> <line x1='13' x2='19' y1='19' y2='13'/> <line x1='16' x2='20' y1='16' y2='20'/> <line x1='19' x2='21' y1='21' y2='19'/>",
 'rotate-ccw':"<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/> <path d='M3 3v5h5'/>",
 'play':"<polygon points='6 3 20 12 6 21 6 3'/>",
 'square':"<rect width='18' height='18' x='3' y='3' rx='2'/>",
 'gem':"<path d='M6 3h12l4 6-10 13L2 9Z'/> <path d='M11 3 8 9l4 13 4-13-3-6'/> <path d='M2 9h20'/>",
 'flame':"<path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'/>",
 'crosshair':"<circle cx='12' cy='12' r='10'/> <line x1='22' x2='18' y1='12' y2='12'/> <line x1='6' x2='2' y1='12' y2='12'/> <line x1='12' x2='12' y1='6' y2='2'/> <line x1='12' x2='12' y1='22' y2='18'/>",
 'layers':"<path d='m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z'/> <path d='m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65'/> <path d='m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65'/>",
 'apple':"<path d='M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z'/> <path d='M10 2c1 .5 2 2 2 5'/>",
 'sparkles':"<path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'/> <path d='M20 3v4'/> <path d='M22 5h-4'/> <path d='M4 17v2'/> <path d='M5 18H3'/>",
};
function ico(name,size=20,cls='',fill='none'){
 return '<svg class="ic '+cls+'" xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="'+fill+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||'')+'</svg>';
}
// turns <i data-icon="name" data-size="20"></i> into inline SVG
function hydrateIcons(root=document){
 root.querySelectorAll('i[data-icon]').forEach(e=>{
  const t=document.createElement('span');t.className='icw';
  t.innerHTML=ico(e.dataset.icon,+e.dataset.size||20,'',e.dataset.fill||'none');
  e.replaceWith(t);
 });
}
hydrateIcons();
