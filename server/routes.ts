import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { whatsappService } from "./services/whatsapp";
import { whatsappVercelService } from "./services/whatsapp-vercel";
import { 
  insertTrainerSchema, 
  insertPokemonCardSchema, 
  insertDuelSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Determine environment and use appropriate service
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const currentService = isVercel ? whatsappVercelService : whatsappService;
  
  // Configure WhatsApp service with WebSocket
  currentService.setWebSocketServer(wss);
  
  console.log(`Environment: ${isVercel ? 'Vercel' : 'Local'} - Using ${isVercel ? 'Vercel' : 'Standard'} WhatsApp service`);

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('Nouvelle connexion WebSocket');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'get_status':
            const isConnected = await currentService.getConnectionStatus();
            ws.send(JSON.stringify({ 
              type: 'status_update', 
              data: { isConnected } 
            }));
            break;
            
          case 'get_qr_code':
            const qrCode = await currentService.getQRCode();
            ws.send(JSON.stringify({ 
              type: 'qr_code', 
              data: qrCode 
            }));
            break;
            
          case 'send_test_message':
            const success = await currentService.sendMessage(data.to, data.message);
            ws.send(JSON.stringify({ 
              type: 'message_sent', 
              data: { success } 
            }));
            break;
        }
      } catch (error) {
        console.error('Erreur WebSocket:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          data: { message: 'Erreur lors du traitement de la requête' } 
        }));
      }
    });

    ws.on('close', () => {
      console.log('Connexion WebSocket fermée');
    });
  });

  // Initialize WhatsApp service
  if (isVercel) {
    // Vercel service initializes automatically
    console.log('WhatsApp service initialized for Vercel');
  } else {
    whatsappService.initialize().catch(console.error);
  }

  // API Routes

  // Statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
  });

  // Bot status
  app.get('/api/bot/status', async (req, res) => {
    try {
      const isConnected = await currentService.getConnectionStatus();
      const qrCode = await currentService.getQRCode();
      res.json({ isConnected, qrCode });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
    }
  });

  // Trainers
  app.get('/api/trainers', async (req, res) => {
    try {
      const trainers = await storage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des dresseurs' });
    }
  });

  app.post('/api/trainers', async (req, res) => {
    try {
      const validatedData = insertTrainerSchema.parse(req.body);
      const trainer = await storage.createTrainer(validatedData);
      res.status(201).json(trainer);
    } catch (error) {
      res.status(400).json({ error: 'Données invalides' });
    }
  });

  app.get('/api/trainers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trainer = await storage.getTrainer(id);
      if (!trainer) {
        res.status(404).json({ error: 'Dresseur non trouvé' });
        return;
      }
      res.json(trainer);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération du dresseur' });
    }
  });

  // Pokemon Cards
  app.get('/api/cards', async (req, res) => {
    try {
      const cards = await storage.getAllPokemonCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des cartes' });
    }
  });

  app.post('/api/cards', async (req, res) => {
    try {
      const validatedData = insertPokemonCardSchema.parse(req.body);
      const card = await storage.createPokemonCard(validatedData);
      res.status(201).json(card);
    } catch (error) {
      res.status(400).json({ error: 'Données invalides' });
    }
  });

  app.put('/api/cards/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const card = await storage.updatePokemonCard(id, updates);
      if (!card) {
        res.status(404).json({ error: 'Carte non trouvée' });
        return;
      }
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la carte' });
    }
  });

  app.delete('/api/cards/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePokemonCard(id);
      if (!success) {
        res.status(404).json({ error: 'Carte non trouvée' });
        return;
      }
      res.json({ message: 'Carte supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de la carte' });
    }
  });

  // Card Distributions
  app.get('/api/distributions', async (req, res) => {
    try {
      const distributions = await storage.getCardDistributions();
      res.json(distributions);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des distributions' });
    }
  });

  app.get('/api/trainers/:id/cards', async (req, res) => {
    try {
      const trainerId = parseInt(req.params.id);
      const cards = await storage.getTrainerCards(trainerId);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des cartes du dresseur' });
    }
  });

  // Duels
  app.get('/api/duels', async (req, res) => {
    try {
      const duels = await storage.getAllDuels();
      res.json(duels);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des duels' });
    }
  });

  app.post('/api/duels', async (req, res) => {
    try {
      const validatedData = insertDuelSchema.parse(req.body);
      const duel = await storage.createDuel(validatedData);
      res.status(201).json(duel);
    } catch (error) {
      res.status(400).json({ error: 'Données invalides' });
    }
  });

  app.get('/api/duels/active', async (req, res) => {
    try {
      const activeDuels = await storage.getActiveDuels();
      res.json(activeDuels);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des duels actifs' });
    }
  });

  // Test commands
  app.post('/api/test/new-trainer', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        res.status(400).json({ error: 'Numéro de téléphone requis' });
        return;
      }

      // Simuler la commande "new dresseur"
      const randomCard = await storage.getRandomPokemonCard();
      if (!randomCard) {
        res.status(500).json({ error: 'Aucune carte disponible' });
        return;
      }

      const trainer = await storage.createTrainer({
        phoneNumber,
        name: null,
        isActive: true
      });

      await storage.createCardDistribution({
        trainerId: trainer.id,
        cardId: randomCard.id
      });

      res.json({ trainer, card: randomCard });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors du test de la commande' });
    }
  });

  app.get('/api/test/pave', async (req, res) => {
    try {
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

      res.json({ paveText });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors du test de la commande pavé' });
    }
  });

  return httpServer;
}
