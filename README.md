# La Librairie des Mondes · WebGL

Un village-librairie méditerranéen **réellement modélisé en Three.js**, compatible GitHub Pages. Il ne s'agit pas d'un panorama ou d'une image animée : les bâtiments, arches, toits, livres des vitrines, jardins, falaises, dôme, mer et passerelles sont des objets 3D dans une scène WebGL.

## Lancer le site

Le projet est **statique et sans compilation**. Ouvrir avec un serveur local (ne pas ouvrir `index.html` en `file://`) :

```bash
python3 -m http.server 8000
```

Puis http://localhost:8000. Les modules Three.js sont chargés depuis un CDN (connexion Internet requise).

## Déployer sur GitHub Pages

1. Sur le dépôt, ouvrir **Settings → Pages**.
2. **Build and deployment → Deploy from a branch**.
3. Sélectionner **main** puis **/(root)** et enregistrer.
4. Adresse attendue : https://trexdbg.github.io/libraryapp/

Les chemins sont tous relatifs, y compris sur `/libraryapp/`. Le fichier `.nojekyll` évite le traitement Jekyll. Aucun serveur, Cloudflare ou clé API n'est nécessaire pour la scène actuelle.

## Fonctionnalités

- Exploration 3D par souris, tactile, zoom et clic sur les bâtiments.
- 12 quartiers de livres ou de services avec étiquettes flottantes, recherche et panneaux accessibles.
- Éclairage automatique par heure **locale du visiteur** (aube, jour, coucher du soleil, nuit), modifiable manuellement.
- Saisons automatiques selon **la date locale du visiteur** ou sélection manuelle (neige en hiver, feuillages adaptés).
- Géométrie et matériaux procéduraux (dont toits et vitrines), pas de dépendances à des modèles 3D externes.
- Mode de secours avec liste complète des rayons si WebGL2 n'est pas disponible.
- Suggestions littéraires, liens vers Open Library (ces titres ne sont **pas** un inventaire).
- Interface responsive et navigation clavier, prise en compte de `prefers-reduced-motion`.

## Structure

- `index.html` — contenu indexable, navigation et référencement.
- `css/style.css` — styles de l'interface.
- `js/world.js` — scène Three.js, bâtiments, matériaux, navigation, météo visuelle.
- `js/data.js` — catégories, positions 3D, suggestions littéraires.
- `js/main.js` — interface, recherche, menus, interactions.

## Prochaines étapes

Cette première version est une **base 3D navigable** et non une copie photoréaliste de l'illustration. Pour tendre vers le niveau de détail du concept visuel : remplacer progressivement les volumes procéduraux par des modèles `.glb` optimisés issus de Blender, ajouter des LOD, des textures compressées et des animations personnalisées.

Les fiches de livres servent d'exemples. Il faudra connecter le vrai catalogue (prix, stock, couvertures, paniers, commandes), respecter les droits des couvertures et mettre en place le service de retrait avant d'annoncer une disponibilité commerciale.

L'hébergement statique sur GitHub Pages suffit pour la **visualisation**. Une couche serveur Cloudflare Workers/D1 ou un autre backend pourra être ajoutée plus tard pour les comptes, paiements, stocks, synchronisation et commandes.