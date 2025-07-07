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

## Déploiement Hybride (Local + Vercel)

### Architecture hybride

Cette solution combine :
- **Site web sur Vercel** : Interface d'administration déployée
- **Serveur WhatsApp local** : Bot WhatsApp avec vrai QR code

### Configuration Vercel

1. **Variables d'environnement** :
   - `DATABASE_URL` : URL de connexion PostgreSQL (Neon Database)
   - `LOCAL_WHATSAPP_URL` : URL du serveur local (ex: `http://localhost:3001`)

2. **Déploiement** :
   ```bash
   # Installer Vercel CLI
   npm i -g vercel
   
   # Déployer
   vercel --prod
   ```

### Configuration du serveur WhatsApp local

1. **Installation automatique** :
   ```bash
   # Exécuter le script d'installation
   ./setup-local-whatsapp.sh
   ```

2. **Installation manuelle** :
   ```bash
   # Installer les dépendances spécifiques
   npm install whatsapp-web.js express cors qrcode
   
   # Démarrer le serveur local
   ./start-local-bot.sh [URL_VERCEL_OPTIONNELLE]
   ```

3. **Étapes de connexion** :
   - Démarrer le serveur local : `./start-local-bot.sh`
   - Scanner le QR code qui s'affiche dans la console
   - Le bot sera connecté à WhatsApp et communiquera avec le site Vercel

### Endpoints du serveur local

- `http://localhost:3001/api/status` - Statut de connexion
- `http://localhost:3001/api/qr` - QR code actuel
- `http://localhost:3001/api/send-message` - Envoyer un message
- `http://localhost:3001/health` - Santé du serveur

### Avantages de l'architecture hybride

- **QR Code réel** : Vraie connexion WhatsApp via le serveur local
- **Interface moderne** : Dashboard déployé sur Vercel
- **Base de données cloud** : PostgreSQL accessible depuis les deux environnements
- **Évolutivité** : Interface web hautement disponible

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