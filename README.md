# La Librairie des Mondes — Édition JRPG premium

Prototype jouable de village-librairie inspiré des ambiances JRPG 16 bits, avec une image **originale** de cité méditerranéenne en pixel-art, animée et rendue dans un `canvas`.

## Ce qui fonctionne

- Grande illustration optimisée WebP (~1 Mo) avec caméra qui suit le personnage, et mode mobile zoomé.
- Navigation réelle par réseau de ruelles, escaliers et ponts (26 embranchements) ; déplacement au clavier et voyage par clic vers les douze quartiers.
- Personnage pixel-art animé, 8 habitants, bulles de dialogue, repères d’entrée lumineux, effets d'eau, éclairages et particules.
- 12 boutiques/espaces visitables : chaque quartier ouvre un **intérieur pixel-art généré**, avec bibliothèque, meubles, fenêtres, luminaires, plantes et personnage mobile.
- Suggestions de lecture et recherche, liens Open Library ; pas de faux inventaire commercial.
- Heure locale + réglage manuel ; printemps, été, automne, hiver ; ambiance musicale optionnelle très légère (synthèse audio simple, sans droits tiers).
- Progression locale sauvegardée (`localStorage`), interface mobile/clavier accessible et contenu indexable.

## Démarrer

```bash
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

## Github Pages

**Settings → Pages → Build and deployment → Deploy from a branch → main → /(root).**

Le site est entièrement statique, sans build ni service côté serveur. Pas besoin de Cloudflare pour jouer.

## Direction artistique et limites

L'illustration principale est un concept art en pixel-art composité avec des sprites et animations réels. Les rues sont parcourues via un **graphe de déplacement simplifié** et non un jeu à collisions libres : cela garantit que le personnage ne traverse pas visuellement les bâtiments. Les intérieurs utilisent un petit moteur de décor procédural en pixel art, avec variantes par genre. Cette édition est une étape interactive, **pas un jeu commercial fini** : pour une fidélité absolue à chaque vue, il faudra produire un atlas de tiles et des animations dessinées spécialement pour chaque quartier. Les textes qui font partie de l'illustration principale sont intégrés à l'image ; pour pouvoir traduire et adapter l'interface à toutes les résolutions, ils devront être redessinés comme éléments UI séparés.

Aucun livre suggéré n'est garanti en stock. Aucun paiement ou retrait effectif n'est implémenté.