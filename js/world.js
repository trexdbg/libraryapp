import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { categories } from './data.js';

const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const V = (x,y,z) => new THREE.Vector3(x,y,z);
let seed = 8841;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const range = (lo,hi) => mix(lo,hi,rand());
const choose = arr => arr[Math.floor(rand()*arr.length)];
const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.87,...extra});
const stone = mat('#e8d5b4');
const stoneLight = mat('#f5e6c9');
const stoneShadow = mat('#bca783');
const wallAlt = mat('#f3dbc1');
const wood = mat('#70513c');
const gold = mat('#b79a69',{metalness:.2,roughness:.5});
const darkWood = mat('#382c30');
const oceanEdge = mat('#b7ddd7',{transparent:true,opacity:.6});
const glowing = mat('#ffd3a0',{emissive:'#ffbb68',emissiveIntensity:1.6});
const leavesMats = ['#72865b','#617f5a','#98a476','#58795a','#859f74'].map(c=>mat(c,{flatShading:true}));
const flowersMats = ['#ce5388','#d76f96','#f2abbe','#dba257','#fcdfb4'].map(c=>mat(c,{flatShading:true}));
const leafGroups=[];
const winterItems=[];
const emitters=[];
const workingCliffs=[];
const interactive=[];
const floaters=[];
let snow,stars,sea,skyMesh,directional,hemisphere,ambient,scene,camera,renderer,controls;
let currentSeason='summer';
const treeHeadGeo = new THREE.IcosahedronGeometry(1,1);
const trunkGeo = new THREE.CylinderGeometry(.16,.25,2.1,7);
const roofTileColors = ['#bd7558','#ad634d','#c48158','#a95143'];
const bookColors=['#9f5646','#476d6f','#c69b52','#536952','#c67765','#506484','#e3b76e'];

const add = (parent, geo,material,x=0,y=0,z=0) => { const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh; };
const box=(parent,w,h,d,material,x=0,y=0,z=0)=>add(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);
const sphere=(parent,r,material,x=0,y=0,z=0,w=12,h=8)=>add(parent,new THREE.SphereGeometry(r,w,h),material,x,y,z);
const cyl=(parent,rTop,rBottom,h,material,x=0,y=0,z=0,segments=12)=>add(parent,new THREE.CylinderGeometry(rTop,rBottom,h,segments),material,x,y,z);
const curveTube=(parent,points,r,material,segments=20)=>add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),segments,r,5,false),material);

function makeRoofTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=256;
 const ctx=c.getContext('2d');ctx.fillStyle='#b97452';ctx.fillRect(0,0,256,256);
 for(let y=0;y<256;y+=24){for(let x=-40;x<288;x+=36){
  const a=x+(Math.floor(y/24)%2)*18;ctx.fillStyle=choose(roofTileColors);ctx.fillRect(a,y,34,22);
  ctx.strokeStyle='rgba(67,39,31,.28)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a,y+1);ctx.lineTo(a+17,y+5);ctx.lineTo(a+34,y+1);ctx.moveTo(a+1,y+22);ctx.lineTo(a+33,y+22);ctx.stroke();
 }}const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,2);tex.anisotropy=4;return tex;
}
function makeBooksTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=384;const x=c.getContext('2d');
 x.fillStyle='#302922';x.fillRect(0,0,256,384);
 const gr=x.createLinearGradient(0,0,256,0);gr.addColorStop(0,'#382719');gr.addColorStop(.55,'#d8a25e');gr.addColorStop(1,'#4c2819');x.fillStyle=gr;x.globalAlpha=.25;x.fillRect(0,0,256,384);x.globalAlpha=1;
 for(let row=0;row<4;row++){
  const shelfY=93+row*96;
  let pos=7;
  while(pos<248){const wid=8+rand()*16; const height=47+rand()*32;
   x.fillStyle=choose(bookColors);x.fillRect(pos,shelfY-height,wid,height);
   x.fillStyle='#fff2c5';x.globalAlpha=.15;x.fillRect(pos+3,shelfY-height+8,2,height-12);x.globalAlpha=1;
   x.fillStyle='#e7ce9a';x.globalAlpha=.7;x.fillRect(pos+2,shelfY-15,wid-4,2);x.globalAlpha=1;
   pos+=wid+2;
  }
  x.fillStyle='#654529';x.fillRect(0,shelfY,256,10);x.fillStyle='#d1a06a';x.fillRect(0,shelfY,256,2);
 }
 const glow=x.createRadialGradient(128,135,10,128,170,240);glow.addColorStop(0,'#ffd19346');glow.addColorStop(1,'#301a0e00');x.fillStyle=glow;x.fillRect(0,0,256,384);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
