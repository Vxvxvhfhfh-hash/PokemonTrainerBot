#!/bin/bash

echo "🚀 Installation du serveur WhatsApp local pour le bot Pokémon"
echo "============================================================"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"

# Créer le dossier du serveur local s'il n'existe pas
mkdir -p whatsapp-local-server
cd whatsapp-local-server

# Copier le fichier de configuration package.json
cat > package.json << 'EOF'
{
  "name": "whatsapp-pokemon-bot-local",
  "version": "1.0.0",
  "description": "Serveur WhatsApp local pour le bot Pokémon",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.31.0",
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "qrcode": "^1.5.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Copier le serveur
cp ../local-whatsapp-server.js ./server.js

# Créer un fichier de configuration
cat > config.env << 'EOF'
# Configuration du serveur WhatsApp local
LOCAL_PORT=3001
VERCEL_API_URL=https://votre-site.vercel.app
NODE_ENV=production
EOF

# Créer un script de démarrage
cat > start.sh << 'EOF'
#!/bin/bash
source config.env
echo "🚀 Démarrage du serveur WhatsApp local sur le port $LOCAL_PORT"
echo "🌐 API Vercel configurée: $VERCEL_API_URL"
node server.js
EOF

chmod +x start.sh

# Instructions finales
echo ""
echo "✅ Installation terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Éditez config.env pour configurer l'URL de votre site Vercel"
echo "2. Lancez le serveur: ./start.sh"
echo "3. Scannez le QR code qui s'affichera"
echo "4. Votre bot WhatsApp sera connecté!"
echo ""
echo "🌐 Le serveur sera accessible sur: http://localhost:3001"
echo "📱 QR Code visible sur: http://localhost:3001/api/qr"
echo ""
echo "📖 Pour plus d'informations, consultez le README.md"