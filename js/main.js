import { categories, byId, seasonForMonth, bookSearchUrl } from './data.js';
import { createWorld } from './world.js';

const $=s=>document.querySelector(s);
const sceneEl=$('#scene'),hotspots=$('#hotspots'),detail=$('#detail-panel'),detailContent=$('#detail-content'),backdrop=$('#panel-backdrop');
let world=null, lastFocus=null,previousFocus=null,toastTimer=null,lastUpdate=0;
const esc=t=>String(t).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const currentSeason=()=>seasonForMonth(new Date().getMonth());
const seasonNames={spring:'Printemps',summer:'Été',autumn:'Automne',winter:'Hiver'};
const getSeason=()=>$('#season-select').value==='auto'?currentSeason():$('#season-select').value;
const getHour=()=>$('#time-select').value==='auto'?new Date().getHours()+new Date().getMinutes()/60:Number($('#time-select').value);

function renderBookmarks(){
 hotspots.innerHTML=categories.map((c,i)=>`<a class="hotspot" style="--tint:${c.color}" href="#${c.id}" data-id="${c.id}" aria-label="Explorer ${esc(c.title)}"><span class="hotspot-icon">${esc(c.emoji)}</span><span>${esc(c.title)}</span><span class="hotspot-chevron">›</span></a>`).join('');
 $('#category-links').innerHTML=categories.map(c=>`<a href="#${c.id}">${esc(c.title)} ↗</a>`).join('');
 hotspots.addEventListener('click',e=>{const a=e.target.closest('[data-id]');if(!a)return;e.preventDefault();openCategory(a.dataset.id);});
 $('#category-links').addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();openCategory(a.hash.slice(1));});
}
function bookMarkup(book,index){
 const [title,author]=book;
 const tones=['#6e856e','#a97461','#566b82','#b39a61','#8e6482'];
 return `<div class="book-item"><span class="book-spine" style="background:${tones[index%tones.length]}">${['✦','❧','✧','✳','☷'][index%5]}</span><div class="book-meta"><strong>${esc(title)}</strong><small>${esc(author)}</small></div><a href="${bookSearchUrl(title,author)}" target="_blank" rel="noopener noreferrer" aria-label="Rechercher ${esc(title)} sur Open Library" title="Rechercher ce titre sur Open Library">↗</a></div>`;
}
function renderCategory(c){
 const books=c.books.length?`<h3>Quelques livres pour commencer</h3>${c.books.map(bookMarkup).join('')}<p class="detail-note">Suggestions de lecture, non représentatives d'un stock en librairie. Le lien ↗ ouvre la recherche Open Library.</p>`:`<h3>Un univers à construire ensemble</h3><p class="detail-desc">Ce quartier vous présente notre intention. Les produits, disponibilités et commandes seront ajoutés à la mise en ligne du catalogue.</p>`;
 detailContent.innerHTML=`<div class="detail-icon" style="background:${c.color}">${esc(c.emoji)}</div><span class="detail-kicker">DÉCOUVREZ LE QUARTIER</span><h2>${esc(c.title)}</h2><p class="detail-desc">${esc(c.description)}</p><div class="detail-sep"></div>${books}<button class="primary-btn" id="go-back" type="button">Revenir à la visite <span>↗</span></button>`;
 $('#go-back').addEventListener('click',closePanel);
}
function renderAll(){
 detailContent.innerHTML=`<span class="detail-kicker">LA CARTE DES UNIVERS</span><h2>Tous nos rayons</h2><p class="detail-desc">Choisissez une aile du village pour vous y promener.</p><div class="detail-sep"></div>${categories.map(c=>`<button class="all-category-item" type="button" data-go="${c.id}"><span class="cat-icon" style="background:${c.color}">${esc(c.emoji)}</span><span><strong class="cat-name">${esc(c.title)}</strong><small class="cat-desc">${esc(c.tagline)}</small></span><span aria-hidden="true" style="margin-left:auto">↗</span></button>`).join('')}`;
 detailContent.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>openCategory(el.dataset.go)));
}
function showPanel(){
 if(!detail.classList.contains('open'))previousFocus=document.activeElement;
 backdrop.hidden=false;detail.classList.add('open');detail.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';detail.scrollTop=0;
 $('#close-panel').focus({preventScroll:true});
}
function openCategory(id){
 const c=byId[id];if(!c)return;
 lastFocus=id;renderCategory(c);showPanel();world?.focus(id);
 if(location.hash!==`#${id}`)history.replaceState(null,'',`#${id}`);
}
function showAll(){lastFocus=null;renderAll();showPanel();}
function closePanel(){detail.classList.remove('open');detail.setAttribute('aria-hidden','true');backdrop.hidden=true;document.body.style.overflow='';previousFocus?.focus?.({preventScroll:true});}
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3900);}

