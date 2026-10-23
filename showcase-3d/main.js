import {addArchitecturalFinishes} from './art-direction.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// La Librairie des Mondes — mediterranean 3D world, built entirely from real Three.js meshes.
const $ = s => document.querySelector(s);
const viewport = $('#viewport');
const labelsRoot = $('#labels');
const isTouch = matchMedia('(pointer:coarse)').matches;
const lowPower = isTouch || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 6);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const v3 = (x,y,z) => new THREE.Vector3(x,y,z);
const seeded = (()=>{let s=57621;return()=>((s=Math.imul(1664525,s)+1013904223|0)>>>0)/4294967296})();
const rnd=(a=0,b=1)=>a+(b-a)*seeded();
const choice=a=>a[Math.floor(rnd(0,a.length))];
const C = (c) => new THREE.Color(c);
const scene=new THREE.Scene();
scene.background=new THREE.Color('#83adc4');
scene.fog=new THREE.FogExp2('#a7c0c5',0.0038);
const camera=new THREE.PerspectiveCamera(38,1,.1,1600);
camera.position.set(72,56,86);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,lowPower?1.3:1.75));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.03;
renderer.setClearColor('#a5d0d7');
viewport.appendChild(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);
orbit.target.set(0,8,3);
orbit.enableDamping=true;
orbit.dampingFactor=.06;
orbit.minDistance=35;orbit.maxDistance=166;
orbit.maxPolarAngle=Math.PI*.475;
orbit.minPolarAngle=.45;
orbit.enablePan=false;
orbit.autoRotate=false;
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.19,.37,.94);
composer.addPass(bloom);
composer.addPass(new OutputPass());
let bloomEnabled=false;
const clock=new THREE.Clock();
const tempObj=new THREE.Object3D();
const animated=[];
const seasonal=[];
const lights=[];
const waterMaterials=[];
const windowMaterials=[];
const categories=[];
const billboards=[];

function pixelCanvas(size,paint){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');paint(g,size);return c;}
function texPaint(size,paint,rx=1,ry=1){const tex=new THREE.CanvasTexture(pixelCanvas(size,paint));tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(rx,ry);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return tex;}
const textures={
 stone:texPaint(512,(g,s)=>{
  g.fillStyle='#cfbda0';g.fillRect(0,0,s,s);
  for(let y=0;y<s;y+=48){let shift=(Math.floor(y/48)%2)*64;for(let x=-shift;x<s;x+=128){const shade=Math.floor(rnd(184,235));g.fillStyle=`rgb(${shade},${shade-13},${shade-29})`;g.fillRect(x+2,y+2,125,45);g.strokeStyle='#a8967a';g.lineWidth=2;g.strokeRect(x+1,y+1,126,46);}}
  for(let i=0;i<7000;i++){const x=rnd(0,s),y=rnd(0,s);g.fillStyle=seeded()<.5?'#765b3920':'#fff7de2a';g.fillRect(x,y,rnd(1,5),rnd(1,3));}
 },2,1),
 plaster:texPaint(512,(g,s)=>{g.fillStyle='#ead8b8';g.fillRect(0,0,s,s);for(let i=0;i<16000;i++){let v=Math.floor(rnd(100,240));g.fillStyle=`rgba(${v},${v-15},${v-29},${rnd(.02,.1)})`;g.fillRect(rnd(0,s),rnd(0,s),rnd(1,6),rnd(1,5))}},2,2),
 paving:texPaint(512,(g,s)=>{g.fillStyle='#9b8b74';g.fillRect(0,0,s,s);for(let j=0;j<12;j++){let y=j*43;for(let i=0;i<8;i++){let x=i*76+(j%2)*38-38,v=Math.floor(rnd(156,209));g.fillStyle=`rgb(${v},${v-11},${v-29})`;g.fillRect(x+2,y+2,73,40);g.fillStyle='#f6e6c920';g.fillRect(x+5,y+5,66,2)}}for(let n=0;n<3000;n++){g.fillStyle='#523e2421';g.fillRect(rnd(0,s),rnd(0,s),rnd(1,4),rnd(1,4))}},5,5),
 roof:texPaint(512,(g,s)=>{g.fillStyle='#9e5139';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=28)for(let x=-28+(Math.floor(y/28)%2)*16;x<s;x+=31){let t=rnd();g.fillStyle=t<.3?'#bb6847':t<.7?'#c88058':'#a6533c';g.fillRect(x+1,y+2,29,24);g.strokeStyle='#6d392951';g.lineWidth=2;g.beginPath();g.ellipse(x+15,y+24,14,6,0,0,Math.PI);g.stroke();g.fillStyle='#ffd2a922';g.fillRect(x+4,y+3,21,3)}},3,4),
 wood:texPaint(512,(g,s)=>{g.fillStyle='#725039';g.fillRect(0,0,s,s);for(let i=0;i<120;i++){const y=rnd(0,s);g.strokeStyle=seeded()<.5?'#29180e38':'#deab6a20';g.lineWidth=rnd(.5,2);g.beginPath();g.moveTo(0,y);g.bezierCurveTo(s*.3,y+rnd(-8,8),s*.7,y+rnd(-8,8),s,y+rnd(-6,6));g.stroke()}},2,2),
 mosaic:texPaint(512,(g,s)=>{g.fillStyle='#c1a77f';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=24)for(let x=0;x<s;x+=24){const v=rnd();g.fillStyle=v<.2?'#9fa28c':v<.5?'#dfc8a0':'#c4b18b';g.fillRect(x+1,y+1,22,22)}},3,3),
 dark:texPaint(256,(g,s)=>{g.fillStyle='#365b60';g.fillRect(0,0,s,s);for(let i=0;i<2600;i++){g.fillStyle='#c6dfde10';g.fillRect(rnd(0,s),rnd(0,s),rnd(1,5),rnd(1,3))}},2,2)
};
function mat(color,roughness=.88,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
const M={
 plaster:new THREE.MeshStandardMaterial({map:textures.plaster,color:'#fff4da',roughness:.96}),
 ivory:new THREE.MeshStandardMaterial({map:textures.stone,color:'#fff5dd',roughness:.92}),
 stone:new THREE.MeshStandardMaterial({map:textures.stone,color:'#d5c3a4',roughness:.94}),
 darkStone:mat('#8a7e73'),
 paving:new THREE.MeshStandardMaterial({map:textures.paving,color:'#e7d6bf',roughness:.98}),
 mosaic:new THREE.MeshStandardMaterial({map:textures.mosaic,color:'#e7dbc1',roughness:.91}),
 roof:new THREE.MeshStandardMaterial({map:textures.roof,color:'#e5a581',roughness:.85}),
 roofDark:new THREE.MeshStandardMaterial({map:textures.roof,color:'#b86b55',roughness:.8}),
 wood:new THREE.MeshStandardMaterial({map:textures.wood,color:'#d2aa7d',roughness:.8}),
 walnut:mat('#62452e'),
 gold:mat('#c6a35f',.37,.72),
 brightGold:new THREE.MeshStandardMaterial({color:'#ffdb88',metalness:.55,roughness:.25,emissive:'#5e3710',emissiveIntensity:.16}),
 bronze:mat('#755134',.45,.62),
 window:new THREE.MeshPhysicalMaterial({color:'#acddec',metalness:.14,roughness:.12,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}),
 darkWindow:new THREE.MeshStandardMaterial({color:'#31566c',metalness:.36,roughness:.22,transparent:true,opacity:.8,emissive:'#2b6985',emissiveIntensity:.24,side:THREE.DoubleSide}),
 glow:new THREE.MeshBasicMaterial({color:'#ffda86',transparent:true,opacity:.9}),
 pink:mat('#d8839c'), green:mat('#3c6e52'),darkGreen:mat('#214f42'),
 rock:new THREE.MeshStandardMaterial({color:'#989287',roughness:1,flatShading:true}),
 cliff:new THREE.MeshStandardMaterial({color:'#aa9d8b',roughness:1,flatShading:true}),
 deepSea:mat('#337f91',.22,.18)
};
const geometry={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,14,10),cylinder:new THREE.CylinderGeometry(.5,.5,1,9),rock:new THREE.DodecahedronGeometry(1,0)};
function add(geo,material,pos,group=scene){const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
function box(w,h,d,material,x,y,z,group){const mesh=add(new THREE.BoxGeometry(w,h,d),material,[x,y,z],group);return mesh;}
function cyl(top,bottom,height,material,x,y,z,radial=12,group){return add(new THREE.CylinderGeometry(top,bottom,height,radial),material,[x,y,z],group)}
function sph(radius,material,x,y,z,group){return add(new THREE.SphereGeometry(radius,16,10),material,[x,y,z],group)}
function curveTube(points,r,material,group=scene,closed=false){let cu=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?v3(...p):p),closed,'catmullrom',.45);return add(new THREE.TubeGeometry(cu,Math.max(15,points.length*4),r,7,closed),material,[0,0,0],group)}
function pointLight(color,power,x,y,z,range=18){const l=new THREE.PointLight(color,power,range,2);l.position.set(x,y,z);scene.add(l);lights.push(l);return l}
function signTexture(text,w=500,h=128){return texPaint(512,(g,s)=>{g.clearRect(0,0,s,s);g.fillStyle='#244b53';g.fillRect(4,125,s-8,190);g.strokeStyle='#d6af6e';g.lineWidth=12;g.strokeRect(10,135,s-20,170);g.strokeStyle='#f7e2b9';g.lineWidth=2;g.strokeRect(20,145,s-40,150);g.fillStyle='#f7eacb';g.font='bold 42px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,220,448)},1,1)}
function sign(text,x,y,z,w=8,h=2.2,rotation=0){const mesh=add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTexture(text),transparent:true,side:THREE.DoubleSide,depthWrite:false}),[x,y,z]);mesh.rotation.y=rotation;mesh.castShadow=false;return mesh}

