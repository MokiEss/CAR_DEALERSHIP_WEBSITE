# Garage Millésime Auto

Application web de consultation du stock et d’administration des véhicules du Garage Millésime Auto à Mulhouse.

## Prérequis

- Node.js et npm
- PostgreSQL
- Un compte SMTP pour l’envoi des messages du formulaire de contact

## Installation

Depuis la racine du projet, installe les dépendances du serveur et du client :

```bash
cd server
npm install

cd ../client
npm install
```

## Configuration du serveur

Crée le fichier `server/.env` à partir du modèle `server/.env.example`, puis renseigne tes propres valeurs :

```env
DATABASE_URL=postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/NOM_DE_LA_BASE
PORT=5050
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=REMPLACER_PAR_UN_HASH_BCRYPT
JWT_SECRET=REMPLACER_PAR_UN_SECRET_ALEATOIRE

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=adresse-expediteur@gmail.com
SMTP_PASS=mot-de-passe-application
CONTACT_TO=adresse-destinataire@example.com
```

Avec Gmail, `SMTP_PASS` doit être un mot de passe d’application, pas le mot de passe habituel du compte.

Ne partage pas le fichier `server/.env` et ne le commite pas. Le fichier `server/.env.example` doit uniquement contenir des valeurs fictives.

## Base de données

Crée une base PostgreSQL, puis indique ses paramètres dans `DATABASE_URL`.

Le schéma initial est dans `database/schema.sql`. Exécute-le sur la base choisie. Depuis la racine du projet, avec `psql` installé, adapte puis lance :

```bash
psql -h localhost -p 5432 -U UTILISATEUR -d NOM_DE_LA_BASE -f database/schema.sql
```

Remplace l’hôte, le port, l’utilisateur et le nom de la base par ceux de ta configuration. Si la base contient déjà des tables ou des données, vérifie son schéma avant d’appliquer des changements.

## Configuration du client

Par défaut, le client utilise `http://localhost:5050/api`. Pour utiliser une autre adresse, crée `client/.env` avec :

```env
VITE_API_URL=http://localhost:5050/api
```

## Démarrage en développement

Dans un premier terminal :

```bash
cd server
npm run dev
```

Dans un second terminal :

```bash
cd client
npm run dev
```

Ouvre ensuite l’adresse locale indiquée par Vite.

## Fonctionnalités

- Catalogue public avec recherche, filtres, tri et pagination
- Fiches détaillées avec galerie d’images
- Administration protégée pour créer, modifier et supprimer les véhicules
- Gestion des images des véhicules
- Formulaire de contact avec envoi par SMTP

## Vérifications avant publication

Depuis le dossier `client`, vérifie le build et les règles de lint :

```bash
npm run build
npm run lint
```

Teste également le catalogue, les fiches véhicules, la connexion admin, les opérations sur les véhicules et les images, ainsi que l’envoi du formulaire de contact.