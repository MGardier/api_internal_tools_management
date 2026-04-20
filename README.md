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
npx prisma db pull    # regénère schema.prisma depuis la DB

npx prisma generate   # regénère le client typé
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


## Source de vérité du schéma

La source de vérité du schéma de base de données est le script SQL (`init.sql`), et non le schéma Prisma. Prisma est utilisé comme query builder typé et reste synchronisé via introspection :

```bash
npx prisma db pull    # regénère schema.prisma depuis la DB
npx prisma generate   # regénère le client typé
```

Aucune commande `prisma migrate` n'est utilisée — toute modification du schéma se fait d'abord dans `init.sql`, puis par ré-introspection.

**Raison :** la configuration Docker et `init.sql` font partie de l'environnement de test fourni. Garder le SQL comme source de vérité respecte ce livrable, évite de réécrire les données de seed dans un format natif Prisma, et rend le workflow explicite (modification SQL → introspection → regénération du client).

## Écarts entre le schéma et le CDC

Le fichier `init.sql` fourni diverge du CDC sur quatre points. Le script original est conservé sous le nom `init.old.sql` à titre de référence ; la version active utilisée par Docker est `init.sql`.

Les écarts sont traités selon leur nature :

- **Règles métier** (contraintes d'intégrité explicitement demandées par le CDC) : appliquées au niveau de la base de données. La DB est le garant ultime de la cohérence des données, indépendamment de la couche API ou de tout client futur.
- **Valeurs dérivées** (champs de réponse qui peuvent être calculés à partir d'autres données) : calculés à la volée dans l'application. Les stocker imposerait une synchronisation sans valeur métier ajoutée.

### 1. `tools.name` — UNIQUE (Règle métier)

**CDC :** le nom doit être unique
**DB originale :** aucune contrainte d'unicité
**Catégorie :** Règle métier (intégrité des données)

Le CDC exige l'unicité de `name`, mais le schéma original ne l'impose pas. Autoriser des noms d'outils en doublon fragmenterait le reporting, perturberait les utilisateurs finaux, et casserait l'hypothèse implicite qu'un outil peut être identifié par son nom dans les échanges ou la documentation.

Comme il s'agit d'une règle d'intégrité explicite, elle doit être garantie au niveau de la base de données.

**Décision :** contrainte `UNIQUE` ajoutée sur `tools.name` dans `init.sql`.

Une validation applicative est également conservée dans le service : un contrôle pré-insertion renvoie un `409 Conflict` propre avec un message clair, plutôt que de laisser Prisma remonter une erreur brute `P2002` (violation de contrainte d'unicité).

### 2. `tools.vendor` — NOT NULL (Règle métier)

**CDC :** le champ vendor est obligatoire
**DB originale :** la colonne est nullable
**Catégorie :** Règle métier (intégrité des données)

Le CDC marque `vendor` comme obligatoire, mais le schéma original autorise les valeurs NULL. Comme il s'agit d'une règle métier explicite (et non d'une valeur dérivée), la contrainte doit être garantie au niveau de la base de données pour assurer l'intégrité indépendamment de la couche API ou de toute future source de données.

**Décision :** contrainte `NOT NULL` ajoutée sur `tools.vendor` dans `init.sql`.

La validation applicative (`@IsNotEmpty()` dans `CreateToolDto`) est également conservée comme première ligne de défense — elle permet de renvoyer un `400 Bad Request` propre avec un message clair au niveau du champ, plutôt que de laisser la base de données remonter une violation de contrainte brute.

### 3. `tools.active_users_count` — non utilisé, conservé dans le schéma (Valeur dérivée)

**CDC :** la réponse inclut un nombre d'utilisateurs actifs à jour
**DB originale :** colonne dénormalisée dans `tools`
**Catégorie :** Valeur dérivée (calculable)

La colonne `tools.active_users_count` duplique une donnée qui peut être dérivée de `user_tool_access` (lignes avec `status = 'active'`). Une colonne dénormalisée de ce type impose une synchronisation — soit côté applicatif à chaque opération de grant/revoke, soit via des triggers SQL. Aucune des deux n'est implémentée dans le schéma fourni, ce qui signifie que la colonne peut silencieusement diverger de l'état réel de `user_tool_access`.

**Décision :** la colonne est ignorée par l'API. Le compteur est calculé à la volée via le `_count` de Prisma sur la relation `userToolAccesses`, filtré par `status = 'active'`. Cela garantit une valeur toujours exacte, pour un coût négligeable sur un dataset de cette taille (FK indexée sur `user_tool_access.tool_id`).

La colonne est **conservée** dans le schéma plutôt que supprimée : sa suppression élargirait le scope (contraintes CHECK, références dans `cost_tracking`) au-delà de ce que le CDC justifie. En production, elle pourrait devenir un cache synchronisé via triggers.

**Note :** si le CDC évolue pour exiger des métriques trop coûteuses à calculer en temps réel (par exemple, des compteurs historiques ou des usages pondérés), la réintroduction d'un cache synchronisé serait à reconsidérer.

### 4. `total_monthly_cost` — calculé dans l'application (Valeur dérivée)

**CDC :** la réponse inclut le coût mensuel total par outil
**DB originale :** snapshot stocké dans la table `cost_tracking`
**Catégorie :** Valeur dérivée (calculable)

Le `total_monthly_cost` peut être directement dérivé comme `monthly_cost × active_users_count`. La table `cost_tracking` existe dans le schéma mais remplit un autre rôle : c'est un **snapshot mensuel d'analytique** (couverture partielle dans le seed, destiné au reporting historique), et non une source de vérité temps réel pour des opérations CRUD.

**Décision :** `total_monthly_cost` est calculé à la volée dans la couche service, en cohérence avec le choix fait pour `active_users_count`. La table `cost_tracking` est hors scope pour cette API.

**Hypothèse :** ce calcul présume un pricing linéaire par utilisateur. Si le métier introduit des remises par volume, des paliers négociés, ou d'autres règles de tarification non linéaires, l'API devra lire depuis `cost_tracking` (ou une table de pricing dédiée) au lieu de calculer la valeur. Ce compromis est acceptable dans le scope actuel du CDC.