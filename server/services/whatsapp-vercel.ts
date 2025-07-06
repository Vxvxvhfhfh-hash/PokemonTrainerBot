import { WebSocketServer } from 'ws';
import { storage } from '../storage';
import type { Server } from 'http';

export class WhatsAppVercelService {
  private wss: WebSocketServer | null = null;
  private isReady = false;
  private simulatedQR = false;

  constructor() {
    this.initialize();
  }

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;
    console.log('WebSocket server configuré pour Vercel');
  }

  private async initialize() {
    // Simulation du service WhatsApp pour Vercel
    console.log('Initialisation du service WhatsApp adapté pour Vercel...');
    
    // Simule une connexion après 2 secondes
    setTimeout(() => {
      this.isReady = true;
      this.simulatedQR = true;
      console.log('Service WhatsApp simulé - Prêt pour Vercel');
      this.broadcastUpdate({
        type: 'ready',
        isConnected: true,
        message: 'Bot WhatsApp connecté (mode Vercel)'
      });
    }, 2000);
  }

  private async handleMessage(message: any) {
    console.log('Message reçu:', message);
    
    const body = message.body?.toLowerCase();
    const from = message.from;

    if (body === 'new dresseur') {
      await this.handleNewTrainer(from, message);
    } else if (body === 'pavé') {
      await this.handlePaveCommand(from, message);
    }
  }

  private async handleNewTrainer(from: string, message: any) {
    try {
      console.log(`Nouveau dresseur: ${from}`);
      
      // Vérifie si le dresseur existe déjà
      const existingTrainer = await storage.getTrainerByPhone(from);
      
      if (existingTrainer) {
        console.log(`Dresseur ${from} déjà existant`);
        return;
      }

      // Crée un nouveau dresseur
      const trainer = await storage.createTrainer({
        phoneNumber: from,
        name: `Dresseur ${from.slice(-4)}`,
        isActive: true
      });

      // Distribue une carte aléatoire
      const randomCard = await storage.getRandomPokemonCard();
      
      if (randomCard) {
        await storage.createCardDistribution({
          trainerId: trainer.id,
          cardId: randomCard.id
        });

        console.log(`Carte ${randomCard.name} distribuée au dresseur ${trainer.name}`);
      }

      // Broadcast update
      this.broadcastUpdate({
        type: 'new_trainer',
        trainer: trainer,
        card: randomCard
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du nouveau dresseur:', error);
    }
  }

  private async handlePaveCommand(from: string, message: any) {
    try {
      console.log(`Commande pavé demandée par: ${from}`);
      
      const trainer = await storage.getTrainerByPhone(from);
      
      if (!trainer) {
        console.log(`Dresseur ${from} non trouvé`);
        return;
      }

      // Récupère les cartes du dresseur
      const trainerCards = await storage.getTrainerCards(trainer.id);
      
      const paveMessage = this.generatePaveMessage(trainer, trainerCards);
      console.log(`Pavé généré pour ${trainer.name}:`, paveMessage);

      // Broadcast update
      this.broadcastUpdate({
        type: 'pave_command',
        trainer: trainer,
        paveMessage: paveMessage
      });

    } catch (error) {
      console.error('Erreur lors de la génération du pavé:', error);
    }
  }

  private generatePaveMessage(trainer: any, cards: any[]): string {
    const cardsList = cards.map(c => 
      `• ${c.card.name} (${c.card.type}) - Niveau ${c.card.level} - ${c.card.rarity}`
    ).join('\n');

    return `🎮 **DUEL POKÉMON** 🎮
━━━━━━━━━━━━━━━━━━━━━━━━

👤 **Dresseur:** ${trainer.name}
📱 **Contact:** ${trainer.phoneNumber}

🎯 **Cartes disponibles:**
${cardsList || '• Aucune carte disponible'}

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
  }

  private broadcastUpdate(update: any) {
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(update));
        }
      });
    }
  }

  async getQRCode(): Promise<string | null> {
    if (!this.simulatedQR) {
      return null;
    }

    // Génère un QR code simulé pour Vercel
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  async getConnectionStatus(): Promise<boolean> {
    return this.isReady;
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    console.log(`Message simulé envoyé à ${to}:`, message);
    
    // Broadcast pour les tests
    this.broadcastUpdate({
      type: 'message_sent',
      to: to,
      message: message,
      timestamp: new Date()
    });
    
    return true;
  }

  async destroy() {
    this.isReady = false;
    this.simulatedQR = false;
    console.log('Service WhatsApp Vercel arrêté');
  }

  // Méthode pour recevoir des messages via webhook (pour l'intégration future)
  async handleWebhook(data: any) {
    console.log('Webhook reçu:', data);
    await this.handleMessage(data);
  }
}

export const whatsappVercelService = new WhatsAppVercelService();