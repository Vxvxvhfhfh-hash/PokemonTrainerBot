# Bot WhatsApp Pokémon

Un bot WhatsApp pour jeu de cartes Pokémon avec interface d'administration moderne.

## Fonctionnalités

- **Bot WhatsApp** : Commandes "new dresseur" et "pavé" pour enregistrer des joueurs et afficher les interfaces de duel
- **Interface d'administration** : Dashboard avec statistiques temps réel, gestion des cartes, test des commandes
- **Base de données persistante** : PostgreSQL avec stockage de toutes les données
- **Déploiement flexible** : Compatible avec développement local et déploiement Vercel

## Commandes WhatsApp

### `new dresseur`
- Enregistre un nouveau dresseur dans la base de données
- Distribue automatiquement une carte Pokémon aléatoire
- Crée un profil avec numéro de téléphone

### `pavé`
- Affiche l'interface de duel formatée
- Montre les cartes disponibles du dresseur
- Génère un pavé avec règles et informations de session

## Installation locale

```bash
# Installer les dépendances
npm install

# Configurer la base de données
npm run db:push

# Démarrer en développement
npm run dev
```

## Déploiement sur Vercel

### Configuration requise

1. **Variables d'environnement** :
   - `DATABASE_URL` : URL de connexion PostgreSQL (Neon Database recommandé)
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` : Paramètres PostgreSQL

2. **Fichiers de configuration** :
   - `vercel.json` : Configuration des routes et fonctions
   - `api/index.ts` : Point d'entrée pour les fonctions serverless

### Étapes de déploiement

1. **Préparer le projet** :
   ```bash
   # Construire le projet
   npm run build
   
   # Vérifier la configuration
   ./build.sh
   ```

2. **Déployer sur Vercel** :
   ```bash
   # Installer Vercel CLI
   npm i -g vercel
   
   # Déployer
   vercel --prod
   ```

3. **Configuration des variables** :
   - Ajouter `DATABASE_URL` dans les settings Vercel
   - Configurer les variables PostgreSQL

### Différences en production

- **Service WhatsApp** : Utilise un service adapté pour Vercel (pas de Puppeteer)
- **WebSocket** : Fonctionnement limité en mode serverless
- **QR Code** : Génération simulée pour la démonstration

## Structure du projet

```
├── api/                    # Fonctions Vercel
│   └── index.ts           # Point d'entrée API
├── client/                # Application React
│   ├── src/
│   │   ├── components/    # Composants UI
│   │   ├── pages/         # Pages principales
│   │   └── lib/          # Utilitaires
├── server/                # Backend Express
│   ├── services/         # Services WhatsApp
│   │   ├── whatsapp.ts   # Service local
│   │   └── whatsapp-vercel.ts  # Service Vercel
│   ├── routes.ts         # Routes API
│   └── storage.ts        # Accès base de données
├── shared/               # Schémas partagés
│   └── schema.ts         # Définitions Drizzle
└── vercel.json          # Configuration Vercel
```

## Base de données

Le projet utilise PostgreSQL avec Drizzle ORM :

- **Trainers** : Dresseurs WhatsApp
- **Pokemon Cards** : Cartes disponibles
- **Card Distributions** : Cartes distribuées
- **Duels** : Sessions de combat
- **Bot Sessions** : États de connexion

## Développement

### Environnement local
- WhatsApp Web.js avec vrai QR code
- WebSocket temps réel
- Base de données PostgreSQL

### Environnement Vercel
- Service WhatsApp simulé
- API REST compatible serverless
- Base de données PostgreSQL (Neon)

## Support

Pour les problèmes de déploiement ou de configuration, vérifier :

1. Variables d'environnement correctement configurées
2. Base de données accessible
3. Build réussi sans erreurs
4. Configuration Vercel valide

## Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend** : Node.js, Express, Drizzle ORM
- **Base de données** : PostgreSQL (Neon Database)
- **WebSocket** : ws library pour temps réel
- **WhatsApp** : whatsapp-web.js (local) / API simulation (Vercel)
- **Déploiement** : Vercel Functions