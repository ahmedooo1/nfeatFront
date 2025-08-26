# nfeat (Front)

Ce projet est une application frontend développée avec Nuxt.js pour un restaurant. Il permet de gérer l'affichage des menus, des catégories, des commandes, et plus encore.

## Table des matières

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Scripts disponibles](#scripts-disponibles)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Introduction

Ce projet utilise Nuxt.js pour créer une application frontend dynamique et performante pour un restaurant. Il permet aux utilisateurs de naviguer facilement entre les différents menus et catégories, de passer des commandes, de consulter leur panier, etc.

## Installation

Pour installer ce projet, suivez les étapes suivantes :

1. Clonez le repository :
    ```bash
    git clone https://github.com/ahmedooo1/nfeatFront.git
    cd nfeatFront
    ```

2. Installez les dépendances avec npm ou yarn :
    ```bash
    npm install
    # ou
    yarn install
    ```

## Configuration

Assurez-vous de configurer correctement les variables d'environnement dans un fichier `.env`. Voici quelques variables importantes :

- `API_BASE_URL` : URL de base de l'API backend.

Exemple de fichier `.env` :
```dotenv
API_BASE_URL=http://localhost:8000/api
```

## Utilisation
Pour démarrer l'application en mode développement, utilisez la commande suivante :
```
npm run dev
# ou
yarn dev
```

Accédez ensuite à l'application via http://localhost:3000.

## Scripts disponibles

Voici les scripts disponibles dans ce projet :


``` npm run dev ``` : Démarre l'application en mode développement.
```npm run build``` : Construit l'application pour la production.
```npm run start``` : Démarre l'application en mode production.
```npm run generate``` : Génère un site statique prêt pour le déploiement.

## Contribuer
Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

Forkez le projet
Créez votre branche feature (```git checkout -b feature/AmazingFeature```)
Commitez vos modifications (```git commit -m 'Add some AmazingFeature'```)
Poussez à la branche (```git push origin feature/AmazingFeature```)
Ouvrez une Pull Request

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.