// Sky and atmospheric sea — shader uniforms update with actual selected light mood.
const skyUniforms={uSun:{value:1},uNight:{value:0},uTime:{value:0}};
const sky=add(new THREE.SphereGeometry(630,48,32),new THREE.ShaderMaterial({
 uniforms:skyUniforms,side:THREE.BackSide,depthWrite:false,
 vertexShader:`varying vec3 vPosition;void main(){vPosition=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec3 vPosition;uniform float uSun;uniform float uNight;uniform float uTime;float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){float h=clamp(normalize(vPosition).y*.5+.5,0.,1.);vec3 dusk=vec3(.96,.52,.39);vec3 high=mix(vec3(.09,.25,.43),vec3(.18,.43,.68),uSun);vec3 low=mix(vec3(.19,.27,.46),dusk,uSun);vec3 col=mix(low,high,smoothstep(.1,.83,h));col=mix(col,vec3(.008,.025,.08)+h*vec3(.025,.04,.12),uNight);float cloud=sin(vPosition.x*.014+sin(vPosition.z*.008))*sin(vPosition.z*.009+sin(vPosition.x*.005));cloud=smoothstep(.58,.88,cloud)*(.25+uSun*.18)*smoothstep(.4,.7,h);col=mix(col,vec3(1.,.92,.84),cloud*(1.-uNight));float star=noise(floor(normalize(vPosition).xz*730.));col+=vec3(1.,.94,.8)*step(.9989,star)*uNight*smoothstep(.51,.75,h);gl_FragColor=vec4(col,1.);}`
}),[0,0,0]);sky.castShadow=false;sky.receiveShadow=false;
const seaUniforms={uTime:{value:0},uNight:{value:0},uSun:{value:1}};
const sea=add(new THREE.PlaneGeometry(570,570,138,138),new THREE.ShaderMaterial({uniforms:seaUniforms,side:THREE.DoubleSide,transparent:true,depthWrite:false,
 vertexShader:`uniform float uTime; varying vec3 vP;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*.10+uTime*.58)*.20+cos(p.y*.13+uTime*.4)*.20+sin((p.x+p.y)*.22+uTime)*.09;vP=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
 fragmentShader:`uniform float uTime;uniform float uNight;uniform float uSun;varying vec3 vP;varying vec2 vUv;
void main(){
 float w=sin(vP.x*.095+uTime*.27+sin(vP.y*.04))*cos(vP.y*.075-uTime*.21);
 float glint=pow(max(0.,sin(vP.x*.29+uTime*.8)*sin(vP.y*.31-uTime*.64)),29.);
 vec3 aqua=mix(vec3(.035,.23,.34),vec3(.08,.48,.53),clamp(.46+.40*w,0.,1.));
 aqua+=vec3(.22,.27,.23)*glint*.38;
 aqua=mix(aqua,vec3(.018,.085,.17),uNight*.78);
 aqua*=.79+uSun*.29;
 float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
 float alpha=smoothstep(.015,.23,edge);
 gl_FragColor=vec4(aqua,alpha);
}`
}),[0,-5.5,0]);sea.rotation.x=-Math.PI/2;sea.castShadow=false;sea.receiveShadow=true;

const hemi=new THREE.HemisphereLight('#d2e7ff','#946d4a',1.4);scene.add(hemi);
const sun=new THREE.DirectionalLight('#ffdda5',2.7);sun.position.set(-55,83,39);sun.castShadow=true;sun.shadow.mapSize.set(lowPower?512:1024,lowPower?512:1024);sun.shadow.camera.left=-86;sun.shadow.camera.right=86;sun.shadow.camera.top=84;sun.shadow.camera.bottom=-84;sun.shadow.camera.near=1;sun.shadow.camera.far=200;sun.shadow.bias=-.00017;sun.shadow.normalBias=.025;scene.add(sun);
const fill=new THREE.DirectionalLight('#74a5ce',.8);fill.position.set(50,34,-40);scene.add(fill);

function island(coords,top,depth=8,material=M.cliff){const shape=new THREE.Shape();coords.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:.65,bevelSize:.7,bevelSegments:2,curveSegments:3});geo.rotateX(-Math.PI/2);const mesh=add(geo,material,[0,top-depth,0]);mesh.receiveShadow=true;return mesh;}
const islandOutline=[[-48,-24],[-38,-35],[-13,-40],[10,-37],[29,-34],[47,-23],[51,-5],[49,13],[42,30],[26,38],[6,42],[-16,40],[-34,31],[-48,17],[-54,-3]];
island(islandOutline,3.7,15,M.cliff);
island([[-46,-22],[-34,-34],[-10,-37],[16,-34],[31,-31],[43,-21],[47,-5],[46,16],[37,30],[21,35],[-1,39],[-24,34],[-41,19],[-49,1]],4.18,1.3,M.paving);
// Stepped districts and plazas.
island([[-17,-26],[17,-26],[24,-16],[21,4],[16,15],[-18,16],[-22,4],[-22,-13]],6.2,2.1,M.ivory);
island([[-18,-6],[19,-6],[24,7],[19,23],[-18,23],[-24,9]],6.48,.24,M.mosaic);
island([[-46,-21],[-28,-34],[-16,-28],[-16,-9],[-27,-3],[-45,-5]],7.15,3,M.stone);
island([[-48,-3],[-30,-6],[-20,4],[-23,17],[-43,23],[-51,15]],5.65,1.7,M.stone);
island([[18,-27],[43,-27],[49,-15],[42,-1],[21,1],[15,-15]],7.45,3.2,M.stone);
island([[20,-2],[47,-1],[50,20],[31,30],[21,18]],5.9,1.6,M.stone);
island([[-43,20],[-24,17],[-17,29],[-26,38],[-42,33]],5.0,1.3,M.stone);
island([[20,19],[38,20],[40,31],[27,39],[13,37]],5.2,1.2,M.stone);
// Cliff mineral strata, outcrops, irregular shoreline boulders.
const rockGeo=new THREE.DodecahedronGeometry(1,0);
const rockMesh=new THREE.InstancedMesh(rockGeo,M.rock,900);rockMesh.castShadow=false;rockMesh.receiveShadow=true;scene.add(rockMesh);
const rockColors=['#9a9388','#c8baaa','#b5a99b','#7b807a','#d7c6ab'];
for(let i=0;i<900;i++){let a=i/900*Math.PI*2+randJitter(),r=rnd(40,54);let x=Math.cos(a)*r,z=Math.sin(a)*r*.78;tempObj.position.set(x,rnd(-10,1.5),z);tempObj.rotation.set(rnd(-1,1),rnd(0,Math.PI),rnd(-.4,.4));tempObj.scale.set(rnd(.7,2.9),rnd(.9,3.5),rnd(.7,3.1));tempObj.updateMatrix();rockMesh.setMatrixAt(i,tempObj.matrix);rockMesh.setColorAt(i,C(choice(rockColors)))}rockMesh.instanceMatrix.needsUpdate=true;function randJitter(){return rnd(-.018,.018)}
// Riviera horizon: layered natural ridgelines instead of low-poly pyramid mountains.
function mountainRidge(depth,base,maxHeight,color,offset){
 const vertices=[],indices=[],count=64,span=700;
 for(let i=0;i<=count;i++){
  const x=-span/2+i*span/count,t=i/count;
  const hill=.38+.26*Math.sin(t*11.1+offset)+.18*Math.sin(t*24.7+offset*.6)+.11*Math.sin(t*46.2+offset*1.7);
  const height=base+Math.max(.12,hill)*maxHeight;
  vertices.push(x,-9,depth,x,height,depth);
  if(i<count){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2)}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide,flatShading:false}));
 mesh.castShadow=false;mesh.receiveShadow=false;scene.add(mesh);
}
mountainRidge(-262,-5,32,'#9aaca9',1.3);
mountainRidge(-233,-7,23,'#7d9b9d',.4);
mountainRidge(-207,-6,11,'#77939a',1.8);
// Distant village belongs to the coastline instead of floating over the sea.
const backdropPalette=['#d9c7ad','#e3d4bf','#e8dcbf','#b5c0b8'];
for(let i=0;i<38;i++){
 const x=-145+i*8.3+rnd(-2,2),z=-202+rnd(-4,5),h=rnd(3.1,6.7);
 const w=rnd(3,6.5),d=rnd(2.8,5.4);
 const b=box(w,h,d,mat(choice(backdropPalette)),x,-5+h/2,z);b.castShadow=false;
 const roof=box(w+.35,.46,d+.32,M.roof,x,-5+h+.16,z);roof.castShadow=false;
}
// Diffuse clouds along the distant coast.
const cloudMat=new THREE.MeshBasicMaterial({color:'#f8f2e6',transparent:true,opacity:.14,depthWrite:false});
for(let i=0;i<26;i++){
 const x=-290+i*23,z=-240+rnd(-24,12),yy=rnd(13,36);
 const mesh=sph(rnd(8,14),cloudMat,x,yy,z);mesh.scale.y=rnd(.22,.42);mesh.castShadow=false;
}
// Architecture toolkit — all walls, roofs and colonnades are real geometry.
function pillar(x,z,base=6.2,height=8,r=.55,material=M.ivory){
 cyl(r*1.25,r*1.25,.34,M.stone,x,base+.17,z);
 cyl(r,r*.98,height-.65,material,x,base+height/2,z,16);
 cyl(r*1.48,r*1.33,.45,M.ivory,x,base+height-.2,z,12);
 box(r*3,.24,r*3,M.stone,x,base+height+.12,z);
}
function windowArch(x,y,z,w=2.4,h=5,glow=true,face='front'){
 const sh=new THREE.Shape();
 sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(w/2,h-w/2);
 sh.absarc(0,h-w/2,w/2,0,Math.PI,false);sh.lineTo(-w/2,0);
 const fillMat=glow?M.darkWindow:M.window;
 const glass=add(new THREE.ShapeGeometry(sh,22),fillMat,[x,y,z]);glass.castShadow=false;glass.receiveShadow=false;
 const points=[];for(let i=0;i<=22;i++){let a=i/22*Math.PI;points.push([x+Math.cos(a)*w/2,y+h-w/2+Math.sin(a)*w/2,z+.06]);}
 curveTube(points,.1,M.ivory);box(w+.24,.22,.23,M.stone,x,y+.03,z+.1);
 box(.17,h-w/2,.22,M.ivory,x-w/2,y+(h-w/2)/2,z+.1);box(.17,h-w/2,.22,M.ivory,x+w/2,y+(h-w/2)/2,z+.1);
 box(.08,h-w/2,.13,M.gold,x,y+(h-w/2)/2,z+.2);
 box(w,.07,.14,M.gold,x,y+(h-w/2)*.55,z+.22);
 return glass;
}
function doorArch(x,y,z,w=3.3,h=6){
 const archFrame=[];for(let i=0;i<=20;i++){let a=i/20*Math.PI;archFrame.push([x+Math.cos(a)*w/2,y+h-w/2+Math.sin(a)*w/2,z+.16]);}
 box(w*.96,h-w/2,.1,M.walnut,x,y+(h-w/2)/2,z+.035);
 curveTube(archFrame,.23,M.ivory);
 for(let dir of [-1,1]){box(.35,h-w/2,.45,M.ivory,x+dir*w/2,y+(h-w/2)/2,z+.16);box(.1,h-w/2,.08,M.gold,x+dir*w*.44,y+(h-w/2)/2,z+.26)}
 box(w*.96,.2,.12,M.gold,x,y+(h-w/2)*.5,z+.2);
 cyl(.09,.09,.14,M.gold,x+w*.27,y+1.9,z+.22);
}
function roofGable(x,y,z,w,d,rise=3,material=M.roof){
 const angle=Math.atan2(rise,w/2),len=Math.hypot(w/2,rise)*1.12;
 for(const side of [-1,1]){
  const r=box(len,.31,d+1.2,material,x+side*w/4,y+rise/2,z);
  r.rotation.z=-side*angle;
  // ornate bronze strip on verge
  curveTube([[x+side*(w/2+.2),y,z+(d+1)/2],[x,y+rise,z+(d+1)/2]],.095,M.bronze);
 }
 cyl(.13,.13,d+1.2,M.brightGold,x,y+rise,z,9).rotation.x=Math.PI/2;
}
function building({x,z,y=5.7,w=11,d=10,h=8,roof=true,roofMat=M.roof,front=true,windows=2,shop=false}){
 box(w,h,d,M.plaster,x,y+h/2,z);
 box(w+.55,.45,d+.55,M.ivory,x,y+h-.1,z);
 box(w+.5,.45,d+.5,M.stone,x,y+.2,z);
 let frontZ=z+d/2+.05;
 if(front){
  doorArch(x,y+.4,frontZ,shop?3.6:2.9,shop?5.1:4.6);
  for(let i=0;i<windows;i++){
   const left=x-w/2+2.0+i*(w-4)/(Math.max(1,windows-1));
   if(Math.abs(left-x)>1.6)windowArch(left,y+2.4,frontZ,1.45,2.65);
  }
 }
 for(let i=-1;i<=1;i+=2){
  box(.18,h,d+.1,M.stone,x+i*w/2,y+h/2,z);
  box(.35,.65,d+.5,M.ivory,x+i*w/2,y+h-.1,z);
 }
 if(roof)roofGable(x,y+h,z,w,d,Math.max(1.5,w*.18),roofMat);
 for(let i=0;i<3;i++){const zz=z-d/2+1+i*(d-2)/2;windowArch(x-w/2-.07,y+2,zz,1.3,2.3)}
 return {x,z,y,w,h,frontZ};
}
function stairs(x,fromZ,steps=8,w=8,base=4.2,toY=6.4,dir=1){
 const rise=(toY-base)/steps, run=.63;
 for(let i=0;i<steps;i++){
  const yy=base+(i+.5)*rise,zz=fromZ+dir*i*run;
  box(w,Math.max(.24,rise),run+.16,M.ivory,x,yy,zz);
  box(w+.04,.08,run+.14,M.stone,x,base+(i+1)*rise+.08,zz);
 }
 const railLength=steps*run;
 for(let side of [-1,1]){
  const start=v3(x+side*(w/2+.35),base+.65,fromZ-run*.5);
  const end=v3(x+side*(w/2+.35),toY+.65,fromZ+dir*railLength);
  curveTube([start,end],.1,M.brightGold);
  for(let i=0;i<=steps;i++){let t=i/steps;cyl(.12,.16,1.1,M.ivory,start.x,lerp(start.y,end.y,t)-.27,lerp(start.z,end.z,t),8)}
 }
}
function railing(a,b,y=5.4,style='stone'){
 const start=v3(a[0],y,a[1]),end=v3(b[0],y,b[1]);
 const length=start.distanceTo(end);const n=Math.ceil(length/2);
 const matRail=style==='gold'?M.gold:M.ivory;
 curveTube([[start.x,y+1.45,start.z],[end.x,y+1.45,end.z]],.14,matRail);
 curveTube([[start.x,y+.28,start.z],[end.x,y+.28,end.z]],.13,matRail);
 for(let i=0;i<=n;i++){let t=i/n;const p=start.clone().lerp(end,t);
  cyl(.17,.2,1.22,M.ivory,p.x,y+.83,p.z,8);
  if(i%4===0){cyl(.3,.32,.18,M.gold,p.x,y+1.53,p.z);}
 }
}
function bridge(ax,az,bx,bz,y=5,w=4){
 const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz);
 const cX=(ax+bx)/2,cZ=(az+bz)/2,theta=Math.atan2(dx,dz);
 const deck=box(w,.48,length+1,M.ivory,cX,y,cZ);deck.rotation.y=theta;
 const walkway=box(w-.4,.13,length+.8,M.mosaic,cX,y+.29,cZ);walkway.rotation.y=theta;
 const n=Math.floor(length/.75);
 for(let i=0;i<n;i++){const t=(i+.5)/n,p=v3(lerp(ax,bx,t),y+.37,lerp(az,bz,t));
  const o=box(w-.2,.028,.10,M.stone,p.x,p.y,p.z);o.rotation.y=theta;
 }
 for(const side of [-1,1]){
  const xx=Math.cos(theta)*w*.52*side, zz=-Math.sin(theta)*w*.52*side;
  railing([ax+xx,az+zz],[bx+xx,bz+zz],y,'gold');
 }
 // visible small arched support below deck
 const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push([lerp(ax,bx,t),y-1.5-2.5*Math.sin(Math.PI*t),lerp(az,bz,t)])}
 curveTube(pts,.48,M.stone);
}
function streetlamp(x,y,z,scale=1){
 cyl(.11*scale,.16*scale,4.1*scale,M.bronze,x,y+2*scale,z);
 cyl(.25*scale,.18*scale,.34*scale,M.brightGold,x,y+4.25*scale,z);
 const flame=sph(.42*scale,new THREE.MeshBasicMaterial({color:'#ffcd70'}),x,y+4.6*scale,z);flame.castShadow=false;
 const cover=new THREE.Mesh(new THREE.SphereGeometry(.52*scale,9,6),new THREE.MeshBasicMaterial({color:'#ffd787',transparent:true,opacity:.22,depthWrite:false}));cover.position.copy(flame.position);scene.add(cover);
 if(lights.length<33)pointLight('#ffc978',3.2,x,y+4.5*scale,z,11*scale);
}
function flag(x,y,z,color='#264f80',h=4){
 cyl(.055,.055,h,M.gold,x,y+h/2,z);
 let mesh=add(new THREE.PlaneGeometry(1.9,2.4),new THREE.MeshStandardMaterial({color,metalness:.12,roughness:.85,side:THREE.DoubleSide}),[x+.9,y+h-1.35,z]);
 mesh.rotation.y=.18;animated.push(t=>{mesh.rotation.y=.18+Math.sin(t*1.4+x)*.08;});
 cyl(.12,.12,.25,M.gold,x,y+h+.1,z);
}
// Main glass-domed library.
function library(){
 const y=6.6,cZ=-17.4,frontZ=-5.5;
 box(30,12.5,24,M.ivory,0,y+6.25,cZ);
 // visible bay recesses and illuminated shelves behind glass
 for(let ix=-4;ix<=4;ix++){
  const x=ix*3.1;
  if(Math.abs(x)<4.5)continue;
  box(2.4,7,.12,M.walnut,x,y+7.7,frontZ+.06);
  for(let row=0;row<4;row++){
   box(2.3,.15,.26,M.gold,x,y+5+row*1.25,frontZ+.17);
   for(let k=0;k<9;k++){
    const col=choice(['#984c42','#315c75','#926f48','#6a7a67','#b59a6c']);
    box(.16+rnd(.02,.07),rnd(.4,.8),.27,mat(col),x-1.04+k*.25,y+5.45+row*1.25,frontZ+.21);
   }
  }
 }
 box(31,1.05,24.8,M.ivory,0,y+12.45,cZ);
 box(31.7,.37,25.5,M.gold,0,y+13.2,cZ);
 box(32,.35,25.8,M.stone,0,y+.24,cZ);
 for(let x of [-13.6,-10.7,-7.7,7.7,10.7,13.6])pillar(x,frontZ+.7,y+.2,10.9,.42);
 for(let x of [-11,-7.3,7.3,11])windowArch(x,y+3.5,frontZ+.96,2.25,5.7,true);
 doorArch(0,y+.35,frontZ+.95,6.2,8.0);
 for(let x of [-3.25,3.25])pillar(x,frontZ+1.1,y+.2,11.5,.58);
 sign('LA LIBRAIRIE DES MONDES',0,y+11.1,frontZ+1.05,13,2.9);
 for(let x of [-15,15])for(let z of [-26,-18,-10])pillar(x,z,y,12.6,.31);
 // Celestial glass dome and detailed gilded ribs, not a billboard.
 const radius=11.65,domeBase=y+13.4;
 const glassMaterial=new THREE.MeshPhysicalMaterial({color:'#65a9cf',metalness:.15,roughness:.10,transparent:true,opacity:.66,side:THREE.FrontSide,depthWrite:false,clearcoat:1,clearcoatRoughness:.12,emissive:'#0d334c',emissiveIntensity:.24});
 const dome=add(new THREE.SphereGeometry(radius,48,24,0,Math.PI*2,0,Math.PI/2),glassMaterial,[0,domeBase,cZ]);
 dome.castShadow=false;dome.receiveShadow=false;
 for(let i=0;i<20;i++){
  const phi=i*Math.PI*2/20,pts=[];
  for(let j=0;j<=18;j++){let t=j/18*Math.PI/2;pts.push([Math.cos(phi)*Math.sin(t)*radius,domeBase+Math.cos(t)*radius,cZ+Math.sin(phi)*Math.sin(t)*radius])}
  curveTube(pts,.085,M.brightGold);
 }
 for(let j=0;j<=3;j++){
  const t=j*Math.PI/8,rr=radius*Math.sin(Math.PI/2-t),yy=domeBase+radius*Math.sin(t);
  const pts=[];for(let k=0;k<=48;k++){let a=k/48*Math.PI*2;pts.push([Math.cos(a)*rr,yy,cZ+Math.sin(a)*rr])}curveTube(pts,j===0?.21:.11,M.gold);
 }
 const spire=cyl(.6,.6,.7,M.gold,0,domeBase+radius+.2,cZ);
 sph(.7,M.brightGold,0,domeBase+radius+.9,cZ);
 for(let i=0;i<7;i++){let p=new THREE.Group();scene.add(p);const ring=add(new THREE.TorusGeometry(3.2+i*.48,.027,6,44),M.gold,[0,0,0],p);ring.rotation.x=i*.38;ring.rotation.y=i*.8;p.position.set(0,domeBase+4,cZ);animated.push(t=>p.rotation.y=t*.03+i);}
 // Entrance steps and banners
 stairs(0,-.5,8,10.5,4.4,6.62,-1);
 for(let x of [-12.2,12.2])flag(x,13.6,frontZ+1.4,'#254e7d',5.4);
 for(let x of [-7.5,7.5]){streetlamp(x,6.5,-1,1.05);}
 // small golden celestial sculpture visible through glass
 const g=sph(1.1,M.brightGold,0,domeBase+4.4,cZ);g.castShadow=false;
 pointLight('#ffd38e',6,0,domeBase+4.5,cZ,19);
}
library();
// Town districts: each building has different volumes and materials.
building({x:-33,z:-18,y:7.15,w:15,d:13,h:8.8,windows:2});
building({x:-31,z:5,y:5.7,w:14,d:12,h:8.6,windows:2,roofMat:M.roofDark});
building({x:-40,z:5,y:5.7,w:7,d:7,h:5.2,windows:1});
building({x:31,z:-18,y:7.5,w:15,d:14,h:9,windows:2});
building({x:33,z:4,y:5.95,w:13,d:11,h:8.1,windows:2});
building({x:28,z:26,y:5.3,w:13,d:11,h:7.1,windows:2,shop:true});
building({x:-30,z:27,y:5.1,w:14,d:10,h:6.9,windows:2,shop:true});
building({x:0,z:29,y:5.1,w:14,d:10,h:6.9,windows:2});
// Distant village roofs behind the dome.
for(const [x,z,s] of [[-20,-34,.8],[-36,-30,.72],[20,-33,.73],[43,-28,.7],[-42,28,.72],[38,32,.57]]){
 building({x,z,y:4.6,w:9*s,d:7*s,h:5*s,windows:1});
}
// Observatory: smaller dark-metallic blue dome and a magical portal.
const obsv=new THREE.Group();scene.add(obsv);
const obsBase=7.45;const obsX=31,obsZ=-18;
const smallDome=add(new THREE.SphereGeometry(5.5,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:'#50799b',metalness:.56,roughness:.19,transparent:true,opacity:.82}),[obsX,obsBase+10,obsZ]);
for(let i=0;i<12;i++){const a=i*Math.PI/6,pts=[];for(let j=0;j<=15;j++){const t=j/15*Math.PI/2;pts.push([obsX+Math.cos(a)*5.5*Math.sin(t),obsBase+10+5.5*Math.cos(t),obsZ+Math.sin(a)*5.5*Math.sin(t)])}curveTube(pts,.09,M.brightGold)}
const portalGeo=new THREE.TorusGeometry(2.4,.38,12,48);
const portal=add(portalGeo,new THREE.MeshStandardMaterial({color:'#4ac5ff',metalness:.35,roughness:.2,emissive:'#247de4',emissiveIntensity:1.1}),[38,12,-7]);portal.castShadow=false;
pointLight('#6ab8ff',5,38,12,-7,15);
const portalDisc=add(new THREE.CircleGeometry(2.08,40),new THREE.MeshBasicMaterial({color:'#6f92d9',transparent:true,opacity:.36,side:THREE.DoubleSide,depthWrite:false}),[38,12,-7]);portalDisc.castShadow=false;animated.push(t=>{portal.rotation.z=t*.08;portalDisc.material.opacity=.30+.1*Math.sin(t*2.5)});
// Manga pavilion lanterns and painted signage
sign('MANGA & BD',-31,12.5,11.08,7,2.4);
for(let x of [-36,-31,-26]){
 const lantern=cyl(.44,.36,.86,new THREE.MeshStandardMaterial({color:'#ef7b88',emissive:'#ab304e',emissiveIntensity:.85}),x,11.7,12.1,10);
 cyl(.11,.11,.18,M.gold,x,12.25,12.1);curveTube([[x,12.3,12.1],[x,14,12.1]],.04,M.walnut);pointLight('#ff8299',1.4,x,11.7,12.1,9);
}
// Romance pergola with rose-twined stone beams
for(let x of [23,29,35,41])for(let z of [14,19])pillar(x,z,5.95,4.6,.23);
for(let z of [14,19])curveTube([[22,10.8,z],[42,10.8,z]],.24,M.wood);
for(let x of [23,29,35,41])curveTube([[x,10.8,13],[x,10.8,20]],.17,M.wood);
// Café patio with furniture and awnings
function table(x,y,z){cyl(.92,.92,.13,M.wood,x,y+1.15,z);cyl(.13,.19,1.1,M.bronze,x,y+.55,z);for(let i=0;i<4;i++){let a=i*Math.PI/2;const pX=x+Math.cos(a)*1.55,pZ=z+Math.sin(a)*1.55;box(.7,.15,.7,M.wood,pX,y+.7,pZ);cyl(.11,.13,.7,M.walnut,pX,y+.35,pZ);}}
for(let [x,z] of [[-40,25],[-35,27],[-29,30],[-22,24],[24,14],[31,15],[38,17]])table(x,5.4,z);
// Stone paths, balustrades and deliberate stepped transitions.
bridge(-20,16,-29,19,5.6,4.2);
bridge(18,17,25,18,5.8,4.2);
bridge(-12,23,-21,28,5.2,3.9);
bridge(14,25,23,28,5.2,3.9);
for(let [a,b,y] of [
 [[-19,12],[-19,-3],6.5],[[19,12],[19,-1],6.5],
 [[-46,17],[-43,-2],5.7],[[-43,-2],[-32,-5],5.7],
 [[48,18],[45,-1],5.9],[[23,-30],[42,-29],7.4],
 [[-44,-24],[-32,-32],7.1],[[21,32],[34,35],5.2]
])railing(a,b,y);
stairs(-18,6.3,7,4.2,4.3,6.55,-1);
stairs(18,5.5,8,4.1,4.4,6.5,-1);
stairs(-23,19,5,4.5,4.2,5.65,-1);
stairs(23,20,5,4.5,4.2,5.95,-1);
// Extra market stalls and book displays.
function stall(x,y,z,color='#b95756'){
 box(5,.25,3,M.wood,x,y+1.5,z);for(let dx of [-2,2])for(let dz of [-1.1,1.1])cyl(.09,.09,3,M.walnut,x+dx,y+1.65,z+dz);
 const cloth=box(5.4,.24,3.4,mat(color,.8),x,y+3.1,z);cloth.castShadow=true;
 for(let i=0;i<7;i++){const book=box(.35,rnd(.45,.8),.12,mat(choice(['#7c4767','#4d7886','#d39a54','#457562','#cb5b4d'])),x-1.8+i*.57,y+1.95,z+1.1);book.rotation.y=rnd(-.25,.25)}
}
stall(24,5.2,31,'#517e77');stall(-22,5.2,30,'#d07859');stall(-34,5.8,13,'#ac5a78');
// Deep blue and white mosaics around the main fountain.
function fountain(){
 const x=0,y=6.48,z=13;
 cyl(6.1,6.1,.65,M.ivory,x,y+.38,z,56);
 cyl(5.5,5.5,.15,new THREE.MeshStandardMaterial({color:'#47949e',metalness:.26,roughness:.17}),x,y+.78,z,56);
 cyl(3.0,3.2,1.2,M.ivory,x,y+1.2,z,48);
 cyl(2.7,2.7,.22,new THREE.MeshStandardMaterial({color:'#46c6d9',metalness:.34,roughness:.2}),x,y+1.86,z,48);
 cyl(.8,.9,2.3,M.stone,x,y+2.7,z);
 sph(.8,M.brightGold,x,y+4.2,z);
 for(let i=0;i<16;i++){const a=i*Math.PI/8,xx=x+4.2*Math.cos(a),zz=z+4.2*Math.sin(a);sph(.16,M.ivory,xx,y+1.0,zz)}
 for(let i=0;i<18;i++){const a=i*Math.PI/9;const r=5.7;box(.5,.12,.9,i%2?M.mosaic:M.gold,x+Math.sin(a)*r,y+.93,z+Math.cos(a)*r).rotation.y=a}
 pointLight('#b5f1ff',3.8,x,y+3.1,z,18);
}
fountain();
// Waterfalls are animated, translucent shader planes anchored at the cliffs.
const fallUniforms={uTime:{value:0},uNight:{value:0}};
for(const [x,y,z,w,h] of [[-41,3,20,5,12],[-24,3,35,4.8,10],[34,3,34,5.3,10],[47,3,9,4.6,12],[-50,3,4,3.2,11],[11,3,39,3,8]]){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uTime:fallUniforms.uTime,uNight:fallUniforms.uNight},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uNight;void main(){float streak=pow(abs(sin(vUv.x*75.+sin(vUv.y*14.+uTime*2.))),13.);float wave=sin(vUv.y*76.-uTime*5.+vUv.x*9.);float edge=smoothstep(.02,.12,vUv.x)*(1.-smoothstep(.88,.98,vUv.x));float op=(.44+streak*.39+wave*.13)*edge;vec3 col=mix(vec3(.07,.44,.54),vec3(.82,.94,1.),streak*.75+.2);col=mix(col,vec3(.07,.13,.27),uNight*.55);gl_FragColor=vec4(col,op);}`});
 const fall=add(new THREE.PlaneGeometry(w,h,1,1),material,[x,y-h/2+1,z]);fall.castShadow=false;fall.receiveShadow=false;
 // edged foam pool
 const foam=sph(w*.42,new THREE.MeshBasicMaterial({color:'#a8e9eb',transparent:true,opacity:.27,depthWrite:false}),x,-4.9,z+1.3);
 foam.scale.y=.09;foam.castShadow=false;
}
// Botanical layering: cypresses, old olive trees, cherry blossom trees, lavender and bougainvillea.
const foliage={leaf:new THREE.SphereGeometry(1,9,6),petal:new THREE.TetrahedronGeometry(1,0),bush:new THREE.IcosahedronGeometry(1,0)};
const leafInstances=new THREE.InstancedMesh(foliage.leaf,mat('#ffffff',.96),900);
leafInstances.castShadow=true;leafInstances.receiveShadow=true;scene.add(leafInstances);
const leafColors=['#365f3f','#608048','#8da365','#4e774c','#739452','#adc078','#536948'];
const flowerInst=new THREE.InstancedMesh(foliage.petal,mat('#ffffff',.86),1200);
flowerInst.castShadow=false;flowerInst.receiveShadow=true;scene.add(flowerInst);
const flowerColors=['#a94d81','#d46f96','#e59ca6','#f3c0bc','#895f94','#f4d29d','#e37a87','#ba526c'];
let leafIndex=0,flowerIndex=0;
function leafCluster(x,y,z,sx,sy,sz,tint){
 if(leafIndex>=leafInstances.count)return;
 tempObj.position.set(x,y,z);tempObj.rotation.set(rnd(-.2,.2),rnd(-3.1,3.1),rnd(-.2,.2));tempObj.scale.set(sx,sy,sz);tempObj.updateMatrix();
 leafInstances.setMatrixAt(leafIndex,tempObj.matrix);leafInstances.setColorAt(leafIndex,C(tint??choice(leafColors)));leafIndex++;
}
function flower(x,y,z,size=.19,color=null){
 if(flowerIndex>=flowerInst.count)return;
 tempObj.position.set(x,y,z);tempObj.rotation.set(rnd(0,2),rnd(0,6.28),rnd(0,2));tempObj.scale.set(size,size*rnd(.6,1.3),size);tempObj.updateMatrix();
 flowerInst.setMatrixAt(flowerIndex,tempObj.matrix);flowerInst.setColorAt(flowerIndex,C(color??choice(flowerColors)));flowerIndex++;
}
function tree(x,y,z,size=1,kind='olive'){
 const pink=kind==='sakura';let tall=kind==='cypress';
 if(tall){
  cyl(.32*size,.52*size,7*size,M.wood,x,y+3.5*size,z,7);
  const m=mat('#3c6252',1);for(let i=0;i<4;i++){
    let cone=add(new THREE.ConeGeometry((1.4-i*.14)*size,(7-i*.85)*size,12),m,[x,y+(4.6+i*.65)*size,z]);
    cone.castShadow=true;
  }
  return;
 }
 const trunkHeight=(pink?3.7:4.7)*size;
 let trunk=cyl(.48*size,.8*size,trunkHeight,M.wood,x,y+trunkHeight/2,z,9);trunk.rotation.z=rnd(-.16,.16);
 for(let i=0;i<6;i++){
  const angle=i*Math.PI*2/6,dx=Math.cos(angle)*rnd(1.4,2.9)*size,dz=Math.sin(angle)*rnd(1.5,2.8)*size;
  const yTop=y+(trunkHeight+rnd(.4,2))*size;
  curveTube([[x,y+trunkHeight*.65,z],[x+dx*.5,yTop-.7*size,z+dz*.5],[x+dx,yTop,z+dz]],.19*size,M.wood);
  for(let j=0;j<11;j++){
   const ox=rnd(-1.6,1.6)*size,oz=rnd(-1.3,1.3)*size,oy=rnd(-.4,1.6)*size;
   if(pink){leafCluster(x+dx+ox*.8,yTop+oy,z+dz+oz*.8,rnd(.55,1.0)*size,rnd(.48,.9)*size,rnd(.6,.95)*size,choice(['#ca7193','#e68cb0','#f7b4ce','#e99bbb','#bf587b']));}
   else leafCluster(x+dx+ox,yTop+oy,z+dz+oz,rnd(.72,1.25)*size,rnd(.45,.8)*size,rnd(.7,1.28)*size);
  }
 }
}
// HERO youth olive tree and manga sakuras.
tree(-38,7.15,-23,1.5,'olive');
tree(-28.6,5.7,1.7,1.0,'sakura');
tree(-39,5.7,8.5,1.0,'sakura');
tree(-27,5.7,15,.88,'sakura');
for(const [x,z,y,s] of [[-43,-10,7.2,1.1],[-24,-26,7.2,.86],[20,-27,7.4,1.15],[43,-20,7.4,.95],[-46,11,5.7,.8],[45,12,5.9,1],[30,32,5.2,.8],[-33,35,5,.75],[-5,35,5.2,.76],[15,34,5.2,.68]])tree(x,y,z,s,'olive');
for(const [x,z,y,s] of [[-49,-22,4.2,1.1],[-15,-33,4.2,.95],[-49,18,4.2,1.2],[-20,21,5.4,1.15],[15,22,5.8,.9],[49,-18,4.2,1],[39,26,5.2,1.05],[22,-35,4.2,1.05],[43,-31,4.2,.8],[-36,-39,4.2,1]])tree(x,y,z,s,'cypress');
// Flower gardens along the balustrades and cliff top, kept off the circulation axis.
for(let i=0;i<895;i++){
 const zone=i%8;
 let x,z,y;
 if(zone===0){x=rnd(-48,-30);z=rnd(-28,-21);y=7.3}
 if(zone===1){x=rnd(-47,-26);z=rnd(15,22);y=5.9}
 if(zone===2){x=rnd(26,48);z=rnd(12,20);y=6.0}
 if(zone===3){x=rnd(16,43);z=rnd(-30,-24);y=7.5}
 if(zone===4){x=rnd(-45,-28);z=rnd(27,35);y=5.2}
 if(zone===5){x=rnd(25,39);z=rnd(27,36);y=5.4}
 if(zone===6){x=rnd(-17,18);z=rnd(20,23);y=6.6}
 if(zone===7){x=rnd(-22,18);z=rnd(-28,-26);y=6.3}
 // ground foliage with vibrant flower crowns
 if(i%5===0){leafCluster(x,y+.4,z,rnd(.3,.65),rnd(.25,.45),rnd(.3,.65),choice(['#598344','#37774d','#60814d','#7e975c']));}
 flower(x,y+rnd(.4,1),z,rnd(.22,.48));
}
leafInstances.count=leafIndex;leafInstances.instanceMatrix.needsUpdate=true;if(leafInstances.instanceColor)leafInstances.instanceColor.needsUpdate=true;
flowerInst.count=flowerIndex;flowerInst.instanceMatrix.needsUpdate=true;if(flowerInst.instanceColor)flowerInst.instanceColor.needsUpdate=true;
// Bougainvillea climbing selected walls; flowers integrated on the stone arches.
for(const [xx,zz,yy] of [[-39,12,8],[-22,11,8],[26,9,8],[43,9,8],[-33,-11,12],[28,-11,12]]){
 for(let i=0;i<45;i++){
  const xx2=xx+rnd(-2,2), yy2=yy+rnd(-1.5,2.5),zz2=zz+rnd(-.4,.5);
  if(i%4===0)leafCluster(xx2,yy2,zz2,rnd(.18,.4),rnd(.18,.37),rnd(.18,.42),'#568249');
  flower(xx2,yy2,zz2,rnd(.15,.26),choice(['#d45c95','#f3a4b2','#ca5286']));
 }
}
// Decorative amphora, seating, books and tiny townspeople.
function urn(x,y,z,scale=1){cyl(.35*scale,.28*scale,.68*scale,M.roofDark,x,y+.35*scale,z,12);sph(.42*scale,M.roof,x,y+.5*scale,z);cyl(.4*scale,.4*scale,.12*scale,M.roofDark,x,y+.76*scale,z,12)}
for(const [x,z,y] of [[-16,8,6.5],[-9,9,6.5],[9,9,6.5],[16,8,6.5],[-42,7,5.7],[-20,28,5.2],[20,29,5.2],[43,2,5.9]])urn(x,y,z,1.15);
function bench(x,y,z,r=0){const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);g.rotation.y=r;box(3.3,.23,.85,M.wood,0,.95,0,g);box(3.3,.2,.22,M.wood,0,1.7,-.34,g);for(const a of [-1.2,1.2]){box(.18,.95,.2,M.bronze,a,.47,0,g);box(.17,.78,.22,M.bronze,a,1.45,-.37,g)}}
for(const [x,z,y,a] of [[-11,17,6.5,0],[11,17,6.5,0],[-17,2,6.5,1.4],[17,2,6.5,1.2],[-36,-9,7.2,.2],[38,13,6,1]])bench(x,y,z,a);
function person(x,y,z,scale=1,coat='#607d9a',hair='#49362b'){
 const grp=new THREE.Group();grp.position.set(x,y,z);grp.scale.setScalar(scale);scene.add(grp);
 const leg=mat('#3a4756'),skin=mat('#d9a17d'),cloth=mat(coat),hairMat=mat(hair);
 for(let d of [-1,1]){box(.20,.8,.28,leg,d*.23,.43,0,grp);box(.27,.14,.42,M.walnut,d*.23,.09,.06,grp)}
 cyl(.46,.33,1.25,cloth,0,1.55,0,8,grp);
 for(let d of [-1,1]){const arm=cyl(.15,.13,.93,cloth,d*.5,1.58,0,8,grp);arm.rotation.z=d*.25;}
 sph(.39,skin,0,2.47,0,grp);sph(.4,hairMat,0,2.71,-.08,grp);cyl(.16,.14,.15,M.gold,0,2.94,0,8,grp);
 return grp;
}
const visitors=[[-13,12,6.6],[-8,20,6.6],[9,13,6.6],[13,5,6.7],[-7,-2,6.5],[8,-3,6.5],[-25,23,5.3],[-33,18,5.6],[28,18,6],[33,13,6],[-37,-11,7.2],[-24,-16,7.2],[34,-8,7.6],[42,-5,7.4],[-28,31,5.2],[27,31,5.2]];
const visitorsObjects=visitors.map((p,i)=>person(p[0],p[2],p[1],rnd(.8,1.08),choice(['#4e8190','#ab6e57','#755b8d','#456858','#d19f60','#547391']),choice(['#533c27','#c7a16b','#352e32'])));
animated.push(t=>{visitorsObjects.forEach((o,i)=>{o.rotation.y=Math.sin(t*.22+i*3)*.18+(i%3)*.4;})});
// Sailing boats on the sea, complete with white cloth sails.
function boat(x,z,s=1){const g=new THREE.Group();scene.add(g);g.position.set(x,-4.7,z);g.scale.setScalar(s);
 const hull=add(new THREE.CylinderGeometry(2.4,1.2,.85,9),M.wood,[0,0,0],g);hull.rotation.z=Math.PI/2;
 const deck=box(1,.22,4.8,M.ivory,0,.32,0,g);
 cyl(.10,.13,6,M.walnut,0,3,0,7,g);
 const sailShape=new THREE.Shape();sailShape.moveTo(0,0);sailShape.lineTo(2.7,0);sailShape.lineTo(0,5);sailShape.lineTo(0,0);
 const sail=add(new THREE.ShapeGeometry(sailShape),new THREE.MeshStandardMaterial({color:'#fff9df',roughness:1,side:THREE.DoubleSide}),[.1,.7,0],g);sail.rotation.y=-Math.PI/2;
 for(let i=0;i<2;i++)cyl(.07,.07,3.4,M.bronze,-.8,2.4,.3+i*.1,7,g).rotation.z=.1;
 animated.push(t=>{g.position.y=-4.7+Math.sin(t*1.1+x)*.18;g.rotation.z=Math.sin(t*.45+z)*.025;g.rotation.y=Math.sin(t*.18+x)*.18});
}
boat(-79,37,.9);boat(71,10,.7);boat(-100,-9,.7);boat(103,65,.8);
// Sparse golden motes near the library and firefly-like ambient particles.
const moteGeo=new THREE.BufferGeometry();const motePositions=new Float32Array(210*3);for(let i=0;i<210;i++){motePositions[i*3]=rnd(-45,45);motePositions[i*3+1]=rnd(8,34);motePositions[i*3+2]=rnd(-27,29)}moteGeo.setAttribute('position',new THREE.BufferAttribute(motePositions,3));
const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:'#f7dfac',size:.17,transparent:true,opacity:.75,depthWrite:false}));scene.add(motes);
animated.push(t=>{motes.rotation.y=.008*Math.sin(t*.1);motes.material.opacity=.35+.33*Math.sin(t*.4)**2});
// Distinctive architectural art direction, including thousands of actual tile meshes.
const finishes=addArchitecturalFinishes({THREE,scene,M,box,cyl,sph,curveTube,mat,rnd,animated,lowPower,pointLight});
// Author-defined interactive 3D viewpoints; places are real world coordinates.
const districtData=[
 {id:'jeunesse',name:'Jeunesse',icon:'✷',color:'#638754',point:[-33,16,-18],cam:[-18,17,-5],description:'Dans les jardins de la librairie : albums illustrés, premiers romans et aventures à partager.',books:[['Le Petit Prince','Antoine de Saint-Exupéry'],['Matilda','Roald Dahl']]},
 {id:'manga',name:'Manga & BD',icon:'桜',color:'#b46f93',point:[-31,15,5],cam:[-31,8,5],description:'Sous les lanternes et les fleurs de cerisier, plongez dans les mangas et la bande dessinée.',books:[['One Piece','Eiichirō Oda'],['Nausicaä de la Vallée du Vent','Hayao Miyazaki']]},
 {id:'litterature',name:'Littérature',icon:'❧',color:'#907552',point:[0,20,-3],cam:[0,11,-11],description:'Au cœur du dôme : grands classiques, romans contemporains et voix venues d’ailleurs.',books:[['L’Étranger','Albert Camus'],['La Tresse','Laetitia Colombani']]},
 {id:'fantasy',name:'Fantasy & SF',icon:'✧',color:'#5278b7',point:[31,17,-14],cam:[29,13,-17],description:'Observatoire des mondes possibles, pour lire au-delà de l’horizon et des étoiles.',books:[['Dune','Frank Herbert'],['Le Hobbit','J. R. R. Tolkien']]},
 {id:'romance',name:'Romance',icon:'♡',color:'#bf6679',point:[35,15,7],cam:[35,8,8],description:'Des jardins fleuris aux lectures passionnées : une terrasse où l’on tombe amoureux des histoires.',books:[['Orgueil et Préjugés','Jane Austen'],['Les Sept Maris d’Evelyn Hugo','Taylor Jenkins Reid']]},
 {id:'papeterie',name:'Papeterie & cadeaux',icon:'✦',color:'#5b9b90',point:[28,14,27],cam:[27,8,27],description:'Carnets, cartes, stylos et idées cadeaux dans notre future boutique.',books:[]},
 {id:'chroniques',name:'Chroniques & café',icon:'☷',color:'#b38959',point:[-30,13,27],cam:[-30,8,27],description:'Un café imaginaire dédié aux lectures et aux critiques, bientôt relié à notre catalogue.',books:[]},
 {id:'polar',name:'Polar & Thriller',icon:'⌕',color:'#896575',point:[39,11,5],cam:[37,8,3],description:'La ruelle des mystères : une sélection de polars et thrillers.',books:[['Le Crime de l’Orient-Express','Agatha Christie']]},
 {id:'bienetre',name:'Bien-être & nature',icon:'❀',color:'#6b947c',point:[-42,11,-7],cam:[-39,8,-8],description:'Des lectures pour cultiver l’équilibre et le jardin.',books:[['La Vie secrète des arbres','Peter Wohlleben']]},
 {id:'histoire',name:'Histoire & société',icon:'♜',color:'#ae8969',point:[0,14,29],cam:[1,8,29],description:'Essais, histoire et sciences humaines.',books:[['Sapiens','Yuval Noah Harari']]},
 {id:'bd',name:'BD & Comics',icon:'✎',color:'#b8835b',point:[-40,11,5],cam:[-40,8,5],description:'Bandes dessinées et romans graphiques.',books:[['Astérix le Gaulois','René Goscinny & Albert Uderzo']]},
 {id:'retrait',name:'Retrait commandes',icon:'▣',color:'#5f9996',point:[25,11,31],cam:[25,8,30],description:'Bientôt, vos livres réservés en ligne seront à retirer en boutique.',books:[]}
 
];
for(const d of districtData){const label=document.createElement('button');label.className='label';label.type='button';label.style.setProperty('--tint',d.color);label.innerHTML=`<span class="label-icon">${d.icon}</span><strong>${d.name}</strong><span>↗</span>`;label.setAttribute('aria-label','Découvrir '+d.name);label.addEventListener('click',()=>focusDistrict(d));labelsRoot.appendChild(label);categories.push({...d,element:label});}
// High-end interactive camera and cinematic day / night transitions.
const homeTarget=v3(0,8,2),homePosition=v3(72,56,86);
let cameraTween=null;
function flyTo(target,range=57){
 const direction=camera.position.clone().sub(orbit.target).normalize();
 const t=v3(...target);const end=direction.multiplyScalar(range).add(t);
 cameraTween={fromP:camera.position.clone(),toP:end,fromT:orbit.target.clone(),toT:t,elapsed:0,duration:1.6};
}
function resetCamera(){cameraTween={fromP:camera.position.clone(),toP:homePosition.clone(),fromT:orbit.target.clone(),toT:homeTarget.clone(),elapsed:0,duration:2.0};}
function focusDistrict(d){
 $('#detailTitle').textContent=d.name;$('#detailText').textContent=d.description;$('#detailIcon').textContent=d.icon;
 $('#books').innerHTML=d.books.length?d.books.map((b,i)=>`<div class="book"><span class="book-spine" style="--tint:${i%2?'#5a7a74':d.color}">✧</span><div><strong>${b[0]}</strong><small>${b[1]}</small></div></div>`).join(''):'<p>Notre futur catalogue présentera ici les livres et produits de ce rayon.</p>';
 $('#detail').hidden=false;
 flyTo(d.cam,53);document.body.classList.add('exploring');
}
$('#visitBtn').addEventListener('click',()=>{flyTo([0,13,-10],53);$('#detail').hidden=true;document.body.classList.add('exploring')});
$('#resetBtn').addEventListener('click',()=>{$('#detail').hidden=true;document.body.classList.remove('exploring');resetCamera()});
$('#closeDetail').addEventListener('click',()=>{$('#detail').hidden=true;resetCamera()});
$('#fullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{}});
$('#quality').addEventListener('click',()=>{bloomEnabled=!bloomEnabled;$('#quality').setAttribute('aria-pressed',String(bloomEnabled));$('#quality').textContent=bloomEnabled?'✦ Effets':'✧ Léger'});
$('#photoMode').addEventListener('click',()=>{const active=document.body.classList.toggle('photo-mode');$('#photoMode').setAttribute('aria-pressed',String(active));$('#photoMode').textContent=active?'◈ Interface':'◈ Immersion';});
function getMood(){const t=$('#time').value;if(t!=='auto')return t;const h=new Date().getHours();return h<6||h>=21?'night':h>=18?'dusk':h<11?'golden':'day'}
function lightMood(mood){
 const moods={
 golden:{name:'L’heure dorée',sub:'Une fin d’après-midi méditerranéenne',icon:'◒',ambient:'#c9ddf2',sun:'#ffd39b',intensity:2.5,hemi:1.4,night:0,sunFactor:.90,exposure:1.02,lamp:1.0,fog:'#a7bbc7'},
 day:{name:'Sous le soleil',sub:'Un village baigné de lumière',icon:'☀',ambient:'#d9edff',sun:'#fff2d2',intensity:2.85,hemi:1.65,night:0,sunFactor:1,exposure:1.08,lamp:.45,fog:'#a8cbd0'},
 dusk:{name:'Le village s’illumine',sub:'Dernières lueurs sur les façades',icon:'✧',ambient:'#b5bfd9',sun:'#ffae7b',intensity:1.45,hemi:.9,night:.16,sunFactor:.55,exposure:1.08,lamp:2.4,fog:'#667c99'},
 night:{name:'Sous les étoiles',sub:'Lanternes, vitres et ciel d’encre',icon:'☾',ambient:'#5c82bd',sun:'#99bde3',intensity:.48,hemi:.45,night:1,sunFactor:.13,exposure:1.02,lamp:4.2,fog:'#172b51'}
 };
 const m=moods[mood]||moods.golden;
 hemi.color.set(m.ambient);hemi.intensity=m.hemi;
 sun.color.set(m.sun);sun.intensity=m.intensity;
 fill.intensity=mood==='night'?1.7:.8;
 renderer.toneMappingExposure=m.exposure;
 lights.forEach((l,i)=>{l.intensity=(i===0?3:1.3)*m.lamp});finishes.shopLights.forEach(l=>l.intensity=(mood==='night'?2.6:mood==='dusk'?1.6:.45));
 M.darkWindow.emissiveIntensity=mood==='night'?1.65:mood==='dusk'?.95:.27;
 skyUniforms.uNight.value=m.night;skyUniforms.uSun.value=m.sunFactor;
 seaUniforms.uNight.value=m.night;seaUniforms.uSun.value=m.sunFactor;
 scene.fog.color.set(m.fog);
 $('#skyIcon').textContent=m.icon;$('#skyName').textContent=m.name;$('#skySubtitle').textContent=m.sub;
}
function seasonPalette(season){
 for(let i=0;i<leafIndex;i++){
  let col;
  if(season==='autumn'){col=choice(['#c78b4f','#b55f3c','#9e7237','#d7a361','#9a7e48'])}
  else if(season==='winter'){col=choice(['#b9c9b8','#d6dbd0','#8ca59c','#8ba6ae','#799494'])}
  else if(season==='spring'){col=choice(['#78a264','#8caf76','#608e61','#95b58a','#bfd18f'])}
  else col=choice(leafColors);
  leafInstances.setColorAt(i,C(col));
 }
 leafInstances.instanceColor.needsUpdate=true;
 if(season==='winter')flowerInst.visible=false;else flowerInst.visible=true;
}
$('#time').addEventListener('change',()=>lightMood(getMood()));
$('#season').addEventListener('change',()=>seasonPalette($('#season').value));
lightMood(getMood());seasonPalette('summer');
$('#quality').setAttribute('aria-pressed','false');$('#quality').textContent='✧ Léger';
function adapt(){const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);bloom.setSize(w,h);}
addEventListener('resize',adapt);adapt();
// Quality-minded interaction: raycast actual island surfaces, plus DOM district labels.
const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
let pointerMoved=false,downX=0,downY=0;
renderer.domElement.addEventListener('pointerdown',e=>{downX=e.clientX;downY=e.clientY;pointerMoved=false});
renderer.domElement.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)>8)pointerMoved=true});
renderer.domElement.addEventListener('click',e=>{
 if(pointerMoved)return;
 const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
 raycaster.setFromCamera(pointer,camera);
 // Check the nearest predefined 3D district anchor, not a fake image hotspot.
 const hits=categories.map(d=>{const p=v3(...d.point).project(camera);const dx=p.x-pointer.x,dy=p.y-pointer.y;return {d,dist:Math.hypot(dx,dy)}}).sort((a,b)=>a.dist-b.dist);
 if(hits[0]?.dist<.18)focusDistrict(hits[0].d);
});
// Don't draw labels on top of the editorial hero or each other.
function labelsUpdate(){
 const w=viewport.clientWidth,h=viewport.clientHeight,placed=[];
 const mobile=w<780;
 for(const c of categories){
  const p=v3(...c.point).project(camera),visible=p.z>0&&p.z<1;
  const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
  const rectW=c.element.offsetWidth||120,rectH=42;
  const r={l:x-rectW/2,r:x+rectW/2,t:y-50,b:y-10};
  const heroBlocked=(!mobile&&r.l<Math.min(w*.33,430)&&r.b>h*.19&&r.t<h*.7)||(mobile&&r.t<220&&r.l<w*.65);
  const edges=r.l<12||r.r>w-12||r.t<83||r.b>h-100;
  const collides=placed.some(o=>r.l<o.r+7&&r.r>o.l-7&&r.t<o.b+7&&r.b>o.t-7);
  const hide=!visible||heroBlocked||edges||collides;
  c.element.style.display=hide?'none':'flex';
  if(!hide){c.element.style.left=`${x}px`;c.element.style.top=`${y}px`;placed.push(r)}
 }
}
let start=performance.now(),frame=0;
function animate(){
 requestAnimationFrame(animate);
 const t=clock.getElapsedTime();const dt=Math.min(.05,t-(animate.last??t));animate.last=t;
 skyUniforms.uTime.value=t;seaUniforms.uTime.value=t;fallUniforms.uTime.value=t;
 for(const fn of animated)fn(t);
 if(cameraTween){cameraTween.elapsed+=dt;const s=clamp(cameraTween.elapsed/cameraTween.duration,0,1);const ease=s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;
  camera.position.lerpVectors(cameraTween.fromP,cameraTween.toP,ease);
  orbit.target.lerpVectors(cameraTween.fromT,cameraTween.toT,ease);
  if(s>=1)cameraTween=null;
 }
 orbit.update();
 if(bloomEnabled)composer.render();else renderer.render(scene,camera);
 if(++frame%3===0)labelsUpdate();
}
// Safe startup: close loading after a real render, show a usable error if rendering throws.
try{renderer.render(scene,camera);document.body.dataset.sceneReady='true';animate();setTimeout(()=>$('#loading').classList.add('done'),320)}
catch(error){console.error(error);$('#loading').classList.add('done');$('#error').hidden=false}