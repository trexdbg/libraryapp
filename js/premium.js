/* La Librairie des Mondes — JRPG premium prototype, zero runtime dependencies.
   Architecture: hand-authored world navigation graph + illustrated environment,
   live canvas characters and particles + generated pixel-art shop interiors. */
const WORLD={width:1672,height:941};
const $=q=>document.querySelector(q);
const canvas=$('#game'),ctx=canvas.getContext('2d',{alpha:false});
const progress=$('#progress'),locationEl=$('#location'),actionEl=$('#game-action');
const panel=$('#drawer'),panelContent=$('#drawer-content'),scrim=$('#scrim');
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const palette=['#587b5e','#c67f66','#577996','#b69a64','#8e6588','#598993'];
const categories=[
 {id:'jeunesse',title:'Jeunesse',icon:'✿',color:'#6b8d51',subtitle:'Les contes commencent ici',description:'Albums illustrés, premiers romans, histoires du soir et belles découvertes pour grandir.',x:311,y:193,entry:18,theme:'garden',books:[['Le Petit Prince','Antoine de Saint-Exupéry'],['Matilda','Roald Dahl'],['Le Gruffalo','Julia Donaldson']]},
 {id:'manga',title:'Manga',icon:'桜',color:'#b46a94',subtitle:'Mille aventures sous les sakuras',description:'Shōnen, shōjo, seinen et découvertes japonaises, sous les lanternes du quartier manga.',x:331,y:376,entry:13,theme:'manga',books:[['One Piece','Eiichirō Oda'],['Nausicaä de la Vallée du Vent','Hayao Miyazaki'],['Frieren','Kanehito Yamada & Tsukasa Abe']]},
 {id:'bd',title:'BD & Comics',icon:'✎',color:'#b17b50',subtitle:'Des bulles pleines de vie',description:'Bandes dessinées, romans graphiques et comics : des héros pour tous les âges.',x:479,y:393,entry:12,theme:'comics',books:[['Astérix le Gaulois','René Goscinny & Albert Uderzo'],['L’Arabe du futur','Riad Sattouf'],['Watchmen','Alan Moore & Dave Gibbons']]},
 {id:'litterature',title:'Littérature',icon:'❧',color:'#667a8e',subtitle:'Le cœur de la bibliothèque',description:'Romans contemporains, classiques et belles voix venues du monde entier.',x:846,y:351,entry:5,theme:'library',books:[['L’Étranger','Albert Camus'],['La Tresse','Laetitia Colombani'],['Chanson douce','Leïla Slimani']]},
 {id:'fantasy',title:'Fantasy & Science-Fiction',icon:'✧',color:'#4e77ae',subtitle:'De l’autre côté des étoiles',description:'Mondes magiques, vaisseaux, dragons, portes du temps et récits du futur.',x:1307,y:196,entry:23,theme:'cosmos',books:[['Dune','Frank Herbert'],['Le Hobbit','J. R. R. Tolkien'],['La Horde du Contrevent','Alain Damasio']]},
 {id:'romance',title:'Romance',icon:'♡',color:'#bb6a80',subtitle:'Des histoires qui font battre le cœur',description:'Romance contemporaine, romantasy, récits historiques et émotions à partager.',x:1371,y:363,entry:27,theme:'romance',books:[['Orgueil et Préjugés','Jane Austen'],['Les Sept Maris d’Evelyn Hugo','Taylor Jenkins Reid'],['Jamais plus','Colleen Hoover']]},
 {id:'polar',title:'Polar & Thriller',icon:'⌕',color:'#81595b',subtitle:'La ruelle des mystères',description:'Enquêtes, crimes et mystères haletants derrière la porte des archives.',x:1269,y:484,entry:30,theme:'noir',books:[['Le Crime de l’Orient-Express','Agatha Christie'],['Millénium','Stieg Larsson'],['La Vérité sur l’affaire Harry Quebert','Joël Dicker']]},
 {id:'histoire',title:'Histoire & Société',icon:'♜',color:'#b28c56',subtitle:'Voyager dans les siècles',description:'Histoire, philosophie, sciences humaines et idées pour comprendre notre monde.',x:641,y:514,entry:9,theme:'study',books:[['Sapiens','Yuval Noah Harari'],['Une histoire populaire des États-Unis','Howard Zinn'],['Le Deuxième Sexe','Simone de Beauvoir']]},
 {id:'bienetre',title:'Bien-être & Nature',icon:'❀',color:'#659580',subtitle:'Respirer et lire',description:'Vie au grand air, cuisine, jardinage, santé et art de vivre.',x:568,y:475,entry:10,theme:'garden',books:[['La Vie secrète des arbres','Peter Wohlleben'],['Le Charme discret de l’intestin','Giulia Enders'],['L’Art de la simplicité','Dominique Loreau']]},
 {id:'papeterie',title:'Papeterie & Cadeaux',icon:'✦',color:'#598f7e',subtitle:'Des petites merveilles à offrir',description:'Carnets, stylos, cartes et attentions pour accompagner les belles lectures.',x:1141,y:612,entry:34,theme:'shop',books:[]},
 {id:'blog',title:'Avis & Chroniques',icon:'☷',color:'#a87555',subtitle:'Le café des lecteurs',description:'Coups de cœur, chroniques et discussions de livres autour d’une table en terrasse.',x:619,y:688,entry:45,theme:'cafe',books:[]},
 {id:'retrait',title:'Retrait sur place',icon:'▣',color:'#527f87',subtitle:'Du site à votre librairie',description:'Le futur point de réservation en ligne et de retrait des livres à Villeneuve-Loubet.',x:1360,y:755,entry:42,theme:'shop',books:[]}
];
const byId=Object.fromEntries(categories.map(c=>[c.id,c]));
// Navigation is traced along visible stairways, paved terraces and bridges of the artwork.
// Each segment is a short, hand-verified walking stretch; no diagonal shortcuts through buildings.
const nodes=[
  [830, 577, [1, 6, 8, 35]],
  [781, 565, [0, 2]],
  [769, 520, [1, 3]],
  [783, 456, [2, 4]],
  [815, 412, [3, 5]],
  [844, 367, [4, 19]],
  [933, 557, [0, 7, 48]],
  [1020, 549, [6, 48]],
  [711, 548, [0, 9, 43]],
  [638, 514, [8, 10]],
  [560, 484, [9, 11]],
  [511, 448, [10, 12]],
  [460, 404, [11, 13, 14]],
  [340, 373, [12]],
  [470, 365, [12, 15]],
  [484, 305, [14, 16]],
  [497, 260, [15, 17]],
  [425, 225, [16, 18]],
  [315, 199, [17]],
  [963, 358, [5, 20]],
  [1055, 314, [19, 21]],
  [1150, 309, [20, 22, 24]],
  [1224, 259, [21, 23]],
  [1291, 204, [22]],
  [1161, 348, [21, 25]],
  [1215, 383, [24, 26]],
  [1313, 363, [25, 27]],
  [1366, 349, [26, 28]],
  [1379, 413, [27, 29]],
  [1338, 462, [28, 30, 31]],
  [1269, 471, [29]],
  [1366, 536, [29, 32]],
  [1320, 591, [31, 33]],
  [1231, 639, [32, 34, 40]],
  [1140, 624, [33, 39]],
  [820, 634, [0, 36, 55]],
  [871, 672, [35, 37]],
  [949, 680, [36, 38]],
  [1030, 693, [37, 39]],
  [1117, 665, [34, 38, 50]],
  [1188, 686, [33, 53]],
  [1212, 767, [51, 53]],
  [1358, 840, [52]],
  [701, 649, [8, 44, 54]],
  [652, 683, [43, 45]],
  [615, 708, [44]],
  [806, 713, []],
  [936, 728, []],
  [970, 619, [6, 7, 49]],
  [1057, 657, [48, 50]],
  [1142, 680, [39, 49]],
  [1233, 807, [41, 52]],
  [1292, 834, [42, 51]],
  [1190, 741, [40, 41]],
  [749, 637, [43, 55]],
  [775, 632, [35, 54]],
].map(([x,y,links])=>({x,y,links}));
const stage={mode:'world',inside:null,loaded:false};
const character={x:nodes[0].x,y:nodes[0].y,dir:'down',step:0,route:[],arrival:null,insideX:480,insideY:494};
const npcs=[
 {x:322,y:340,shade:0,t:'Les livres sont des passages secrets. Il suffit d’en ouvrir un.',name:'Mia, apprentie libraire'},
 {x:621,y:372,shade:2,t:'La place est encore plus jolie quand les lanternes s’allument.',name:'Lucien, historien'},
 {x:736,y:547,shade:5,t:'Un coup de cœur littéraire, ça se partage autour d’un café.',name:'Chloé, lectrice'},
 {x:951,y:589,shade:1,t:'Chaque quartier a sa petite histoire. Explorez-les tous !',name:'Léon, flâneur'},
 {x:1106,y:568,shade:4,t:'La boutique des carnets est juste au coin de la rue.',name:'Sofia, artiste'},
 {x:1310,y:454,shade:3,t:'Je garde un œil sur les mystères qui se cachent entre ces pages.',name:'Auguste, détective'},
 {x:1337,y:758,shade:2,t:'Un jour, vous récupérerez ici vos livres commandés en ligne.',name:'Noé, du port'},
 {x:1270,y:219,shade:4,t:'Sur cette terrasse, on peut presque toucher les étoiles.',name:'Morgane, astronome'}
];
let viewW=1,viewH=1,dpr=1,scale=1,cam={x:836,y:510},targetCam={x:836,y:510},zoom=1,overview=true;
let worldImage=new Image();worldImage.src='./assets/mediterranean-jrpg.webp';
let spriteAtlasLoaded=false;const spriteAtlas=new Image();
spriteAtlas.addEventListener('load',()=>{spriteAtlasLoaded=true});
spriteAtlas.src='./assets/characters.png';
let last=0,clock=0,nightMode='day',seasonMode='summer',panelFocus=null,toaster=0,mouse={x:-1,y:-1},muted=true,sfx=null;
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const particles=Array.from({length:85},(_,i)=>({x:rand(0,WORLD.width),y:rand(0,WORLD.height),v:rand(.2,1.5),seed:rand(0,30)}));
const visits=new Set((()=>{try{return JSON.parse(localStorage.getItem('librairie-jrpg-visits')||'[]')}catch{return []}})());
function save(){try{localStorage.setItem('librairie-jrpg-visits',JSON.stringify([...visits]))}catch{}}
function note(t){clearTimeout(toaster);const e=$('#toast');e.textContent=t;e.classList.add('show');toaster=setTimeout(()=>e.classList.remove('show'),3600)}
function paintTime(){
 const selected=$('#time').value;
 let h=new Date().getHours();nightMode=selected==='auto'?(h<6||h>=21?'night':h<10?'morning':h>=17?'sunset':'day'):selected;
 let m=new Date().getMonth();seasonMode=$('#season').value==='auto'?(m===11||m<2?'winter':m<5?'spring':m<8?'summer':'autumn'):$('#season').value;
}
function song(tone=740){if(muted)return;try{sfx??=new (window.AudioContext||window.webkitAudioContext)();const o=sfx.createOscillator(),g=sfx.createGain();o.connect(g);g.connect(sfx.destination);o.type='triangle';o.frequency.setValueAtTime(tone,sfx.currentTime);o.frequency.exponentialRampToValueAtTime(tone*.68,sfx.currentTime+.22);g.gain.setValueAtTime(.035,sfx.currentTime);g.gain.exponentialRampToValueAtTime(.001,sfx.currentTime+.25);o.start();o.stop(sfx.currentTime+.28)}catch{}}
function resize(){
 const rect=canvas.getBoundingClientRect();viewW=Math.max(1,rect.width);viewH=Math.max(1,rect.height);dpr=Math.min(2,devicePixelRatio||1);
 canvas.width=Math.round(viewW*dpr);canvas.height=Math.round(viewH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
 const cover=Math.max(viewW/WORLD.width,viewH/WORLD.height);
 const contain=Math.min(viewW/WORLD.width,viewH/WORLD.height);
 zoom=overview ? Math.max(.78,Math.min(1,contain/cover)) : (viewW<760?1.72:1.26);
 scale=cover*zoom;
 if(stage.mode==='world'){
  if(overview){cam.x=WORLD.width/2;cam.y=WORLD.height/2;targetCam={...cam}}
  else{cam.x=character.x;cam.y=character.y-35;targetCam={...cam}}
 }
 clampCamera();
}
function worldToScreen(p){return{x:(p.x-cam.x)*scale+viewW/2,y:(p.y-cam.y)*scale+viewH/2}}
function screenToWorld(x,y){return{x:(x-viewW/2)/scale+cam.x,y:(y-viewH/2)/scale+cam.y}}
function clampCamera(){
 const halfW=viewW/(2*scale),halfH=viewH/(2*scale);
 cam.x=halfW>=WORLD.width/2?WORLD.width/2:clamp(cam.x,halfW,WORLD.width-halfW);
 cam.y=halfH>=WORLD.height/2?WORLD.height/2:clamp(cam.y,halfH,WORLD.height-halfH);
 targetCam.x=halfW>=WORLD.width/2?WORLD.width/2:clamp(targetCam.x,halfW,WORLD.width-halfW);
 targetCam.y=halfH>=WORLD.height/2?WORLD.height/2:clamp(targetCam.y,halfH,WORLD.height-halfH);
}
function setOverview(value){
 overview=value;
 const button=$('#overview');if(button){button.setAttribute('aria-pressed',String(value));button.textContent=value?'◈ Vue générale':'⊙ Suivi héros'}
 resize();
}
function chooseNode(x,y){let k=0,d=Infinity;nodes.forEach((p,i)=>{const v=Math.hypot(x-p.x,y-p.y);if(v<d){d=v;k=i}});return k}
function findRoute(from,to){const n=nodes.length,distances=Array(n).fill(Infinity),prev=Array(n).fill(-1),done=new Set();distances[from]=0;for(let j=0;j<n;j++){let u=-1;for(let i=0;i<n;i++)if(!done.has(i)&&(u<0||distances[i]<distances[u]))u=i;if(u<0||distances[u]===Infinity)break;if(u===to)break;done.add(u);for(const v of nodes[u].links){const next=distances[u]+dist(nodes[u],nodes[v]);if(next<distances[v]){distances[v]=next;prev[v]=u}}}let path=[],cur=to;while(cur!==-1){path.push(cur);if(cur===from)break;cur=prev[cur]}path.reverse();return path[0]===from?path:[from,to]}
function routeTo(node,arrival){
 if(stage.mode!=='world')return;
 const from=chooseNode(character.x,character.y);const p=findRoute(from,node);
 character.route=[{x:nodes[from].x,y:nodes[from].y},...p.slice(1).map(i=>({x:nodes[i].x,y:nodes[i].y}))];
 if(dist(character,character.route[0])<12)character.route.shift();character.arrival=arrival||null;
}
function travelTo(id,autoEnter=true){const c=byId[id];if(!c)return;if(stage.mode==='interior'){stage.mode='world';stage.inside=null;}routeTo(c.entry,autoEnter?()=>enter(c):null);song(880);note(`En route vers ${c.title} !`)}
function enter(c){stage.mode='interior';stage.inside=c;character.route=[];character.arrival=null;character.insideX=470;character.insideY=508;locationEl.textContent=c.title;visits.add(c.id);save();progress.textContent=`${visits.size} / 12`;song(930);message(`${c.icon} Bienvenue au quartier ${c.title}. Approchez-vous des bibliothèques ou appuyez sur E pour découvrir les livres.`,4600)}
function leave(){stage.mode='world';stage.inside=null;locationEl.textContent='La place des histoires';character.route=[];character.arrival=null;song(520)}
function message(txt,ms=3500){const e=$('#message');e.hidden=false;e.textContent=txt;clearTimeout(message.timer);message.timer=setTimeout(()=>e.hidden=true,ms)}
function update(dt){clock+=dt;
 if(stage.mode==='world'){
  let amount=dt*95;
  while(amount>0&&character.route.length){const t=character.route[0],dx=t.x-character.x,dy=t.y-character.y,len=Math.hypot(dx,dy);if(len<1){character.x=t.x;character.y=t.y;character.route.shift();continue;}const v=Math.min(amount,len);character.x+=dx/len*v;character.y+=dy/len*v;character.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';character.step+=v*.065;amount-=v;if(v>=len-1)character.route.shift();else break;}
  if(!character.route.length&&character.arrival){const fn=character.arrival;character.arrival=null;fn()}
  if(!character.route.length&&!character.arrival){
    const held=pressed.ArrowUp||pressed.z||pressed.Z||pressed.w||pressed.W?'up':
               pressed.ArrowDown||pressed.s||pressed.S?'down':
               pressed.ArrowLeft||pressed.q||pressed.Q||pressed.a||pressed.A?'left':
               pressed.ArrowRight||pressed.d||pressed.D?'right':null;
    if(held&&clock-lastHeldTurn>.17){lastHeldTurn=clock;movingDirection(held)}
  }
  if(!overview){targetCam={x:character.x,y:character.y-35};let f=clamp(dt*4,0,1);cam.x+=(targetCam.x-cam.x)*f;cam.y+=(targetCam.y-cam.y)*f;}clampCamera();
  let near=null,nearest=55;for(const c of categories){const d=dist(character,nodes[c.entry]);if(d<nearest){nearest=d;near=c}}
  actionEl.hidden=!near;if(near){$('#action-title').textContent=near.title;$('#action-hint').textContent='E POUR ENTRER'}
  if(!character.route.length&&near)locationEl.textContent=near.title;
  else if(character.route.length)locationEl.textContent='Les ruelles du village';
  else locationEl.textContent='La place des histoires';
 }else{const keys=pressed;let dx=(keys.ArrowRight||keys.d||keys.D?1:0)-(keys.ArrowLeft||keys.q||keys.Q||keys.a||keys.A?1:0),dy=(keys.ArrowDown||keys.s||keys.S?1:0)-(keys.ArrowUp||keys.z||keys.Z||keys.w||keys.W?1:0);if(dx||dy){let len=Math.hypot(dx,dy);character.insideX=clamp(character.insideX+dx/len*dt*165,185,760);character.insideY=clamp(character.insideY+dy/len*dt*165,408,565);character.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';character.step+=dt*10;}if(character.insideY>545&&character.insideX>438&&character.insideX<518){/* exit indicated in center at floor */}}
}
// Pixel-art atlas: handcrafted four-frame directional sprites with consistent proportions.
const dirs={down:0,left:1,right:2,up:3};
function spriteScale(y,interior=false){return interior?1.05:clamp(.47+(y-175)/750*.25,.47,.72)}
function drawCharacter(x,y,dir,frame,v=0,modifier=1){
 const size=spriteScale(y,stage.mode==='interior')*modifier;
 const w=48*size,h=64*size;
 ctx.fillStyle='rgba(29,32,36,.27)';ctx.beginPath();ctx.ellipse(x,y-.8,11*size,3*size,0,0,Math.PI*2);ctx.fill();
 if(spriteAtlasLoaded){
  const ix=Math.floor(frame)%4,iy=(v%10)*4+(dirs[dir]??0);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(spriteAtlas,ix*48,iy*64,48,64,Math.round(x-w/2),Math.round(y-h+4*size),w,h);
  ctx.imageSmoothingEnabled=true;
 }else{
  ctx.fillStyle='#bb7b56';ctx.fillRect(x-4*size,y-33*size,8*size,10*size);
  ctx.fillStyle=v?'#915679':'#2e63a0';ctx.fillRect(x-7*size,y-22*size,14*size,20*size);
 }
}
function drawEnvironment(){
 ctx.fillStyle='#224a5a';ctx.fillRect(0,0,viewW,viewH);
 // When viewing the whole island, fill any aspect-ratio gutters with the same panorama,
 // rather than leaving black bars or distorting the painted buildings.
 if(overview&&stage.loaded&&WORLD.width*scale<viewW-2 || overview&&stage.loaded&&WORLD.height*scale<viewH-2){
  const cover=Math.max(viewW/WORLD.width,viewH/WORLD.height);
  const w=WORLD.width*cover,h=WORLD.height*cover;
  ctx.globalAlpha=.32;ctx.drawImage(worldImage,(viewW-w)/2,(viewH-h)/2,w,h);ctx.globalAlpha=1;
 }
 ctx.save();ctx.translate(viewW/2-cam.x*scale,viewH/2-cam.y*scale);ctx.scale(scale,scale);
 if(stage.loaded)ctx.drawImage(worldImage,0,0,WORLD.width,WORLD.height);
 else{ctx.fillStyle='#69a3ad';ctx.fillRect(0,0,WORLD.width,WORLD.height)}
 const night=nightMode==='night'?1:nightMode==='sunset'?.47:nightMode==='morning'?.19:0;
 if(night){ctx.fillStyle=`rgba(13,24,69,${night*.64})`;ctx.fillRect(0,0,WORLD.width,WORLD.height);}
 if(seasonMode==='autumn'){ctx.fillStyle='#bf763024';ctx.fillRect(0,0,WORLD.width,WORLD.height)}
 if(seasonMode==='winter'){ctx.fillStyle='#afdaff36';ctx.fillRect(0,0,WORLD.width,WORLD.height)}
 // Reflections shimmer over the areas of visible water, without affecting the buildings.
 if(!reducedMotion){ctx.lineWidth=2;const t=clock*16;for(let i=0;i<42;i++){let x=(i*113+Math.sin(i*1.7)*50+100)%WORLD.width;let y=x<270?590+(i*37)%345:x>1170?760+(i*23)%174:836+(i*9)%90;if(y>WORLD.height)continue;ctx.strokeStyle=`rgba(225,247,255,${.12+.13*Math.sin(clock*2+i)})`;ctx.beginPath();ctx.moveTo(x+(t%22),y);ctx.lineTo(x+12+t%22,y);ctx.stroke()}}
 // Lit streetlamps, windows and dancing light at twilight / night.
 if(night>.05){const lamps=[[772,555],[897,550],[714,610],[935,640],[1204,508],[1320,499],[550,645],[1280,720],[1130,668],[1051,389],[568,403],[674,319],[1480,697]];for(const [x,y] of lamps){const r=32+(night*33)+Math.sin(clock*5+x)*3;const grad=ctx.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,`rgba(255,202,109,${.5*night})`);grad.addColorStop(1,'rgba(255,178,85,0)');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r,r*2,r*2)}}
 // In-world glint markers; existing painted category labels remain uncluttered.
 for(const c of categories){const p=nodes[c.entry],rad=10+Math.sin(clock*3+c.x)*2;ctx.strokeStyle=`rgba(255,241,169,${.55+.3*Math.sin(clock*3+c.x)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(p.x,p.y-8,rad,rad*.48,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff0bd';ctx.font='15px Georgia';ctx.textAlign='center';ctx.fillText('✦',p.x,p.y-16+Math.sin(clock*2+c.y)*3)}
 if(new URLSearchParams(location.search).has('debugPaths')){
  ctx.save();ctx.lineWidth=3;ctx.strokeStyle='#00ffbee6';
  for(let i=0;i<nodes.length;i++)for(const j of nodes[i].links)if(j>i){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}
  for(let i=0;i<nodes.length;i++){ctx.beginPath();ctx.fillStyle='#172e46';ctx.arc(nodes[i].x,nodes[i].y,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='white';ctx.font='12px monospace';ctx.fillText(i,nodes[i].x-7,nodes[i].y+4)}
  ctx.restore();
 }
 for(const n of npcs){const bob=reducedMotion?0:Math.sin(clock*.85+n.x)*6;drawCharacter(n.x+bob,n.y,n.x%3===0?'left':'down',Math.floor(clock*2+n.y)%4,1+n.shade,1)}
 drawCharacter(character.x,character.y,character.dir,Math.floor(character.step)%4,0,1);
 if(seasonMode==='winter'||seasonMode==='spring'){for(const p of particles){let x=(p.x+Math.sin(clock*.3+p.seed)*19+WORLD.width)%WORLD.width;let y=(p.y+(clock*(seasonMode==='winter'?9:16)*p.v))%WORLD.height;ctx.fillStyle=seasonMode==='winter'?'#f8fbffbd':'#ffb6dad0';ctx.fillRect(x,y,seasonMode==='winter'?3:5,seasonMode==='winter'?3:2)}}
 ctx.restore();}
function floorBlock(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
let interiorCache={};
function makeInterior(c){if(interiorCache[c.id])return interiorCache[c.id];const off=document.createElement('canvas');off.width=960;off.height=610;const g=off.getContext('2d');let seed=103+c.title.length*183;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const accent=c.color, dark=c.theme==='noir'?'#232536':c.theme==='cosmos'?'#1e2947':'#43504e';
 g.fillStyle='#101d29';g.fillRect(0,0,960,610);
 R(90,37,780,531,'#796b5a');R(101,47,758,507,'#d5c6a9');R(118,80,724,472,'#b9a281');
 // Tile mosaic: individually painted stone bricks / parquet with irregular wear.
 for(let y=250;y<551;y+=28)for(let x=121;x<843;x+=36){const t=rng();R(x+1+(y%56?9:0),y+1,34,26,t>.66?'#bfaa8b':t>.3?'#a58c70':'#ad987a');R(x+3+(y%56?9:0),y+3,28,2,'#f3dfb048');R(x+24,y+19,4,3,'#887558')}
 // Distinct walls with dark wood / stone wainscot.
 R(126,90,708,179,dark);R(130,95,700,169,c.theme==='cosmos'?'#273c59':c.theme==='romance'?'#795463':c.theme==='manga'?'#694862':'#596865');
 for(let x=135;x<830;x+=76){R(x,92,5,166,'#dec592');R(x+4,96,2,159,'#a88964')}R(123,255,714,11,'#4a3c35');R(128,260,703,6,'#d0ab6b');
 // Windows overlooking a Riviera sky; matching daytime palette regardless of real season.
 for(let k=0;k<3;k++){let x=279+k*183;R(x,110,76,112,'#b88b59');R(x+7,115,63,96,'#5c9cb9');R(x+10,119,58,47,'#aed8dc');R(x+13,164,55,42,'#3985a8');R(x+40,119,5,92,'#d6b880');R(x+9,160,61,5,'#d6b880');R(x,110,5,111,'#3e3532');R(x+71,110,5,111,'#3e3532')}
 // Detailed library shelves on both wings.
 function shelf(x,y,w,h){R(x,y,w,h,'#3c302c');R(x+5,y+5,w-10,h-10,'#674632');for(let level=0;level<3;level++){let by=y+13+level*43;R(x+7,by+34,w-14,8,'#b4874c');for(let bx=x+11;bx<x+w-14;){let bw=8+Math.floor(rng()*7);const colors=['#a66e49','#b8a45c','#a86a79','#658b8a','#d49e5c','#365e7b','#c1b286'];R(bx,by,bw,33,colors[Math.floor(rng()*colors.length)]);R(bx+2,by+4,2,26,'#f5ebca77');bx+=bw+2}}R(x+3,y+3,w-6,5,'#d8b77d')}
 shelf(155,108,112,149);shelf(692,108,115,149);
 // Huge sidecases and long reading desks.
 shelf(141,303,146,147);shelf(675,303,146,147);
 R(367,371,235,97,'#4c382f');R(359,364,251,18,'#ad7d51');R(368,383,235,13,'#ce9d61');R(382,468,17,44,'#553a30');R(570,468,17,44,'#553a30');
 for(let b=0;b<9;b++){let x=392+b*19,y=343+(b%2)*4;R(x,y,13,22,['#b77863','#e2bc69','#5c9a8c','#c997a1'][b%4]);R(x+1,y+3,11,2,'#faf0c1a0')}
 // Carpet runner with repeated diamond borders.
 R(315,467,343,85,c.theme==='romance'?'#a44e71':c.theme==='cosmos'?'#2e6392':c.theme==='manga'?'#b66f87':'#8a4d43');R(324,475,325,66,'#c7ae7777');for(let x=339;x<640;x+=25){R(x,481,11,11,accent);R(x+4,485,3,3,'#f5dfb0')}
 // Terracotta plants and lamps.
 for(let x of [152,815]){R(x,461,26,36,'#a75b42');R(x+3,493,20,3,'#e69b58');for(let j=0;j<22;j++){let px=x+8+Math.sin(j*2.2)*23,py=457-rng()*54;R(px,py,9,7,['#659a62','#90ae75','#3e7753','#aed08d'][j%4])}}
 // Hanging chandelier and tapestry.
 R(460,78,5,53,'#e9cb83');R(429,128,72,7,'#b68b49');for(let x=428;x<500;x+=14){R(x,122,4,12,'#e2a956');R(x-2,120,8,5,'#fff2bc')}R(440,84,40,20,'#d9b97c');
 // Door exit at bottom (real interaction, not just a decorative label).
 R(430,533,105,25,'#57443f');R(442,538,81,16,'#c5a476');R(466,540,36,12,'#314b51');
 // Category symbol sign.
 R(371,199,217,43,'#293b42');R(376,203,207,35,accent);g.font='bold 20px Georgia';g.textAlign='center';g.fillStyle='#fff4dc';g.fillText(c.title.length>18?c.title.slice(0,18):c.title,479,228);
 if(c.theme==='cosmos'){for(let i=0;i<20;i++){const x=295+rng()*396,y=121+rng()*85;R(x,y,3,3,'#f7e2b9')}}
 if(c.theme==='manga'){for(let i=0;i<10;i++){R(288+i*28,228,14,12,i%2?'#f0a5b4':'#ffffff')}}
 if(c.theme==='romance'){for(let i=0;i<14;i++){R(286+i*24,245,9,5,'#e78eaa')}}
 if(c.theme==='cafe'){for(let i=0;i<6;i++){R(322+i*33,416,15,16,'#e5c9a4')}}

 // Premium hand-authored decorative layer: unique reading room identity per district.
 const outline='#2b2a36',ivory='#fbe6b4',gold='#d7aa64';
 function framed(x,y,w,h,col='#5c3c47'){
  R(x-5,y-5,w+10,h+10,'#362f35');R(x-2,y-2,w+4,h+4,gold);R(x,y,w,h,col);
 }
 function chair(x,y,col='#8c5d51'){
  R(x-12,y-17,37,37,outline);R(x-10,y-16,33,23,col);R(x-7,y-13,27,14,'#ffffff25');
  R(x-14,y+6,39,13,outline);R(x-11,y+8,33,7,col);
 }
 function bookOpen(x,y,size=1){
  R(x-2,y-2,38*size+4,25*size+4,'#514039');R(x,y,18*size,22*size,'#fff0d6');R(x+20*size,y,18*size,22*size,'#eed6ae');
  R(x+19*size,y+1,2*size,20*size,'#9a6c53');
  for(let i=0;i<3;i++){R(x+3*size,y+(5+i*5)*size,12*size,1*size,'#c1a18a');R(x+23*size,y+(5+i*5)*size,12*size,1*size,'#c1a18a')}
 }
 function vase(x,y,flower){
  R(x-3,y+19,20,7,'#8a4b3c');R(x,y+4,14,17,'#bb7353');R(x+3,y+7,8,10,'#d49370');
  R(x+6,y-18,3,26,'#547848');
  for(let i=0;i<9;i++)R(x-7+((i*7)%28),y-20+((i*5)%15),5,5,i%3?'#628c55':flower);
 }
 function flowerArch(){
  for(let i=0;i<26;i++){
   let x=310+i*13,y=190-Math.sin(i/25*Math.PI)*31;
   R(x,y,11,8,i%3?'#bc4b83':'#f1a5bb');R(x+2,y-2,6,4,'#f6ccdb');
  }
 }
 function cushion(x,y,color){R(x-2,y+8,53,16,'#362f3e');R(x,y,49,12,color);R(x+6,y+3,32,2,'#ffffff5a')}
 function table(x,y){
  R(x+9,y+14,10,51,'#5b4436');R(x-28,y-9,88,27,outline);R(x-25,y-10,83,22,'#9e6e48');R(x-21,y-7,75,4,'#d9a66e')
 }
 // floor corner trim, set into stone tiles and aged timber
 for(let yy=313; yy<554; yy+=48){
  R(118,yy,724,2,'#f0d9ad26');
 }
 for(let xx=140; xx<828; xx+=54){R(xx,545,24,2,'#fbe8b24a')}
 if(c.theme==='garden'){
  flowerArch();vase(346,328,'#f7bd80');vase(599,320,'#c59cb9');
  cushion(328,410,'#68977d');cushion(590,413,'#9cbb81');
  bookOpen(469,403,.85);
  framed(364,122,60,81,'#86b6af');R(375,179,40,15,'#5f9474');
  R(482,286,42,37,'#986a4b');R(488,292,30,25,'#cfaa67');R(497,298,8,8,'#e8b589');
 }
 if(c.theme==='manga'){
  // Noren curtains, lanterns, scrolls and indigo mats
  for(let i=0;i<5;i++){
   const x=350+i*58; R(x,109,39,55,i%2?'#b06a87':'#835a9e');
   R(x+7,118,26,3,'#f5d9d5');R(x+10,129,20,2,'#f5d9d5')
  }
  for(let i=0;i<5;i++){let x=322+i*70;R(x,151,2,20,'#4a3239');R(x-11,169,26,31,'#efb1bc');R(x-11,177,26,3,'#b95e7f');R(x,170,2,28,'#d67591')}
  cushion(306,433,'#b55a87');cushion(626,432,'#685eac');
  for(let i=0;i<3;i++)framed(343+i*91,289,53,58,['#765d9f','#aa6290','#537c9f'][i]);
 }
 if(c.theme==='cosmos'){
  // A luminous planetarium lives inside the fantasy/SF wing
  framed(394,102,172,134,'#172d56');
  let cg=g.createRadialGradient(475,169,2,475,169,94);
  cg.addColorStop(0,'#e5bbee');cg.addColorStop(.28,'#6a79ba');cg.addColorStop(1,'#162749');g.fillStyle=cg;g.fillRect(395,103,170,132);
  g.strokeStyle='#b1bfe8';g.lineWidth=5;g.beginPath();g.ellipse(476,175,73,35,-.2,0,Math.PI*2);g.stroke();
  g.fillStyle='#e8ca90';g.beginPath();g.arc(478,172,24,0,Math.PI*2);g.fill();
  for(let i=0;i<23;i++)R(409+(i*37)%147,111+(i*19)%115,2+(i%2),2,'#fff4c5');
  // telescope in the foreground
  R(553,345,16,100,'#75634e');R(517,319,116,20,'#293e61');R(527,314,103,11,'#b3a46f');R(521,315,7,28,'#c6c5a8');
  bookOpen(392,400,1);
 }
 if(c.theme==='romance'){
  flowerArch();cushion(325,429,'#b5667f');cushion(586,428,'#a45c7c');
  for(let i=0;i<12;i++){R(314+i*31,294+Math.floor(Math.sin(i*1.7)*8),7,7,'#ca5887');R(316+i*31,292+Math.floor(Math.sin(i*1.7)*8),4,4,'#f8b3cd')}
  framed(432,120,96,76,'#854d70');g.fillStyle='#f2b7cb';g.font='38px serif';g.fillText('♥',465,169);
  bookOpen(474,407,.9);
 }
 if(c.theme==='noir'){
  framed(425,120,116,95,'#3e394a');
  for(let i=0;i<8;i++){R(433+(i*33)%90,130+(i*37)%70,23,16,i%2?'#d6be91':'#bca9a0');R(436+(i*33)%90,139+(i*37)%70,16,2,'#786d65')}
  R(445,326,8,75,'#443949');R(447,324,61,12,'#746451');R(500,319,14,37,'#bc9d70');
  R(494,307,22,12,'#eacb85');R(513,352,35,13,'#4f3d37');
  framed(338,297,53,72,'#323749');
 }
 if(c.theme==='study'||c.theme==='library'){
  // Atlas globes, old parchment, reading lecterns
  R(552,310,6,91,'#654d39');R(531,393,47,8,'#5a3d2f');
  g.fillStyle='#487e7c';g.beginPath();g.arc(553,304,28,0,Math.PI*2);g.fill();
  R(545,283,12,14,'#88b39c');R(558,307,18,8,'#9baa76');R(539,312,9,12,'#9baa76');
  g.strokeStyle='#e1c083';g.lineWidth=3;g.beginPath();g.arc(553,304,32,0,Math.PI*2);g.stroke();
  bookOpen(432,403,1);
  framed(359,120,61,76,'#6f7e6e');
 }
 if(c.theme==='shop'){
  for(let i=0;i<5;i++){
   let x=342+i*57,y=307+(i%2)*12;
   R(x-2,y-2,48,48,'#594239');R(x,y,44,43,['#97b5a4','#bb8493','#e2c178','#7c9eb6','#cd9c7b'][i]);
   R(x+18,y,7,43,'#e9d9ba');R(x,y+17,44,7,'#e9d9ba');
   R(x+8,y-8,12,10,'#efd5a1');R(x+23,y-8,12,10,'#efd5a1');
  }
  framed(413,123,128,70,'#54847d');
  R(444,142,64,29,'#d7c595');R(455,150,43,5,'#648c86');
 }
 if(c.theme==='cafe'){
  table(361,332);table(541,341);R(360,309,19,19,'#d5bd97');R(360,310,17,11,'#fff0d2');
  for(let i=0;i<3;i++){let x=386+i*38;R(x,370,13,19,'#e8dab7');R(x+4,378,4,4,'#ad8773')}
  cushion(320,432,'#ad7f53');cushion(613,431,'#bb9965');
  for(let i=0;i<9;i++){let x=338+i*36;R(x,149+(i%3)*4,5,4,i%2?'#ffdea5':'#fbc2a0')}
 }
 // Pixel skylight ambience, light shafts, and hand-painted edge vignette (no CSS blur).
 let lg=g.createLinearGradient(0,225,0,500);
 lg.addColorStop(0,'#fff3bd12');lg.addColorStop(.5,'#ffe0ae05');lg.addColorStop(1,'#38232115');
 g.fillStyle=lg;g.fillRect(128,226,704,324);
 for(let i=0;i<18;i++){
  let x=158+i*39,y=270+((i*71)%205);
  R(x,y,2,2,i%3?'#fff1c442':'#f9e5b980');
 }
 interiorCache[c.id]=off;return off}
function renderInterior(){const c=stage.inside;if(!c)return;ctx.fillStyle='#112535';ctx.fillRect(0,0,viewW,viewH);const ratio=Math.min(viewW/960,viewH/610)*1.02;const w=960*ratio,h=610*ratio,l=(viewW-w)/2,top=(viewH-h)/2;ctx.drawImage(makeInterior(c),l,top,w,h);ctx.save();ctx.translate(l,top);ctx.scale(ratio,ratio);
 // Lively candlelight and floating dust within a detailed interior.
 for(const x of [269,688]){let g=ctx.createRadialGradient(x,277,2,x,277,102);g.addColorStop(0,`rgba(255,218,124,${.22+Math.sin(clock*4+x)*.04})`);g.addColorStop(1,'rgba(255,202,121,0)');ctx.fillStyle=g;ctx.fillRect(x-102,170,204,205)}
 for(let i=0;i<20;i++){const px=235+(i*37)%530,py=142+(clock*(i%3+1)*7+i*47)%290;ctx.fillStyle=`rgba(255,245,192,${.2+.2*Math.sin(clock*2+i)})`;ctx.fillRect(px,py,2,2)}
 drawCharacter(476,326,'down',0,4,1);drawCharacter(character.insideX,character.insideY,character.dir,Math.floor(character.step)%4,0,1);
 ctx.fillStyle='#143345da';ctx.fillRect(360,565,240,25);ctx.font='bold 14px DM Sans';ctx.textAlign='center';ctx.fillStyle='#f9dba3';ctx.fillText('E · DÉCOUVRIR LES LIVRES',480,582);ctx.restore();}
function frame(ts){if(!last)last=ts;let dt=Math.min(.05,(ts-last)/1000);last=ts;ctx.setTransform(dpr,0,0,dpr,0,0);update(dt);if(stage.mode==='world')drawEnvironment();else renderInterior();requestAnimationFrame(frame)}
const pressed={};let lastHeldTurn=0;
function movingDirection(d){if(stage.mode!=='world'||character.route.length)return;const current=chooseNode(character.x,character.y),p=nodes[current],map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}},vec=map[d];let options=p.links.map(id=>({id,dir:{x:nodes[id].x-p.x,y:nodes[id].y-p.y}}));options=options.map(v=>({...v,score:(v.dir.x*vec.x+v.dir.y*vec.y)/Math.hypot(v.dir.x,v.dir.y)})).sort((a,b)=>b.score-a.score);if(options.length&&options[0].score>.13)routeTo(options[0].id);}
function interact(){if(stage.mode==='interior'){openCategory(stage.inside);return}let near=null,best=66;for(const c of categories){const d=dist(character,nodes[c.entry]);if(d<best){best=d;near=c}}if(near){enter(near);return}for(const n of npcs){if(dist(character,n)<70){message(`${n.name} : « ${n.t} »`,5500);song(610);return}}message('Explorez les chemins jusqu’aux entrées scintillantes des quartiers.');}
function pointer(e){const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;return stage.mode==='world'?screenToWorld(x,y):{x:(x-(viewW-960*Math.min(viewW/960,viewH/610)*1.02)/2)/(Math.min(viewW/960,viewH/610)*1.02),y:(y-(viewH-610*Math.min(viewW/960,viewH/610)*1.02)/2)/(Math.min(viewW/960,viewH/610)*1.02)}}
canvas.addEventListener('click',e=>{if($('#welcome')&&!$('#welcome').hidden)return;const p=pointer(e);if(stage.mode==='interior'){if(p.y>527&&p.x>414&&p.x<540){leave();return}character.insideX=clamp(p.x,185,760);character.insideY=clamp(p.y,408,565);return}const targets=categories.map(c=>({c,d:Math.hypot(c.x-p.x,c.y-p.y)})).sort((a,b)=>a.d-b.d);if(targets[0].d<98){travelTo(targets[0].c.id);return}const k=chooseNode(p.x,p.y);routeTo(k,()=>{for(const n of npcs){if(dist(character,n)<59){message(`${n.name} : « ${n.t} »`,4800);return}}});});
canvas.addEventListener('pointermove',e=>{mouse=pointer(e)});
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select'))return;if(panel.classList.contains('open')){if(e.key==='Escape'){closeDrawer();e.preventDefault()}return}const key=e.key;if(key==='Escape'&&stage.mode==='interior'){leave();return}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'].includes(key))e.preventDefault();if((key==='e'||key==='E'||key==='Enter')&&!e.repeat){interact();return}let d=null;if(['ArrowUp','z','Z','w','W'].includes(key))d='up';if(['ArrowDown','s','S'].includes(key))d='down';if(['ArrowLeft','q','Q','a','A'].includes(key))d='left';if(['ArrowRight','d','D'].includes(key))d='right';if(d){pressed[key]=true;if(stage.mode==='world'&&!e.repeat)movingDirection(d)}});
document.addEventListener('keyup',e=>{delete pressed[e.key]});window.addEventListener('blur',()=>Object.keys(pressed).forEach(k=>delete pressed[k]));
for(const btn of document.querySelectorAll('[data-dir]')){const keys={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};const d=btn.dataset.dir;btn.addEventListener('pointerdown',e=>{e.preventDefault();pressed[keys[d]]=true;if(stage.mode==='world')movingDirection(d)});for(const ev of ['pointerup','pointercancel','pointerleave'])btn.addEventListener(ev,()=>delete pressed[keys[d]])}
$('#touch-enter').addEventListener('click',interact);
$('#overview').addEventListener('click',()=>setOverview(!overview));
$('#recenter').addEventListener('click',()=>{if(stage.mode==='interior')leave();routeTo(0);song(650)});
$('#time').addEventListener('change',paintTime);$('#season').addEventListener('change',paintTime);
setInterval(()=>{if($('#time').value==='auto'||$('#season').value==='auto')paintTime()},60000);
$('#sound').addEventListener('click',()=>{muted=!muted;$('#sound').setAttribute('aria-pressed',String(!muted));$('#sound').textContent=muted?'♪':'♫';if(!muted)song(830)});
const bookSearch=(t,a)=>'https://openlibrary.org/search?q='+encodeURIComponent(`${t} ${a}`);
function openDrawer(markup){panelContent.innerHTML=markup;panelFocus=document.activeElement;panel.classList.add('open');panel.setAttribute('aria-hidden','false');scrim.hidden=false;document.body.style.overflow='hidden';$('#drawer-close').focus({preventScroll:true})}
function closeDrawer(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');scrim.hidden=true;document.body.style.overflow='';panelFocus?.focus?.({preventScroll:true})}
$('#drawer-close').addEventListener('click',closeDrawer);scrim.addEventListener('click',closeDrawer);
function categoryList(){return `<div class="smallcap">LE PLAN DU VILLAGE</div><h2>Douze mondes à découvrir</h2><p>Choisissez un univers. Votre personnage rejoindra son quartier par les ruelles et les escaliers du village.</p><div class="district-list">${categories.map(c=>`<button class="district-link" data-go="${c.id}"><span class="icon" style="background:${c.color}">${safe(c.icon)}</span><span><b>${safe(c.title)}</b><em>${safe(c.subtitle)}</em></span><span class="arrow">↗</span></button>`).join('')}</div>`}
function mapDrawer(){openDrawer(categoryList());panelContent.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.go;closeDrawer();travelTo(id)}))}
function openCategory(c){if(!c)return;const list=c.books.length?c.books.map(([title,author],i)=>`<div class="book"><span class="spine" style="background:${palette[i%palette.length]}">✦</span><span><strong>${safe(title)}</strong><small>${safe(author)}</small></span><a href="${bookSearch(title,author)}" target="_blank" rel="noopener noreferrer" aria-label="Rechercher ${safe(title)} sur Open Library">↗</a></div>`).join(''):'<p>Ce rayon sera enrichi lorsque nous aurons ajouté les références et les articles de la boutique.</p>';
 openDrawer(`<div class="smallcap">${safe(c.icon)} · VOTRE PROCHAIN CHAPITRE</div><h2>${safe(c.title)}</h2><p>${safe(c.description)}</p><div class="smallcap">NOTRE PETITE SÉLECTION</div><div class="book-list">${list}</div><p class="note">Suggestions éditoriales : ces livres ne constituent pas un catalogue de stock. Les liens ouvrent Open Library.</p><div class="drawer-actions"><button class="gold-button" id="return-visit">RETOUR AU JEU ↗</button>${stage.mode==='interior'?'<button class="header-btn" id="exit-shop">QUITTER LE RAYON</button>':''}</div>`);$('#return-visit').addEventListener('click',closeDrawer);$('#exit-shop')?.addEventListener('click',()=>{closeDrawer();leave()});}
$('#world-map').addEventListener('click',mapDrawer);$('#beneath-map').addEventListener('click',mapDrawer);
$('#search-open').addEventListener('click',()=>{openDrawer(`<div class="smallcap">RETROUVEZ VOTRE HISTOIRE</div><h2>Une histoire en tête ?</h2><p>Recherchez un rayon, un titre ou un auteur dans notre sélection de démonstration.</p><label class="sr" for="search">Recherche</label><input class="search-input" id="search" type="search" placeholder="Auteur, titre, rayon…"><div id="results" class="district-list"></div>`);$('#search').focus();const out=$('#results');$('#search').addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase('fr').trim();const r=q?categories.filter(c=>[c.title,c.subtitle,c.description,...c.books.flat()].join(' ').toLocaleLowerCase('fr').includes(q)):categories;out.innerHTML=r.length?r.map(c=>`<button class="district-link" data-c="${c.id}"><span class="icon" style="background:${c.color}">${safe(c.icon)}</span>${safe(c.title)}<span class="arrow">↗</span></button>`).join(''):'<p>Aucune correspondance dans les suggestions actuelles.</p>';out.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>openCategory(byId[b.dataset.c]))});$('#search').dispatchEvent(new Event('input'))});
$('#seo-links').innerHTML=categories.map(c=>`<button type="button" data-c="${c.id}">${safe(c.title)}</button>`).join('');$('#seo-links').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>travelTo(b.dataset.c));
$('#home').addEventListener('click',e=>{e.preventDefault();if(stage.mode==='interior')leave();closeDrawer();routeTo(0)});
$('#start').addEventListener('click',()=>{$('#welcome').hidden=true;canvas.focus();song(780)});
worldImage.onload=()=>{stage.loaded=true;$('#loading').classList.add('done');setTimeout(()=>$('#loading').remove(),600)};
worldImage.onerror=()=>{stage.loaded=false;$('#loading').classList.add('done');note('Le décor illustré est indisponible : vérifiez le fichier assets/mediterranean-jrpg.webp.');};
resize();addEventListener('resize',resize);paintTime();progress.textContent=`${visits.size} / 12`;requestAnimationFrame(frame);