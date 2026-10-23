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
 {id:'jeunesse',title:'Jeunesse',icon:'✿',color:'#6b8d51',subtitle:'Les contes commencent ici',description:'Albums illustrés, premiers romans, histoires du soir et belles découvertes pour grandir.',x:311,y:193,entry:11,theme:'garden',books:[['Le Petit Prince','Antoine de Saint-Exupéry'],['Matilda','Roald Dahl'],['Le Gruffalo','Julia Donaldson']]},
 {id:'manga',title:'Manga',icon:'桜',color:'#b46a94',subtitle:'Mille aventures sous les sakuras',description:'Shōnen, shōjo, seinen et découvertes japonaises, sous les lanternes du quartier manga.',x:331,y:376,entry:9,theme:'manga',books:[['One Piece','Eiichirō Oda'],['Nausicaä de la Vallée du Vent','Hayao Miyazaki'],['Frieren','Kanehito Yamada & Tsukasa Abe']]},
 {id:'bd',title:'BD & Comics',icon:'✎',color:'#b17b50',subtitle:'Des bulles pleines de vie',description:'Bandes dessinées, romans graphiques et comics : des héros pour tous les âges.',x:479,y:393,entry:10,theme:'comics',books:[['Astérix le Gaulois','René Goscinny & Albert Uderzo'],['L’Arabe du futur','Riad Sattouf'],['Watchmen','Alan Moore & Dave Gibbons']]},
 {id:'litterature',title:'Littérature',icon:'❧',color:'#667a8e',subtitle:'Le cœur de la bibliothèque',description:'Romans contemporains, classiques et belles voix venues du monde entier.',x:846,y:351,entry:2,theme:'library',books:[['L’Étranger','Albert Camus'],['La Tresse','Laetitia Colombani'],['Chanson douce','Leïla Slimani']]},
 {id:'fantasy',title:'Fantasy & Science-Fiction',icon:'✧',color:'#4e77ae',subtitle:'De l’autre côté des étoiles',description:'Mondes magiques, vaisseaux, dragons, portes du temps et récits du futur.',x:1307,y:196,entry:17,theme:'cosmos',books:[['Dune','Frank Herbert'],['Le Hobbit','J. R. R. Tolkien'],['La Horde du Contrevent','Alain Damasio']]},
 {id:'romance',title:'Romance',icon:'♡',color:'#bb6a80',subtitle:'Des histoires qui font battre le cœur',description:'Romance contemporaine, romantasy, récits historiques et émotions à partager.',x:1371,y:363,entry:19,theme:'romance',books:[['Orgueil et Préjugés','Jane Austen'],['Les Sept Maris d’Evelyn Hugo','Taylor Jenkins Reid'],['Jamais plus','Colleen Hoover']]},
 {id:'polar',title:'Polar & Thriller',icon:'⌕',color:'#81595b',subtitle:'La ruelle des mystères',description:'Enquêtes, crimes et mystères haletants derrière la porte des archives.',x:1269,y:484,entry:21,theme:'noir',books:[['Le Crime de l’Orient-Express','Agatha Christie'],['Millénium','Stieg Larsson'],['La Vérité sur l’affaire Harry Quebert','Joël Dicker']]},
 {id:'histoire',title:'Histoire & Société',icon:'♜',color:'#b28c56',subtitle:'Voyager dans les siècles',description:'Histoire, philosophie, sciences humaines et idées pour comprendre notre monde.',x:641,y:514,entry:7,theme:'study',books:[['Sapiens','Yuval Noah Harari'],['Une histoire populaire des États-Unis','Howard Zinn'],['Le Deuxième Sexe','Simone de Beauvoir']]},
 {id:'bienetre',title:'Bien-être & Nature',icon:'❀',color:'#659580',subtitle:'Respirer et lire',description:'Vie au grand air, cuisine, jardinage, santé et art de vivre.',x:568,y:475,entry:8,theme:'garden',books:[['La Vie secrète des arbres','Peter Wohlleben'],['Le Charme discret de l’intestin','Giulia Enders'],['L’Art de la simplicité','Dominique Loreau']]},
 {id:'papeterie',title:'Papeterie & Cadeaux',icon:'✦',color:'#598f7e',subtitle:'Des petites merveilles à offrir',description:'Carnets, stylos, cartes et attentions pour accompagner les belles lectures.',x:1141,y:612,entry:23,theme:'shop',books:[]},
 {id:'blog',title:'Avis & Chroniques',icon:'☷',color:'#a87555',subtitle:'Le café des lecteurs',description:'Coups de cœur, chroniques et discussions de livres autour d’une table en terrasse.',x:619,y:688,entry:13,theme:'cafe',books:[]},
 {id:'retrait',title:'Retrait sur place',icon:'▣',color:'#527f87',subtitle:'Du site à votre librairie',description:'Le futur point de réservation en ligne et de retrait des livres à Villeneuve-Loubet.',x:1360,y:755,entry:26,theme:'shop',books:[]}
];
const byId=Object.fromEntries(categories.map(c=>[c.id,c]));
// Routes follow the actual stairs, plazas and bridges in the painted town.
const nodes=[
 [833,566,[1,3,4,5]], // 0 grande place
 [827,467,[0,2,6]], // 1 vers le dôme
 [847,368,[1]], // 2 grande librairie
 [704,543,[0,7,12]], // 3 ouest
 [976,550,[0,20,22]], // 4 est
 [834,665,[0,12,14]], // 5 vers le port
 [710,405,[1,7,16]], // 6 étages ouest
 [632,515,[3,6,8,9]], // 7 histoire
 [565,476,[7,10]], // 8 nature
 [333,364,[10,11]], // 9 manga
 [463,407,[8,9,6]], // 10 ruelle manga BD
 [328,202,[9,16]], // 11 jeunesse
 [658,648,[3,5,13]], // 12 café
 [619,705,[12,14]], // 13 chroniques
 [798,742,[5,13,25]], // 14 pont inférieur
 [1162,310,[16,17,18]], // 15 terrasse fantasy
 [756,335,[6,11,15]], // 16 pont haut
 [1290,209,[15]], // 17 fantasy
 [1210,387,[15,19,20]], // 18 vers romance
 [1365,349,[18]], // 19 romance
 [1128,514,[4,18,21,23]], // 20 quartier polar
 [1260,474,[20,19,22]], // 21 polar
 [1125,634,[4,21,23,24]], // 22 boutique rue
 [1133,604,[20,22]], // 23 cadeaux
 [1202,694,[22,25,26]], // 24 escalier port
 [1021,731,[14,24]], // 25 pont port
 [1374,744,[24]] // 26 retrait
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
let viewW=1,viewH=1,dpr=1,scale=1,cam={x:836,y:510},targetCam={x:836,y:510},zoom=1;
let worldImage=new Image();worldImage.src='./assets/mediterranean-jrpg.webp';
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
function resize(){const rect=canvas.getBoundingClientRect();viewW=Math.max(1,rect.width);viewH=Math.max(1,rect.height);dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(viewW*dpr);canvas.height=Math.round(viewH*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const base=Math.max(viewW/WORLD.width,viewH/WORLD.height);zoom=viewW<760?2.1:1.02;scale=base*zoom;if(stage.mode==='world'){cam.x=character.x;cam.y=character.y}}
function worldToScreen(p){return{x:(p.x-cam.x)*scale+viewW/2,y:(p.y-cam.y)*scale+viewH/2}}
function screenToWorld(x,y){return{x:(x-viewW/2)/scale+cam.x,y:(y-viewH/2)/scale+cam.y}}
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
  targetCam={x:character.x,y:character.y-35};let f=clamp(dt*3,0,1);cam.x+=(targetCam.x-cam.x)*f;cam.y+=(targetCam.y-cam.y)*f;
  let near=null,nearest=55;for(const c of categories){const d=dist(character,nodes[c.entry]);if(d<nearest){nearest=d;near=c}}
  actionEl.hidden=!near;if(near){$('#action-title').textContent=near.title;$('#action-hint').textContent='E POUR ENTRER'}
  if(!character.route.length&&near)locationEl.textContent=near.title;
  else if(character.route.length)locationEl.textContent='Les ruelles du village';
  else locationEl.textContent='La place des histoires';
 }else{const keys=pressed;let dx=(keys.ArrowRight||keys.d||keys.D?1:0)-(keys.ArrowLeft||keys.q||keys.Q||keys.a||keys.A?1:0),dy=(keys.ArrowDown||keys.s||keys.S?1:0)-(keys.ArrowUp||keys.z||keys.Z||keys.w||keys.W?1:0);if(dx||dy){let len=Math.hypot(dx,dy);character.insideX=clamp(character.insideX+dx/len*dt*165,185,760);character.insideY=clamp(character.insideY+dy/len*dt*165,408,565);character.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';character.step+=dt*10;}if(character.insideY>545&&character.insideX>438&&character.insideX<518){/* exit indicated in center at floor */}}
}
// Pixel-character sprites, generated frame by frame in a tiny offscreen atlas.
function sprite(variant=0,dir='down',frame=0){const c=document.createElement('canvas');c.width=24;c.height=35;const g=c.getContext('2d');const pixel=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};const tones=['#cf8a51','#e2aa71','#a66b49','#eab489','#bc865f','#d49b75'];const coats=['#285c93','#bf6150','#48846d','#82629b','#c69a50','#597782'];const skin=tones[variant%tones.length],coat=coats[variant%coats.length],hair=['#673b28','#392b2e','#d1a650','#352a4a','#65452c','#251c1c'][variant%6];const walk=Math.floor(frame)%2;const leg=walk?1:-1;pixel(7,30+leg,4,4,'#24293b');pixel(13,30-leg,4,4,'#24293b');pixel(6,18,12,13,'#2f3244');pixel(7,18,10,12,coat);pixel(5,21,3,8,skin);pixel(17,21,3,8,skin);pixel(8,7,9,12,'#241f27');pixel(8,8,9,9,skin);pixel(7,5,11,6,hair);pixel(6,9,3,5,hair);pixel(17,9,2,5,hair);if(dir!=='up'){pixel(9,12,2,2,'#332528');pixel(14,12,2,2,'#332528');pixel(11,16,3,1,'#9d514c')}else{pixel(7,12,10,5,hair);pixel(8,21,8,6,'#b78e55')}if(dir==='left')pixel(10,14,2,2,'#26191a');if(dir==='right')pixel(14,14,2,2,'#26191a');pixel(9,20,6,2,'#ffffff22');return c}
const playerSprites={},npcSprites={};for(const d of ['up','down','left','right'])for(let f=0;f<2;f++){playerSprites[d+f]=sprite(0,d,f);for(let v=0;v<6;v++)npcSprites[v+d+f]=sprite(v,d,f)}
function drawCharacter(x,y,dir,frame,v=0,s=1){ctx.fillStyle='rgba(15,23,31,.45)';ctx.beginPath();ctx.ellipse(x,y-1,13*s,4*s,0,0,Math.PI*2);ctx.fill();const im=v===0?playerSprites[dir+frame]:npcSprites[(v%6)+dir+frame];ctx.imageSmoothingEnabled=false;ctx.drawImage(im,x-14*s,y-39*s,28*s,40*s);ctx.imageSmoothingEnabled=true}
function drawEnvironment(){ctx.save();ctx.translate(viewW/2-cam.x*scale,viewH/2-cam.y*scale);ctx.scale(scale,scale);
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
 for(const n of npcs){const bob=reducedMotion?0:Math.sin(clock*.85+n.x)*6;drawCharacter(n.x+bob,n.y,n.x%3===0?'left':'down',Math.floor(clock*2+n.y)%2,1+n.shade,.85)}
 drawCharacter(character.x,character.y,character.dir,Math.floor(character.step)%2,0,1.16);
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
 interiorCache[c.id]=off;return off}
function renderInterior(){const c=stage.inside;if(!c)return;ctx.fillStyle='#112535';ctx.fillRect(0,0,viewW,viewH);const ratio=Math.min(viewW/960,viewH/610)*1.02;const w=960*ratio,h=610*ratio,l=(viewW-w)/2,top=(viewH-h)/2;ctx.drawImage(makeInterior(c),l,top,w,h);ctx.save();ctx.translate(l,top);ctx.scale(ratio,ratio);
 // Lively candlelight and floating dust within a detailed interior.
 for(const x of [269,688]){let g=ctx.createRadialGradient(x,277,2,x,277,102);g.addColorStop(0,`rgba(255,218,124,${.22+Math.sin(clock*4+x)*.04})`);g.addColorStop(1,'rgba(255,202,121,0)');ctx.fillStyle=g;ctx.fillRect(x-102,170,204,205)}
 for(let i=0;i<20;i++){const px=235+(i*37)%530,py=142+(clock*(i%3+1)*7+i*47)%290;ctx.fillStyle=`rgba(255,245,192,${.2+.2*Math.sin(clock*2+i)})`;ctx.fillRect(px,py,2,2)}
 drawCharacter(476,326,'down',0,4,1.7);drawCharacter(character.insideX,character.insideY,character.dir,Math.floor(character.step)%2,0,1.8);
 ctx.fillStyle='#143345da';ctx.fillRect(360,565,240,25);ctx.font='bold 14px DM Sans';ctx.textAlign='center';ctx.fillStyle='#f9dba3';ctx.fillText('E · DÉCOUVRIR LES LIVRES',480,582);ctx.restore();}
function frame(ts){if(!last)last=ts;let dt=Math.min(.05,(ts-last)/1000);last=ts;ctx.setTransform(dpr,0,0,dpr,0,0);update(dt);if(stage.mode==='world')drawEnvironment();else renderInterior();requestAnimationFrame(frame)}
const pressed={};
function movingDirection(d){if(stage.mode!=='world')return;const current=chooseNode(character.x,character.y),p=nodes[current],map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}},vec=map[d];let options=p.links.map(id=>({id,dir:{x:nodes[id].x-p.x,y:nodes[id].y-p.y}}));options=options.map(v=>({...v,score:(v.dir.x*vec.x+v.dir.y*vec.y)/Math.hypot(v.dir.x,v.dir.y)})).sort((a,b)=>b.score-a.score);if(options.length&&options[0].score>.13)routeTo(options[0].id);}
function interact(){if(stage.mode==='interior'){openCategory(stage.inside);return}let near=null,best=66;for(const c of categories){const d=dist(character,nodes[c.entry]);if(d<best){best=d;near=c}}if(near){enter(near);return}for(const n of npcs){if(dist(character,n)<70){message(`${n.name} : « ${n.t} »`,5500);song(610);return}}message('Explorez les chemins jusqu’aux entrées scintillantes des quartiers.');}
function pointer(e){const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;return stage.mode==='world'?screenToWorld(x,y):{x:(x-(viewW-960*Math.min(viewW/960,viewH/610)*1.02)/2)/(Math.min(viewW/960,viewH/610)*1.02),y:(y-(viewH-610*Math.min(viewW/960,viewH/610)*1.02)/2)/(Math.min(viewW/960,viewH/610)*1.02)}}
canvas.addEventListener('click',e=>{if($('#welcome')&&!$('#welcome').hidden)return;const p=pointer(e);if(stage.mode==='interior'){if(p.y>527&&p.x>414&&p.x<540){leave();return}character.insideX=clamp(p.x,185,760);character.insideY=clamp(p.y,408,565);return}const targets=categories.map(c=>({c,d:Math.hypot(c.x-p.x,c.y-p.y)})).sort((a,b)=>a.d-b.d);if(targets[0].d<98){travelTo(targets[0].c.id);return}const k=chooseNode(p.x,p.y);routeTo(k,()=>{for(const n of npcs){if(dist(character,n)<59){message(`${n.name} : « ${n.t} »`,4800);return}}});});
canvas.addEventListener('pointermove',e=>{mouse=pointer(e)});
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select'))return;if(panel.classList.contains('open')){if(e.key==='Escape'){closeDrawer();e.preventDefault()}return}const key=e.key;if(key==='Escape'&&stage.mode==='interior'){leave();return}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter'].includes(key))e.preventDefault();if((key==='e'||key==='E'||key==='Enter')&&!e.repeat){interact();return}let d=null;if(['ArrowUp','z','Z','w','W'].includes(key))d='up';if(['ArrowDown','s','S'].includes(key))d='down';if(['ArrowLeft','q','Q','a','A'].includes(key))d='left';if(['ArrowRight','d','D'].includes(key))d='right';if(d){pressed[key]=true;if(stage.mode==='world'&&!e.repeat)movingDirection(d)}});
document.addEventListener('keyup',e=>{delete pressed[e.key]});window.addEventListener('blur',()=>Object.keys(pressed).forEach(k=>delete pressed[k]));
for(const btn of document.querySelectorAll('[data-dir]')){const keys={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'};const d=btn.dataset.dir;btn.addEventListener('pointerdown',e=>{e.preventDefault();pressed[keys[d]]=true;if(stage.mode==='world')movingDirection(d)});for(const ev of ['pointerup','pointercancel','pointerleave'])btn.addEventListener(ev,()=>delete pressed[keys[d]])}
$('#touch-enter').addEventListener('click',interact);
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