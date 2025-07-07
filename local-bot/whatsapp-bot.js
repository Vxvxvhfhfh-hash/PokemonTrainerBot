const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');

class LocalWhatsAppBot {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.qrCodeData = null;
        this.app = express();
        this.setupExpress();
    }

    setupExpress() {
        this.app.use(cors());
        this.app.use(express.json());

        // Endpoint pour obtenir le QR code
        this.app.get('/qr', (req, res) => {
            res.json({ 
                qrCode: this.qrCodeData,
                isReady: this.isReady 
            });
        });

        // Endpoint pour obtenir le statut
        this.app.get('/status', (req, res) => {
            res.json({ 
                isConnected: this.isReady,
                hasQR: !!this.qrCodeData 
            });
        });

        // Endpoint pour envoyer des messages de test
        this.app.post('/send', async (req, res) => {
            try {
                const { to, message } = req.body;
                if (this.isReady && this.client) {
                    await this.client.sendMessage(to, message);
                    res.json({ success: true });
                } else {
                    res.status(400).json({ error: 'Bot non connecté' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Endpoint pour recevoir les commandes du site Vercel
        this.app.post('/webhook', async (req, res) => {
            try {
                const { from, message } = req.body;
                await this.handleMessage({ from, body: message });
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Démarrer le serveur local
        const PORT = process.env.LOCAL_BOT_PORT || 3001;
        this.app.listen(PORT, () => {
            console.log(`🤖 Bot local démarré sur le port ${PORT}`);
            console.log(`📱 QR Code disponible sur: http://localhost:${PORT}/qr`);
        });
    }

    async initialize() {
        console.log('🚀 Initialisation du bot WhatsApp local...');

        this.client = new Client({
            authStrategy: new LocalAuth(),
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

        // Génération du QR code
        this.client.on('qr', async (qr) => {
            console.log('🔗 QR Code généré');
            try {
                this.qrCodeData = await qrcode.toDataURL(qr);
                console.log('✅ QR Code converti en base64');
            } catch (error) {
                console.error('❌ Erreur génération QR:', error);
            }
        });

        // Bot prêt
        this.client.on('ready', () => {
            console.log('✅ Bot WhatsApp connecté et prêt!');
            this.isReady = true;
            this.qrCodeData = null; // Plus besoin du QR une fois connecté
        });

        // Gestion des messages
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Gestion des déconnexions
        this.client.on('disconnected', (reason) => {
            console.log('❌ Bot déconnecté:', reason);
            this.isReady = false;
            this.qrCodeData = null;
        });

        // Démarrage du client
        await this.client.initialize();
    }

    async handleMessage(message) {
        const body = message.body?.toLowerCase();
        const from = message.from;

        console.log(`📨 Message reçu de ${from}: ${body}`);

        try {
            if (body === 'new dresseur') {
                await this.handleNewTrainer(from, message);
            } else if (body === 'pavé') {
                await this.handlePaveCommand(from, message);
            }
        } catch (error) {
            console.error('❌ Erreur traitement message:', error);
        }
    }

    async handleNewTrainer(from, message) {
        console.log(`🆕 Nouveau dresseur: ${from}`);
        
        try {
            // Appel à l'API Vercel pour enregistrer le dresseur
            const response = await fetch(`${process.env.VERCEL_API_URL || 'http://localhost:5000'}/api/test/new-trainer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: from })
            });

            if (response.ok) {
                const result = await response.json();
                await this.client.sendMessage(from, 
                    `🎉 Bienvenue nouveau dresseur !\n\n` +
                    `✅ Votre profil a été créé\n` +
                    `🎴 Une carte Pokémon vous a été attribuée\n\n` +
                    `Tapez "pavé" pour voir vos informations de duel`
                );
                console.log(`✅ Dresseur ${from} enregistré avec succès`);
            } else {
                throw new Error('Erreur API');
            }
        } catch (error) {
            console.error('❌ Erreur nouveau dresseur:', error);
            await this.client.sendMessage(from, 
                `❌ Erreur lors de l'enregistrement. Veuillez réessayer.`
            );
        }
    }

    async handlePaveCommand(from, message) {
        console.log(`📋 Commande pavé: ${from}`);
        
        try {
            // Appel à l'API Vercel pour générer le pavé
            const response = await fetch(`${process.env.VERCEL_API_URL || 'http://localhost:5000'}/api/test/pave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber: from })
            });

            if (response.ok) {
                const paveMessage = `🎮 **DUEL POKÉMON** 🎮
━━━━━━━━━━━━━━━━━━━━━━━━

👤 **Dresseur:** ${from.slice(-4)}
📱 **Contact:** ${from}

🎯 **Cartes disponibles:**
• Récupération en cours...

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

                await this.client.sendMessage(from, paveMessage);
                console.log(`✅ Pavé envoyé à ${from}`);
            } else {
                throw new Error('Erreur API');
            }
        } catch (error) {
            console.error('❌ Erreur pavé:', error);
            await this.client.sendMessage(from, 
                `❌ Erreur lors de la génération du pavé. Veuillez réessayer.`
            );
        }
    }

    async destroy() {
        if (this.client) {
            await this.client.destroy();
        }
        this.isReady = false;
        console.log('🛑 Bot arrêté');
    }
}

// Démarrage du bot
const bot = new LocalWhatsAppBot();
bot.initialize().catch(console.error);

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du bot...');
    await bot.destroy();
    process.exit(0);
});

module.exports = LocalWhatsAppBot;