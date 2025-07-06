import { 
  trainers, 
  pokemonCards, 
  cardDistributions, 
  duels, 
  botSessions,
  users,
  type Trainer, 
  type InsertTrainer,
  type PokemonCard,
  type InsertPokemonCard,
  type CardDistribution,
  type InsertCardDistribution,
  type Duel,
  type InsertDuel,
  type BotSession,
  type InsertBotSession,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trainer methods
  getTrainer(id: number): Promise<Trainer | undefined>;
  getTrainerByPhone(phoneNumber: string): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  getAllTrainers(): Promise<Trainer[]>;
  updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer | undefined>;
  
  // Pokemon card methods
  getPokemonCard(id: number): Promise<PokemonCard | undefined>;
  getAllPokemonCards(): Promise<PokemonCard[]>;
  getActivePokemonCards(): Promise<PokemonCard[]>;
  createPokemonCard(card: InsertPokemonCard): Promise<PokemonCard>;
  updatePokemonCard(id: number, card: Partial<PokemonCard>): Promise<PokemonCard | undefined>;
  deletePokemonCard(id: number): Promise<boolean>;
  getRandomPokemonCard(): Promise<PokemonCard | undefined>;
  
  // Card distribution methods
  createCardDistribution(distribution: InsertCardDistribution): Promise<CardDistribution>;
  getTrainerCards(trainerId: number): Promise<(CardDistribution & { card: PokemonCard })[]>;
  getCardDistributions(): Promise<CardDistribution[]>;
  
  // Duel methods
  createDuel(duel: InsertDuel): Promise<Duel>;
  getDuel(id: number): Promise<Duel | undefined>;
  getAllDuels(): Promise<Duel[]>;
  getActiveDuels(): Promise<Duel[]>;
  updateDuel(id: number, duel: Partial<Duel>): Promise<Duel | undefined>;
  
  // Bot session methods
  createBotSession(session: InsertBotSession): Promise<BotSession>;
  updateBotSession(id: number, session: Partial<BotSession>): Promise<BotSession | undefined>;
  getCurrentBotSession(): Promise<BotSession | undefined>;
  
  // Statistics
  getStats(): Promise<{
    activeDresseurs: number;
    cardsDistributed: number;
    activeDuels: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private trainers: Map<number, Trainer> = new Map();
  private pokemonCards: Map<number, PokemonCard> = new Map();
  private cardDistributions: Map<number, CardDistribution> = new Map();
  private duels: Map<number, Duel> = new Map();
  private botSessions: Map<number, BotSession> = new Map();
  
  private currentUserId = 1;
  private currentTrainerId = 1;
  private currentCardId = 1;
  private currentDistributionId = 1;
  private currentDuelId = 1;
  private currentSessionId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with some default Pokemon cards
    const defaultCards: InsertPokemonCard[] = [
      {
        name: "Pikachu",
        type: "Électrique",
        level: 25,
        rarity: "Commune",
        imageUrl: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Pokémon Souris électrique",
        isActive: true
      },
      {
        name: "Charizard",
        type: "Feu/Vol",
        level: 55,
        rarity: "Rare",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Pokémon Flamme",
        isActive: true
      },
      {
        name: "Blastoise",
        type: "Eau",
        level: 50,
        rarity: "Rare",
        imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Pokémon Carapace",
        isActive: true
      },
      {
        name: "Venusaur",
        type: "Plante/Poison",
        level: 48,
        rarity: "Rare",
        imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        description: "Pokémon Graine",
        isActive: true
      }
    ];

    defaultCards.forEach(card => {
      this.createPokemonCard(card);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Trainer methods
  async getTrainer(id: number): Promise<Trainer | undefined> {
    return this.trainers.get(id);
  }

  async getTrainerByPhone(phoneNumber: string): Promise<Trainer | undefined> {
    return Array.from(this.trainers.values()).find(
      (trainer) => trainer.phoneNumber === phoneNumber,
    );
  }

  async createTrainer(insertTrainer: InsertTrainer): Promise<Trainer> {
    const id = this.currentTrainerId++;
    const trainer: Trainer = { 
      id,
      phoneNumber: insertTrainer.phoneNumber,
      name: insertTrainer.name || null,
      registeredAt: new Date(),
      isActive: insertTrainer.isActive ?? true 
    };
    this.trainers.set(id, trainer);
    return trainer;
  }

  async getAllTrainers(): Promise<Trainer[]> {
    return Array.from(this.trainers.values());
  }

  async updateTrainer(id: number, updates: Partial<Trainer>): Promise<Trainer | undefined> {
    const trainer = this.trainers.get(id);
    if (!trainer) return undefined;
    
    const updatedTrainer = { ...trainer, ...updates };
    this.trainers.set(id, updatedTrainer);
    return updatedTrainer;
  }

  // Pokemon card methods
  async getPokemonCard(id: number): Promise<PokemonCard | undefined> {
    return this.pokemonCards.get(id);
  }

  async getAllPokemonCards(): Promise<PokemonCard[]> {
    return Array.from(this.pokemonCards.values());
  }

  async getActivePokemonCards(): Promise<PokemonCard[]> {
    return Array.from(this.pokemonCards.values()).filter(card => card.isActive);
  }

  async createPokemonCard(insertCard: InsertPokemonCard): Promise<PokemonCard> {
    const id = this.currentCardId++;
    const card: PokemonCard = { 
      id,
      name: insertCard.name,
      type: insertCard.type,
      level: insertCard.level,
      rarity: insertCard.rarity,
      imageUrl: insertCard.imageUrl || null,
      description: insertCard.description || null,
      isActive: insertCard.isActive ?? true
    };
    this.pokemonCards.set(id, card);
    return card;
  }

  async updatePokemonCard(id: number, updates: Partial<PokemonCard>): Promise<PokemonCard | undefined> {
    const card = this.pokemonCards.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...updates };
    this.pokemonCards.set(id, updatedCard);
    return updatedCard;
  }

  async deletePokemonCard(id: number): Promise<boolean> {
    return this.pokemonCards.delete(id);
  }

  async getRandomPokemonCard(): Promise<PokemonCard | undefined> {
    const activeCards = await this.getActivePokemonCards();
    if (activeCards.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * activeCards.length);
    return activeCards[randomIndex];
  }

  // Card distribution methods
  async createCardDistribution(insertDistribution: InsertCardDistribution): Promise<CardDistribution> {
    const id = this.currentDistributionId++;
    const distribution: CardDistribution = { 
      ...insertDistribution, 
      id, 
      distributedAt: new Date() 
    };
    this.cardDistributions.set(id, distribution);
    return distribution;
  }

  async getTrainerCards(trainerId: number): Promise<(CardDistribution & { card: PokemonCard })[]> {
    const distributions = Array.from(this.cardDistributions.values())
      .filter(dist => dist.trainerId === trainerId);
    
    const result = [];
    for (const dist of distributions) {
      const card = await this.getPokemonCard(dist.cardId);
      if (card) {
        result.push({ ...dist, card });
      }
    }
    return result;
  }

  async getCardDistributions(): Promise<CardDistribution[]> {
    return Array.from(this.cardDistributions.values());
  }

  // Duel methods
  async createDuel(insertDuel: InsertDuel): Promise<Duel> {
    const id = this.currentDuelId++;
    const duel: Duel = { 
      id,
      trainer1Id: insertDuel.trainer1Id,
      trainer2Id: insertDuel.trainer2Id || null,
      arena: insertDuel.arena || null,
      distance: insertDuel.distance || null,
      latency: insertDuel.latency || null,
      status: insertDuel.status || null,
      createdAt: new Date() 
    };
    this.duels.set(id, duel);
    return duel;
  }

  async getDuel(id: number): Promise<Duel | undefined> {
    return this.duels.get(id);
  }

  async getAllDuels(): Promise<Duel[]> {
    return Array.from(this.duels.values());
  }

  async getActiveDuels(): Promise<Duel[]> {
    return Array.from(this.duels.values()).filter(duel => duel.status === 'active');
  }

  async updateDuel(id: number, updates: Partial<Duel>): Promise<Duel | undefined> {
    const duel = this.duels.get(id);
    if (!duel) return undefined;
    
    const updatedDuel = { ...duel, ...updates };
    this.duels.set(id, updatedDuel);
    return updatedDuel;
  }

  // Bot session methods
  async createBotSession(insertSession: InsertBotSession): Promise<BotSession> {
    const id = this.currentSessionId++;
    const session: BotSession = { 
      id,
      sessionId: insertSession.sessionId || null,
      isConnected: insertSession.isConnected ?? false,
      qrCode: insertSession.qrCode || null,
      lastActivity: new Date() 
    };
    this.botSessions.set(id, session);
    return session;
  }

  async updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession | undefined> {
    const session = this.botSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates, lastActivity: new Date() };
    this.botSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getCurrentBotSession(): Promise<BotSession | undefined> {
    const sessions = Array.from(this.botSessions.values());
    return sessions.length > 0 ? sessions[sessions.length - 1] : undefined;
  }

  // Statistics
  async getStats(): Promise<{ activeDresseurs: number; cardsDistributed: number; activeDuels: number; }> {
    const activeTrainers = Array.from(this.trainers.values()).filter(t => t.isActive);
    const distributions = Array.from(this.cardDistributions.values());
    const activeDuels = Array.from(this.duels.values()).filter(d => d.status === 'active');

    return {
      activeDresseurs: activeTrainers.length,
      cardsDistributed: distributions.length,
      activeDuels: activeDuels.length
    };
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTrainer(id: number): Promise<Trainer | undefined> {
    const [trainer] = await db.select().from(trainers).where(eq(trainers.id, id));
    return trainer || undefined;
  }

  async getTrainerByPhone(phoneNumber: string): Promise<Trainer | undefined> {
    const [trainer] = await db.select().from(trainers).where(eq(trainers.phoneNumber, phoneNumber));
    return trainer || undefined;
  }

  async createTrainer(insertTrainer: InsertTrainer): Promise<Trainer> {
    const [trainer] = await db
      .insert(trainers)
      .values({
        phoneNumber: insertTrainer.phoneNumber,
        name: insertTrainer.name || null,
        isActive: insertTrainer.isActive ?? true
      })
      .returning();
    return trainer;
  }

  async getAllTrainers(): Promise<Trainer[]> {
    return await db.select().from(trainers);
  }

  async updateTrainer(id: number, updates: Partial<Trainer>): Promise<Trainer | undefined> {
    const [trainer] = await db
      .update(trainers)
      .set(updates)
      .where(eq(trainers.id, id))
      .returning();
    return trainer || undefined;
  }

  async getPokemonCard(id: number): Promise<PokemonCard | undefined> {
    const [card] = await db.select().from(pokemonCards).where(eq(pokemonCards.id, id));
    return card || undefined;
  }

  async getAllPokemonCards(): Promise<PokemonCard[]> {
    return await db.select().from(pokemonCards);
  }

  async getActivePokemonCards(): Promise<PokemonCard[]> {
    return await db.select().from(pokemonCards).where(eq(pokemonCards.isActive, true));
  }

  async createPokemonCard(insertCard: InsertPokemonCard): Promise<PokemonCard> {
    const [card] = await db
      .insert(pokemonCards)
      .values({
        name: insertCard.name,
        type: insertCard.type,
        level: insertCard.level,
        rarity: insertCard.rarity,
        imageUrl: insertCard.imageUrl || null,
        description: insertCard.description || null,
        isActive: insertCard.isActive ?? true
      })
      .returning();
    return card;
  }

  async updatePokemonCard(id: number, updates: Partial<PokemonCard>): Promise<PokemonCard | undefined> {
    const [card] = await db
      .update(pokemonCards)
      .set(updates)
      .where(eq(pokemonCards.id, id))
      .returning();
    return card || undefined;
  }

  async deletePokemonCard(id: number): Promise<boolean> {
    const result = await db.delete(pokemonCards).where(eq(pokemonCards.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getRandomPokemonCard(): Promise<PokemonCard | undefined> {
    const activeCards = await this.getActivePokemonCards();
    if (activeCards.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * activeCards.length);
    return activeCards[randomIndex];
  }

  async createCardDistribution(insertDistribution: InsertCardDistribution): Promise<CardDistribution> {
    const [distribution] = await db
      .insert(cardDistributions)
      .values(insertDistribution)
      .returning();
    return distribution;
  }

  async getTrainerCards(trainerId: number): Promise<(CardDistribution & { card: PokemonCard })[]> {
    const results = await db
      .select()
      .from(cardDistributions)
      .innerJoin(pokemonCards, eq(cardDistributions.cardId, pokemonCards.id))
      .where(eq(cardDistributions.trainerId, trainerId));
    
    return results.map(result => ({
      ...result.card_distributions,
      card: result.pokemon_cards
    }));
  }

  async getCardDistributions(): Promise<CardDistribution[]> {
    return await db.select().from(cardDistributions);
  }

  async createDuel(insertDuel: InsertDuel): Promise<Duel> {
    const [duel] = await db
      .insert(duels)
      .values({
        trainer1Id: insertDuel.trainer1Id,
        trainer2Id: insertDuel.trainer2Id || null,
        arena: insertDuel.arena || null,
        distance: insertDuel.distance || null,
        latency: insertDuel.latency || null,
        status: insertDuel.status || null
      })
      .returning();
    return duel;
  }

  async getDuel(id: number): Promise<Duel | undefined> {
    const [duel] = await db.select().from(duels).where(eq(duels.id, id));
    return duel || undefined;
  }

  async getAllDuels(): Promise<Duel[]> {
    return await db.select().from(duels);
  }

  async getActiveDuels(): Promise<Duel[]> {
    return await db.select().from(duels).where(eq(duels.status, 'active'));
  }

  async updateDuel(id: number, updates: Partial<Duel>): Promise<Duel | undefined> {
    const [duel] = await db
      .update(duels)
      .set(updates)
      .where(eq(duels.id, id))
      .returning();
    return duel || undefined;
  }

  async createBotSession(insertSession: InsertBotSession): Promise<BotSession> {
    const [session] = await db
      .insert(botSessions)
      .values({
        sessionId: insertSession.sessionId || null,
        isConnected: insertSession.isConnected ?? false,
        qrCode: insertSession.qrCode || null
      })
      .returning();
    return session;
  }

  async updateBotSession(id: number, updates: Partial<BotSession>): Promise<BotSession | undefined> {
    const [session] = await db
      .update(botSessions)
      .set({ ...updates, lastActivity: new Date() })
      .where(eq(botSessions.id, id))
      .returning();
    return session || undefined;
  }

  async getCurrentBotSession(): Promise<BotSession | undefined> {
    const [session] = await db
      .select()
      .from(botSessions)
      .orderBy(botSessions.id)
      .limit(1);
    return session || undefined;
  }

  async getStats(): Promise<{ activeDresseurs: number; cardsDistributed: number; activeDuels: number; }> {
    const activeTrainersResult = await db.select().from(trainers).where(eq(trainers.isActive, true));
    const distributionsResult = await db.select().from(cardDistributions);
    const activeDuelsResult = await db.select().from(duels).where(eq(duels.status, 'active'));

    return {
      activeDresseurs: activeTrainersResult.length,
      cardsDistributed: distributionsResult.length,
      activeDuels: activeDuelsResult.length
    };
  }
}

export const storage = new DatabaseStorage();
