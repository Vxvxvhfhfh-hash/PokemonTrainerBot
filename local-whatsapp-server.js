#!/usr/bin/env node

/**
 * Serveur WhatsApp local pour fonctionner avec le site déployé sur Vercel
 * Ce serveur gère la connexion WhatsApp réelle et expose une API pour Vercel
 */

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.LOCAL_PORT || 3001;

// Configuration CORS pour permettre les requêtes depuis Vercel
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', /\.vercel\.app$/],
  credentials: true
}));

app.use(express.json());

// Variables globales
let client = null;
let isReady = false;
let currentQR = null;
let qrCodeDataUrl = null;

// Initialiser le client WhatsApp
function initializeWhatsApp() {
  console.log('🚀 Initialisation du client WhatsApp local...');
  
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'pokemon-bot-local'
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  // Événements du client
  client.on('qr', async (qr) => {
    console.log('📱 QR Code reçu');
    currentQR = qr;
    
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qr);
      console.log('✅ QR Code généré en data URL');
    } catch (error) {
      console.error('❌ Erreur génération QR Code:', error);
    }
  });

  client.on('ready', () => {
    console.log('✅ Client WhatsApp prêt!');
    isReady = true;
    currentQR = null;
    qrCodeDataUrl = null;
  });

  client.on('authenticated', () => {
    console.log('🔐 Client WhatsApp authentifié');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Échec d\'authentification:', msg);
    isReady = false;
  });

  client.on('disconnected', (reason) => {
    console.log('🔌 Client déconnecté:', reason);
    isReady = false;
    currentQR = null;
    qrCodeDataUrl = null;
  });

  client.on('message', async (message) => {
    await handleMessage(message);
  });

  // Initialiser
  client.initialize().catch(console.error);
}

// Gestionnaire de messages
async function handleMessage(message) {
  const body = message.body.toLowerCase().trim();
  const from = message.from;
  
  console.log(`📨 Message reçu de ${from}: ${body}`);

  try {
    if (body === 'new dresseur') {
      await handleNewTrainer(from, message);
    } else if (body === 'pavé') {
      await handlePaveCommand(from, message);
    }
  } catch (error) {
    console.error('❌ Erreur traitement message:', error);
  }
}

// Gestion nouveau dresseur
async function handleNewTrainer(from, message) {
  console.log(`🆕 Nouveau dresseur: ${from}`);
  
  // Simuler la création en base (en production, faire un appel à l'API Vercel)
  const trainerName = `Dresseur ${from.slice(-4)}`;
  const cards = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Mew', 'Alakazam'];
  const randomCard = cards[Math.floor(Math.random() * cards.length)];
  
  const responseMessage = `🎉 Bienvenue ${trainerName}!

🎴 Vous avez reçu votre première carte: **${randomCard}**

📋 Commandes disponibles:
• "pavé" - Afficher votre interface de duel
• "cartes" - Voir vos cartes
• "aide" - Liste des commandes

Bon dressage! 🚀`;

  await message.reply(responseMessage);
  console.log(`✅ Dresseur ${trainerName} enregistré avec carte ${randomCard}`);
}

// Gestion commande pavé
async function handlePaveCommand(from, message) {
  console.log(`📋 Commande pavé demandée par: ${from}`);
  
  const trainerName = `Dresseur ${from.slice(-4)}`;
  const cards = ['Pikachu (⚡ Niveau 25)', 'Charizard (🔥 Niveau 55)'];
  
  const paveMessage = `🎮 **DUEL POKÉMON** 🎮
━━━━━━━━━━━━━━━━━━━━━━━━

👤 **Dresseur:** ${trainerName}
📱 **Contact:** ${from}

🎯 **Cartes disponibles:**
${cards.map(card => `• ${card}`).join('\n')}

⚔️ **RÈGLES DU DUEL:**
• Distance max: 50km
• Latence: 7min maximum
• Arène: Sélection automatique
• Mode: Combat 1v1

🏆 **Statut:** En attente d'adversaire
📍 **Localisation:** Détection automatique

━━━━━━━━━━━━━━━━━━━━━━━━
💬 Tapez "duel [nom_dresseur]" pour défier
🔄 Tapez "pavé" pour actualiser

⏰ Session active pendant 7 minutes`;

  await message.reply(paveMessage);
  console.log(`✅ Pavé envoyé à ${trainerName}`);
}

// Routes API pour communication avec Vercel

// Statut du bot
app.get('/api/status', (req, res) => {
  res.json({
    isReady,
    hasQR: !!qrCodeDataUrl,
    timestamp: new Date().toISOString()
  });
});

// QR Code
app.get('/api/qr', (req, res) => {
  if (qrCodeDataUrl) {
    res.json({
      qrCode: qrCodeDataUrl,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      error: 'QR Code non disponible',
      isReady
    });
  }
});

// Envoyer un message de test
app.post('/api/send-message', async (req, res) => {
  const { to, message } = req.body;
  
  if (!isReady) {
    return res.status(503).json({ error: 'WhatsApp non connecté' });
  }
  
  if (!to || !message) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  try {
    const chatId = to.includes('@') ? to : `${to}@c.us`;
    await client.sendMessage(chatId, message);
    res.json({ success: true, message: 'Message envoyé' });
    console.log(`✅ Message envoyé à ${to}: ${message}`);
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({ error: 'Erreur envoi message' });
  }
});

// Test des commandes
app.post('/api/test/new-trainer', async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Numéro requis' });
  }
  
  // Simuler la réception du message
  const mockMessage = {
    from: phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`,
    body: 'new dresseur',
    reply: async (text) => {
      console.log(`🤖 Réponse simulée à ${phoneNumber}: ${text}`);
      return { success: true };
    }
  };
  
  await handleNewTrainer(mockMessage.from, mockMessage);
  res.json({ success: true, message: 'Commande testée' });
});

app.post('/api/test/pave', async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Numéro requis' });
  }
  
  // Simuler la réception du message
  const mockMessage = {
    from: phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@c.us`,
    body: 'pavé',
    reply: async (text) => {
      console.log(`🤖 Réponse simulée à ${phoneNumber}: ${text}`);
      return { success: true };
    }
  };
  
  await handlePaveCommand(mockMessage.from, mockMessage);
  res.json({ success: true, message: 'Pavé généré' });
});

// Redémarrer le client
app.post('/api/restart', async (req, res) => {
  try {
    if (client) {
      await client.destroy();
    }
    isReady = false;
    currentQR = null;
    qrCodeDataUrl = null;
    
    setTimeout(() => {
      initializeWhatsApp();
    }, 2000);
    
    res.json({ success: true, message: 'Redémarrage en cours...' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur redémarrage' });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsapp: isReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🌐 Serveur WhatsApp local démarré sur le port ${PORT}`);
  console.log(`📡 API accessible sur http://localhost:${PORT}`);
  console.log(`🔗 Configurez votre site Vercel pour pointer vers cette URL locale`);
  
  // Initialiser WhatsApp
  initializeWhatsApp();
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

module.exports = { app, initializeWhatsApp };