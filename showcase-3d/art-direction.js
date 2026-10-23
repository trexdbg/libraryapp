/* Architectural finishing pass — real mesh-based props, not a painted backdrop.
   Instancing is used for repeated architectural details to keep draw calls bounded. */
export function addArchitecturalFinishes({THREE,scene,M,box,cyl,sph,curveTube,mat,rnd,animated,lowPower,pointLight}) {
 const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 const terracotta=mat('#b95f47',.88), tileLight=mat('#df976f',.84), tileShadow=mat('#884338',.96);
 const chalk=mat('#eddfc3',.96), limestone=mat('#c7b99e',.97), darkMortar=mat('#78644e',.97);
 const iron=mat('#292e34',.52,.45), darkBlue=mat('#31536b',.73), turquoise=mat('#477d82',.72), laurel=mat('#49764d',.96);
 const amber=new THREE.MeshStandardMaterial({color:'#f8d99b',metalness:.1,roughness:.33,emissive:'#d48434',emissiveIntensity:.36});
 const jade=mat('#487a6e',.85),rose=mat('#aa6686',.9), lilac=mat('#736d9f',.9);
 const noShadow=(o)=>{o.castShadow=false;return o};
 const geoTile = new THREE.CylinderGeometry(.255,.255,.95,8,1,false,0,Math.PI);
 geoTile.rotateZ(Math.PI/2);
 const roofInstances = new THREE.InstancedMesh(geoTile, tileLight, 2100);
 roofInstances.castShadow=false;roofInstances.receiveShadow=true;scene.add(roofInstances);
 const scratch=new THREE.Object3D(),col=new THREE.Color();let roofCount=0;
 const roofColors=['#cc7354','#bc654e','#e49b72','#bc7055','#a84d3b','#e5a075','#b35b44'];
 function roofTiles({x,z,y,w,d,rise}) {
   const angle=Math.atan2(rise,w/2),half=Math.hypot(w/2,rise);
   for(const side of [-1,1]){
     const rows=Math.max(4,Math.round(half/.68)),columns=Math.max(5,Math.round(d/.62));
     for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
       if(roofCount>=roofInstances.count)continue;
       const k=(i+.5)/rows,zz=z-d/2+(j+.5)*d/columns + ((i%2)?-.14:.14);
       scratch.position.set(x+side*(w/2-k*w/2),y+k*rise+.16,zz);
       scratch.rotation.set(Math.PI/2,0,side*angle);
       scratch.scale.set(.36,.69,.17);scratch.updateMatrix();roofInstances.setMatrixAt(roofCount,scratch.matrix);
       col.set(roofColors[Math.floor(rnd(0,roofColors.length))]);roofInstances.setColorAt(roofCount,col);roofCount++;
     }
   }
 }
 const houses=[
  {x:-33,z:-18,y:7.15,w:15,d:13,h:8.8,r:2.7,type:'jeunesse'},
  {x:-31,z:5,y:5.7,w:14,d:12,h:8.6,r:2.52,type:'manga'},
  {x:-40,z:5,y:5.7,w:7,d:7,h:5.2,r:1.65,type:'manga'},
  {x:31,z:-18,y:7.5,w:15,d:14,h:9,r:2.7,type:'fantasy'},
  {x:33,z:4,y:5.95,w:13,d:11,h:8.1,r:2.34,type:'romance'},
  {x:28,z:26,y:5.3,w:13,d:11,h:7.1,r:2.34,type:'papeterie'},
  {x:-30,z:27,y:5.1,w:14,d:10,h:6.9,r:2.52,type:'chroniques'},
  {x:0,z:29,y:5.1,w:14,d:10,h:6.9,r:2.52,type:'histoire'},
 ];
 // Fine-grained tile silhouettes and aged limestone corner masonry.
 for(const h of houses){
   roofTiles({...h,y:h.y+h.h,rise:h.r});
   for(const dir of [-1,1])for(let level=0;level<Math.floor(h.h/1.1);level++){
     const y=h.y+level*1.08+.55;
     box(.53,1.01,.65,(level+1)%4===0?limestone:chalk,h.x+dir*(h.w/2+.16),y,h.z+h.d/2+.06);
     box(.53,1.01,.65,(level+1)%4===0?limestone:chalk,h.x+dir*(h.w/2+.16),y,h.z-h.d/2-.06);
   }
   // layered cornice and drip course interrupt the flat cube silhouettes
   box(h.w+.95,.21,h.d+.95,limestone,h.x,h.y+h.h-.48,h.z);
   box(h.w+.5,.10,h.d+.55,M.gold,h.x,h.y+h.h-.30,h.z);
   box(h.w+.65,.2,h.d+.65,chalk,h.x,h.y+1.05,h.z);
   for(const sx of [-1,1]){
    const wx=h.x+sx*(h.w/2-.95),fz=h.z+h.d/2+.14;
    for(const floor of [h.y+3.75,h.y+5.7]){
      if(floor>h.y+h.h-1.4)continue;
      const shutter=box(.71,2.15,.13,h.type==='romance'?rose:h.type==='fantasy'?darkBlue:h.type==='manga'?turquoise:jade,wx,floor,fz+.16);
      shutter.rotation.y=sx*.27;
      for(let k=0;k<7;k++)box(.55,.047,.16,M.wood,wx,floor-.75+k*.23,fz+.26);
      box(.8,.17,.64,chalk,wx,floor-1.2,fz+.22);
      // planted wrought-iron balcony
      if(floor===h.y+5.7){
       box(2.3,.2,.88,limestone,wx,floor-1.36,fz+.46);
       for(let t=-4;t<=4;t++)cyl(.045,.045,.73,iron,wx+t*.23,floor-.85,fz+.88,7);
       box(2.28,.08,.1,iron,wx,floor-.46,fz+.88);
      }
    }
   }
   // Shop-specific cloth awnings give meaningful differentiated districts.
   if(['manga','papeterie','chroniques'].includes(h.type)){
     const color=h.type==='manga'?rose:h.type==='papeterie'?jade:terracotta;
     const awning=box(h.w*.72,.19,2.75,color,h.x,h.y+5.38,h.z+h.d/2+1.45);
     awning.rotation.x=.16;
     const stripeCount=Math.max(5,Math.floor(h.w*.72));
     for(let i=0;i<stripeCount;i++)box(h.w*.72/stripeCount*.48,.21,2.77,chalk,h.x-h.w*.36+(i+.5)*h.w*.72/stripeCount,h.y+5.40,h.z+h.d/2+1.46).rotation.x=.16;
     curveTube([[h.x-h.w*.36,h.y+5.28,h.z+h.d/2+2.95],[h.x+h.w*.36,h.y+5.28,h.z+h.d/2+2.95]],.07,M.bronze);
   }
 }
 roofInstances.count=roofCount;roofInstances.instanceMatrix.needsUpdate=true;roofInstances.instanceColor.needsUpdate=true;
 // Pediment arches with individually articulated voussoirs around the central front.
 function archFace(x,y,z,r=2.6,width=.45,color=M.ivory){
   const frame = new THREE.Mesh(new THREE.RingGeometry(r-width,r,36,1,0,Math.PI),color);
   frame.position.set(x,y+.18,z+.17);frame.castShadow=true;frame.receiveShadow=true;scene.add(frame);
   for(let i=0;i<15;i++){
     const a=(i+.5)*Math.PI/15;
     const px=x+Math.cos(a)*(r-width*.47),py=y+.18+Math.sin(a)*(r-width*.47);
     const voussoir=box(width*.63,.24,.52,i%3===0?limestone:chalk,px,py,z+.26);
     voussoir.rotation.z=a-Math.PI/2;
   }
   return frame;
 }
 // Grand library facade is deliberately more ornate than the residential villas.
 for(const x of [-10.5,-7.2,7.2,10.5]){
   archFace(x,9.8,-4.25,1.35,.26,chalk);
 }
 for(const x of [-12.4,-8.6,8.6,12.4]){
   box(2.6,.32,1.05,limestone,x,18.95,-4.38);
   box(2.1,.15,.75,M.gold,x,19.23,-4.21);
 }
 for(let i=0;i<12;i++){
   const x=-14.8+i*2.69;
   box(.19,.9,.32,M.gold,x,18.83,-4.17);
 }
 // A mosaic atrium visible through the glass dome, and a circular balcony around it.
 for(const radius of [8.7,9.0]){
   const pts=[];
   for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;pts.push([Math.cos(a)*radius,19.9,-17.4+Math.sin(a)*radius]);}
   curveTube(pts,radius===8.7?.1:.18,radius===8.7?iron:M.gold);
 }
 for(let i=0;i<32;i++){
   const a=i*Math.PI/16,r=8.95;
   cyl(.07,.07,1.5,M.gold,Math.cos(a)*r,19.16,-17.4+Math.sin(a)*r,7);
 }
 const centralOrrery=new THREE.Group();centralOrrery.position.set(0,25.2,-17.4);scene.add(centralOrrery);
 for(let i=0;i<4;i++){
  const rad=2.2+i*.86;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(rad,.045,8,72),i%2?M.gold:M.brightGold);
  ring.rotation.set(.6+i*.12,.45+i*.38,.3*i);centralOrrery.add(ring);
 }
 sph(.75,M.brightGold,0,24.8,-17.4);
 animated.push(t=>{centralOrrery.rotation.y=t*.035;centralOrrery.rotation.z=Math.sin(t*.14)*.03;});
 // Street paving in radial patterns around the central fountain.
 const plazaY=6.59;
 for(const rr of [8.3,10.9,14.7,17.7]){
  const pts=[];
  for(let i=0;i<=120;i++){
   const a=i*Math.PI/60;pts.push([Math.cos(a)*rr,plazaY+.015,13+Math.sin(a)*rr]);
  }
  curveTube(pts,rr===17.7?.19:.085,rr===10.9?M.gold:limestone);
 }
 for(let i=0;i<24;i++){
   const a=i*Math.PI/12,r=12.3;
   const stone=box(1.1,.06,2.7,i%2?chalk:limestone,Math.cos(a)*r,plazaY+.045,13+Math.sin(a)*r);
   stone.rotation.y=-a;
 }
 // Ivy, boughs and hand-crafted planters (not uniform spheres).
 function planter(x,y,z,s=1,pink=false){
   cyl(.62*s,.42*s,1.0*s,terracotta,x,y+.5*s,z,12);
   cyl(.66*s,.66*s,.12*s,tileShadow,x,y+1.0*s,z,12);
   cyl(.17*s,.16*s,1.3*s,M.wood,x,y+1.55*s,z,8);
   const leaves= pink?rose:laurel;
   for(let i=0;i<7;i++){
     const a=i*Math.PI*2/7;
     const o=sph(.4*s,leaves,x+Math.cos(a)*.36*s,y+(1.85+Math.sin(i*1.9)*.23)*s,z+Math.sin(a)*.37*s);
     o.scale.set(.8,1.2,.75);
     if(pink){const f=sph(.17*s,i%2?rose:lilac,x+Math.cos(a)*.48*s,y+(2.08+Math.sin(i*2)*.19)*s,z+Math.sin(a)*.48*s);f.castShadow=false;}
   }
 }
 for(const [x,z,y,s,p] of [
 [-14,14,6.5,1,true],[-11,8,6.5,.9,true],[11,8,6.5,.9,true],[14,14,6.5,1,true],
 [-24,15,5.65,1.1,true],[-38,16,5.65,.85,true],[-30,31,5.1,1.1,true],
 [23,25,5.2,1,true],[35,27,5.2,1.2,true],[28,11,5.9,1,true],[40,13,5.9,.9,true],
 [-20,-3,6.4,.95,false],[20,-3,6.4,.95,false],[-42,-26,7.1,.9,false],[43,-24,7.4,.9,false]
 ])planter(x,y,z,s,p);
 // Lantern strings create a layered human-scale foreground at sunset/night.
 const glowMat=new THREE.MeshBasicMaterial({color:'#ffdc95'});
 function hangingLights(a,b,y,n=12){
  const points=[];
  for(let i=0;i<=30;i++){let t=i/30;points.push([a[0]+(b[0]-a[0])*t,y-Math.sin(Math.PI*t)*.75,a[1]+(b[1]-a[1])*t]);}
  curveTube(points,.024,iron);
  for(let i=1;i<n;i++){
   let t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,yy=y-Math.sin(Math.PI*t)*.75;
   cyl(.07,.09,.35,M.bronze,x,yy-.18,z,6);
   const lamp=sph(.16,glowMat,x,yy-.44,z);lamp.castShadow=false;
  }
 }
 hangingLights([-44,21],[-28,21],12.8,12);
 hangingLights([23,18],[40,18],12.9,11);
 hangingLights([-27,32],[-15,30],11.7,9);
 // Layered book displays with visible colorful covers.
 const bookCovers=['#a55b4b','#3e6d74','#5c638e','#917a50','#9c6c85','#466d52'];
 function display(x,y,z,rot=0){
   const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);g.rotation.y=rot;
   box(2.9,.15,1.6,M.wood,0,.92,0,g);
   box(2.9,.11,1.6,M.wood,0,1.4,0,g);
   for(const dx of [-1.3,1.3])for(const dz of [-.65,.65])cyl(.09,.12,1.46,M.bronze,dx,.74,dz,8,g);
   for(let i=0;i<10;i++){
     const x=-1.12+(i%5)*.54,z=-.35+Math.floor(i/5)*.73;
     const cover=box(.39,.54,.055,mat(bookCovers[i%bookCovers.length],.7),x,1.58,z,g);
     cover.rotation.x=-.65;
     box(.28,.026,.068,M.gold,x,1.74,z+.14,g);
   }
 }
 display(-33,5.7,18,.15);display(-24,5.25,28,-.15);display(24,5.2,30,.1);
 // Large architectural book sculpture by the entrance.
 function stoneBook(x,y,z,s=1){
   const left=box(2.65*s,.17*s,2.2*s,chalk,x-1.26*s,y,z);left.rotation.z=.13;
   const right=box(2.65*s,.17*s,2.2*s,chalk,x+1.26*s,y,z);right.rotation.z=-.13;
   curveTube([[x,y-.11*s,z-1.22*s],[x,y-.11*s,z+1.25*s]],.055*s,M.gold);
   for(let j=0;j<7;j++)for(const side of [-1,1]){
     box((1.4+j%2*.23)*s,.01*s,.022*s,limestone,x+side*1.2*s,y+.12*s+Math.abs(side)*.02*s,z-.8*s+j*.27*s).rotation.z=-side*.13;
   }
 }
 stoneBook(0,7.9,5.7,1.3);
 // Varying potted flora and foreground low walls emphasize the playable pathways.
 for(let i=0;i<23;i++){
   const a=i*Math.PI*2/23,rr=19.5;
   if(i%3!==0)continue;
   const x=Math.cos(a)*rr,z=13+Math.sin(a)*rr;
   planter(x,6.1,z,.65,i%2===0);
 }
 // Night-time light from open shop windows; intensity set by external mood controller.
 const shopLights=[];
 for(const [x,y,z,color] of [[-31,10,11,'#ffa9bd'],[-30,10.6,32,'#f5c484'],[28,10.4,31,'#ffce84'],[34,10.7,9,'#f7b5c9'],[-33,11.2,-11,'#ffdd9c']]){
  const l=new THREE.PointLight(color,0,8,2);l.position.set(x,y,z);scene.add(l);shopLights.push(l);
 }
 return {shopLights,roofCount};
}