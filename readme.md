# Liste des déclarations RGESN
Une simple page web pour lister, trier et filtrer les déclarations RGESN. 
Le tout est basé sur le fichier declarations.json.

## Structure

```
src/
  index.html          
  styles.css          
  app.js              Logique (filtres, tri, pagination, PWA)
  sw.js               Service worker
  manifest.json        Manifeste PWA
  declarations.json    Données 
```

## Développement

```bash
npm install
npm start
```
Ouvre un serveur de développement avec rechargement à chaud.

## Build de production (minifié)

```bash
npm run build
```
Génère le site optimisé (JS/CSS minifiés, etc.) dans `dist/`.

## Licence

Code sous licence [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).
Dépôt source : https://github.com/ldevernay/liste_rgesn