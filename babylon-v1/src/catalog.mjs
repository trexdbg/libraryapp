// Données de démonstration : pas de stock, d'édition précise ni de couverture officielle.
export const zones = [
  {id:'fantasy', title:'Fantasy & Science-fiction', short:'Fantasy & SF', x:-12.3, accent:'#c69e76', color:'#52374d', tagline:'Par-delà les royaumes', books:[
    {id:'dune', title:'Dune', author:'Frank Herbert', initials:'D', accent:'#ba875f', note:'Déserts infinis, dynasties et destins entremêlés : une porte d’entrée majeure vers la science-fiction.'},
    {id:'hobbit', title:'Le Hobbit', author:'J. R. R. Tolkien', initials:'H', accent:'#6d8866', note:'Une aventure inattendue, un voyage et le plaisir de découvrir la fantasy classique.'},
    {id:'horde', title:'La Horde du Contrevent', author:'Alain Damasio', initials:'HC', accent:'#69869c', note:'Un roman d’imaginaire français à découvrir pour ses voix, ses rythmes et son univers.'}
  ]},
  {id:'manga', title:'Mangas', short:'Mangas', x:0, accent:'#e9a0ac', color:'#793e56', tagline:'L’appel de l’aventure', books:[
    {id:'onepiece', title:'One Piece', author:'Eiichirō Oda', initials:'OP', accent:'#be6f64', note:'Une aventure au long cours dans un monde de pirates et d’amitié.'},
    {id:'frieren', title:'Frieren', author:'Kanehito Yamada & Tsukasa Abe', initials:'F', accent:'#899e9b', note:'Une fantasy contemplative sur la mémoire, le temps et les rencontres.'},
    {id:'nausicaa', title:'Nausicaä de la Vallée du Vent', author:'Hayao Miyazaki', initials:'N', accent:'#7997a2', note:'Un univers foisonnant à la croisée du manga, de la nature et de l’imaginaire.'}
  ]},
  {id:'jeunesse', title:'Jeunesse', short:'Jeunesse', x:12.3, accent:'#d4b978', color:'#687b5d', tagline:'Grandir avec les histoires', books:[
    {id:'petitprince', title:'Le Petit Prince', author:'Antoine de Saint-Exupéry', initials:'PP', accent:'#6f92b2', note:'Un voyage poétique devenu un classique pour de nombreuses générations.'},
    {id:'matilda', title:'Matilda', author:'Roald Dahl', initials:'M', accent:'#c5787b', note:'Une héroïne passionnée de livres et une histoire pleine d’inventivité.'},
    {id:'gruffalo', title:'Le Gruffalo', author:'Julia Donaldson', initials:'G', accent:'#a08e60', note:'Une promenade malicieuse dans la forêt pour les plus jeunes lecteurs.'}
  ]}
];
export const bookById = Object.fromEntries(zones.flatMap(z=>z.books.map(b=>[b.id,{...b,zone:z}])));
export function findBookLink(book){return `https://openlibrary.org/search?q=${encodeURIComponent(`${book.title} ${book.author}`)}`;}