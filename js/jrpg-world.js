// Hand-composed Mediterranean pixel-world. Original art drawn through Canvas primitives;
// no copyrighted game tiles, sprites or third-party image assets are used.
import { categories } from './data.js';
export const W=2100,H=1390;
export const districts=[
 {id:'jeunesse',x:370,y:178,w:274,h:183,kind:'garden',label:'JEUNESSE',door:[508,370]},
 {id:'manga',x:335,y:512,w:255,h:174,kind:'manga',label:'MANGA',door:[466,697]},
 {id:'bd',x:585,y:871,w:235,h:167,kind:'shop',label:'BD & COMICS',door:[700,1050]},
 {id:'litterature',x:875,y:266,w:470,h:315,kind:'palace',label:'LITTÉRATURE',door:[1110,605]},
 {id:'fantasy',x:1523,y:185,w:288,h:238,kind:'fantasy',label:'FANTASY & SF',door:[1667,438]},
 {id:'romance',x:1607,y:557,w:268,h:180,kind:'romance',label:'ROMANCE',door:[1740,748]},
 {id:'polar',x:1588,y:841,w:250,h:172,kind:'shop',label:'POLAR',door:[1710,1028]},
 {id:'histoire',x:1045,y:871,w:239,h:177,kind:'archive',label:'HISTOIRE',door:[1162,1053]},
 {id:'bien-etre',x:365,y:1109,w:223,h:147,kind:'garden',label:'BIEN-ÊTRE',door:[477,1270]},
 {id:'papeterie',x:1352,y:1120,w:223,h:145,kind:'shop',label:'PAPETERIE',door:[1465,1278]},
 {id:'blog',x:856,y:1130,w:220,h:141,kind:'tavern',label:'AVIS & BLOG',door:[970,1276]},
 {id:'retrait',x:1649,y:1116,w:230,h:148,kind:'shop',label:'RETRAIT',door:[1760,1277]}
];
const ink='#253b43';
const P={stone:'#e7d2ac',stoneLight:'#f8e8c9',mortar:'#b99975',terracotta:'#b45e42',roofLight:'#df9060',roofDark:'#7c4541',ink:'#29474c',glass:'#85a9a5',sea:'#4bacc5',foam:'#dbf0dc',leaf:'#54846e',flower:'#e991a1'};
const hash=n=>{let x=Math.sin(n*127.1+9.3)*43758.5453123;return x-Math.floor(x)};
const rnd=(seed,a,b)=>a+(b-a)*hash(seed);
const px=(ctx,x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const polygon=(ctx,points,fill,stroke=null,width=3)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
const stroke=(ctx,points,color,width=3)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke()};
const ell=(ctx,x,y,rx,ry,c)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=c;ctx.fill()};
function text(ctx,t,x,y,size=12,color='#fff0d2',align='center'){
 ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle='#28353a';ctx.fillText(t,x+1,y+2);ctx.fillStyle=color;ctx.fillText(t,x,y);
}
function brickLine(ctx,x,y,w){for(let i=0;i<w;i+=21){px(ctx,x+i,y,14,2,'#fcebd0a3');px(ctx,x+i+14,y+1,7,2,'#9876576a')}}
function shutter(ctx,x,y,lit=false){px(ctx,x-3,y-3,25,42,'#4d6467');px(ctx,x,y,19,36,lit?'#ffda88':'#75a6ac');px(ctx,x+2,y+2,15,4,lit?'#fff2b5':'#abc8ba');px(ctx,x+8,y,3,35,'#d2ad80');px(ctx,x-7,y+7,4,25,'#70918c');px(ctx,x+23,y+7,4,25,'#70918c');px(ctx,x-3,y+34,25,4,'#f5dfb7');}
function arch(ctx,x,y,w,h,fill='#2d575d'){
 px(ctx,x,y+h*.28,w,h*.72,fill);ell(ctx,x+w/2,y+h*.3,w/2,h*.32,fill);px(ctx,x+4,y+h*.3,w-8,h*.7,fill);
}
function vine(ctx,x,y,seed,season='summer'){
 const leaves=season==='winter'?'#b9c6ae':season==='autumn'?'#b5783f':'#54886b';
 for(let i=0;i<16;i++){let xx=x+rnd(seed+i*3,-50,50), yy=y+rnd(seed+i*5,-10,38);px(ctx,xx,yy,6,5,leaves);if(i%4===0)px(ctx,xx+3,yy-3,5,5,season==='winter'?'#ecf3ee':'#e77d9b')}
}
function tree(ctx,x,y,s=1,seed=1,season='summer',flower=false){
 // Sprite silhouette with intentionally stepped foliage clusters.
 ell(ctx,x+3,y+5,24*s,7*s,'#6f6751a8');px(ctx,x-6*s,y-42*s,12*s,51*s,'#6b5544');px(ctx,x-2*s,y-49*s,6*s,36*s,'#a37c53');
 let leaf=flower?'#be6c96':season==='autumn'?'#c48c4b':season==='winter'?'#9eb2aa':'#46745d';
 for(let i=0;i<12;i++){let a=i*2.4,xx=x+Math.sin(a)*rnd(seed+i,14,38)*s, yy=y-60*s+Math.cos(a*1.13)*rnd(seed+i*3,8,18)*s;
   let col=flower?(i%4===0?'#ffe0ce':i%3===0?'#ea9db0':'#b95f87'):season==='autumn'?(i%3===0?'#e1ac5a':i%3===1?'#a96247':'#bc7a44'):season==='winter'?(i%2===0?'#d0e0d6':'#7c9991'):(i%4===0?'#83aa72':i%3===0?'#689771':'#42735a');
   px(ctx,xx-16*s,yy-11*s,33*s,22*s,col);px(ctx,xx-19*s,yy-3*s,36*s,13*s,col);if(i%3===0)px(ctx,xx-6*s,yy-10*s,15*s,3*s,'#fbf3ba70');
 }
 if(season==='winter'&&!flower)for(let i=0;i<9;i++)px(ctx,x-31*s+i*7*s,y-77*s+(i%3)*9*s,9*s,3*s,'#ecf2de');
}
function cypress(ctx,x,y,s=1,season='summer'){
 px(ctx,x-4*s,y-12*s,8*s,25*s,'#7c5c45');
 for(let k=0;k<6;k++){let w=(17-Math.abs(k-3)*2)*s;polygon(ctx,[[x,y-(80-k*13)*s],[x-w,y-(36+k*4)*s],[x+w,y-(36+k*4)*s]],season==='winter'?'#67817b':k%2?'#24594b':'#376f57')}
 if(season==='winter')px(ctx,x-7*s,y-58*s,15*s,4*s,'#e5ebe3')
}
function stair(ctx,x,y,width,length,vertical=true){px(ctx,x,y,width,length,'#cfb38d');for(let v=0;v<length;v+=9)px(ctx,x,y+v,width,2,'#fff0c8');px(ctx,x,y,4,length,'#a88a65');px(ctx,x+width-4,y,4,length,'#ae9067')}
function lantern(ctx,x,y,glow=false){px(ctx,x-2,y-24,5,29,'#394747');px(ctx,x-8,y-30,17,7,'#394747');px(ctx,x-6,y-41,13,14,'#384747');px(ctx,x-4,y-39,9,10,glow?'#ffcd79':'#e7d299');px(ctx,x-8,y-42,17,3,'#e5c389');if(glow){ctx.fillStyle='#f0ac5550';ctx.fillRect(x-13,y-43,27,20)}}
function pot(ctx,x,y,flower=true){px(ctx,x-10,y-12,20,17,'#a95f47');px(ctx,x-11,y-13,22,5,'#db9160');for(let i=0;i<7;i++){const xx=x+rnd(i+x,-19,19),yy=y+rnd(i+y,-27,-15);px(ctx,xx,yy,8,7,i%2?'#517e5e':'#8da15f');if(flower&&i%3===0)px(ctx,xx+2,yy-4,5,5,'#e58ea4')}}
function roof(ctx,x,y,w,h,season){
 polygon(ctx,[[x-13,y+h*.30],[x+w/2,y-17],[x+w+13,y+h*.30],[x+w+2,y+h*.44],[x+w/2,y+4],[x-3,y+h*.44]],P.roofDark,'#764c3d',4);
 polygon(ctx,[[x+1,y+h*.28],[x+w/2,y-8],[x+w-1,y+h*.28],[x+w-1,y+h*.32],[x+w/2,y+0],[x+1,y+h*.32]],P.terracotta);
 for(let r=0;r<5;r++){let yy=y+r*8;let ratio=(yy-(y-6))/(h*.36+6);if(ratio<0||ratio>1)continue;let half=w*.5*ratio;for(let k=x+w/2-half;k<x+w/2+half;k+=10)px(ctx,k+(r%2)*4,yy,7,2,r%2?'#de8056':'#e59c67')}
 if(season==='winter'){stroke(ctx,[[x,y+h*.27],[x+w/2,y-11],[x+w,y+h*.27]],'#edf4e8',5)}
}
function titleSign(ctx,b,light){
 let t=b.label, sw=Math.min(b.w-20,Math.max(91,t.length*8+27)), sx=b.x+(b.w-sw)/2,sy=b.y+b.h-17;
 px(ctx,sx+3,sy+4,sw,27,'#3b33357a');px(ctx,sx,sy,sw,24,'#38565b');px(ctx,sx+3,sy+3,sw-6,18,light?'#7c5744':'#274450');px(ctx,sx,sy,sw,3,'#f8d092');px(ctx,sx,sy+21,sw,3,'#b78c5b');
 text(ctx,t,sx+sw/2,sy+12,t.length>14?10:11,'#ffedcb')
}
function villa(ctx,b,season='summer',hour=13){
 const {x,y,w,h,kind}=b, lit=hour<8||hour>=18;
 // Black cast shadow deliberately offset like a 16-bit isometric RPG.
 ell(ctx,x+w/2,y+h+13,w*.56,22,'#4a58467a');px(ctx,x+6,y+56,w-12,h-57,'#876f5d');px(ctx,x+10,y+51,w-20,h-56,P.stone);px(ctx,x+15,y+56,w-30,10,P.stoneLight);
 for(let j=0;j<4;j++)brickLine(ctx,x+17,y+74+j*26,w-35);
 if(kind==='fantasy'){
  for(let i=0;i<3;i++){const xx=x+20+i*(w-40)/2;px(ctx,xx-9,y-25,26,97,'#a98d74');px(ctx,xx-4,y-45,16,30,'#c2aa83');polygon(ctx,[[xx-10,y-43],[xx+4,y-68],[xx+18,y-43]],'#5b7589');px(ctx,xx+1,y-31,5,17,'#f7d9aa')}
 }
 if(kind==='garden'){roof(ctx,x-5,y+10,w+10,125,season);for(let i=0;i<3;i++)shutter(ctx,x+24+i*(w-60)/3,y+90,lit);}
 else if(kind==='manga'){
  roof(ctx,x,y+25,w,130,season);px(ctx,x+12,y+52,w-24,12,'#784953');
  for(let i=0;i<4;i++){const xx=x+26+i*57;px(ctx,xx,y+57,5,110,'#5b4649');px(ctx,xx-8,y+81,28,16,'#df6b8c');px(ctx,xx-4,y+87,20,3,'#ffe2b6')}
 }else if(kind==='romance'){
  roof(ctx,x,y+18,w,115,season);for(let i=0;i<3;i++)shutter(ctx,x+34+i*73,y+98,lit);
  vine(ctx,x+65,y+85,2,season);vine(ctx,x+w-67,y+85,8,season);
 }else if(kind==='archive'){
  roof(ctx,x,y+18,w,115,season);for(let i=0;i<3;i++){arch(ctx,x+24+i*68,y+85,43,61);px(ctx,x+28+i*68,y+122,35,4,'#d1aa7c');}
 }else{
  roof(ctx,x,y+18,w,118,season);for(let i=0;i<3;i++)shutter(ctx,x+20+i*(w-62)/3,y+91,lit);
 }
 // Forecourt colonnade and door.
 const dx=x+w/2-20;arch(ctx,dx,y+h-89,43,78,'#3d5557');px(ctx,dx+4,y+h-53,35,34,lit?'#f7cc86':'#658d87');px(ctx,dx+20,y+h-53,3,42,'#6c5248');px(ctx,dx+30,y+h-32,4,4,'#fff0bc');
 for(let i=0;i<4;i++){const xx=x+15+i*(w-30)/3;px(ctx,xx,y+h-52,8,49,'#f5dcb0');px(ctx,xx-3,y+h-53,14,5,'#a98764');px(ctx,xx-3,y+h-9,14,6,'#b99875')}
 if(kind==='manga'){px(ctx,x+5,y+h-46,w-10,5,'#a24d64');for(let k=0;k<6;k++)px(ctx,x+22+k*36,y+h-60,10,11,'#ea8999')}
 if(kind==='tavern'){px(ctx,x+14,y+h-65,w-28,18,'#bc7652');text(ctx,'CAFÉ DES MOTS',x+w/2,y+h-56,11)}
 if(kind==='garden')for(let i=0;i<3;i++)pot(ctx,x+25+i*85,y+h-9,true);
 else{pot(ctx,x+27,y+h-7);pot(ctx,x+w-25,y+h-7)}
 titleSign(ctx,b,lit);
}
function palace(ctx,b,season,hour){
 const {x,y,w,h}=b,lit=hour<8||hour>=18;
 ell(ctx,x+w/2,y+h+12,w*.57,32,'#4f4d4775');
 // Layered main walls, stone pillars, three arcades.
 px(ctx,x+15,y+129,w-30,170,'#b89c7b');px(ctx,x+24,y+120,w-48,175,'#e7d1ab');
 px(ctx,x+42,y+80,w-84,74,'#d5b18a');px(ctx,x+34,y+90,w-68,22,'#f9e6c4');
 // Orangery / central glass dome with step-cut pixel edges.
 const mid=x+w/2;ell(ctx,mid,y+107,163,105,'#344d56');ell(ctx,mid,y+104,154,98,'#669ba0');ell(ctx,mid,y+95,145,85,lit?'#456d7a':'#8dc0c0');
 for(let i=0;i<8;i++){let xx=mid-123+i*35;px(ctx,xx,y+63+(i%3)*4,5,86,'#d7c59e');}
 for(let i=0;i<13;i++){let xx=mid-144+i*24,dy=Math.sqrt(Math.max(0,1-Math.pow((xx-mid)/154,2)))*88;px(ctx,xx,y+104-dy,17,4,'#dbe1c7a8')}
 px(ctx,mid-165,y+112,330,14,'#d0b78c');px(ctx,mid-170,y+126,340,8,'#8e795f');px(ctx,mid-171,y+134,344,7,'#f8dfa8');
 for(let i=0;i<7;i++){const xx=x+38+i*64;arch(ctx,xx,y+172,45,90,lit?'#a47f62':'#597e78');for(let s=0;s<5;s++){px(ctx,xx+7,y+199+s*11,32,3,lit?'#d39b59':'#91ac9c');px(ctx,xx+10,y+192+s*11,5,8,'#d88a56');px(ctx,xx+17,y+192+s*11,4,8,'#e5c78a');px(ctx,xx+24,y+192+s*11,6,8,'#875e54')}px(ctx,xx-7,y+165,59,8,'#e4c698')}
 for(let i=0;i<6;i++) {let xx=x+18+i*83;px(ctx,xx,y+147,11,135,'#f7ddb4');px(ctx,xx-3,y+145,17,7,'#baa17f');px(ctx,xx-4,y+280,19,10,'#b69a77')}
 // Central illuminated great door, icon and banner.
 arch(ctx,mid-43,y+186,86,109,'#274a4f');px(ctx,mid-33,y+215,66,77,lit?'#eebc6e':'#7cb0a9');px(ctx,mid-24,y+225,48,65,'#547c78');px(ctx,mid,y+224,3,67,'#d7c096');
 px(ctx,mid-82,y+151,164,36,'#2b5660');px(ctx,mid-79,y+154,158,5,'#f3c984');text(ctx,'BIBLIOTHÈQUE',mid,y+171,15,'#fff0c9');
 for(let side of [-1,1]){let xx=mid+side*186;px(ctx,xx,y+147,24,105,'#305c74');px(ctx,xx,y+151,24,4,'#edbc78');text(ctx,'✦',xx+12,y+189,17,'#f3cb80')}
 px(ctx,x+5,y+289,w-10,10,'#b18e6f');px(ctx,x+12,y+299,w-24,6,'#f7e0b8');
 if(season==='winter'){stroke(ctx,[[mid-158,y+104],[mid,y+3],[mid+158,y+104]],'#ecf3e7',5);px(ctx,x+24,y+114,w-48,5,'#f0f2df')}
 titleSign(ctx,b,lit);
}
function cottage(ctx,x,y,w=89,h=85,season='summer',hour=13,style=0){
 const lit=hour<8||hour>=18;
 ell(ctx,x+w/2,y+h+4,w*.56,9,'#625d4d60');
 px(ctx,x+5,y+21,w-10,h-20,style%3===0?'#d9bea0':'#e7cfad');
 px(ctx,x+10,y+25,w-20,h-29,'#eedcba');
 polygon(ctx,[[x-8,y+30],[x+w/2,y-8],[x+w+8,y+30],[x+w,y+39],[x+w/2,y+7],[x,y+39]],style%3===0?'#92564a':'#ac6145','#6e5349',2);
 for(let i=0;i<5;i++)for(let j=0;j<2;j++){let xx=x+20+i*(w-40)/5,yy=y+10+j*7;px(ctx,xx,yy,9,2,j?'#f6aa70':'#d98256')}
 px(ctx,x+w/2-10,y+h-44,20,40,'#436a6a');px(ctx,x+w/2-7,y+h-43,14,18,lit?'#efc783':'#7a9fa0');
 px(ctx,x+12,y+40,17,24,lit?'#e6be79':'#80a5a0');px(ctx,x+w-29,y+40,17,24,lit?'#e6be79':'#80a5a0');
 px(ctx,x+10,y+39,20,4,'#a37f66');px(ctx,x+w-30,y+39,20,4,'#a37f66');
 px(ctx,x+w/2-25,y+h-12,50,6,'#bd9574');
 if(season==='winter')stroke(ctx,[[x-5,y+30],[x+w/2,y-9],[x+w+5,y+30]],'#eef3eb',4);
}
function wall(ctx,x,y,w){px(ctx,x,y,w,15,'#b29374');px(ctx,x,y-7,w,9,'#f6e2bc');for(let i=0;i<w;i+=31){px(ctx,x+i,y+3,20,2,'#f4dab3');px(ctx,x+i+15,y+10,15,2,'#8f8268')}}
function bench(ctx,x,y){px(ctx,x-24,y-16,48,6,'#a3684b');px(ctx,x-23,y-6,46,5,'#c58a5f');px(ctx,x-20,y-5,6,19,'#675340');px(ctx,x+15,y-5,6,19,'#675340')}
function marketStand(ctx,x,y,kind=0){
 ell(ctx,x,y+43,55,10,'#5e655a70');px(ctx,x-46,y-5,92,43,'#a58161');px(ctx,x-42,y+0,84,28,'#f0d7a8');
 for(let i=0;i<5;i++)px(ctx,x-43+i*18,y+9,13,10,['#b57d58','#d0a25b','#7d957b'][i%3]);
 px(ctx,x-51,y-14,102,7,'#694c46');for(let i=0;i<8;i++)px(ctx,x-49+i*13,y-10,12,17,(i+kind)%2?'#fff1c8':'#c67972');
 px(ctx,x-43,y-1,5,41,'#674a43');px(ctx,x+39,y-1,5,41,'#674a43')
}
function flowerBed(ctx,x,y,w,season='summer'){
 px(ctx,x,y,w,19,'#a68d67');px(ctx,x,y+14,w,8,'#d2ad83');
 for(let i=4;i<w-5;i+=12){px(ctx,x+i,y-5+(i%3)*2,14,15,season==='winter'?'#82948d':i%3===0?'#3f856e':'#6c9c6f');
 if(season!=='winter'){px(ctx,x+i+4,y-9,6,6,i%4===0?'#f6c3b1':'#e98e9f');px(ctx,x+i+8,y-5,4,4,'#efb67a')}else px(ctx,x+i+3,y-7,11,4,'#ecf1e8')}
}
function bridge(ctx,x,y,w,season){px(ctx,x,y,w,48,'#8a8573');px(ctx,x,y+4,w,40,'#ddc398');for(let i=0;i<w;i+=25){px(ctx,x+i,y+8,3,32,'#9e8c78');px(ctx,x+i,y+12,20,2,'#fff0c9')}px(ctx,x,y-7,w,5,'#f5e4c4');px(ctx,x,y+44,w,5,'#b18e69')}
function waterFall(ctx,x,y,w,h,frame){px(ctx,x,y,w,h,'#247e9e');for(let j=0;j<w;j+=9){px(ctx,x+j,y+2,w>100?3:2,h-3,j%3===0?'#e7f4e0':'#84d5d9');for(let k=0;k<4;k++)px(ctx,x+j+2,y+hash(j+k)*h,3,3,'#d6f2eb')}ell(ctx,x+w/2,y+h-1,w*.65,7,'#d8f6e58c')}
function ground(ctx,season){
 px(ctx,0,0,W,H,'#61b4c5');for(let iy=0;iy<H;iy+=23)for(let ix=0;ix<W;ix+=34){const h=hash(ix*12+iy);if(h>.35){px(ctx,ix+rnd(h,0,21),iy+rnd(h*3,0,16),h*13+6,2,h>.8?'#c2e7db':'#8ecfd0')}}
 // Cliffside world: stepped sea on the west and lower edge.
 const outline=[[255,0],[2100,0],[2100,1200],[1990,1320],[1690,1348],[1400,1365],[1230,1312],[990,1380],[660,1350],[470,1230],[277,1110],[231,922],[294,720],[218,520],[247,325],[255,0]];
 polygon(ctx,outline,'#9b795c','#6e6470',28);polygon(ctx,outline,'#c59d74','#e7cc9b',11);
 // Main stone walking ground (with subtle sand cobbles and dither).
 polygon(ctx,outline,season==='winter'?'#dbe0d1':season==='autumn'?'#decba3':'#ead8b5',null);
 for(let y=15;y<1350;y+=22)for(let x=255;x<2080;x+=32){if(!pointLand(x,y))continue;let k=hash(x*7+y),col=k>.55?'#f9e6c729':'#95765a17';px(ctx,x+Math.floor(k*9),y,17,2,col);if(k>.84)px(ctx,x+10,y+7,3,4,'#ba977447')}
 // terraces / back of tall retaining wall on west edge
 stroke(ctx,[[260,40],[276,318],[237,511],[303,705],[245,913],[286,1072],[475,1213]],'#9c7c62',14);
 stroke(ctx,[[277,40],[289,317],[255,511],[317,704],[261,916],[297,1053],[490,1221]],'#f7e7c3',6);
 // Lines of stairs and walkways connect every district to the central piazza.
 let roads=[[[1098,689],[1097,620]],[[1093,697],[771,706],[506,716]],[[1100,696],[1475,704],[1741,755]],[[1095,695],[1135,885]],[[1111,702],[1100,1120]],[[1094,694],[818,940],[703,1050]],[[1093,697],[584,986],[477,1257]],[[1097,699],[1545,950],[1746,1270]],[[1093,695],[1438,1110],[1458,1267]],[[1096,693],[1688,482]],[[1093,694],[510,405]]];
 for(let pts of roads){stroke(ctx,pts,'#ad906e',73);stroke(ctx,pts,'#f9e7c0',67);stroke(ctx,pts,'#d4ba96',57);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dist=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let p=0;p<dist;p+=19){let x=a[0]+(b[0]-a[0])*p/dist,y=a[1]+(b[1]-a[1])*p/dist;px(ctx,x,y,16,3,'#9d8a7a55')}}}
 // Cascades with a stone bridge between coastal garden and the village.
 waterFall(ctx,720,704,75,277,0);bridge(ctx,663,756,191,season);
 waterFall(ctx,1293,1077,68,222,0);bridge(ctx,1254,1137,141,season);
 // Central plaza mosaic; epicenter of world.
 ell(ctx,1104,705,232,119,'#a78d73');ell(ctx,1104,697,227,114,'#f5dcaf');ell(ctx,1104,697,207,98,'#d9bc94');ell(ctx,1104,697,191,88,'#ead2aa');
 for(let a=0;a<36;a++){let t=a*Math.PI/18;px(ctx,1104+Math.cos(t)*207,697+Math.sin(t)*96,11,6,a%2?'#b49573':'#f8e9c7')}
 ell(ctx,1104,700,65,37,'#9d896a');ell(ctx,1104,697,59,32,'#58aebc');ell(ctx,1104,693,39,19,'#cfe8ca');ell(ctx,1104,690,30,14,'#b7ccae');
 // Embossed sun compass on piazza.
 for(let a=0;a<8;a++){let t=a*Math.PI/4;stroke(ctx,[[1104+Math.cos(t)*73,697+Math.sin(t)*39],[1104+Math.cos(t)*123,697+Math.sin(t)*60]],'#a98f70',5)}
}
function pointLand(x,y){return x>280 && x<2085 && y<1300 || x>500&&x<1550&&y<1340}
function decorations(ctx,season,hour){
 const lit=hour<8||hour>=18;
 // Secondary architecture: hand-placed houses provide a real village silhouette.
 const cottages=[[338,23,99,89],[467,61,87,78],[601,13,105,89],[731,86,91,81],
  [1371,36,111,99],[1511,66,101,91],[1657,6,119,97],[1811,48,118,103],[1974,138,96,86],
  [724,443,94,78],[1421,468,82,75],[1876,737,100,91],[1892,935,91,87],
  [1147,1143,92,80],[324,939,81,75],[1882,1167,93,77]];
 cottages.forEach(([x,y,w,h],i)=>cottage(ctx,x,y,w,h,season,hour,i));
 // Planted terraces and lower walls break up the sandstone ground.
 for(const [x,y,w] of [[376,394,270],[1580,475,255],[350,747,185],[927,823,337],[1549,786,283],[1370,1090,190],[685,1224,168],[1607,1291,252]])wall(ctx,x,y,w);
 for(const [x,y,w] of [[408,417,182],[359,471,160],[1544,512,205],[1637,790,189],[882,831,300],[1361,1090,194],[580,1094,178],[1178,1136,160]])flowerBed(ctx,x,y,w,season);
 for(const [x,y] of [[579,733],[813,719],[1284,774],[1426,876],[853,1167],[1233,1092]])bench(ctx,x,y);
 marketStand(ctx,1431,855,1);marketStand(ctx,821,1182,2);marketStand(ctx,1938,1074,1);
 // Ordered landmark furniture, not procedurally placed buildings.
 const cyp=[[315,134],[688,207],[782,270],[1385,285],[1440,220],[1873,244],[1920,548],[1394,637],[1505,804],[1845,1060],[1342,1051],[720,1160],[300,898],[720,424],[1940,770],[772,130],[827,179],[1334,114],[1880,145],[1995,335],[2001,610],[2011,963],[1955,1160],[550,1260],[358,1132],[1600,1083],[677,1132],[1511,1252]];
 cyp.forEach(([x,y],i)=>cypress(ctx,x,y,1+i%2*.25,season));
 const trees=[[520,169,1.15,false],[299,442,.8,true],[620,492,1,true],[315,795,1.1,true],[786,803,.8,false],[1420,547,1,false],[1870,477,.9,true],[1490,1085,.9,false],[563,1077,.8,true],[1940,1027,.82,false],[796,157,.7,false],[1352,175,.9,false],[1415,179,.7,false],[1973,361,.7,true],[2009,842,.84,false],[1770,1084,.72,true],[1188,1199,.58,false],[758,1275,.77,true],[352,1013,.65,false]];
 trees.forEach(([x,y,s,b],i)=>tree(ctx,x,y,s,i*17,season,b));
 for(let i=0;i<95;i++){let x=rnd(107+i*13,300,2005),y=rnd(7+i*29,140,1330);if(!pointLand(x,y))continue; if(districts.some(d=>x>d.x-35&&x<d.x+d.w+35&&y>d.y-18&&y<d.y+d.h+38))continue;if(Math.abs(x-1104)<300&&Math.abs(y-699)<145)continue;
  px(ctx,x,y,8,8,i%5===0?'#d38d94':i%3===0?'#7a965c':'#66937a');if(i%4===0)px(ctx,x+2,y-4,5,5,'#f2b3b2')
 }
 for(let i=0;i<24;i++){let t=i*79,xx=340+(t*19%1550),yy=320+(t*11%830);if(districts.some(d=>xx>d.x-18&&xx<d.x+d.w+18&&yy>d.y-20&&yy<d.y+d.h+30))continue;pot(ctx,xx,yy,i%2===0)}
 for(let i=0;i<18;i++){let xx=315+i*96,yy=i%2?768:1072;lantern(ctx,xx,yy,lit)}
 // Clifftop lighthouse and moored boats at far left.
 px(ctx,125,530,30,92,'#fff0cf');px(ctx,121,519,39,15,'#a05d4f');polygon(ctx,[[118,519],[141,488],[164,519]],'#c56b53');px(ctx,136,516,11,10,lit?'#ffdc8b':'#91c9bc');
 for(let i=0;i<5;i++){let x=92+i*23,y=900+i*61;polygon(ctx,[[x-30,y],[x+30,y],[x+16,y+13],[x-20,y+13]],'#f6e5c5','#436983',3);stroke(ctx,[[x,y],[x,y-64]],'#5f5f60',2);polygon(ctx,[[x+2,y-59],[x+2,y-13],[x+25,y-13]],'#faf0d0')}
}
export function createTerrain(season='summer',hour=13){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
 ground(ctx,season);decorations(ctx,season,hour);
 for(let b of [...districts].sort((a,b)=>a.y-b.y)){if(b.kind==='palace')palace(ctx,b,season,hour);else villa(ctx,b,season,hour)}
 // plaza central olive tree, arcade lampposts in front of buildings.
 tree(ctx,1104,701,.65,27,season,false);
 for(let [x,y] of [[962,748],[1240,748],[1040,793],[1173,793],[878,611],[1370,613]])lantern(ctx,x,y,hour<8||hour>=18);
 return c;
}
export function drawPerson(ctx,x,y,color='#b26655',dir='down',step=0,scale=1,hat=false){
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);
 ell(ctx,0,1,14,5,'#243a3a70');
 // 16x27 pixel sprite, distinct walking frames.
 let foot=step?3:0;
 px(ctx,-7,-12+foot,5,11,'#263947');px(ctx,3,-12-foot,5,11,'#304453');px(ctx,-9,-25,18,15,'#273844');px(ctx,-7,-23,14,12,color);px(ctx,-13,-24,5,12,'#dfaa7c');px(ctx,8,-24,5,12,'#dfaa7c');
 px(ctx,-6,-34,13,13,'#e1ae82');if(dir==='down'){px(ctx,-4,-28,2,2,'#443d3b');px(ctx,2,-28,2,2,'#443d3b')}
 px(ctx,-8,-37,17,6,'#463b3c');if(hat){px(ctx,-10,-41,21,5,'#efdaaa');px(ctx,-5,-46,11,8,'#77584b')}
 else{px(ctx,-7,-36,4,7,'#463b3c')}ctx.restore();
}
export function drawParticles(ctx,time,season,w,h,camX,camY){
 const n=season==='winter'?60:season==='autumn'?32:season==='spring'?19:7;
 for(let i=0;i<n;i++){let x=(hash(i*7)*w+time*(season==='winter'?7:14)+i*13)%(w+40)-20;let y=(hash(i*17)*h+time*(season==='winter'?26:13)+i*33)%(h+40)-20;px(ctx,x,y,season==='winter'?4:3,season==='winter'?4:3,season==='winter'?'#fafbf3be':season==='autumn'?'#f1b5738a':season==='spring'?'#f9b4cb9b':'#fcda9490')}
}
export function hitDistrict(x,y){return districts.find(d=>x>=d.x-16&&x<=d.x+d.w+16&&y>=d.y-17&&y<=d.y+d.h+22)||null;}
export function nearestDistrict(x,y,max=90){let best=null,dist=max;for(let d of districts){let v=Math.hypot(d.door[0]-x,d.door[1]-y);if(v<dist){best=d;dist=v}}return best;}
export function isWalkable(x,y){if(x<290||x>2060||y<80||y>1320)return false;if(x>715&&x<795&&y>710&&y<970)return false;if(x>1294&&x<1360&&y>1080&&y<1320)return false;return !districts.some(d=>x>d.x+7&&x<d.x+d.w-7&&y>d.y+10&&y<d.y+d.h-13)}