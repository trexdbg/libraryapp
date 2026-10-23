# La Librairie des Mondes · Riviera Edition

Scène d'exploration 3D isométrique en **Three.js** pour GitHub Pages. Accès public prévu : https://trexdbg.github.io/libraryapp/showcase-3d/

## Évolutions de cette version

- Un second module `art-direction.js` construit **de la vraie géométrie 3D** de finition : des tuiles de toiture instanciées, des volets et balcons, des arcades, des modénatures, des garde-corps, des jardinières, des guirlandes lumineuses, des étals de livres et un décor central enrichi.
- Refonte de la lumière (exposition et bloom plus retenus), fog moins chargé, caméra légèrement plus aplatie et textures existantes conservées.
- 12 zones littéraires localisables, chacune avec un panneau de démonstration ; ni prix ni stock fictifs.
- Mode « Immersion » pour masquer l'interface et juger le décor sans obstacles visuels.
- Préservation des versions précédentes dans l'historique Git et de l'application principale dans `/`.
- Aucun asset externe binaire : géométrie et textures peintes dans Canvas. La seule dépendance externe est Three.js depuis un CDN.

## Démarrer et tester

Depuis la racine du projet :

```sh
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080/showcase-3d/` après l'installation des fichiers dans ce sous-dossier. Internet est nécessaire pour télécharger les modules Three.js depuis `cdn.jsdelivr.net`. Pour un usage de production hors-ligne, envisager de figer les dépendances dans le dépôt.

## Contrôles

Glisser = tourner la caméra. Molette/pincement = zoom. Cliquer sur un rayon = vue rapprochée et sélection littéraire. Contrôles pour saisons, heure locale ou choisie, effets graphiques, immersion et plein écran.

## Portée et limites

Il s'agit d'une **itération de qualité visuelle**, pas d'un jeu AAA photoréaliste. Le principal gain est la richesse du modelé des bâtiments et du premier plan ; un rendu de niveau studio nécessiterait ensuite une phase de modélisation Blender, UV/PBR, assets artistiques, optimisation GPU et QA sur de véritables machines.

Vérifications : syntaxe JavaScript, tests de présence des fichiers et inspection du code. Un rendu final visuel n'a pas pu être capturé automatiquement dans cet environnement lorsque le CDN externe est indisponible.