## Description

Backend de l'application [J'agis](https://jagis.beta.gouv.fr/), un service
d'accompagnement des citoyens dans la réduction de leur empreinte carbone.

Ce composant porte :

- la persistance des données utilisateur via la BDD Postgresql
- la majeur partie de la logique métier et data du service exposée via des APIs
  aux clients web et mobile (les mêmes APIs pour les deux)
- l'interfaçage avec les services externes (Nos gestes climat, impactCO2, pres
  de chez nous, linky, etc)

> [!NOTE]
> Pour plus d'informations sur les choix techniques, les processus de
> développement, ainsi que l'intégration avec les services externes, veuillez
> consulter la documentation dans le dossier [`./docs`](./docs).

## Pile technique.

- Language : nodejs (>=18.0.0)
- TypeScript
- [PostgreSQL](https://www.postgresql.org/) 14 en base de données
- ORM Prisma
- [NestJS](https://nestjs.com/) comme framework principale (controlers,
  injection de dépendances, ...)
- [Jest](https://jestjs.io/) pour le framework de tests
- [Publicodes](https://publi.codes) pour la modélisation/réutilisation de
  certains calculs métiers
- Infra de run : Scalingo.com

## Installation locale

```bash
$ npm install
```

## Configuration de la base de données locale

Le backend a besoin d'une instance Postgresql (v14) pour s'exécuter, également une instance pour exécuter l'ensemble des tests d'intégration

Vous êtes libre de configuer en local ces instance selon vos préférences :

- via une installation standalone de Postgresql (plus efficace en terme de ressources)
  - sous Mac https://postgresapp.com fonctionne très bien par exemple
- via docker (un fichier `docker-compose.yml` est fournit à titre d'exemple)

### Paramétrage des URLs de BDD

- Dupliquer le fichier `.env.run.sample` en `.env.run`, le remplir, ce fichier est utilisé pour les run local du back, cad `npm run start:dev`
- Dupliquer le fichier `.env.test.sample` en `.env.test`, le remplir, ce fichier est utilisé pour les lignes de commande de test, eg. `npm run test`
- renseigner les URLs respectives de votre base de test base de dev

### Lancer les bases de données

**Si vous utilisez docker**, vous avec les raccourcis suivants ;

```bash
npm run db:up
npm run db:down
```

Sinon lancer votre instance local postgresql

### Lancer les migrations sur les bases de dev et tests

Cette procédure joue l'ensemble des script SQL permettant d'avoir la dernière version du schema SQL de l'application AGIR

```bash
npm run db:update
```

### Lancer les tests d'intégration et les tests unitaires

Pour vérifier que tout marche bien

```bash
npm run test # pour tous les tests sauf ceux appelant une API externe
```

```bash
npm run test:int # pour les tests d'intégration seuls
```

```bash
npm run test:unit # pour les tests unitaires seuls
```

```bash
npm run test:api # pour les tests api seuls
```

```bash
npm run test:ext # pour les tests faisant appel à des APIs externes
```

### Accéder à la base scalingo de dev

Il faut utiliser un tunnel SSH pour accéder via un client local la base de données scalingo
Il est nécessaire au préalable d'installer la ligne de commande Scalingo (https://doc.scalingo.com/platform/cli/start)

Il peut être également nécessaire de configurer sa clé SSH dans son compte Scalingo (https://doc.scalingo.com/platform/getting-started/setup-ssh-linux)

```bash
#Valeur de DATABASE_URL à récupérer dans l'interface web scalingo de agir-back-dev
scalingo --app agir-back-dev db-tunnel DATABASE_URL
```

## Lancer l'application

```bash
# build project
$ npm run build

# start backend
$ npm run start

ou bien

# watch mode
$ npm run start:dev

```

## Assistant d'écriture de CRON

https://crontab.guru/
