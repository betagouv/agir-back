# Aides vélo

Un des _services externes_ intégrés concerne le calcul des aides vélo.
L'intégration est effectuée en récupérant le modèle de calcul de
[mesaidesvelo.fr](https://mesaidesvelo.fr/).

## Architecture

### Modélisation du domaine

Le calcul des aides vélo est modélisé en [Publicodes](https://publi.codes) dans
le paquet
[`@betagouv/aides-velo`](https://github.com/betagouv/publicodes-aides-velo). La
librairie expose une classe
[`AidesVeloEngine`](https://www.jsdocs.io/package/@betagouv/aides-velo#AidesVeloEngine)
qui permet d'abstraire le moteur Publicodes et de facilement récupérer la liste
des aides pour une situation donnée.

> [!TIP]
> Le code lié à cette partie est disponible dans le fichier
> [`./src/infrastructure/repository/aidesVelo.repository.ts`](../src/infrastructure/repository/aidesVelo.repository.ts).

### Exposition de l'API

Ce service est exposé via une API REST à l'endpoint
[`/utilisateurs/:utilisateurId/simulerAideVelo`](../src/infrastructure/api/aides.controller.ts)
avec comme entrée attendue le prix du vélo.

> [!TIP]
> La construction de la situation complète depuis les informations de
> l'utilisateurice ainsi que l'appel au calcul est effectué dans la méthode
> `simulerAideVelo` du fichier
> [`src/usecase/aides.usecase.ts`](../src/usecase/aides.usecase.ts).

## Processus de développement

### Mise à jour des aides

La mise à jour (resp. l'ajout/suppression) d'une aide se fait directement
depuis le dépôt
[`betagouv/publicodes-aides-velo`](https://github.com/betagouv/publicodes-aides-velo).

La publication d'une nouvelle version de `@betagouv/aides-velo` déclenche la CI
[dependabot](../.github/dependabot.yml) et une PR est créée pour faire une
montée de version. Reste alors à s'assurer que les changements ne sont pas
cassants et correctement testés avant de merge la PR.

### Gestion des images des institutions

Le paquet `@betagouv/aides-velo` associe pour chaque aide un lien vers l'image
du logo de l'institution proposant l'aide (voir
[`Aide`](https://www.jsdocs.io/package/@betagouv/aides-velo#Aide)). Ce lien
pointe vers le dépôt [`aides-jeune`](https://github/betagouv/aides-jeune).

**Il est donc nécessaire de télécharger les nouvelles images afin de les rendre
accessibles depuis le CMS (voir [Gestion des images](./cms.md)).**

L'association entre chaque aide et son image correspondante est faite dans le
fichier
[`src/infrastructure/data/miniatures.json`](../src/infrastructure/data/miniatures.json).
Ce fichier est généré automatiquement par le script
[`./scripts/generate-images.mjs`](../scripts/generate-images.mjs).

> [!TIP]
> Actuellement, il existe un petit script
> ([`./scripts/generate-images.mjs`](../scripts/generate-images.mjs)) JS
> permettant de télécharger les images et de les convertir au format WebP dans
> `./public/images`. Il faut ensuite les ajouter à la main dans le dossier
> [`miniatures`](https://console.cloudinary.com/pm/c-ac7daab9ad09abfa85f08b02cfc95e/media-explorer/miniatures)
> de Cloudinary.

> [!IMPORTANT]
> Un workflow automatisé devrait être mis en place à terme pour s'assurer que
> les images sont toujours à jour.
