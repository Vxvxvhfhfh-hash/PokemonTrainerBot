import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { storage } from '../server/storage';
import { whatsappVercelService } from '../server/services/whatsapp-vercel';
import { 
  insertTrainerSchema, 
  insertPokemonCardSchema, 
  insertDuelSchema 
} from '../shared/schema';

const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes for Vercel

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
    const isConnected = await whatsappVercelService.getConnectionStatus();
    const qrCode = await whatsappVercelService.getQRCode();
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
    const card = await storage.updatePokemonCard(id, req.body);
    if (!card) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }
    res.json(card);
  } catch (error) {
    res.status(400).json({ error: 'Données invalides' });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deletePokemonCard(id);
    if (!success) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Test commands
app.post('/api/test/new-trainer', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }
    
    // Simulate new trainer command
    await whatsappVercelService.handleWebhook({
      from: phoneNumber,
      body: 'new dresseur'
    });
    
    res.json({ success: true, message: 'Commande "new dresseur" testée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du test de la commande' });
  }
});

app.post('/api/test/pave', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Numéro de téléphone requis' });
    }
    
    // Simulate pave command
    await whatsappVercelService.handleWebhook({
      from: phoneNumber,
      body: 'pavé'
    });
    
    res.json({ success: true, message: 'Commande "pavé" testée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du test de la commande' });
  }
});

// WhatsApp webhook (for future integration)
app.post('/api/webhook/whatsapp', async (req, res) => {
  try {
    await whatsappVercelService.handleWebhook(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}