function updateEnvironment(){
 if(!world)return;
 const hour=getHour(),season=getSeason();world.setHour(hour);world.setSeason(season);
 let title,icon;
 if(hour<6||hour>=21){title='La librairie sous les étoiles';icon='☾';}
 else if(hour<10){title='Une matinée méditerranéenne';icon='☼';}
 else if(hour<17){title='Sous le soleil de la Méditerranée';icon='☀';}
 else{title='La douceur de l’heure dorée';icon='◒';}
 $('#environment-title').textContent=title;
 $('#environment-subtitle').textContent=`${seasonNames[season]} · ${$('#time-select').value==='auto'?'heure locale':'éclairage choisi'}`;
 $('.env-sun').textContent=icon;
}
function placeHotspots(ts){
 requestAnimationFrame(placeHotspots);
 if(!world||ts-lastUpdate<55)return;lastUpdate=ts;
 const w=sceneEl.clientWidth,h=sceneEl.clientHeight,mobile=w<700;
 const placed=[];
 // Give primary book sections priority, while avoiding overlap with the masthead, intro and each other.
 for(const c of categories){
  const el=hotspots.querySelector(`[data-id="${c.id}"]`);
  const p=world.getScreenPosition(c.position),cx=p.x,cy=p.y;
  if(!p.visible||cx<30||cx>w-30||cy<(mobile?310:125)||cy>h-105){el.classList.add('hidden');continue;}
  const wide=el.offsetWidth||110,high=el.offsetHeight||36;
  const rect={l:cx-wide/2-8,r:cx+wide/2+8,t:cy-high-8,b:cy+10};
  const inIntro=!mobile&&rect.l<Math.min(440,w*.38)&&rect.t<h*.62&&rect.b>h*.20;
  const collision=placed.some(p=>rect.l<p.r&&rect.r>p.l&&rect.t<p.b&&rect.b>p.t);
  if(inIntro||collision){el.classList.add('hidden');continue;}
  placed.push(rect);el.classList.remove('hidden');el.style.transform=`translate(calc(${cx.toFixed(1)}px - 50%),calc(${cy.toFixed(1)}px - 100%))`;
 }
}
function wireUI(){
 $('#toggle-collections').addEventListener('click',showAll);
 $('#explore-btn').addEventListener('click',showAll);
 $('#fallback-open').addEventListener('click',showAll);
 $('#close-panel').addEventListener('click',closePanel);
 backdrop.addEventListener('click',closePanel);
 $('#reset-view').addEventListener('click',()=>{world?.reset();closePanel();history.replaceState(null,'','#accueil');});
 $('#home-link').addEventListener('click',e=>{e.preventDefault();world?.reset();closePanel();history.replaceState(null,'','#accueil');});
 $('#time-select').addEventListener('change',updateEnvironment);
 $('#season-select').addEventListener('change',updateEnvironment);
 $('#search-form').addEventListener('submit',e=>{
  e.preventDefault();const q=$('#search-input').value.trim().toLocaleLowerCase('fr');if(!q){showAll();return;}
  const hits=categories.filter(c=>[c.title,c.description,c.keywords,...c.books.flat()].join(' ').toLocaleLowerCase('fr').includes(q));
  if(hits.length===1){openCategory(hits[0].id);return;}
  detailContent.innerHTML=`<span class="detail-kicker">RECHERCHE DANS LA LIBRAIRIE</span><h2>« ${esc($('#search-input').value.trim())} »</h2><p class="detail-desc">${hits.length?`${hits.length} rayon(s) correspondant à votre recherche.`:'Aucun rayon correspondant. Retrouvez tous les univers en parcourant la librairie.'}</p><div class="detail-sep"></div>${hits.map(c=>`<button class="all-category-item" type="button" data-go="${c.id}"><span class="cat-icon" style="background:${c.color}">${esc(c.emoji)}</span><span class="cat-name">${esc(c.title)}</span><span style="margin-left:auto">↗</span></button>`).join('')}`;
  detailContent.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>openCategory(el.dataset.go)));showPanel();
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&detail.classList.contains('open'))closePanel();
  if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'&&!detail.classList.contains('open')){e.preventDefault();$('#search-input').focus();}
  if(e.key==='Tab'&&detail.classList.contains('open')){
   const nodes=[...detail.querySelectorAll('a[href],button:not([disabled]),input,select')];const first=nodes[0],last=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(byId[id])openCategory(id);else if(id==='accueil')closePanel();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&$('#time-select').value==='auto')updateEnvironment();});
 setInterval(()=>{if($('#time-select').value==='auto')updateEnvironment();},60000);
}
async function start(){
 renderBookmarks();wireUI();
 try{
  if(!document.createElement('canvas').getContext('webgl2'))throw new Error('WebGL2 indisponible');
  world=createWorld(sceneEl);
  world.setCategoryHandler(openCategory);
  updateEnvironment();requestAnimationFrame(placeHotspots);
  // Show the real scene as soon as its geometry has been assembled.
  requestAnimationFrame(()=>$('#loading').classList.add('done'));
  const hash=location.hash.replace('#','');if(byId[hash])openCategory(hash);
 }catch(e){
  console.error('La scène WebGL ne peut pas démarrer :',e);
  $('#loading').classList.add('done');$('#fallback').hidden=false;
  toast('Mode léger activé : explorez les rayons sans la 3D.');
 }
}
start();