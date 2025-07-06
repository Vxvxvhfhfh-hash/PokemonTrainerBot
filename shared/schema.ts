import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trainers = pgTable("trainers", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name"),
  registeredAt: timestamp("registered_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const pokemonCards = pgTable("pokemon_cards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  level: integer("level").notNull(),
  rarity: text("rarity").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const cardDistributions = pgTable("card_distributions", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull(),
  cardId: integer("card_id").notNull(),
  distributedAt: timestamp("distributed_at").defaultNow(),
});

export const duels = pgTable("duels", {
  id: serial("id").primaryKey(),
  trainer1Id: integer("trainer1_id").notNull(),
  trainer2Id: integer("trainer2_id"),
  arena: text("arena"),
  distance: text("distance").default("6m"),
  latency: text("latency").default("7min"),
  status: text("status").default("waiting"), // waiting, active, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const botSessions = pgTable("bot_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id"),
  isConnected: boolean("is_connected").default(false),
  qrCode: text("qr_code"),
  lastActivity: timestamp("last_activity").defaultNow(),
});

// Insert schemas
export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
  registeredAt: true,
});

export const insertPokemonCardSchema = createInsertSchema(pokemonCards).omit({
  id: true,
});

export const insertCardDistributionSchema = createInsertSchema(cardDistributions).omit({
  id: true,
});

export const insertDuelSchema = createInsertSchema(duels).omit({
  id: true,
  createdAt: true,
});

export const insertBotSessionSchema = createInsertSchema(botSessions).omit({
  id: true,
});

// Types
export type Trainer = typeof trainers.$inferSelect;
export type InsertTrainer = z.infer<typeof insertTrainerSchema>;

export type PokemonCard = typeof pokemonCards.$inferSelect;
export type InsertPokemonCard = z.infer<typeof insertPokemonCardSchema>;

export type CardDistribution = typeof cardDistributions.$inferSelect;
export type InsertCardDistribution = z.infer<typeof insertCardDistributionSchema>;

export type Duel = typeof duels.$inferSelect;
export type InsertDuel = z.infer<typeof insertDuelSchema>;

export type BotSession = typeof botSessions.$inferSelect;
export type InsertBotSession = z.infer<typeof insertBotSessionSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Relations
export const trainersRelations = relations(trainers, ({ many }) => ({
  cardDistributions: many(cardDistributions),
  duelsAsTrainer1: many(duels, { relationName: "trainer1" }),
  duelsAsTrainer2: many(duels, { relationName: "trainer2" }),
}));

export const pokemonCardsRelations = relations(pokemonCards, ({ many }) => ({
  distributions: many(cardDistributions),
}));

export const cardDistributionsRelations = relations(cardDistributions, ({ one }) => ({
  trainer: one(trainers, {
    fields: [cardDistributions.trainerId],
    references: [trainers.id],
  }),
  card: one(pokemonCards, {
    fields: [cardDistributions.cardId],
    references: [pokemonCards.id],
  }),
}));

export const duelsRelations = relations(duels, ({ one }) => ({
  trainer1: one(trainers, {
    fields: [duels.trainer1Id],
    references: [trainers.id],
    relationName: "trainer1",
  }),
  trainer2: one(trainers, {
    fields: [duels.trainer2Id],
    references: [trainers.id],
    relationName: "trainer2",
  }),
}));
