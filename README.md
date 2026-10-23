# La Librairie des Mondes — JRPG méditerranéen

Une carte de village-librairie jouable, dessinée en pixel art procédural original, inspirée des RPG japonais 16-bit classiques **sans réutiliser de sprites, cartes ou visuels protégés**. La direction artistique transpose notre librairie méditerranéenne en douze quartiers accessibles.

## Fonctionne sur GitHub Pages

Le projet utilise **HTML + CSS + JavaScript et Canvas 2D** : pas de compilation, backend, compte utilisateur, clé API ou moteur lourd. Les polices optionnelles sont servies par Google Fonts, avec repli système. Pas besoin de Cloudflare pour l'expérience actuelle.

Démarrage local :

```bash
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

Publication : `Settings` → `Pages` → `Deploy from a branch` → `main` → `/(root)`. URL cible : <https://trexdbg.github.io/libraryapp/>.

## Commandes

- **Flèches**, **ZQSD** ou **WASD** : déplacer le personnage.
- **Clic/tap** sur une zone libre : marcher vers cet endroit.
- **Clic/tap** sur un bâtiment ou une enseigne : ouvrir le rayon.
- **E / Entrée** : parler à un habitant proche ou entrer dans un rayon.
- **Glisser** : déplacer la caméra ; **molette** : zoom.
- Sur mobile, utiliser la croix directionnelle tactile et le bouton **E**.

## Fonctionnalités

- Carte méditerranéenne dessinée à la main par code : mer animée, arcades, bâtiments en pierre, coupole, falaises, ponts, végétation, enseignes et personnages.
- 12 rayons cliquables, découverte de quartiers mémorisée localement.
- 7 personnages non-joueurs avec dialogues.
- Éclairage selon l'heure locale du visiteur, ou matin / midi / crépuscule / nuit au choix.
- Saisons automatiques et réglages manuels. Musique douce synthétisée en option (désactivée par défaut).
- Recherche de genres, auteurs, titres ; suggestions éditoriales et liens vers Open Library.
- Aucune promesse de disponibilité commerciale : les stocks, ventes et réservations ne sont pas encore opérationnels.

## Structure

- `index.html` : page accessible, contrôles de jeu, menus.
- `css/jrpg.css` : interface rétro responsive.
- `js/jrpg-world.js` : décors, carte, façades, arbres, personnages et hitboxes.
- `js/jrpg-game.js` : déplacement, animation, caméra, jour/nuit, saisons et interactions.
- `js/jrpg-main.js` : recherche, panneau de rayons, navigation, dialogues.
- `js/data.js` : catalogue éditorial / rayons existants conservés.

**Note technique :** ce rendu RPG 16-bit utilise Canvas 2D, plutôt que la 3D Three.js abandonnée dans cette version. Cela correspond mieux à la direction esthétique demandée et évite les dépendances lourdes sur GitHub Pages. Si nécessaire, PixiJS/WebGL peut être ajouté ensuite pour des milliers de sprites ou des shaders avancés, sans changer la direction artistique.

**Prochain niveau visuel :** remplacer le pixel art procédural par des spritesheets illustrées à la main, des tilesets édités et de petites animations de personnages plus élaborées. La première version livrée est un véritable prototype jouable, pas encore un jeu complet ni une reproduction exacte du concept photoréaliste.