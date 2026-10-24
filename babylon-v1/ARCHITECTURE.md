# Library Max · Architecture cible

## Objet

Une application web hybride : **exploration 3D** de la librairie + **catalogue HTML indexable**. La 3D n'est pas une source de vérité pour le stock. Les scènes consomment les mêmes fiches que la recherche et le futur retrait en magasin.

```
             Next.js / React (future app shell)
    ┌────────────────┴────────────────┐
    │ Pages HTML indexables          │ Monde Babylon.js
    │ Catalogue · Recherche · SEO     │ Vue iso / rayon / interactions
    └────────────────┬────────────────┘
                     │
          API catalogue / recherche
                     │
          PostgreSQL / Supabase
                     │
          livres · éditions (ISBN) · emplacements 3D
          partenaires affiliés · stocks (plus tard)
```

## Prototype v1 (ici)

- **Pure web statique compatible GitHub Pages.** `index.html` + CSS + modules JavaScript, chargement Babylon depuis le CDN officiel. Pas de build ni serveur applicatif.
- `src/world.mjs` : géométrie réellement 3D, éclairage, personnage, étagères, objets interactifs, volumes de collision.
- `src/navigation.mjs` : A* et grille de zones praticables. Le rayon du personnage est inclus dans les tests d'obstacle. **Ce n'est pas encore un NavMesh Recast** ; une interface `path(from,to)` permet de le remplacer ensuite.
- `src/main.mjs` : commandes, animation et modes de caméra. La vue isométrique est une orthographique ; le rayon est une perspective, dans le **même espace 3D**.
- `src/catalog.mjs` : sélections de démonstration, pas de prix, de stock ni de couvertures officielles. Liens de recherche OpenLibrary uniquement.
- `tests/navigation.test.mjs` : vérification des collisions et itinéraires.

## Évolution production

1. Conserver les URL de détail livres en React/Next.js et garantir des pages SSR/SSG avec données structurées Book/Product seulement après validation des informations.
2. Remplacer la géométrie procédurale par un ensemble modulaire de décors Blender en **glTF/GLB**, avec LOD, textures compressées, atlases PBR, matériaux cohérents et instances.
3. Utiliser `@babylonjs/core` et importation via Vite/Next.js dans un bundle **versionné** : le CDN courant est réservé à la démo.
4. Passer de la grille A* à Recast / Detour sur navmesh exporté (surtout pour les étages, rampes et passages irréguliers). Ajouter animations d'un avatar GLB riggé.
5. Stocker chaque ouvrage sous `book_id`, `isbn13`, `title`, `authors`, `cover_url` sous licence/permission adaptée, `sector_id`, `shelf_id`, `slot_index` et `world_anchor` ; synchronisation des disponibilités d'un système de caisse/ERP.
6. Introduire un véritable panier/réservation uniquement après service commercial opérationnel et gestion des paiements/stock sécurisée sur le serveur.

## Cibles de performance

- Ordinateur : 60 FPS visés sur matériel récent. Mobile milieu de gamme : 30 FPS visés. **Non mesurés sur les appareils cibles.**
- Démarrage : chargement progressif des assets, scènes partielles, plafonnement pixel ratio ; prévoir un fallback catalogue 2D.
- Utilisabilité : le moteur 3D est optionnel ; le catalogue reste utilisable avec clavier, lecteurs d'écran et sans WebGL.

## Définition de « jouable » en v1

- Un personnage se déplace à l'intérieur des limites et contourne les volumes occupés.
- Clic sol = destination, clic rayon = chemin jusqu'à l'accès, bouton "Dans le rayon" = caméra rapprochée.
- Clic livre = déplacement au présentoir puis fiche de découverte.
- ZQSD / WASD / flèches et contrôles tactiles ; échappement et fermeture accessible de la fiche.

## Éléments non livrés

Aucun backend, vrai stock, transaction, ISBN vérifié, modèle Blender final, couverture officielle, audio, QA mobile physique ou analytics ne sont revendiqués.