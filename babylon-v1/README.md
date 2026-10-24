# Library Max — Babylon.js · Prototype jouable V1

Première pièce de librairie 3D stylisée, *entièrement en géométrie 3D* : trois rayons (Fantasy & SF, Mangas, Jeunesse), étagères garnies, livres interactifs, avatar, lumières, chemins évitant les meubles, vue isométrique et immersion de rayon. Sans serveur commercial et sans faux stocks.

## Jouer

Sur GitHub Pages : `https://trexdbg.github.io/libraryapp/babylon-v1/` **après publication des fichiers** dans `/babylon-v1` sur la branche servie par Pages.

Local :

```bash
python3 -m http.server 8080
# ouvrir http://localhost:8080/ depuis ce dossier
```

Babylon.js est téléchargé via `https://cdn.babylonjs.com/babylon.js` ; Internet et WebGL sont nécessaires. Ne pas ouvrir le fichier en mode `file://`.

## Commandes

- **Clic/tap au sol** : aller vers le point cliqué (A* + collisions).
- **Clic/tap sur une étagère ou bouton rayon** : marcher jusqu'au rayon, puis passer en caméra immersive.
- **Clic/tap sur un des neuf livres en présentation** : s'en approcher et ouvrir sa fiche.
- **ZQSD / WASD / flèches** : déplacement direct avec collisions.
- **E ou Entrée** : interagir près du présentoir.
- **Échap** : fermer la fiche / revenir en isométrique.
- **Mobile** : pavé directionnel ou déplacements au tap.

## Tests

```bash
node --test tests/*.test.mjs
node --check src/main.mjs
node --check src/world.mjs
```

## Portée

Scène générée en JS pour obtenir un prototype jouable sans dépendances artistiques. Le résultat est une **base de production**, pas un décor AAA final modélisé dans Blender. Aucun prix ni stock annoncé ; visuels de couvertures purement illustratifs. Pour l'architecture cible, voir [ARCHITECTURE.md](ARCHITECTURE.md).