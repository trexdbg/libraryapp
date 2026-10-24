import {zones} from './catalog.mjs';

// Direction artistique : librairie chaleureuse, volumes en 3D, sans image-plane.
export function createWorld(B, scene, quality='high') {
  const mat=new Map(), pickables=[], animated=[], blocks=[];
  let randomSeed=32891;
  const rnd=()=>((randomSeed=(Math.imul(1664525,randomSeed)+1013904223)>>>0)/4294967296);
  const between=(a,b)=>a+(b-a)*rnd();
  const col=c=>B.Color3.FromHexString(c);
  function material(name,hex,opts={}){
    if(mat.has(name))return mat.get(name);
    const m=new B.StandardMaterial(name,scene);m.diffuseColor=col(hex);m.specularColor=col(opts.metal?'#72716d':'#272b2a');m.specularPower=opts.metal?58:25;
    if(opts.emissive)m.emissiveColor=col(opts.emissive);if(opts.alpha!==undefined)m.alpha=opts.alpha;
    mat.set(name,m);return m;
  }
  const wood=material('walnut','#6d4837'),woodLight=material('warm-oak','#987456'),woodDark=material('deep-walnut','#3f2d2b'),brass=material('brass','#be9b63',{metal:true}),gold=material('gold-lit','#f4d69c',{emissive:'#765027'}),cream=material('parchment','#e0c6a0'),plaster=material('warm-plaster','#ba9e81'),stone=material('stone','#9b8d77'),deep=material('dark-teal','#244a4b'),leaf=material('olive-leaf','#566c4c'),leaf2=material('sage-leaf','#799278'),floorEdge=material('floor-edge','#6e6860');
  const bookColors=['#876a63','#688279','#997968','#a18f67','#6c7f90','#ae726e','#8b758b','#466c69','#b19b86','#675969','#b17d64','#747e56'];
  const bookMats=bookColors.map((c,i)=>material('book-'+i,c));
  function box(name,w,h,d,x,y,z,m,opts={}){const o=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);o.position.set(x,y,z);o.material=m;o.isPickable=!!opts.pick;if(opts.meta)o.metadata=opts.meta;if(opts.shadow!==false)o.receiveShadows=true;return o;}
  function sphere(name,r,x,y,z,m,segments=12){const o=B.MeshBuilder.CreateSphere(name,{diameter:r*2,segments},scene);o.position.set(x,y,z);o.material=m;o.isPickable=false;return o;}
  function cylinder(name,diam,hei,x,y,z,m,tess=14){const o=B.MeshBuilder.CreateCylinder(name,{diameter:diam,height:hei,tessellation:tess},scene);o.position.set(x,y,z);o.material=m;o.isPickable=false;return o;}
  function tube(name,pts,r,m){const o=B.MeshBuilder.CreateTube(name,{path:pts.map(p=>new B.Vector3(...p)),radius:r,tessellation:8},scene);o.material=m;o.isPickable=false;return o;}
  function txt(name,text,width,height,bg='#132e37',fg='#f4daa8',size=100){
    const t=new B.DynamicTexture(name,{width:1024,height:256},scene,true);
    const c=t.getContext();c.fillStyle=bg;c.fillRect(0,0,1024,256);c.strokeStyle='#d6ae7180';c.lineWidth=13;c.strokeRect(14,14,996,228);
    c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.font=`500 ${size}px Georgia,serif`;c.fillText(text,512,137,935);t.update();
    const m=new B.StandardMaterial(name+'-material',scene);m.diffuseTexture=t;m.emissiveColor=new B.Color3(.14,.12,.08);m.backFaceCulling=false;
    const p=B.MeshBuilder.CreatePlane(name,{width,height},scene);p.material=m;p.isPickable=false;return p;
  }
  function addBlock(x0,x1,z0,z1){blocks.push({x0,x1,z0,z1});}
  // Flooring: painterly stone pattern with physically present inlaid brass lines.
  const floorTex=new B.DynamicTexture('floor-tiles',{width:1024,height:1024},scene,true);
  const ctx=floorTex.getContext();ctx.fillStyle='#ae997c';ctx.fillRect(0,0,1024,1024);
  for(let y=0;y<1024;y+=128){for(let x=0;x<1024;x+=128){const v=Math.floor(between(155,189));ctx.fillStyle=`rgb(${v},${Math.floor(v*.87)},${Math.floor(v*.72)})`;ctx.fillRect(x+3,y+3,122,122);ctx.strokeStyle='rgba(71,61,52,.18)';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,124,124);}}
  for(let i=0;i<1900;i++){ctx.fillStyle=`rgba(60,50,36,${between(.015,.07)})`;ctx.fillRect(rnd()*1024,rnd()*1024,between(1,8),between(1,7));}floorTex.update();floorTex.uScale=5;floorTex.vScale=3;floorTex.wrapU=B.Texture.WRAP_ADDRESSMODE;floorTex.wrapV=B.Texture.WRAP_ADDRESSMODE;
  const floorMat=new B.StandardMaterial('terra-cotta-floor',scene);floorMat.diffuseTexture=floorTex;floorMat.specularColor=col('#292420');
  box('foundation',42,.95,28,0,-.54,0,floorEdge);
  const floor=B.MeshBuilder.CreateGround('walkable-floor',{width:41.3,height:26.5,subdivisions:1},scene);floor.position.y=-.045;floor.material=floorMat;floor.metadata={type:'floor'};floor.isPickable=true;
  // Raised borders, rear architecture and three thematic walls.
  box('stone rear wall',42,7.6,.8,0,3.75,12.75,plaster);
  box('wall base',42,.65,1,0,.33,12.68,stone);
  box('wall cornice',42,.25,1.05,0,7.55,12.65,cream);
  for(let x=-19.2;x<=19.3;x+=3.2){box('wall pilaster',.13,7.4,.18,x,3.73,12.28,cream,{shadow:false});}
  for(const x of [-20.65,20.65]){box('edge-wall',.7,3.1,28,x,1.5,0,plaster);box('edge-trim',.86,.18,28,x,3.0,0,cream);}
  for(let x=-20;x<=20;x+=2.4){box('front brass inlay',.045,.015,25,x,-.016,0,brass,{shadow:false}).isVisible=(Math.abs(x)%4.8<.1);}
  for(const z of [-10.9,-7.3,0,7.2,10.9])box('floor line',40,.012,.028,0,.012,z,woodLight,{shadow:false});
  // Entrance terrace, reception and circular mosaic in lobby.
  box('entry-porch',10,.28,3,0,-.08,-12.7,stone);
  for(const rad of [2.0,1.48,.92]){const t=B.MeshBuilder.CreateTorus('marble mosaic',{diameter:rad*2,thickness:.045,tessellation:64},scene);t.rotation.x=Math.PI/2;t.position.set(0,.023,-6.55);t.material=rad===1.48?brass:woodDark;t.isPickable=false;}
  sphere('mosaic centerpiece',.25,0,.04,-6.55,brass,16).scaling.y=.08;
  // Decorative column clusters and raised arch portals.
  for(const x of [-6.12,6.12])for(const z of [8.1,-3.1]){
    cylinder('carved column',.7,5,x,2.5,z,cream,14);cylinder('column base',1,.36,x,.18,z,woodDark);cylinder('column capital',1.08,.28,x,5.04,z,brass);addBlock(x-.4,x+.4,z-.35,z+.35);
  }
  // Arched portal spans behind each genre; hanging signs remain readable from isometric view.
  zones.forEach((zone,zi)=>{
    const x=zone.x;
    const ac=material('zone-'+zi,zone.color);
    const rug=box('woven-carpet-'+zone.id,10.2,.045,13,x,-.012,3.0,ac,{shadow:false});rug.isPickable=false;
    for(const xEdge of [x-5,x+5]){box('rug border',.075,.016,12.7,xEdge,.02,3,brass,{shadow:false});}
    for(const zEdge of [-3.25,9.25])box('rug trim',9.95,.016,.06,x,.02,zEdge,brass,{shadow:false});
    // Ornamental arch, no structural wall blocking the camera.
    const pts=[];for(let n=0;n<=24;n++){const a=Math.PI*n/24;pts.push([x+3.7*Math.cos(a),5.1+1.85*Math.sin(a),11.9]);}tube('stone arch',pts,.17,cream);tube('arch filigree',pts.map(p=>[p[0],p[1]-.21,p[2]-.05]),.055,brass);
    for(const xx of [x-3.7,x+3.7]){box('arch stem',.24,4.6,.27,xx,2.9,11.94,cream);box('arch collar',.58,.17,.48,xx,5.28,11.91,brass);}
    const sign=txt('wall plaque-'+zone.id,zone.short.toUpperCase(),4.9,1.25,'#19373c',zone.accent,zone.id==='fantasy'?88:108);
    sign.position.set(x,5.1,11.35);sign.rotation.y=Math.PI; // faces the open front
    sphere('arched medallion',.16,x,7.12,11.9,brass);
    // Fixed tall bookshelves along the back and both sides of the aisle.
    buildShelf(x,9.46,8.0,.95,zone,0);
    buildShelf(x-4.45,4.35,1.05,5.4,zone,1);
    buildShelf(x+4.45,4.35,1.05,5.4,zone,2);
    addBlock(x-4.12,x+4.12,8.85,10.06);
    addBlock(x-5.05,x-3.85,1.52,7.18);addBlock(x+3.85,x+5.05,1.52,7.18);
    // A manuscript table, with three separate pickable books.
    buildDisplay(zone);
    addBlock(x-2.15,x+2.15,-1.05,.55);
    // Ambient lanterns are built as real geometry, not screen sprites.
    for(const lx of [x-3.6,x+3.6]){
      tube('lantern chain',[[lx,7.35,-1.6],[lx,5.35,-1.6]],.035,brass);
      cylinder('lantern crown',.56,.16,lx,5.26,-1.6,woodDark);
      cylinder('lantern glass',.42,.65,lx,4.85,-1.6,gold,8);
      cylinder('lantern base',.54,.13,lx,4.48,-1.6,brass);
    }
    // Lush plants and brass vessels in safe side corners.
    makePlant(x-5.35,-2.2,1.0);makePlant(x+5.35,-2.2,.87);
    // The small floor totems are clickable and lead to the front of each room.
    const disc=B.MeshBuilder.CreateCylinder('zone-disc-'+zone.id,{diameter:1.1,height:.07,tessellation:32},scene);
    disc.position.set(x,.05,-4.25);disc.material=brass;disc.metadata={type:'zone',zoneId:zone.id};disc.isPickable=true;pickables.push(disc);
    const rune=txt('zone-marker-'+zone.id,zi===0?'✧':zi===1?'桜':'☼',.83,.52,'#254950',zone.accent,138);
    rune.position.set(x,.14,-4.25);rune.rotation.x=Math.PI/2;rune.isPickable=false;
  });
  // Real 3D side tables, cushions and picture frames along lobby corners.
  for(const x of [-18.4,18.4]){
    box('antique bench',1.4,.18,2.8,x,.7,-6.2,wood);
    for(const z of [-7.15,-5.25])box('bench leg',.22,.7,.22,x,.32,z,woodDark);
    makePlant(x,-9.2,1.2);
  }
  // Hero stylized like the world: volumetric clothes, layered hair, book satchel, animated walk.
  const hero=new B.TransformNode('explorer-root',scene);
  const hood=material('hero hood','#355c63'),coat=material('hero-coat','#476d75'),skin=material('skin','#d8a887'),hair=material('hero-hair','#45352f'),boot=material('boots','#363436'),scarf=material('scarf','#dda875');
  function part(mesh,parent=hero){mesh.parent=parent;mesh.isPickable=false;return mesh;}
  function cubePart(name,w,h,d,x,y,z,m){return part(box(name,w,h,d,x,y,z,m));}
  function sphPart(name,r,x,y,z,m){return part(sphere(name,r,x,y,z,m));}
  const body=cubePart('hero-jacket',.7,.87,.43,0,1.15,0,coat);body.scaling.x=.89;
  sphPart('hero-head',.35,0,1.96,-.018,skin);
  const hairCap=sphPart('soft sculpted hair',.39,0,2.17,.026,hair);hairCap.scaling.y=.55;
  for(const dx of [-.18,.18]){const curl=sphPart('hair curl',.135,dx,2.09,-.24,hair);curl.scaling.z=.7;}
  const scarfLoop=part(cylinder('scarf collar',.62,.16,0,1.61,0,scarf));
  const legs=[],arms=[];
  for(const dir of [-1,1]){
    const leg=part(B.MeshBuilder.CreateCapsule('cloth boot',{radius:.14,height:.75,tessellation:9},scene));leg.material=boot;leg.position.set(dir*.19,.42,0);legs.push(leg);
    const arm=part(B.MeshBuilder.CreateCapsule('hero sleeve',{radius:.125,height:.66,tessellation:9},scene));arm.material=coat;arm.position.set(dir*.49,1.19,0);arms.push(arm);
  }
  const cape=cubePart('stitched cape',.76,.7,.13,0,1.12,.29,hood);cape.rotation.x=.12;
  cubePart('leather satchel',.34,.36,.18,.45,.96,.18,woodLight);
  cubePart('satchel buckle',.14,.07,.06,.45,.94,.07,brass);
  const footGlow=B.MeshBuilder.CreateTorus('hero-shadow-ring',{diameter:1.0,thickness:.035,tessellation:28},scene);footGlow.rotation.x=Math.PI/2;footGlow.position.y=.06;footGlow.material=gold;footGlow.isPickable=false;
  // Warm lighting + shadow map. Emissive lanterns maintain ambience on basic GPUs.
  const hemi=new B.HemisphericLight('sky bounce',new B.Vector3(0,1,0),scene);hemi.intensity=.71;hemi.diffuse=col('#e6e0c5');hemi.groundColor=col('#516864');
  const sun=new B.DirectionalLight('sun from window',new B.Vector3(-.57,-.9,.48),scene);sun.position.set(14,26,-17);sun.intensity=1.35;sun.diffuse=col('#ffe6b8');
  if(quality==='high'){
    const shadows=new B.ShadowGenerator(1024,sun);shadows.useBlurExponentialShadowMap=true;shadows.blurKernel=24;
    // Only cast the hero + architectural elements: book instances otherwise expensive.
    shadows.addShadowCaster(body);shadows.addShadowCaster(hairCap);
  }
  for(const z of zones){const light=new B.PointLight('reading-lamp-'+z.id,new B.Vector3(z.x,4.6,-1.6),scene);light.diffuse=col(z.accent);light.intensity=quality==='high'?.58:.38;light.range=11;}
  scene.clearColor=B.Color4.FromHexString('#2b555dff');scene.ambientColor=col('#c5b8a0');
  return {hero,legs,arms,footGlow,animated,blocks,pickables,zones,renderMark:null};

  function buildShelf(x,z,w,d,zone,slot){
    const h=4.35,back=box('shelf back',w,h,d,x,h/2,z,woodDark);
    back.isPickable=true;back.metadata={type:'zone',zoneId:zone.id};pickables.push(back);
    box('shelf inner',w-.14,h-.22,d+.055,x,h/2,z,wood);
    for(let level=0;level<5;level++){
      const y=.46+level*.84;
      box('hardwood shelf',w+.16,.12,d+.18,x,y,z,woodLight);
      box('shelf gilt edge',w+.18,.045,.08,x,y-.05,z-d/2-.075,brass,{shadow:false});
    }
    for(const offset of [-w/2,0,w/2])box('shelf vertical',.14,h+.12,d+.21,x+offset,h/2,z,woodDark);
    box('cornice carved',w+.32,.28,d+.28,x,h+.09,z,woodDark);
    box('cornice gilt',w+.37,.055,d+.33,x,h+.22,z,brass,{shadow:false});
    // Deliberately uneven, colour-grouped book bindings. Spines point into the open aisle.
    for(let level=0;level<4;level++){
      const span=slot===0?w:d;let cursor=-span/2+.20;
      while(cursor<span/2-.28){const bw=between(.14,.28),bh=between(.55,.75);const color=bookMats[Math.floor(rnd()*bookMats.length)];
        if(slot===0){const b=box('bound volume',bw,bh,d*.60,x+cursor+bw/2,.56+level*.84+bh/2,z-d*.08,color,{shadow:false});b.isPickable=false;
          if(rnd()>.66)box('spine gilding',bw*.68,.024,d*.6+.02,x+cursor+bw/2,.67+level*.84,z-d*.08,brass,{shadow:false});}
        else{const b=box('bound volume',w*.60,bh,bw,x,.56+level*.84+bh/2,z+cursor+bw/2,color,{shadow:false});b.isPickable=false;}
        cursor+=bw+.027;
      }
    }
    // End-cap emblems are physical boxes and lamp trims.
    for(const sx of [-1,1])box('carved edge',.085,3.8,.06,x+sx*(w/2-.10),2.18,z-d/2-.13,brass,{shadow:false});
    return back;
  }
  function buildDisplay(zone){
    const x=zone.x,z=-.2;
    box('table top',4.0,.23,1.52,x,1.02,z,woodDark);
    box('gold table lip',4.08,.06,1.61,x,1.13,z,brass);
    for(const xx of [x-1.72,x+1.72])for(const zz of [z-.55,z+.55])cylinder('carved table leg',.18,.97,xx,.51,zz,wood,10);
    box('display velvet',3.65,.035,1.18,x,1.175,z,material('velvet-'+zone.id,zone.color));
    for(let i=0;i<3;i++){
      const book=zone.books[i],bx=x+(i-1)*1.22;
      // Upright hardcover built with physical depth and a separately printed cover.
      box('book page block',.73,1.06,.22,bx,1.77,z,cream);
      const casing=box('book binding',.80,1.16,.27,bx,1.78,z-.035,material('cover-'+book.id,book.accent),{pick:true,meta:{type:'book',bookId:book.id,zoneId:zone.id}});
      casing.rotation.y=-.11+(i*.11);pickables.push(casing);
      const cover=txt('cover-illustration-'+book.id,book.initials,.75,1.0,book.accent,'#fff4dc',book.initials.length>1?145:190);
      cover.position.set(bx,1.81,z-.195);cover.rotation.y=Math.PI;
      cover.isPickable=true;cover.metadata={type:'book',bookId:book.id,zoneId:zone.id};pickables.push(cover);
      const mini=cylinder('book pedestal',.99,.08,bx,1.22,z,brass);mini.isPickable=true;mini.metadata={type:'book',bookId:book.id,zoneId:zone.id};
      animated.push({mesh:casing,start:1.78,phase:i*1.8});
    }
    const plaque=txt('display-title-'+zone.id,'NOS COUPS DE CŒUR',3.25,.34,'#193b3e','#f2daaa',72);
    plaque.position.set(x,.82,z-.80);plaque.rotation.y=Math.PI;
  }
  function makePlant(x,z,scale){
    const pot=cylinder('ceramic planter',.84*scale,.74*scale,x,.37*scale,z,material('terracotta','#976c54'),11);
    pot.scaling.x=.92;const stems=4;
    for(let i=0;i<stems;i++){
      const dx=between(-.25,.25),dz=between(-.25,.25),size=between(.45,.75)*scale;
      tube('olive branch',[[x,.75*scale,z],[x+dx,1.20*scale,z+dz],[x+dx*1.5,1.72*scale,z+dz*1.5]],.035*scale,woodDark);
      for(let n=0;n<3;n++){const f=.9+n*.25;const s=sphere('foliage',size*.44,x+dx*f,1.1*scale+n*.22*scale,z+dz*f,n%2?leaf:leaf2);s.scaling.y=.68;}
    }
  }
}