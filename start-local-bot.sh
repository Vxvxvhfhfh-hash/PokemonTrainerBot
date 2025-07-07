#!/bin/bash

echo "🚀 Démarrage du Bot WhatsApp Pokémon Local"
echo "=========================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Node.js et npm détectés"

# Installer les dépendances locales si nécessaire
if [ ! -d "node_modules_local" ]; then
    echo "📦 Installation des dépendances locales..."
    npm install --prefix . whatsapp-web.js express cors qrcode nodemon
    echo "✅ Dépendances installées"
fi

# Créer le dossier de session WhatsApp si nécessaire
if [ ! -d ".wwebjs_auth" ]; then
    echo "📁 Création du dossier de session WhatsApp..."
    mkdir -p .wwebjs_auth
    echo "✅ Dossier créé"
fi

# Afficher les instructions
echo ""
echo "📋 Instructions:"
echo "1. Le serveur local va démarrer sur le port 3001"
echo "2. Un QR code sera généré pour la connexion WhatsApp"
echo "3. Scannez le QR code avec votre WhatsApp"
echo "4. Une fois connecté, le bot sera prêt à recevoir des messages"
echo ""
echo "🌐 Endpoints disponibles:"
echo "- http://localhost:3001/api/status - Statut du bot"
echo "- http://localhost:3001/api/qr - QR code actuel"
echo "- http://localhost:3001/health - Santé du serveur"
echo ""

# Définir l'URL du site Vercel si fournie
if [ ! -z "$1" ]; then
    export VERCEL_API_URL="$1"
    echo "🔗 Site Vercel configuré: $VERCEL_API_URL"
fi

# Démarrer le serveur
echo "🚀 Démarrage du serveur WhatsApp local..."
echo ""
node local-whatsapp-server.js