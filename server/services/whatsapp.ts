import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { storage } from '../storage';
import { WebSocketServer } from 'ws';

export class WhatsAppService {
  private client: Client | null = null;
  private wss: WebSocketServer | null = null;
  private isReady = false;
  private qrCodeData: string | null = null;

  constructor() {
    try {
      this.client = new Client({
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.setupEventHandlers();
    } catch (error) {
      console.warn('WhatsApp client initialization failed:', error);
      this.isReady = false;
    }
  }

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
  }

  private setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('QR code généré');
      this.qrCodeData = await qrcode.toDataURL(qr);
      
      // Sauvegarder le QR code dans la base de données
      const currentSession = await storage.getCurrentBotSession();
      if (currentSession) {
        await storage.updateBotSession(currentSession.id, {
          qrCode: this.qrCodeData,
          isConnected: false
        });
      } else {
        await storage.createBotSession({
          qrCode: this.qrCodeData,
          isConnected: false
        });
      }
      
      this.broadcastUpdate({ type: 'qr_code', data: this.qrCodeData });
    });

    this.client.on('ready', async () => {
      console.log('WhatsApp bot prêt !');
      this.isReady = true;
      
      // Mettre à jour le statut de connexion
      const currentSession = await storage.getCurrentBotSession();
      if (currentSession) {
        await storage.updateBotSession(currentSession.id, {
          isConnected: true
        });
      }
      
      this.broadcastUpdate({ type: 'bot_ready', data: { isConnected: true } });
    });

    this.client.on('disconnected', async (reason) => {
      console.log('WhatsApp bot déconnecté:', reason);
      this.isReady = false;
      
      // Mettre à jour le statut de connexion
      const currentSession = await storage.getCurrentBotSession();
      if (currentSession) {
        await storage.updateBotSession(currentSession.id, {
          isConnected: false
        });
      }
      
      this.broadcastUpdate({ type: 'bot_disconnected', data: { isConnected: false, reason } });
    });

    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });
  }

  private async handleMessage(message: any) {
    const from = message.from;
    const body = message.body.trim().toLowerCase();
    
    console.log(`Message reçu de ${from}: ${body}`);
    
    // Diffuser le message reçu
    this.broadcastUpdate({ 
      type: 'message_received', 
      data: { from, body: message.body, timestamp: new Date() } 
    });

    try {
      if (body === 'new dresseur') {
        await this.handleNewTrainer(from, message);
      } else if (body === 'pavé') {
        await this.handlePaveCommand(from, message);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      await message.reply('Désolé, une erreur s\'est produite. Veuillez réessayer plus tard.');
    }
  }

  private async handleNewTrainer(from: string, message: any) {
    // Vérifier si le dresseur existe déjà
    const existingTrainer = await storage.getTrainerByPhone(from);
    if (existingTrainer) {
      await message.reply('🎯 Vous êtes déjà inscrit au Centre Pokémon ! Utilisez "pavé" pour lancer un duel.');
      return;
    }

    // Créer un nouveau dresseur
    const trainer = await storage.createTrainer({
      phoneNumber: from,
      name: null,
      isActive: true
    });

    // Obtenir une carte aléatoire
    const randomCard = await storage.getRandomPokemonCard();
    if (!randomCard) {
      await message.reply('🚫 Aucune carte disponible pour le moment. Contactez un administrateur.');
      return;
    }

    // Distribuer la carte
    await storage.createCardDistribution({
      trainerId: trainer.id,
      cardId: randomCard.id
    });

    // Répondre avec la carte
    const response = `🎉 Bienvenue au Centre Pokémon ! Voici votre première carte :

🎴 **${randomCard.name}** - Niveau ${randomCard.level}
⚡ Type: ${randomCard.type}
🌟 Rareté: ${randomCard.rarity}

${randomCard.description}

Utilisez "pavé" pour lancer un duel !`;

    await message.reply(response);
    
    // Diffuser l'activité
    this.broadcastUpdate({ 
      type: 'new_trainer', 
      data: { trainer, card: randomCard } 
    });
  }

  private async handlePaveCommand(from: string, message: any) {
    const paveText = `✧═══════[ *DUEL☮️* ]══════✧
       *🔸 GAME - MODO 🎮◻️*
*══════════════════════*
*👤 DRESSEUR 1🎴:*
                🆚
*👤 DRESSEUR 2🎴:*

*⛩️DISTANCE🔸: 6m*
*🏟️ARENA🔸:*
*🔻LATENCE: 7min🔸*
*══════════════════════*
*rules 💢 :*

*🚫: Ne pas dévaloriser le verdict d'un modérateurs sans preuve concrête sinon vous aurez une ammende et une défaite Direct de votre duel en cours.*

*⛔: Tout votre pavé ne sera pas validé si vous êtes en retard donc après 7 minute, plus les une minute de temps additionnel accordé donc 7 + 1*

*♻️: En cas d'urgence vous pouvez demander un temps morts allant jusqu'à 10min et si cela vous semble insuffisant  vous devez soit declarer forfait soit demandé au modo et a l'adversaire si vous pouvez reporté le match (un arrangement entre vous)*

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

   *🔶POKEMO UNITE 🎴🎮*

✧═══════[ *GAME🎮* ]══════✧`;

    await message.reply(paveText);
    
    // Créer un nouveau duel
    const trainer = await storage.getTrainerByPhone(from);
    if (trainer) {
      await storage.createDuel({
        trainer1Id: trainer.id,
        trainer2Id: null,
        arena: 'Arena Centrale',
        distance: '6m',
        latency: '7min',
        status: 'waiting'
      });
      
      this.broadcastUpdate({ 
        type: 'duel_created', 
        data: { trainerId: trainer.id } 
      });
    }
  }

  private broadcastUpdate(update: any) {
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(update));
        }
      });
    }
  }

  async initialize() {
    console.log('Initialisation du client WhatsApp...');
    try {
      if (this.client) {
        await this.client.initialize();
      } else {
        console.warn('Client WhatsApp non disponible - mode simulation activé');
        this.simulateQRCode();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation WhatsApp:', error);
      console.log('Mode simulation activé');
      this.simulateQRCode();
    }
  }

  private async simulateQRCode() {
    // Simulation d'un QR code pour les tests
    const fakeQRText = 'Simulation QR Code for testing';
    this.qrCodeData = await qrcode.toDataURL(fakeQRText);
    
    const currentSession = await storage.getCurrentBotSession();
    if (currentSession) {
      await storage.updateBotSession(currentSession.id, {
        qrCode: this.qrCodeData,
        isConnected: false
      });
    } else {
      await storage.createBotSession({
        qrCode: this.qrCodeData,
        isConnected: false
      });
    }
    
    this.broadcastUpdate({ type: 'qr_code', data: this.qrCodeData });
  }

  async getQRCode(): Promise<string | null> {
    const session = await storage.getCurrentBotSession();
    return session?.qrCode || this.qrCodeData;
  }

  async getConnectionStatus(): Promise<boolean> {
    const session = await storage.getCurrentBotSession();
    return session?.isConnected || this.isReady;
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      if (!this.isReady) {
        throw new Error('Bot non connecté');
      }
      
      await this.client.sendMessage(to, message);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return false;
    }
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

export const whatsappService = new WhatsAppService();
