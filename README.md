# Internal Tools API

API de gestion des outils internes d'une entreprise (catalogue, accès utilisateurs, suivi des coûts et de l'usage).

## Technologies

- **Langage :** TypeScript
- **Framework :** NestJS 11
- **Base de données :** PostgreSQL 15
- **ORM :** Prisma 6
- **Gestionnaire de paquets :** pnpm
- **Conteneurisation :** Docker Compose
- **Port API :** `3000` (configurable via la variable d'environnement `PORT`)

## Quick Start

### 1. Démarrer la base de données

```bash
docker compose --profile postgres up -d
```

Cette commande lance :
- **PostgreSQL** sur `localhost:5432`
- **pgAdmin** sur [http://localhost:8081](http://localhost:8081)

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer Prisma

```bash
# Générer le client Prisma
pnpm prisma generate

# Appliquer les migrations (environnement de dev)
pnpm prisma migrate dev

```

### 4. Lancer le serveur

```bash
# Mode développement (watch)
pnpm start:dev

# Mode production
pnpm build && pnpm start:prod
```

### 5. Accéder à l'API

- **API :** [http://localhost:3000](http://localhost:3000)
- **Documentation :** à venir (Swagger/OpenAPI non encore implémenté)

## Configuration

- Les variables d'environnement sont définies dans `.env` (voir `.env.local` pour un exemple).
- Variables principales attendues :
  - `PORT` : port d'écoute de l'API
  - `DATABASE_URL` : chaîne de connexion PostgreSQL utilisée par Prisma
  - `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` : configuration du conteneur PostgreSQL
  - `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`, `PGADMIN_PORT` : configuration de pgAdmin

## Tests

```bash
# Tests unitaires
pnpm test

# Tests unitaires en watch
pnpm test:watch

# Couverture
pnpm test:cov

# Tests end-to-end
pnpm test:e2e
```

## Architecture

### Choix techniques

- **NestJS** pour sa structure modulaire, son système d'injection de dépendances et son écosystème adapté aux API d'entreprise.
- **PostgreSQL** pour la fiabilité transactionnelle, le typage fort (enums natifs utilisés dans le schéma) et les contraintes de cohérence nécessaires à la gestion d'accès et au suivi des coûts.
- **Prisma** comme ORM pour un typage TypeScript de bout en bout, des migrations versionnées et un modèle de données lisible.
- **pnpm** pour la rapidité d'installation et l'économie d'espace disque.
- **Docker Compose** pour un environnement de dev reproductible (PostgreSQL + pgAdmin prêts en une commande).

### Structure du projet

Architecture **modulaire par feature** (NestJS) personnalisée :

```
src/
├── app/        # Configuration et paramétrage de l'application (bootstrap, config globale)
├── shared/     # Code partagé entre modules (utilitaires, guards, pipes, decorators, types communs)
├── modules/    # Un dossier par feature métier (tools, users, access, usage, costs, ...)
├── main.ts     # Point d'entrée de l'application
└── app.module.ts
```

Chaque module dans `modules/` encapsule sa propre logique (controller, service, DTOs, entités) afin de garder un couplage faible entre les features et de faciliter les évolutions indépendantes.

## Commandes utiles

```bash
# Arrêter les conteneurs
docker compose --profile postgres down

# Voir les logs PostgreSQL
docker compose logs -f postgres

# Linter
pnpm lint

# Formatter
pnpm format
```

## Connexion à la base

```
postgresql://dev:dev123@localhost:5432/internal_tools
```

- **pgAdmin :** [http://localhost:8081](http://localhost:8081)
- **Identifiants par défaut :** `dev / dev123`
- **Base :** `internal_tools`
