# La Librairie des Mondes — JRPG V4

Version jouable, mise à jour graphique et navigation, pour GitHub Pages : https://trexdbg.github.io/libraryapp/

## V4 — nouveautés

- **Spritesheets dessinés pixel par pixel** : 10 modèles de personnages (héros et PNJ), 4 directions et 4 images de marche, dans `assets/characters.png`. Le héros est réduit selon son emplacement dans la perspective du décor pour se rapprocher de la taille des personnages peints.
- **Déplacement guidé** : graphe de plus de 50 points de marche positionnés sur les escaliers, les arcades, les quais, les ponts et les terrasses. Calcul du plus court itinéraire et animation des pas. Les clics sur un rayon n'envoient plus le personnage tout droit à travers les bâtiments.
- **Cadrage du décor** : bascule « Vue générale / Suivi héros », redimensionnement sans déformation de l'illustration, fond raccord lorsqu'un ratio d'écran laisse des marges, caméra confinée à la carte.
- **Intérieurs thématiques** : enrichissements dédiés aux rayons manga, jeunesse, polar, fantasy/SF, romance, histoire, café, papeterie, etc. avec des éléments et lumières spécifiques.
- **Ambiances** : éclairage local selon l'heure, lanternes la nuit, saisons et particules facultatives.
- **12 quartiers** et suggestions éditoriales conservés, interactions avec les habitants, exploration mobile et clavier, progression sauvegardée.

## Limites et intentions

La ville principale demeure une **illustration pixel-art intégrée dans un moteur Canvas 2D**, pas un monde 3D ni une tilemap complètement modélisée. Les déplacements empruntent les chemins visibles autant que le décor peint le permet, mais l'image ne fournit pas de calque d'occlusion ni de géométrie fiable pour chaque marche. Pour atteindre le niveau d'un JRPG commercial, la prochaine étape est un vrai tileset segmenté, des bâtiments avec masques avant-plan/arrière-plan et des sprites d'animations dessinés à la main.

Les livres cités sont des **suggestions**, pas un catalogue de stock, ni une offre de commandes opérationnelle.

## Exécuter localement

```bash
python3 -m http.server 8000
```

Ouvrir `http://localhost:8000` (ne pas ouvrir `index.html` avec `file://`). Pas de Node, bundler, backend ou CDN indispensable à l'exécution.

## Publication GitHub Pages

Dans **Settings → Pages**, sélectionner **Deploy from a branch**, `main`, `/(root)`.

## Contrôles

- Flèches et ZQSD : se déplacer le long des routes
- Clic dans le monde : rejoindre le point de promenade le plus proche
- Clic sur un quartier ou menu « Quartiers » : atteindre son entrée
- E / Entrée : entrer dans le quartier ou lire les livres dans une salle
- Échap : quitter l'intérieur ; « Vue générale » pour afficher tout le panorama
- Sur mobile : contrôles tactiles ou navigation par clic

Pour diagnostiquer le réseau de chemins : ajouter `?debugPaths` à l'URL (overlay réservée au développement).