## Description

Backend de l'application XXX

## Installation

```bash
$ npm install
```

## Configuration de la base de données

### Prérequis

avoir un environnement : docker fonctionnelle (docker et docker-compose)

Sur mac voici une façon de faire (si vous ne pouvez pas utiliser Docker Desktop pour des questions de licence):

```bash
# Install hyperkit and minikube
brew install hyperkit
brew install minikube

# Install Docker CLI
brew install docker
brew install docker-compose

# Start minikube
minikube start

# Tell Docker CLI to talk to minikube's VM
eval $(minikube docker-env)

# Save IP to a hostname
echo "`minikube ip` docker.local" | sudo tee -a /etc/hosts > /dev/null

# Test
docker run hello-world
```

### Paramétrage des URLs

- Dupliquer le fichier `.env.run.sample` en `.env.run`, le remplir, ce fichier est utilisé pour les run local du back, cad `npm run start:dev`
- Dupliquer le fichier `.env.test.sample` en `.env.test`, le remplir, ce fichier est utilisé pour les lignes de commande de test, eg. `npm run test`
- renseigner les URLs respectives de votre base de test base de dev

### Lancer les bases de données

Vous pouvez aussi le faire manuellement si vous rencontrez des problèmes de droits sous linux avec le script `docker-compose` sous jacent

```bash
npm run db:up
```

### Lancer les migrations sur les bases de dev et tests

```bash
npm run db:update
```

### Lancer les tests d'intégration et les tests unitaires

Pour vérifier que tout marche bien

```bash
npm run test
```

```bash
npm run test:int # pour les tests d'intégration seuls
```

```bash
npm run test:unit # pour les tests unitaires seuls
```

### Stoper et détruire les bases de dev et tests

Si elle ne vous sont plus utiles, ou pour repartir de rien

```bash
npm run db:destroy
```

### Accéder à la base scalingo de dev

Il faut utiliser un tunnel SSH pour accéder via un client local la base de données scalingo
Il est nécessaire au préalable d'installer la ligne de commande Scalingo (https://doc.scalingo.com/platform/cli/start)
Il peut être également nécessaire de configurer sa clé SSH dans son compte Scalingo (https://doc.scalingo.com/platform/getting-started/setup-ssh-linux)

```bash
#Valeur de DATABASE_URL à récupérer dans l'interface web scalingo de agir-back-dev
scalingo --app agir-back-dev db-tunnel DATABASE_URL
```

## Running the app

```bash
# build project
$ npm run build

# start backend
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Convertisseur CSV => JSON pour les questions NGC

https://www.convertcsv.com/csv-to-json.htm?utm_content=cmp-true

## Assistant d'écriture de CRON

https://crontab.guru/
