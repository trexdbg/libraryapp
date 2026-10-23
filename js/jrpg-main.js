import { categories, byId, bookSearchUrl, seasonForMonth } from './data.js';
import { LibraryGame, } from './jrpg-game.js';
import { districts } from './jrpg-world.js';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let game=null, lastFocus=null,toastTimer=null,audio=null,audioTimer=null,playing=false;
const drawer=$('#drawer'),shade=$('#drawer-shade'),content=$('#drawer-content'),dialogue=$('#dialogue');
const icons=['✦','❀','☼','◈','✧','♡','⌕','♜','❃','✎','☷','▣'];
const colors=['#607c4b','#aa6677','#bd8358','#71837a','#4f7190','#b46779','#8f614b','#99835e','#658d7d','#ad855f','#71857d','#468081'];
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3600)}
function updateQuest(){const n=game?.visited.size||0;$('#quest-count').textContent=`${n} / 12`;}
function showDrawer(){lastFocus=document.activeElement;shade.hidden=false;drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#drawer-close').focus({preventScroll:true});}
function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');shade.hidden=true;document.body.style.overflow='';lastFocus?.focus?.({preventScroll:true})}
function writeCategory(id){const c=byId[id];if(!c)return;
 const i=categories.indexOf(c),d=districts.find(x=>x.id===id);
 const books=c.books.length?`<h3 class="book-heading">✦ QUELQUES LECTURES POUR COMMENCER</h3>${c.books.map(([title,author],j)=>`<div class="book-row"><div class="book-cover" style="--cover:${['#647f71','#ae7960','#6f8196','#ad8494','#8b7567'][j%5]}">${icons[(i+j)%icons.length]}</div><div><strong>${esc(title)}</strong><small>${esc(author)}</small></div><a href="${esc(bookSearchUrl(title,author))}" target="_blank" rel="noopener noreferrer" aria-label="Chercher ${esc(title)} sur Open Library">↗</a></div>`).join('')}<p class="fine-print">Suggestions éditoriales, sans information de stock ni réservation. Les liens mènent à une recherche sur Open Library.</p>`:'<p class="fine-print">Ce quartier présente notre futur service. Le catalogue, les commandes et les stocks seront ajoutés ultérieurement.</p>';
 content.innerHTML=`<div class="label">✦ QUARTIER ${String(i+1).padStart(2,'0')} / 12 · LES CHRONIQUES DE LA LIBRAIRIE</div><div class="tile-glyph" style="--tile:${colors[i]};width:62px;height:62px;font-size:30px;margin-top:21px">${icons[i]}</div><h2 id="drawer-title">${esc(c.title)}</h2><p class="lede">${esc(c.description)}</p><hr class="drawer-rule">${books}<button type="button" class="primary" id="back-to-village">◀ REPRENDRE L'EXPLORATION</button>`;
 $('#back-to-village').addEventListener('click',closeDrawer);showDrawer();history.replaceState(null,'',`#${id}`);updateQuest();
 if(d)$('#location-title').textContent=c.title;
}
function openCategory(id,n){game?.visited.add(id);try{localStorage.setItem('librairie-des-mondes-visited',JSON.stringify([...game.visited]))}catch{}writeCategory(id);game?.focus(id);updateQuest()}
function categoryMenu(){
 content.innerHTML=`<div class="label">✦ LA CARTE DES DOUZE MONDES</div><h2 id="drawer-title">Choisissez votre aventure</h2><p class="lede">Douze quartiers, douze façons de découvrir les livres. Touchez un rayon pour y voyager.</p><hr class="drawer-rule">${categories.map((c,i)=>`<button type="button" class="category-tile" data-id="${c.id}"><span class="tile-glyph" style="--tile:${colors[i]}">${icons[i]}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.tagline)}</small></span><span class="arrow">${game?.visited.has(c.id)?'✓':'↗'}</span></button>`).join('')}`;
 content.querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>openCategory(el.dataset.id)));showDrawer();
}
function searchMenu(){
 content.innerHTML=`<div class="label">✦ ARCHIVES DE LA LIBRAIRIE</div><h2 id="drawer-title">Un livre en tête ?</h2><p class="lede">Recherche un genre, un titre ou un auteur parmi nos suggestions.</p><label class="sr-only" for="drawer-search">Texte recherché</label><input id="drawer-search" class="search-box" type="search" autocomplete="off" placeholder="Roman, manga, Tolkien…"><div id="search-results"></div>`;
 showDrawer();const input=$('#drawer-search'),results=$('#search-results');input.focus({preventScroll:true});
 function render(q){const term=q.toLocaleLowerCase('fr').trim(),found=categories.filter(c=>!term||[c.title,c.description,c.keywords,...c.books.flat()].join(' ').toLocaleLowerCase('fr').includes(term));
 results.innerHTML=`<hr class="drawer-rule"><span class="label">${found.length} QUARTIER(S) À DÉCOUVRIR</span>${found.map(c=>`<button type="button" class="search-result" data-id="${c.id}"><span class="tile-glyph" style="--tile:${colors[categories.indexOf(c)]}">${icons[categories.indexOf(c)]}</span><span><strong>${esc(c.title)}</strong><small>${esc(c.tagline)}</small></span><span class="arrow">↗</span></button>`).join('')}${found.length?'':'<p class="lede">Aucun quartier correspondant. Essaie un autre mot ou explore la carte.</p>'}`;
 results.querySelectorAll('[data-id]').forEach(el=>el.addEventListener('click',()=>openCategory(el.dataset.id)));
 }input.addEventListener('input',()=>render(input.value));render('');
}
function openDialogue(n){if(!n)return;$('#dialogue-portrait').textContent=n.icon||'✦';$('#dialogue-name').textContent=n.name.toUpperCase();$('#dialogue-text').textContent=n.line;dialogue.hidden=false;}
function closeDialogue(){dialogue.hidden=true;}
function applyEnvironment(){if(!game)return;game.setHour($('#time-select').value);game.setSeason($('#season-select').value)}
function makeMusic(){if(!audio){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext){toast('Audio non pris en charge sur ce navigateur.');return;}audio=new AudioContext()}audio.resume();let seq=0;function note(){if(!playing||!audio)return;let freq=[392,440,523,587,523,440,392,330,349,392,440,392][seq%12];seq++;let o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.025,audio.currentTime+.025);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.43);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.46)}note();audioTimer=setInterval(note,620)}
function toggleSound(){playing=!playing;$('#sound-toggle').setAttribute('aria-pressed',String(playing));$('#sound-toggle').title=playing?'Couper la musique':'Activer les sons d’ambiance';if(playing)makeMusic();else{clearInterval(audioTimer);audio?.suspend?.()}}
function wire(){
 $('#start-adventure').addEventListener('click',()=>{$('#welcome').hidden=true;$('#game').focus({preventScroll:true});toast('Bonne exploration ! Flèches, ZQSD ou clic pour avancer.');const hash=location.hash.slice(1);if(byId[hash])openCategory(hash)});
 $('#map-toggle').addEventListener('click',categoryMenu);$('#search-toggle').addEventListener('click',searchMenu);
 $('#drawer-close').addEventListener('click',closeDrawer);shade.addEventListener('click',closeDrawer);
 $('#brand').addEventListener('click',e=>{e.preventDefault();closeDrawer();game?.recenter();history.replaceState(null,'','#accueil')});
 $('#recenter').addEventListener('click',()=>game?.recenter());$('#time-select').addEventListener('change',applyEnvironment);$('#season-select').addEventListener('change',applyEnvironment);
 $('#sound-toggle').addEventListener('click',toggleSound);
 dialogue.addEventListener('click',closeDialogue);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!dialogue.hidden){closeDialogue();return}if(drawer.classList.contains('open')){closeDrawer();return}}
  if(!dialogue.hidden&&['Enter','e','E',' '].includes(e.key)){e.preventDefault();e.stopPropagation();closeDialogue();return}
  if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'&&!drawer.classList.contains('open')){e.preventDefault();searchMenu()}
  if(e.key==='Tab'&&drawer.classList.contains('open')){let nodes=[...drawer.querySelectorAll('button:not([disabled]),a[href],input')];let first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 },true);
 document.querySelectorAll('.touch-pad button').forEach(b=>{const dir={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[b.dataset.dir];
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);game?.setDirection(dir,true)});
  for(let type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>game?.setDirection(dir,false));
 });
 $('#mobile-interact').addEventListener('click',()=>game?.interact());
 $('#district-links').innerHTML=categories.map(c=>`<a href="#${c.id}" data-id="${c.id}">${esc(c.title)} ↗</a>`).join('');
 $('#district-links').addEventListener('click',e=>{const a=e.target.closest('[data-id]');if(a){e.preventDefault();openCategory(a.dataset.id)}});
 window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(byId[id]&&$('#welcome').hidden)openCategory(id);else if(id==='accueil')closeDrawer()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&$('#time-select').value==='auto')applyEnvironment()});setInterval(()=>{if($('#time-select').value==='auto')applyEnvironment()},60_000);
}
function init(){wire();try{game=new LibraryGame($('#game'),{onDistrict:openCategory,onTalk:openDialogue,onLocation:name=>{$('#location-title').textContent=name},onToast:toast});game.onHover=(d,p)=>{const t=$('#game-tooltip');if(d){t.hidden=false;t.textContent=`↗ ${byId[d.id]?.title||d.label}`;t.style.left=`${Math.min(p.x+15,window.innerWidth-165)}px`;t.style.top=`${Math.max(p.y-30,75)}px`;}else t.hidden=true;};updateQuest()}catch(err){console.error('La carte du village ne peut pas se lancer',err);$('#welcome').hidden=true;toast('Affichage limité. Les douze rayons restent accessibles.');categoryMenu()}}
init();