# Guide de Déploiement - Bot WhatsApp Pokémon

## Vue d'ensemble

Ce projet utilise une architecture hybride pour combiner les avantages du cloud et du local :
- **Interface web** déployée sur Vercel (accessible partout)
- **Bot WhatsApp** fonctionnant en local (QR code réel)
- **Base de données** PostgreSQL sur Neon (partagée)

## Étape 1 : Déploiement Vercel

### 1.1 Préparation
```bash
# Cloner le projet
git clone [votre-repo]
cd whatsapp-pokemon-bot

# Installer les dépendances
npm install
```

### 1.2 Configuration de la base de données
1. Créer un compte sur [Neon Database](https://neon.tech)
2. Créer une nouvelle base de données
3. Noter l'URL de connexion `DATABASE_URL`

### 1.3 Déploiement sur Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 1.4 Configuration des variables d'environnement
Dans les settings Vercel, ajouter :
- `DATABASE_URL` : URL de votre base Neon
- `LOCAL_WHATSAPP_URL` : `http://localhost:3001` (pour développement)

## Étape 2 : Serveur WhatsApp Local

### 2.1 Installation automatique
```bash
# Utiliser le script d'installation
./setup-local-whatsapp.sh
```

### 2.2 Installation manuelle
```bash
# Installer les dépendances WhatsApp
npm install whatsapp-web.js express cors qrcode

# Copier le serveur local
cp local-whatsapp-server.js whatsapp-server.js
```

### 2.3 Configuration
Créer un fichier `.env.local` :
```env
LOCAL_PORT=3001
VERCEL_API_URL=https://votre-site.vercel.app
NODE_ENV=production
```

### 2.4 Démarrage
```bash
# Démarrer le serveur WhatsApp local
./start-local-bot.sh https://votre-site.vercel.app
```

## Étape 3 : Connexion WhatsApp

### 3.1 Scanner le QR Code
1. Démarrer le serveur local
2. Ouvrir WhatsApp sur votre téléphone
3. Aller dans Paramètres > Appareils liés
4. Scanner le QR code affiché dans la console

### 3.2 Vérification
- Le serveur local affichera "✅ Bot WhatsApp connecté et prêt!"
- L'interface Vercel montrera le statut "Connecté"

## Étape 4 : Test du Bot

### 4.1 Commandes WhatsApp
Envoyer à votre numéro WhatsApp :
- `new dresseur` : Créer un nouveau profil
- `pavé` : Afficher l'interface de duel

### 4.2 Interface Web
- Accéder à votre site Vercel
- Vérifier les statistiques
- Tester les commandes depuis l'interface

## Architecture des Fichiers

```
projet/
├── api/                    # Fonctions Vercel
│   └── index.ts           # Routes API serverless
├── client/                # Interface React
├── server/                # Backend Express
│   ├── services/
│   │   ├── whatsapp.ts    # Service local standard
│   │   └── whatsapp-vercel.ts # Service hybride
├── local-whatsapp-server.js # Serveur WhatsApp indépendant
├── setup-local-whatsapp.sh # Script d'installation
├── start-local-bot.sh     # Script de démarrage
└── vercel.json           # Configuration Vercel
```

## Troubleshooting

### Problème : QR Code ne s'affiche pas
- Vérifier que le serveur local est démarré
- Contrôler les logs pour les erreurs Puppeteer
- Redémarrer avec `./start-local-bot.sh`

### Problème : Site Vercel ne communique pas avec le serveur local
- Vérifier que `LOCAL_WHATSAPP_URL` est configuré
- S'assurer que le port 3001 est ouvert
- Tester l'endpoint : `http://localhost:3001/health`

### Problème : Base de données inaccessible
- Vérifier `DATABASE_URL` dans les variables Vercel
- Tester la connexion depuis le serveur local
- Utiliser `npm run db:push` pour synchroniser le schéma

## Maintenance

### Redémarrage du bot
```bash
# Arrêter le serveur local (Ctrl+C)
# Redémarrer
./start-local-bot.sh
```

### Mise à jour du site
```bash
# Déployer les changements
vercel --prod
```

### Sauvegarde des sessions WhatsApp
Le dossier `.wwebjs_auth` contient les sessions. Sauvegarder régulièrement.

## Support

- **Logs du serveur local** : Affiché dans la console
- **Logs Vercel** : Consultables dans le dashboard Vercel
- **Base de données** : Accessible via Neon Dashboard

Pour plus d'aide, consulter les logs détaillés ou les endpoints de debug.