let tileMat,booksMat;
function archedShape(w,h){ const r=w/2;return new THREE.Shape().moveTo(-r,0).lineTo(r,0).lineTo(r,h-r).absarc(0,h-r,r,0,Math.PI,false).lineTo(-r,0);}
function archWindow(parent,x,y,z,w=1.1,h=2.3,flip=false){
 const frame=new THREE.Group();frame.position.set(x,y,z);if(flip)frame.rotation.y=Math.PI;parent.add(frame);
 const shape=archedShape(w,h), geo=new THREE.ShapeGeometry(shape,14), uv=geo.getAttribute('uv'),pos=geo.getAttribute('position');
 for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,pos.getY(i)/h);
 uv.needsUpdate=true;
 const face=add(frame,geo,booksMat,0,0,.035);face.castShadow=false;
 const moldingPts=[[-w/2,0,.07],[-w/2,h-w/2,.07]];
 for(let j=0;j<=16;j++){const a=Math.PI-j/16*Math.PI;moldingPts.push([Math.cos(a)*w/2,h-w/2+Math.sin(a)*w/2,.07]);}
 moldingPts.push([w/2,0,.07]);
 curveTube(frame,moldingPts,.085,stoneLight,24);
 box(frame,.07,h-w/2,.08,stoneShadow,0,(h-w/2)/2,.11); // central mullion
 box(frame,w,.07,.08,stoneShadow,0,h*.44,.11);
 box(frame,w+.25,.17,.34,stoneLight,0,-.05,.11);
 return frame;
}
function placeStoneSteps(parent,x,y,z,w=4,length=3){for(let i=0;i<5;i++)box(parent,w+.16*i,.16,length/5,stoneLight,x,y-i*.13,z+i*(length/5));}
function roof(parent,w,d,peak=1.55){
 const pitch=[[-w/2,0,peak],[0,0,0],[w/2,0,peak]]; // actually custom face coords below
 const root=new THREE.Group();parent.add(root);
 for(let side of [-1,1]){
  const x0=side*(-w/2-.45),x1=0;
  const points=[x0,0,-d/2-.35,x1,peak,-d/2-.35,x0,0,d/2+.35,x1,peak,d/2+.35];
  const geometry=new THREE.BufferGeometry();const p=new Float32Array([
   points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7],points[8],
   points[6],points[7],points[8],points[3],points[4],points[5],points[9],points[10],points[11]
  ]);
  geometry.setAttribute('position',new THREE.BufferAttribute(p,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,0,1,1,0,1,1],2));geometry.computeVertexNormals();
  const m=add(root,geometry,tileMat);m.material.side=THREE.DoubleSide;
  const snowGeo=geometry.clone();const snowMesh=add(root,snowGeo,mat('#f4f2e7',{side:THREE.DoubleSide}),0,.07,0);snowMesh.visible=false;winterItems.push(snowMesh);
 }
 curveTube(root,[[0,peak,-d/2-.3],[0,peak,d/2+.3]],.12,mat('#cda077'),12);
 return root;
}
function makeVilla(parent,conf){
 const {x,z,w=5,d=4,h=4.2,accent='#e8d6b6',roofPeak=1.6,windowCount=2,category,angle=0}=conf;
 const group=new THREE.Group(); group.position.set(x,3.72,z);group.rotation.y=angle; parent.add(group);
 box(group,w,.55,d,stoneShadow,0,-.25,0);
 const walls=box(group,w,h,d,mat(accent),0,h/2,0);
 for(let i=0;i<windowCount;i++){
  const px=(i-(windowCount-1)/2)*Math.min(2.1,(w-.95)/windowCount);
  archWindow(group,px,.75,d/2+.05,Math.min(1.1,w/(windowCount+1.1)),Math.min(2.35,h-.9));
 }
 if(w>4.7){archWindow(group,-w/2-.06,1.15,0,.9,1.9);}
 const r=roof(group,w,d,roofPeak);r.position.y=h;
 box(group,w+.25,.16,d+.25,stoneLight,0,h-.08,0);
 // tiny wrought iron balconies and stone steps
 for(let i=0;i<6;i++){box(group,.075,.55,.075,gold,-w/2+(i+.5)*w/6,.5,d/2+.65);}
 box(group,w,.07,.09,wood,0,.8,d/2+.65);
 placeStoneSteps(group,0,-.48,d/2+.25,w*.55,1.2);
 if(category){group.traverse(obj=>{if(obj.isMesh)obj.userData.categoryId=category;});interactive.push(group);}
 return group;
}
function cliff(parent,x,z,rx,rz,top=3.35,depth=6.3){
 const points=28;
 const verts=[],colors=[],idx=[];
 const rockColors=['#d0b99a','#c6b092','#ab947b','#ded0af','#a8a393'].map(c=>new THREE.Color(c));
 for(let ring=0;ring<3;ring++){
  for(let i=0;i<points;i++){
   const angle=i/points*Math.PI*2;
   const jitter=(ring===0?1:range(.93,1.05));
   const radius=1+Math.sin(angle*7+x)*.045+Math.sin(angle*13+z)*.032;
   const px=Math.cos(angle)*rx*radius*jitter, pz=Math.sin(angle)*rz*radius*jitter;
   const yy=ring===0?top:ring===1?top-depth*.38+range(-.3,.3):top-depth+range(-.5,.2);
   verts.push(x+px,yy,z+pz);const col=rockColors[(i+ring)%rockColors.length].clone();col.multiplyScalar(range(.86,1.12));colors.push(col.r,col.g,col.b);
  }
 }
 for(let ring=0;ring<2;ring++){for(let i=0;i<points;i++){const a=ring*points+i,b=ring*points+(i+1)%points,c=(ring+1)*points+i,d=(ring+1)*points+(i+1)%points;idx.push(a,c,b,b,c,d);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(idx);geo.computeVertexNormals();
 add(parent,geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide,flatShading:true}));
 const topMesh=cyl(parent,1,1,.16,mat('#ddd0ab'),x,top-.04,z,40);topMesh.scale.set(rx,1,rz);topMesh.castShadow=false;
 const rim=cyl(parent,1,1,.11,mat('#f2dfb9'),x,top+.05,z,40);rim.scale.set(rx+.16,1,rz+.16);
 workingCliffs.push({x,z,rx,rz,top});
 // wisps of foam around stone at the waterline
 const shore=add(parent,new THREE.RingGeometry(.92,1.11,48),oceanEdge,x,-2.55,z);shore.rotation.x=-Math.PI/2;shore.scale.set(rx*1.07,rz*1.07,1);shore.receiveShadow=false;
}
function path(parent,coords,width=.53){
 const points=coords.map(([x,z])=>V(x,3.57,z));
 const c=new THREE.CatmullRomCurve3(points);c.curveType='centripetal';const mesh=add(parent,new THREE.TubeGeometry(c,Math.max(10,coords.length*9),width,6,false),stoneLight);mesh.castShadow=false;
 // smaller center tread gilded edge
 const line=add(parent,new THREE.TubeGeometry(c,Math.max(10,coords.length*9),.04,5,false),mat('#e9c99c'),0,.08,0);line.castShadow=false;
 return mesh;
}
function bridge(parent,x1,z1,x2,z2){
 const points=[];for(let i=0;i<=12;i++){const t=i/12;points.push([mix(x1,x2,t),3.57+Math.sin(t*Math.PI)*.8,mix(z1,z2,t)]);}
 curveTube(parent,points,.65,stoneLight,32);
 for(let s of [-1,1]){
  const sidePoints=[];
  for(let i=0;i<=10;i++){
   const t=i/10,dx=x2-x1,dz=z2-z1,L=Math.hypot(dx,dz);const offX=-dz/L*.5*s,offZ=dx/L*.5*s;
   const px=mix(x1,x2,t)+offX,pz=mix(z1,z2,t)+offZ,y=3.6+Math.sin(t*Math.PI)*.8;
   if(i%2===0)cyl(parent,.07,.09,.78,stoneLight,px,y+.37,pz,7);
   sidePoints.push([px,y+.72,pz]);
  }
  curveTube(parent,sidePoints,.06,gold,24);
 }
}
function olive(parent,x,z,size=1){
 const tree=new THREE.Group();tree.position.set(x,3.7,z);parent.add(tree);
 const trunk=cyl(tree,.16*size,.27*size,2.3*size,wood,0,1.1*size,0,7);trunk.rotation.z=range(-.09,.09);
 for(let i=0;i<5;i++){
  const px=range(-.9,.9)*size,py=range(2.2,3.1)*size,pz=range(-.7,.7)*size;
  const foliage=add(tree,treeHeadGeo,choose(leavesMats),px,py,pz);foliage.scale.set(range(.85,1.3)*size,range(.54,.8)*size,range(.76,1.1)*size);
  leafGroups.push({mesh:foliage,original:foliage.material});
 }
 return tree;
}
function cypress(parent,x,z,size=1){
 const tree=new THREE.Group();tree.position.set(x,3.7,z);parent.add(tree);
 cyl(tree,.13,.2,3.2*size,wood,0,1.6*size,0,7);
 for(let i=0;i<3;i++){const cone=add(tree,new THREE.ConeGeometry((.65-i*.15)*size,(3-i*.28)*size,8),leavesMats[1],0,(2+i*.62)*size,0);leafGroups.push({mesh:cone,original:cone.material});}
 return tree;
}
function floweringBush(parent,x,z,size=.85){
 const bush=new THREE.Group();bush.position.set(x,3.78,z);parent.add(bush);
 const green=sphere(bush,.85*size,choose(leavesMats),0,.46*size,0,8,6);green.scale.set(1.25,.72,1);
 leafGroups.push({mesh:green,original:green.material});
 for(let j=0;j<7;j++){const a=rand()*Math.PI*2;const r=rand()*.64*size;const p=sphere(bush,range(.12,.25)*size,choose(flowersMats),Math.cos(a)*r,.65*size+range(-.1,.4)*size,Math.sin(a)*r,6,4);p.castShadow=false;}
}
function lamppost(parent,x,z){
 const post=new THREE.Group();post.position.set(x,3.72,z);parent.add(post);
 cyl(post,.065,.1,2.5,darkWood,0,1.25,0,8);
 cyl(post,.24,.16,.18,gold,0,2.44,0,8);
 const flame=add(post,new THREE.OctahedronGeometry(.25,0),glowing,0,2.75,0);flame.castShadow=false;
 const shade=add(post,new THREE.ConeGeometry(.35,.28,5),mat('#574c3e'),0,3.03,0);
 emitters.push(flame);
}
function seats(parent,x,z){
 box(parent,1.5,.13,.52,wood,x,4.25,z);for(let s of [-1,1])box(parent,.13,.58,.48,stoneShadow,x+s*.63,3.98,z);
}
function waterFountain(parent,x,z,r=2){
 cyl(parent,r,r,.35,stoneLight,x,3.85,z,40);
 cyl(parent,r-.21,r-.21,.15,mat('#71c5cf',{metalness:.32,roughness:.24}),x,4.08,z,40);
 cyl(parent,.55,.62,.35,stone,x,4.3,z,14);
 const orb=sphere(parent,.42,mat('#d4b06b',{metalness:.7,roughness:.25}),x,4.76,z,12,10);
 const waterRing=add(parent,new THREE.TorusGeometry(r-.12,.11,8,44),mat('#ceeef0',{emissive:'#5ab7c1',emissiveIntensity:.26}),x,4.15,z);waterRing.rotation.x=Math.PI/2;
}
function domeLibrary(parent){
 const group=new THREE.Group();group.position.set(1,3.62,-5.6);parent.add(group);
 cyl(group,6.25,6.5,.82,stoneLight,0,.3,0,32);
 cyl(group,5.65,5.85,5.65,stone,0,3.54,0,32);
 for(let i=0;i<16;i++){
  const a=i*Math.PI*2/16,r=5.88,x=Math.sin(a)*r,z=Math.cos(a)*r;
  const win=archWindow(group,x,1.2,z,1.5,3.8);
  win.rotation.y=a; // front points outward from round wall
  cyl(group,.2,.25,5.6,stoneLight,Math.sin(a+.20)*5.9,3.5,Math.cos(a+.20)*5.9,8);
 }
 cyl(group,5.85,5.85,.35,stoneLight,0,6.47,0,32);
 // translucent domed glass canopy with curved metallic ribs
 const dome=new THREE.Mesh(new THREE.SphereGeometry(5.28,40,18,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:'#a5d5c9',metalness:.15,roughness:.12,transparent:true,opacity:.33,side:THREE.DoubleSide,depthWrite:false}));
 dome.position.y=6.5;dome.scale.y=.82;group.add(dome);
 for(let i=0;i<12;i++){
  const angle=i*Math.PI/6;const pts=[];
  for(let j=0;j<=12;j++){const a=(j/12)*Math.PI/2;pts.push([Math.cos(angle)*Math.sin(a)*5.3,6.5+Math.cos(a)*4.35,Math.sin(angle)*Math.sin(a)*5.3]);}
  curveTube(group,pts,.065,gold,20);
 }
 for(let j=1;j<=4;j++){
  const a=j/5*Math.PI/2,r=Math.sin(a)*5.3,y=6.5+Math.cos(a)*4.35;
  const ring=add(group,new THREE.TorusGeometry(r,.058,6,48),gold,0,y,0);ring.rotation.x=Math.PI/2;
 }
 sphere(group,.45,mat('#d4a66b',{metalness:.55,roughness:.3,emissive:'#815c34',emissiveIntensity:.45}),0,10.9,0,16,10);
 cyl(group,.65,.85,.7,stoneLight,0,11.12,0,12);
 // warm interior visible through the glass
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7;const orb=sphere(group,.19,glowing,Math.sin(a)*2.9,8.6+Math.sin(a*2)*.45,Math.cos(a)*2.9);orb.castShadow=false;
 }
 // columns of central doorway
 for(let s of [-1,1])cyl(group,.32,.37,3.8,stoneLight,s*2,2.23,5.8,10);
 box(group,4.6,.35,.8,stoneLight,0,4.2,5.82);
 placeStoneSteps(group,0,-.18,6.2,4.2,2.3);
 // golden olive tree in courtyard
 goldenTree(parent,1,9.2);
 waterFountain(parent,1,12.5,1.65);
 group.traverse(obj=>{if(obj.isMesh)obj.userData.categoryId='litterature';});interactive.push(group);
}
function goldenTree(parent,x,z){
 const trunkMat=mat('#c09c64',{metalness:.43,roughness:.55,emissive:'#a27a3a',emissiveIntensity:.2});
 const trunk=cyl(parent,.2,.48,3.35,trunkMat,x,5.05,z,9);
 const topMat=mat('#e7c78f',{emissive:'#e6af55',emissiveIntensity:.35,roughness:.7});
 for(let i=0;i<8;i++){
  const a=i*Math.PI*2/8,dx=Math.cos(a)*1.65,dz=Math.sin(a)*1.4;
  curveTube(parent,[[x,6.35,z],[x+dx*.4,7.1,z+dz*.4],[x+dx,7.5+rand()*.4,z+dz]],.10,trunkMat,10);
  const foliage=sphere(parent,.62,topMat,x+dx,7.7,z+dz,10,8);foliage.scale.set(1.1,.72,.9);leafGroups.push({mesh:foliage,original:topMat,isGold:true});
 }
}
function tower(parent,x,z,height=9){
 const group=new THREE.Group();group.position.set(x,3.72,z);parent.add(group);
 cyl(group,1.35,1.5,height,stone,0,height/2,0,10);
 for(let i=0;i<6;i++){
  const a=i*2*Math.PI/6,rad=1.37;
  archWindow(group,Math.sin(a)*rad,height*.52,Math.cos(a)*rad,.62,1.55).rotation.y=a;
 }
 cyl(group,1.75,1.75,.26,stoneLight,0,height-.18,0,10);
 const top=add(group,new THREE.ConeGeometry(2.13,2.85,10),tileMat,0,height+1.24,0);
 const snow=add(group,new THREE.ConeGeometry(2.14,2.87,10),mat('#eef4e7'),0,height+1.32,0);snow.visible=false;winterItems.push(snow);
 cyl(group,.07,.07,1,gold,0,height+3.05,0);
 return group;
}
function archGate(parent,x,z,rotation=0){
 const g=new THREE.Group();g.position.set(x,3.7,z);g.rotation.y=rotation;parent.add(g);
 for(let s of [-1,1])box(g,.72,4.8,.9,stoneLight,s*2.1,2.4,0);
 const a=add(g,new THREE.TorusGeometry(2.1,.42,8,32,Math.PI),stoneLight,0,4.8,0);a.rotation.z=0;
 box(g,5.2,.3,1.1,stoneLight,0,4.85,0);
 const portal=add(g,new THREE.CircleGeometry(1.8,32),mat('#315776',{emissive:'#36788b',emissiveIntensity:.5,transparent:true,opacity:.63,side:THREE.DoubleSide}),0,2.55,-.26);
 portal.scale.y=1.24;
 for(let i=0;i<7;i++)sphere(g,.07,glowing,range(-1.2,1.2),range(1.6,4.2),-.16,6,5);
 return g;
}
function pergola(parent,x,z,w=4,d=3){
 const g=new THREE.Group();g.position.set(x,3.76,z);parent.add(g);
 for(let s of [-1,1])for(let t of [-1,1])cyl(g,.12,.13,3.1,wood,s*w*.5,1.55,t*d*.5,7);
 for(let i=0;i<8;i++)box(g,.12,.15,d+.4,wood,(i/7-.5)*w,3.15,0);
 for(let i=0;i<6;i++)floweringBush(parent,x+range(-w/2,w/2),z+range(-d/2,d/2),.45);
 return g;
}
function addReadingTerrace(parent,x,z){
 pergola(parent,x,z,4.4,3.1);for(let s of [-1,1])seats(parent,x+s*1.4,z+.1);
}
function waterFall(parent,x,z,width=2.7,length=4.5){
 const geo=new THREE.PlaneGeometry(width,length,11,6);
 const m=new THREE.MeshBasicMaterial({color:'#9ce4e8',transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
 const plane=add(parent,geo,m,x,1.1,z);plane.rotation.x=-.17;
 const spark=add(parent,new THREE.PlaneGeometry(width*.8,length*.88),mat('#e1f9f4',{emissive:'#9ce1eb',emissiveIntensity:.45,transparent:true,opacity:.55,side:THREE.DoubleSide}),x+.15,1.3,z+.1);spark.rotation.x=-.18;
 const foam=sphere(parent,.66,mat('#e1f0e8',{transparent:true,opacity:.66}),x,-2.3,z+.3,10,6);foam.scale.set(width*1.3,.2,.8);
 floaters.push({mesh:plane,phase:range(0,6)});
}
function distantTown(parent){
 const distantMat=mat('#e4c9a3',{flatShading:true});
 for(let hill=0;hill<5;hill++){
  const cx=-72+hill*37,cz=-54-range(0,25);const base=add(parent,new THREE.SphereGeometry(1,10,6),mat('#9baba0',{flatShading:true}),cx,-.4,cz);base.scale.set(range(13,20),range(3,7),range(9,15));
  for(let i=0;i<14;i++){
   const x=cx+range(-9,9),z=cz+range(-5,5),y=range(4,7),w=range(1.3,3);
   box(parent,w,range(2,5),range(1.8,3.8),distantMat,x,y,z);
   const r=add(parent,new THREE.ConeGeometry(w*.84,1.3,4),mat('#b67861',{flatShading:true}),x,y+2.4,z);r.rotation.y=Math.PI/4;
  }
  for(let j=0;j<10;j++){
   const x=cx+range(-14,14),z=cz+range(-9,9),c=add(parent,new THREE.ConeGeometry(.55,range(3,7),6),mat('#496759'),x,4.3,z);
  }
 }
}
function boat(parent,x,z,s=1){
 const g=new THREE.Group();g.position.set(x,-2.3,z);parent.add(g);
 const hull=add(g,new THREE.SphereGeometry(1,12,7),mat('#8c5943'),0,0,0);hull.scale.set(2.1*s,.3*s,.6*s);
 cyl(g,.045,.06,3.7*s,wood,0,1.75*s,0,8);
 const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,.12*s,0,.07*s,3.4*s,0,1.5*s,.2*s,0],3));sailGeo.computeVertexNormals();const sail=add(g,sailGeo,mat('#fff0d3',{side:THREE.DoubleSide}));
}
function createSky(parent){
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#7ec2e2')},horizon:{value:new THREE.Color('#e9ebdc')},bottom:{value:new THREE.Color('#e6cfba')}},vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec3 vPos;uniform vec3 top;uniform vec3 horizon;uniform vec3 bottom;void main(){float h=normalize(vPos).y;vec3 c=mix(horizon,top,smoothstep(-0.02,0.7,h));c=mix(bottom,c,smoothstep(-0.55,-0.05,h));gl_FragColor=vec4(c,1.0);}`});
 skyMesh=add(parent,new THREE.SphereGeometry(500,32,16),material,0,0,0);skyMesh.castShadow=false;skyMesh.receiveShadow=false;
 const pos=[];for(let i=0;i<350;i++){
  const theta=rand()*Math.PI*2;const phi=rand()*Math.PI*.47;pos.push(Math.cos(theta)*Math.sin(phi)*240,Math.cos(phi)*240,Math.sin(theta)*Math.sin(phi)*240);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));stars=new THREE.Points(geo,new THREE.PointsMaterial({color:'#fff6e7',size:1.25,transparent:true,opacity:0,depthWrite:false,sizeAttenuation:false}));parent.add(stars);
}
function createSea(parent){
 const shader=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:false,uniforms:{time:{value:0},day:{value:1},blue:{value:new THREE.Color('#4eabb1')}},vertexShader:`varying vec3 worldPos;uniform float time;void main(){vec3 p=position;p.z+=sin(p.x*.42+time*.35)*.12+cos(p.y*.51-time*.33)*.1;worldPos=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,fragmentShader:`varying vec3 worldPos;uniform float time;uniform float day;uniform vec3 blue;void main(){float wave=sin(worldPos.x*1.3+time*.6)+sin(worldPos.y*1.9-time*.45);float foam=smoothstep(1.25,1.95,wave)*.20;float glint=pow(max(0.0,sin(worldPos.x*.3+worldPos.y*.2+time*.4)),14.0)*.17;vec3 col=blue*(.80+wave*.035)+vec3(.48,.76,.72)*(foam+glint)*day;gl_FragColor=vec4(col,1.0);}`});
 sea=add(parent,new THREE.PlaneGeometry(1200,1200,1,1),shader,0,-2.75,0);sea.rotation.x=-Math.PI/2;sea.castShadow=false;sea.receiveShadow=false;
}
function buildWorld(parent){
 // Separate Mediterranean terraces, each with genuine geometry, not a painted picture.
 cliff(parent,0,1,21,15,3.55,6.1);
 cliff(parent,-17,-7,10,9,3.65,7);
 cliff(parent,-19,7,11,12,3.62,6.9);
 cliff(parent,18,-7,11,9,3.63,6.5);
 cliff(parent,20,8,11,12,3.62,6.7);
 cliff(parent,-3,16,12,9,3.62,7);
 cliff(parent,13,17,12,9,3.63,6.7);
 // central piazza and route networks
 for(let [x,z,r] of [[0,2,6.5],[-12,2,3.5],[10,9,3.3]]){
  const plaza=add(parent,new THREE.CylinderGeometry(r,r,.07,36),mat('#e7d6b8'),x,3.63,z);plaza.receiveShadow=true;plaza.castShadow=false;
  const trim=add(parent,new THREE.TorusGeometry(r-.24,.06,6,48),gold,x,3.71,z);trim.rotation.x=Math.PI/2;
 }
 path(parent,[[-16,-4],[-11,-3],[-6,-3],[0,1],[9,-2],[16,-7]]);
 path(parent,[[-18,3],[-13,7],[-7,10],[0,9],[8,10],[20,11]]);
 path(parent,[[-9,15],[-3,14],[1,13],[7,16],[18,16]]);
 path(parent,[[-4,2],[-5,8],[-3,16]]);
 path(parent,[[7,-3],[9,4],[12,10],[17,14]]);
 bridge(parent,-11,9,-6,13);bridge(parent,8,11,12,15);bridge(parent,13,-3,16,0);
 // core architecture
 domeLibrary(parent);
 tower(parent,-6.7,-11.5,7.3);
 tower(parent,8.6,-10.5,6.4);
 makeVilla(parent,{x:-18,z:-7,w:7.4,d:5,h:4.4,roofPeak:1.9,windowCount:3,category:'jeunesse',accent:'#e6d0ae'});
 makeVilla(parent,{x:-22,z:2,w:7,d:4.2,h:4,windowCount:3,category:'manga',accent:'#edd1b7'});
 makeVilla(parent,{x:-18,z:11.4,w:6.3,d:4.8,h:3.9,windowCount:2,category:'bd'});
 makeVilla(parent,{x:18,z:-9,w:6.1,d:4.9,h:5,windowCount:2,category:'fantasy',accent:'#d9ceb9'});
 archGate(parent,16.4,-14,.25);
 makeVilla(parent,{x:22,z:0,w:6.7,d:4.5,h:4.2,windowCount:3,category:'romance',accent:'#efcebd'});
 makeVilla(parent,{x:21,z:9,w:6.2,d:4.5,h:4.8,windowCount:2,category:'polar'});
 makeVilla(parent,{x:0,z:5,w:6.1,d:3.6,h:3.2,windowCount:3,category:'histoire'});
 makeVilla(parent,{x:-9,z:16,w:5,d:3.7,h:3.9,windowCount:2,category:'bien-etre'});
 makeVilla(parent,{x:11,z:16,w:6.1,d:4.6,h:3.9,windowCount:3,category:'papeterie'});
 makeVilla(parent,{x:21,z:17,w:6,d:4.3,h:3.7,windowCount:2,category:'retrait'});
 makeVilla(parent,{x:-3,z:19,w:5.5,d:3.2,h:3.5,windowCount:2,category:'blog'});
 // smaller clustered houses add believable village scale
 [[-12,-13,3.3,3],[-25,-5,3,3],[-23,12,3.5,3.1],[-8,-12,3,2.4],[12,-13,3.1,2.8],[27,4,3.2,3],[27,14,3,2.5],[5,19,3,2.8],[-15,17,2.9,2.8]].forEach(([x,z,w,d],i)=>makeVilla(parent,{x,z,w,d,h:range(2.8,4),windowCount:1,roofPeak:1.15,accent:i%2?'#e4c9a8':'#efdcc3'}));
 // architectural details, separate stairs, fountains and beach features
 for(let [x,z] of [[-8,-1],[-14,6],[11,4],[5,14],[-1,17],[16,5]])lamppost(parent,x,z);
 for(let [x,z] of [[-11,-5],[-21,-1],[-14,13],[23,5],[15,-4],[-5,17],[8,18]])addReadingTerrace(parent,x,z);
 for(let [x,z] of [[-24,-11],[-12,-11],[-26,8],[-12,14],[-6,7],[9,-7],[15,-15],[25,-12],[27,10],[14,21],[3,19],[-9,21]])olive(parent,x,z,range(.65,1.2));
 for(let [x,z] of [[-10,-14],[-27,3],[-25,14],[-4,-14],[4,-14],[12,-11],[23,-15],[29,-4],[27,17],[17,22],[4,21],[-14,19]])cypress(parent,x,z,range(.7,1.35));
 for(let i=0;i<105;i++){
  const area=choose([[-18,-9,8,5],[-20,7,8,9],[20,5,8,9],[-2,16,10,7],[14,16,9,6],[0,0,14,12]]);
  const x=area[0]+range(-area[2],area[2]),z=area[1]+range(-area[3],area[3]);
  if(Math.abs(x)<7&&z<1&&z>-12)continue;
  if(rand()>.35)floweringBush(parent,x,z,range(.32,.7));
 }
 waterFall(parent,-18,12,2.2,7);waterFall(parent,-6,20,2.6,6.3);waterFall(parent,25,20,2.9,7);waterFall(parent,29,4,1.6,5);waterFall(parent,-25,-12,1.7,5);
 for(let [x,z] of [[-7,6],[13,7],[18,-4],[-17,-13],[6,17]])seats(parent,x,z);
 distantTown(parent);
 boat(parent,-43,15,1);boat(parent,-31,32,.75);boat(parent,40,23,1.2);
}
function buildSnow(parent){
 const particlePositions=[];
 for(let i=0;i<220;i++)particlePositions.push(range(-45,45),range(0,31),range(-35,30));
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(particlePositions,3));
 snow=new THREE.Points(geo,new THREE.PointsMaterial({color:'#fcfff9',size:.17,transparent:true,opacity:.86,depthWrite:false}));snow.visible=false;parent.add(snow);
}
export function createWorld(target){
 const mobile=matchMedia('(max-width: 700px)').matches;
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#d8e5dd',.0043);
 camera=new THREE.PerspectiveCamera(mobile?48:40,1,.1,1000);
 camera.position.copy(mobile?V(40,39,54):V(44,31,47));
 renderer=new THREE.WebGLRenderer({antialias:!mobile,alpha:true,powerPreference:mobile?'low-power':'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.4:1.8));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 target.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Scène WebGL de la librairie');renderer.domElement.setAttribute('tabindex','0');
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.07;controls.maxPolarAngle=1.5;controls.minPolarAngle=.4;controls.enablePan=true;controls.panSpeed=.55;controls.maxDistance=110;controls.minDistance=12;controls.target.set(0,4,2);controls.update();
 hemisphere=new THREE.HemisphereLight('#e1f2ff','#ad8870',2.25);scene.add(hemisphere);
 ambient=new THREE.AmbientLight('#fff0d7',.2);scene.add(ambient);
 directional=new THREE.DirectionalLight('#fff2cc',3.1);directional.position.set(-25,45,24);directional.castShadow=!mobile;directional.shadow.mapSize.set(2048,2048);directional.shadow.camera.left=-60;directional.shadow.camera.right=60;directional.shadow.camera.top=60;directional.shadow.camera.bottom=-60;directional.shadow.camera.near=.5;directional.shadow.camera.far=160;directional.shadow.normalBias=.025;scene.add(directional);
 tileMat=mat('#fff',{map:makeRoofTexture(),side:THREE.DoubleSide});booksMat=new THREE.MeshStandardMaterial({map:makeBooksTexture(),roughness:.73,side:THREE.DoubleSide,emissive:'#ad6935',emissiveIntensity:.4});
 createSky(scene);createSea(scene);buildWorld(scene);buildSnow(scene);
 const targetView=V(0,4,3), targetCamera=camera.position.clone();let flying=false;
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
 let categoryHandler=()=>{};
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;} down=null;
  const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(interactive,true);
  const cat=hits.find(h=>h.object.userData.categoryId)?.object.userData.categoryId;
  if(cat)categoryHandler(cat);
 });
 function resize(){const r=target.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
 resize();const observer=new ResizeObserver(resize);observer.observe(target);
 let running=true;const clock=new THREE.Clock();let elapsed=0;
 const onFrame=()=>{
  if(!running)return;requestAnimationFrame(onFrame);
  const dt=Math.min(clock.getDelta(),.06);elapsed+=dt;
  controls.update();
  if(flying){camera.position.lerp(targetCamera,.065);controls.target.lerp(targetView,.065);if(camera.position.distanceTo(targetCamera)<.12&&controls.target.distanceTo(targetView)<.08)flying=false;}
  if(!reduceMotion){sea.material.uniforms.time.value=elapsed;floaters.forEach(f=>f.mesh.material.opacity=.58+.11*Math.sin(elapsed*.7+f.phase));if(snow?.visible)snow.rotation.y+=.0006;}
  renderer.render(scene,camera);
 };
 onFrame();
 return {
  scene,camera,controls,renderer,interactive,
  setCategoryHandler(fn){categoryHandler=fn;},
  focus(id){
   const cat=categories.find(c=>c.id===id);if(!cat)return;
   const x=cat.position[0],z=cat.position[2];targetView.set(x,4.8,z);targetCamera.set(x+13,13.4,z+17);flying=true;
  },
  reset(){targetView.set(0,4,2);targetCamera.copy(mobile?V(40,39,54):V(44,31,47));flying=true;},
  getScreenPosition(position){
   const p=V(...position).project(camera);const r=target.getBoundingClientRect();
   return {x:(p.x*.5+.5)*r.width,y:(-.5*p.y+.5)*r.height,visible:p.z>-1&&p.z<1};
  },
  setSeason(season){
   currentSeason=season;
   winterItems.forEach(m=>m.visible=season==='winter');if(snow)snow.visible=season==='winter';
   const autumn=mat('#bd8860',{flatShading:true}),winter=mat('#557261',{flatShading:true}),spring=mat('#87a776',{flatShading:true});
   leafGroups.forEach(({mesh,original,isGold})=>{mesh.material=isGold?original:season==='autumn'?autumn:season==='winter'?winter:season==='spring'?spring:original;});
  },
  setHour(hour){
   const isNight=hour<6.5||hour>20.5;
   const sunrise=hour>=6&&hour<10,sunset=hour>=16.5&&hour<=20.5;
   const day=clamp(Math.sin(Math.PI*(hour-5.3)/15),0,1);
   const golden=sunrise||sunset;
   const colorTop=isNight?'#101f43':golden?'#779cbb':'#77b6d0';
   const colorHorizon=isNight?'#566b9b':golden?'#f1ad82':'#e6e8d4';
   const colorBottom=isNight?'#1a2945':golden?'#b3b1aa':'#c7e3dc';
   skyMesh.material.uniforms.top.value.set(colorTop);skyMesh.material.uniforms.horizon.value.set(colorHorizon);skyMesh.material.uniforms.bottom.value.set(colorBottom);
   directional.intensity=isNight?.18:1.2+day*2.65;directional.color.set(golden?'#ffc18b':isNight?'#839ac5':'#fff0d1');
   directional.position.set(-40+hour*3.4,19+day*53,-20+hour*2);
   hemisphere.intensity=isNight?.75:1.2+day*.85;
   hemisphere.color.set(isNight?'#9dadc9':'#e6f4ff');
   booksMat.emissiveIntensity=isNight?1.1:.32;
   glowing.emissiveIntensity=isNight?3.3:.95;
   scene.fog.color.set(isNight?'#172744':golden?'#d9c1ae':'#d5e1d7');
   sea.material.uniforms.day.value=isNight?.22:day;
   sea.material.uniforms.blue.value.set(isNight?'#24476f':golden?'#378b9c':'#4aabb4');
   stars.material.opacity=isNight?.95:golden?.16:0;
   renderer.toneMappingExposure=isNight?.93:golden?1.14:1.27;
  },
  dispose(){running=false;observer.disconnect();controls.dispose();renderer.dispose();}
 };
}