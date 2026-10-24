import {zones,bookById,findBookLink} from './catalog.mjs';
import {WalkGrid} from './navigation.mjs';
import {createWorld} from './world.mjs';

const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const canvas=$('#renderCanvas');
const B=window.BABYLON;
const fail=(error)=>{console.error('[Library Max Babylon]',error);$('#loading').classList.add('done');$('#error').hidden=false;};
if(!B || !B.Engine.isSupported())fail(new Error('Babylon.js ou WebGL indisponible'));
else try {boot();}catch(err){fail(err);}

function boot(){
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const touch=matchMedia('(pointer:coarse)').matches;
  const low=touch || (navigator.hardwareConcurrency||8)<5;
  const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:false},false);
  engine.setHardwareScalingLevel(Math.max(1,window.devicePixelRatio/(low?1.05:1.65)));
  const scene=new B.Scene(engine);
  scene.skipPointerMovePicking=false;
  const world=createWorld(B,scene,low?'low':'high');
  const grid=new WalkGrid({blocks:world.blocks});
  const cam=new B.ArcRotateCamera('literary camera',-Math.PI/4,.87,48,new B.Vector3(0,2,1),scene);
  cam.minZ=.1;cam.maxZ=170;
  cam.mode=B.Camera.ORTHOGRAPHIC_CAMERA;
  scene.activeCamera=cam;
  const start={x:0,z:-8.4};
  world.hero.position.set(start.x,0,start.z);
  const look={alpha:-Math.PI/4,beta:.9,radius:48,target:new B.Vector3(0,1.5,0)};
  let mode='iso',selected='fantasy',playing=false,path=[],lastGoal=null,afterWalking=null;
  let highlighted=null,toastTimer=null,lastKey=null,clock=0,motion=0;
  const keys=new Set();
  const hero=world.hero;
  function updateOrtho(){
    const aspect=engine.getRenderWidth()/Math.max(1,engine.getRenderHeight());
    const half=aspect<.83?17.6:aspect<1.3?19:20.8;
    cam.orthoTop=half;cam.orthoBottom=-half;cam.orthoLeft=-half*aspect;cam.orthoRight=half*aspect;
  }
  updateOrtho();
  const sceneColor={fantasy:'#c69e76',manga:'#e9a0ac',jeunesse:'#d4b978'};
  function setActiveZone(id){selected=id;$$('.zone').forEach(btn=>btn.classList.toggle('active',btn.dataset.zone===id));}
  function setMode(next){
    mode=next;
    const inside=next==='inside';
    $('#isoBtn').classList.toggle('active',!inside);$('#insideBtn').classList.toggle('active',inside);
    $('#isoBtn').setAttribute('aria-pressed',String(!inside));$('#insideBtn').setAttribute('aria-pressed',String(inside));
    if(inside){
      const zone=zones.find(z=>z.id===selected);
      look.alpha=-Math.PI/2;look.beta=1.24;look.radius=14;
      look.target=new B.Vector3(zone.x,2.0,3.0);
      cam.mode=B.Camera.PERSPECTIVE_CAMERA;cam.fov=.72;
      $('#locationText').textContent=`Dans le rayon ${zone.short}`;
    }else{
      look.alpha=-Math.PI/4;look.beta=.9;look.radius=48;
      look.target=new B.Vector3(0,1.2,0);
      cam.mode=B.Camera.ORTHOGRAPHIC_CAMERA;updateOrtho();
      $('#locationText').textContent='Dans la grande librairie';
    }
  }
  function begin(){playing=true;document.body.classList.add('playing');canvas.focus({preventScroll:true});}
  function notify(text){const node=$('#toast');node.textContent=text;node.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('visible'),2600);}
  function moveTo(x,z,callback){
    const route=grid.path(hero.position,{x,z});
    if(!route.length){if(grid.free(hero.position.x,hero.position.z)&&Math.hypot(hero.position.x-x,hero.position.z-z)<.6){callback?.();return;}notify('Ce passage est inaccessible pour le moment.');return;}
    path=route;afterWalking=callback||null;lastGoal={x,z};
  }
  function goZone(id,autoEnter=true){
    const z=zones.find(q=>q.id===id);if(!z)return;
    begin();setActiveZone(id);
    moveTo(z.x,-2.25,()=>{
      if(autoEnter){setMode('inside');notify(`Bienvenue au rayon ${z.short} ✦`);}
    });
  }
  function openBook(id){
    const book=bookById[id];if(!book)return;
    setActiveZone(book.zone.id);
    $('#bookTitle').textContent=book.title;$('#bookAuthor').textContent=book.author;
    $('#bookGenre').textContent=book.zone.short.toUpperCase();$('#bookNote').textContent=book.note;
    $('#bookArtwork').style.background=`linear-gradient(135deg,${book.accent},#1b333e)`;
    $('#bookArtwork').replaceChildren(Object.assign(document.createElement('span'),{textContent:book.initials}));
    $('#bookLink').href=findBookLink(book);
    $('#bookPanel').hidden=false;$('#bookScrim').hidden=false;
    $('#closeBook').focus();
  }
  function hideBook(){
    $('#bookPanel').hidden=true;$('#bookScrim').hidden=true;canvas.focus({preventScroll:true});
  }
  $('#exploreBtn').addEventListener('click',()=>{begin();notify('Touchez un rayon ou le sol pour vous promener ✦');});
  $('#isoBtn').addEventListener('click',()=>{begin();setMode('iso');});
  $('#insideBtn').addEventListener('click',()=>{begin();goZone(selected);});
  $('#resetBtn').addEventListener('click',()=>{begin();path=[];afterWalking=null;setMode('iso');setActiveZone('fantasy');moveTo(0,-8.4);});
  $$('.zone').forEach(btn=>btn.addEventListener('click',()=>goZone(btn.dataset.zone)));
  $('#closeBook').addEventListener('click',hideBook);$('#bookScrim').addEventListener('click',hideBook);
  const movementKey={arrowup:[0,1],z:[0,1],w:[0,1],arrowdown:[0,-1],s:[0,-1],arrowleft:[-1,0],q:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
  // Direction clavier orientée vers le plan du monde (pas vers l'écran).
  window.addEventListener('keydown',e=>{
    if(!$('#bookPanel').hidden){if(e.key==='Escape')hideBook();return;}
    const key=e.key.toLowerCase();
    if(movementKey[key]){e.preventDefault();keys.add(key);path=[];afterWalking=null;begin();}
    if(key==='e'||key==='enter'){e.preventDefault();interact();}
    if(key==='escape'){setMode('iso');}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>keys.clear());
  $$('.dpad button').forEach(btn=>{
    const bind={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[btn.dataset.dir];
    const end=()=>keys.delete(bind);
    btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);keys.add(bind);path=[];afterWalking=null;begin();});
    btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);btn.addEventListener('lostpointercapture',end);
  });
  function interact(){
    begin();const z=zones.reduce((best,z)=>Math.abs(z.x-hero.position.x)<Math.abs(best.x-hero.position.x)?z:best,zones[0]);
    if(Math.abs(z.x-hero.position.x)<4.6&&hero.position.z>-4.8&&hero.position.z<1.5){setActiveZone(z.id);setMode('inside');openBook(z.books[0].id);}else goZone(z.id);
  }
  // Click on actual 3D mesh, not on a flattened picture; the path solver resolves obstructions.
  scene.onPointerObservable.add(e=>{
    if(!$('#bookPanel').hidden)return;
    const pi=e.pickInfo;
    if(e.type===B.PointerEventTypes.POINTERMOVE){
      const m=pi?.pickedMesh;const meta=m?.metadata;
      highlighted=meta?.type==='book'?meta:null;
      canvas.style.cursor=meta?.type==='book'||meta?.type==='zone'?'pointer':'crosshair';
      return;
    }
    if(e.type!==B.PointerEventTypes.POINTERPICK||!pi?.hit)return;
    const mesh=pi.pickedMesh,meta=mesh?.metadata;
    begin();
    if(meta?.type==='book'){
      const book=bookById[meta.bookId];
      setActiveZone(meta.zoneId);
      moveTo(book.zone.x,-2.25,()=>{setMode('inside');openBook(meta.bookId);});
    }else if(meta?.type==='zone')goZone(meta.zoneId);
    else if(pi.pickedPoint){const p=pi.pickedPoint;moveTo(p.x,p.z);}
  });
  // Reusable click destination marker on the walkable floor.
  const goal=B.MeshBuilder.CreateTorus('destination',{diameter:1.15,thickness:.07,tessellation:32},scene);
  goal.rotation.x=Math.PI/2;goal.position.y=.08;goal.isPickable=false;goal.material=new B.StandardMaterial('waypoint',scene);goal.material.emissiveColor=B.Color3.FromHexString('#f1d79d');goal.material.diffuseColor=B.Color3.FromHexString('#d3b479');goal.setEnabled(false);
  function advance(dx,dz,step){
    const targetX=hero.position.x+dx*step,targetZ=hero.position.z+dz*step;
    if(grid.free(targetX,targetZ)){hero.position.x=targetX;hero.position.z=targetZ;}
    else if(grid.free(targetX,hero.position.z))hero.position.x=targetX;
    else if(grid.free(hero.position.x,targetZ))hero.position.z=targetZ;
    else return false;
    const face=Math.atan2(-dx,-dz),angle=((face-hero.rotation.y+3*Math.PI)%(2*Math.PI))-Math.PI;
    hero.rotation.y+=angle*.2;return true;
  }
  function tick(){
    const dt=Math.min(.055,engine.getDeltaTime()/1000);clock+=dt;
    const moveKeys=[...keys].map(k=>movementKey[k]).filter(Boolean);
    let walking=false;
    if(moveKeys.length){let dx=0,dz=0;for(const [x,z] of moveKeys){dx+=x;dz+=z;}const len=Math.hypot(dx,dz);if(len){dx/=len;dz/=len;walking=advance(dx,dz,dt*4.7);}}
    else if(path.length){let next=path[0],dx=next.x-hero.position.x,dz=next.z-hero.position.z,dist=Math.hypot(dx,dz);
      if(dist<.11){path.shift();if(!path.length){const cb=afterWalking;afterWalking=null;lastGoal=null;cb?.();}}
      else walking=advance(dx/dist,dz/dist,Math.min(dist,dt*4.5));
    }
    motion+=(walking?dt*12:dt*3);
    world.legs.forEach((leg,i)=>leg.rotation.x=(walking?Math.sin(motion+i*Math.PI)*.48:0));
    world.arms.forEach((arm,i)=>arm.rotation.x=(walking?Math.sin(motion+i*Math.PI+Math.PI)*.38:0));
    world.hero.position.y=walking?Math.sin(motion*2)*.025:0;
    world.footGlow.position.x=hero.position.x;world.footGlow.position.z=hero.position.z;
    if(lastGoal){goal.setEnabled(true);goal.position.set(lastGoal.x,.07,lastGoal.z);goal.scaling.setAll(1+Math.sin(clock*5)*.08);}else goal.setEnabled(false);
    // Camera tracking is intentionally eased to preserve a cutaway-diorama feel.
    const zone=zones.find(z=>z.id===selected);
    if(mode==='inside'){look.target.x=zone.x*.58+hero.position.x*.42;look.target.z=hero.position.z*.25+3*.75;}
    else if(window.innerWidth<850&&playing){look.target.x=hero.position.x*.5;look.target.z=hero.position.z*.4;}
    const factor=1-Math.exp(-dt*(reduced?18:3.5));
    cam.alpha+=(look.alpha-cam.alpha)*factor;cam.beta+=(look.beta-cam.beta)*factor;cam.radius+=(look.radius-cam.radius)*factor;
    cam.target=B.Vector3.Lerp(cam.target,look.target,factor);
    if(mode==='iso')updateOrtho();
    for(const item of world.animated){item.mesh.position.y=item.start+(reduced?0:Math.sin(clock*1.6+item.phase)*.035);}
    updateMarker();
  }
  function updateMarker(){
    const marker=$('#marker');if(!highlighted){marker.hidden=true;return;}
    const book=bookById[highlighted.bookId];if(!book){marker.hidden=true;return;}
    const z=book.zone;
    const idx=z.books.findIndex(b=>b.id===book.id);
    const pos=new B.Vector3(z.x+(idx-1)*1.22,3.15,-.2);
    const projected=B.Vector3.Project(pos,B.Matrix.Identity(),scene.getTransformMatrix(),cam.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()));
    const rect=canvas.getBoundingClientRect();
    const left=rect.left+projected.x*rect.width/engine.getRenderWidth(),top=rect.top+projected.y*rect.height/engine.getRenderHeight();
    if(projected.z<0||projected.z>1||left<0||top<0||left>innerWidth||top>innerHeight){marker.hidden=true;return;}
    marker.style.left=left+'px';marker.style.top=top+'px';$('#markerText').textContent=book.title;marker.hidden=false;
  }
  canvas.addEventListener('wheel',e=>{
    if(mode!=='iso')return;e.preventDefault();
    const half=cam.orthoTop+Math.sign(e.deltaY)*1.1;
    cam.orthoTop=Math.max(13,Math.min(28,half));cam.orthoBottom=-cam.orthoTop;const a=engine.getRenderWidth()/engine.getRenderHeight();cam.orthoLeft=-cam.orthoTop*a;cam.orthoRight=cam.orthoTop*a;
  },{passive:false});
  window.addEventListener('resize',()=>{engine.resize();updateOrtho();});
  engine.runRenderLoop(()=>{tick();scene.render();});
  // Defer splash removal until one real WebGL render has completed.
  scene.executeWhenReady(()=>{try{scene.render();$('#loading').classList.add('done');}catch(e){fail(e);}});
  // Explicit failure fallback if script/API crashes later.
  engine.onContextLostObservable.add(()=>notify('Contexte graphique perdu. Rechargez la page.'));
}