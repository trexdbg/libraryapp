import { createTerrain, districts, drawPerson, drawParticles, hitDistrict, isWalkable, nearestDistrict, W, H } from './jrpg-world.js';
import { seasonForMonth } from './data.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PALETTE=['#b95e4e','#588478','#59728b','#c39057','#845781','#628963','#ac7252'];
export class LibraryGame {
 constructor(canvas,{onDistrict,onTalk,onLocation,onToast}) {
  this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});if(!this.ctx)throw Error('Canvas 2D non disponible');
  this.ctx.imageSmoothingEnabled=false;this.onDistrict=onDistrict;this.onTalk=onTalk;this.onLocation=onLocation;this.onToast=onToast;
  this.player={x:1095,y:802,dir:'down',walk:0};this.camera={x:1090,y:705};this.zoom=1;this.keys=new Set();this.pointer=null;this.goal=null;this.last=0;this.time=0;this.running=true;this.lockCamera=0;this.lastLocation='';this.visited=new Set();
  try{this.visited=new Set(JSON.parse(localStorage.getItem('librairie-des-mondes-visited')||'[]'))}catch{}
  this.hour=this.localHour();this.season=seasonForMonth(new Date().getMonth());this.terrain=createTerrain(this.season,this.hour);
  this.npcs=[
   {name:'Mina, apprentie libraire',line:'Bienvenue ! Chaque ruelle mène à une nouvelle histoire. Essaie le rayon Manga, juste à l’ouest !',icon:'✿',x:831,y:751,color:'#af6678'},
   {name:'Léon, le conteur',line:'On dit que la fontaine garde le souvenir de tous les livres lus ici… À toi de découvrir les douze quartiers.',icon:'✦',x:1179,y:802,color:'#7d809a'},
   {name:'Noé, le voyageur',line:'Le belvédère Fantasy et Science-Fiction est mon endroit préféré. D’ici on aperçoit des mondes impossibles !',icon:'☾',x:1495,y:671,color:'#607894'},
   {name:'Lou, jardinière',line:'Sous les cyprès, les histoires poussent mieux. Et la Méditerranée n’est jamais loin.',icon:'❀',x:695,y:803,color:'#679877'},
   {name:'Sofia, relieuse',line:'Les beaux carnets sont près du quartier Papeterie. On peut y noter toutes ses découvertes.',icon:'✎',x:1328,y:1048,color:'#c29c70'},
   {name:'Hugo, passionné de BD',line:'Tu as déjà trouvé le quartier BD et Comics ? Les aventures y débordent des cases !',icon:'★',x:745,y:1094,color:'#527f9b'},
   {name:'Camille, lectrice',line:'Un roman, un banc au soleil et le bruit des vagues : voilà un très beau programme.',icon:'♡',x:1520,y:814,color:'#be7884'}
  ];
  this.npcs.forEach((n,i)=>{n.homeX=n.x;n.homeY=n.y;n.phase=i*1.8;n.dir='down';n.step=0});
  this.resize();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);
  this.attachEvents();this.raf=requestAnimationFrame(t=>this.frame(t));
 }
 localHour(){const d=new Date();return d.getHours()+d.getMinutes()/60}
 setHour(hour){const h=hour==='auto'?this.localHour():Number(hour);if(Math.abs(h-this.hour)>.03){this.hour=h;this.terrain=createTerrain(this.season,this.hour)}}
 setSeason(s){const season=s==='auto'?seasonForMonth(new Date().getMonth()):s;if(this.season!==season){this.season=season;this.terrain=createTerrain(this.season,this.hour)}}
 resize(){const r=this.canvas.getBoundingClientRect();this.cw=Math.max(1,Math.round(r.width));this.ch=Math.max(1,Math.round(r.height));let ratio=window.devicePixelRatio||1;this.canvas.width=Math.max(1,Math.round(this.cw*Math.min(ratio,1.5)));this.canvas.height=Math.max(1,Math.round(this.ch*Math.min(ratio,1.5)));this.dpr=this.canvas.width/this.cw;this.ctx.imageSmoothingEnabled=false;this.zoom=clamp(this.zoom,.64,1.45)}
 screenToWorld(px,py){return {x:(px-this.cw/2)/this.zoom+this.camera.x,y:(py-this.ch/2)/this.zoom+this.camera.y}}
 worldToScreen(x,y){return{x:(x-this.camera.x)*this.zoom+this.cw/2,y:(y-this.camera.y)*this.zoom+this.ch/2}}
 attachEvents(){
  this.down=e=>{if(/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement?.tagName||''))return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','e','enter'].includes(k))e.preventDefault();if(k==='e'||k==='enter'||k===' '){if(!e.repeat)this.interact();return;}this.keys.add(k)};
  this.up=e=>this.keys.delete(e.key.toLowerCase());
  window.addEventListener('keydown',this.down);window.addEventListener('keyup',this.up);
  const pos=e=>{const r=this.canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
  this.canvas.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;this.canvas.setPointerCapture(e.pointerId);const p=pos(e);this.pointer={id:e.pointerId,start:p,old:p,drag:false};});
  this.canvas.addEventListener('pointermove',e=>{const p=pos(e);if(this.pointer?.id===e.pointerId){if(Math.hypot(p.x-this.pointer.start.x,p.y-this.pointer.start.y)>12)this.pointer.drag=true;
    if(this.pointer.drag){this.camera.x-=(p.x-this.pointer.old.x)/this.zoom;this.camera.y-=(p.y-this.pointer.old.y)/this.zoom;this.lockCamera=2.4}this.pointer.old=p;}
    else{let w=this.screenToWorld(p.x,p.y),d=hitDistrict(w.x,w.y);this.hovered=d;this.onHover?.(d,p)}
  });
  this.canvas.addEventListener('pointerup',e=>{if(!this.pointer||this.pointer.id!==e.pointerId)return;const p=pos(e),wasDrag=this.pointer.drag;this.pointer=null;
   if(!wasDrag){const w=this.screenToWorld(p.x,p.y),b=hitDistrict(w.x,w.y),npc=this.npcs.find(n=>Math.hypot(n.x-w.x,n.y-w.y)<23);
    if(b)this.openDistrict(b.id);else if(npc)this.onTalk(npc);else{this.goal={x:clamp(w.x,310,W-70),y:clamp(w.y,60,H-80)};this.lockCamera=0}}
  });
  this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=clamp(this.zoom+(e.deltaY>0?-.07:.07),.64,1.45)}, {passive:false});
 }
 setDirection(k,pressed){if(pressed)this.keys.add(k);else this.keys.delete(k)}
 openDistrict(id){const d=districts.find(b=>b.id===id);if(!d)return;this.visited.add(id);try{localStorage.setItem('librairie-des-mondes-visited',JSON.stringify([...this.visited]))}catch{}this.goal=null;this.onDistrict(id,this.visited.size)}
 focus(id){const d=districts.find(b=>b.id===id);if(!d)return;this.camera.x=d.x+d.w/2;this.camera.y=d.y+d.h/2;this.lockCamera=3.8}
 recenter(){this.goal=null;this.player.x=1095;this.player.y=802;this.camera.x=1090;this.camera.y=705;this.zoom=1;this.lockCamera=1;this.onToast('Retour sur la place des histoires ✦')}
 interact(){let n=this.npcs.find(n=>Math.hypot(this.player.x-n.x,this.player.y-n.y)<75);if(n){this.onTalk(n);return;}const d=nearestDistrict(this.player.x,this.player.y,100);if(d){this.openDistrict(d.id);return;}this.onToast('Approche-toi d’un habitant ou touche une enseigne pour découvrir son histoire.');}
 frame(ts){if(!this.running)return;const dt=Math.min((ts-this.last)/1000||0,.045);this.last=ts;this.time+=dt;this.update(dt);this.render();this.raf=requestAnimationFrame(t=>this.frame(t))}
 update(dt){
  let vx=0,vy=0;const key=k=>this.keys.has(k);
  if(key('arrowup')||key('z')||key('w'))vy--;
  if(key('arrowdown')||key('s'))vy++;
  if(key('arrowleft')||key('q')||key('a'))vx--;
  if(key('arrowright')||key('d'))vx++;
  if(vx||vy)this.goal=null;
  if(!(vx||vy)&&this.goal){vx=this.goal.x-this.player.x;vy=this.goal.y-this.player.y;if(Math.hypot(vx,vy)<9){this.goal=null;vx=0;vy=0}}
  let magnitude=Math.hypot(vx,vy);
  if(magnitude>0){vx/=magnitude;vy/=magnitude;const speed=165;let nx=this.player.x+vx*speed*dt,ny=this.player.y+vy*speed*dt;
   if(isWalkable(nx,this.player.y))this.player.x=nx;
   if(isWalkable(this.player.x,ny))this.player.y=ny;
   if(Math.abs(vx)>Math.abs(vy))this.player.dir=vx<0?'left':'right';else this.player.dir=vy<0?'up':'down';this.player.walk+=dt*10;
  }else this.player.walk=0;
  if(this.lockCamera>0)this.lockCamera-=dt;else{const factor=Math.min(1,dt*4.3);this.camera.x+=(this.player.x-this.camera.x)*factor;this.camera.y+=(this.player.y-65-this.camera.y)*factor;}
  const hw=this.cw/this.zoom/2,hh=this.ch/this.zoom/2;
  this.camera.x=clamp(this.camera.x,Math.min(hw,W/2),Math.max(W-hw,W/2));
  this.camera.y=clamp(this.camera.y,Math.min(hh,H/2),Math.max(H-hh,H/2));
  this.npcs.forEach(n=>{n.phase+=dt*(.4+Math.sin(n.homeX)*.1);let xx=n.homeX+Math.cos(n.phase)*25,yy=n.homeY+Math.sin(n.phase*.8)*15;n.dir=xx>n.x?'right':'left';if(isWalkable(xx,yy)){n.x=xx;n.y=yy}n.step=Math.floor(this.time*3)%2});
  const nearest=nearestDistrict(this.player.x,this.player.y,205);
  const loc=nearest?.label||'La place des histoires';if(loc!==this.lastLocation){this.lastLocation=loc;this.onLocation(loc)}
 }
 render(){
  const ctx=this.ctx,dpr=this.dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;pxfill(ctx,0,0,this.cw,this.ch,'#65b7c5');
  const x=Math.round(this.cw/2-this.camera.x*this.zoom),y=Math.round(this.ch/2-this.camera.y*this.zoom);
  const width=Math.ceil(W*this.zoom),height=Math.ceil(H*this.zoom);
  ctx.drawImage(this.terrain,x,y,width,height);
  // Waves that move independently of the tilemap.
  for(let i=0;i<33;i++){let wx=65+(i*79)%490,wy=(i*127+Math.floor(this.time*14))%1300,sc=this.worldToScreen(wx,wy);if(sc.x>0&&sc.x<this.cw&&sc.y>0&&sc.y<this.ch){ctx.fillStyle='#f6f1d17d';ctx.fillRect(sc.x,sc.y,24*this.zoom,2*this.zoom)}}
  // Show click-to-walk destination with an animated diamond cursor.
  if(this.goal){let p=this.worldToScreen(this.goal.x,this.goal.y);ctx.fillStyle='#fff4c8';ctx.font='20px monospace';ctx.textAlign='center';ctx.fillText('✦',p.x,p.y+Math.sin(this.time*6)*4)}
  const actors=[...this.npcs.map(n=>({...n,npc:true})),{...this.player,step:Math.floor(this.player.walk)%2,npc:false}].sort((a,b)=>a.y-b.y);
  for(let a of actors){const p=this.worldToScreen(a.x,a.y);if(p.x>-32&&p.x<this.cw+32&&p.y>-35&&p.y<this.ch+40){ctx.save();ctx.translate(p.x,p.y);ctx.scale(this.zoom,this.zoom);drawPerson(ctx,0,0,a.npc?a.color:'#cb7250',a.dir,a.step||0,1,!a.npc);ctx.restore()}}
  // Holographic-looking RPG target cues and lantern halos.
  const closer=nearestDistrict(this.player.x,this.player.y,85);if(closer){let p=this.worldToScreen(...closer.door);let scale=this.zoom;ctx.strokeStyle='#ffebae';ctx.lineWidth=2;ctx.strokeRect(p.x-15*scale,p.y-9*scale,30*scale,14*scale);ctx.fillStyle='#fff2b3';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('E',p.x,p.y-18*scale)}
  if(this.hour<7||this.hour>17.5){const darkness=this.hour>=20||this.hour<5?.40:.20;ctx.fillStyle=`rgba(15,34,73,${darkness})`;ctx.fillRect(0,0,this.cw,this.ch);
   ctx.globalCompositeOperation='screen';for(let b of districts){let p=this.worldToScreen(b.x+b.w/2,b.y+b.h*.68);if(p.x<-150||p.x>this.cw+150||p.y<-150||p.y>this.ch+150)continue;let radius=90*this.zoom;const grad=ctx.createRadialGradient(p.x,p.y,3,p.x,p.y,radius);grad.addColorStop(0,'rgba(255,182,93,.34)');grad.addColorStop(1,'rgba(255,182,93,0)');ctx.fillStyle=grad;ctx.fillRect(p.x-radius,p.y-radius,radius*2,radius*2)}ctx.globalCompositeOperation='source-over';
  }else if(this.hour>=16.5){ctx.fillStyle='rgba(238,121,55,.095)';ctx.fillRect(0,0,this.cw,this.ch)}
  drawParticles(ctx,this.time,this.season,this.cw,this.ch);
  // True pixel-like graphic border. Keep game world focus while showing map outside.
  ctx.strokeStyle='#223e4a8a';ctx.lineWidth=2;ctx.strokeRect(1,1,this.cw-2,this.ch-2);
 }
 destroy(){this.running=false;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();window.removeEventListener('keydown',this.down);window.removeEventListener('keyup',this.up)}
}
function pxfill(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}