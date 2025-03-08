import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Game Locations table
export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'story', 'secret', 'cutscene'
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  radius: integer("radius").notNull(),
  stage: text("stage").notNull(), // 'start', '1', '2', '3', 'final'
  narrative: text("narrative"),
  itemId: text("item_id"),
  cutsceneData: json("cutscene_data")
});

export const insertLocationSchema = createInsertSchema(locations);

// Game Progress table
export const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stage: text("stage").notNull(),
  health: integer("health").notNull(),
  sanity: integer("sanity").notNull(),
  inventory: json("inventory").notNull(),
  visitedLocations: json("visited_locations").notNull(),
  discoveredSecrets: json("discovered_secrets").notNull(),
  difficulty: text("difficulty").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).omit({
  id: true,
  lastUpdated: true
});

// Highscores table
export const highscores = pgTable("highscores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stagesCompleted: integer("stages_completed").notNull(),
  artifactsFound: integer("artifacts_found").notNull(),
  finalHealth: integer("final_health").notNull(),
  finalSanity: integer("final_sanity").notNull(),
  difficulty: text("difficulty").notNull(),
  date: timestamp("date").notNull().defaultNow()
});

export const insertHighscoreSchema = createInsertSchema(highscores).omit({
  id: true,
  date: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;

export type InsertHighscore = z.infer<typeof insertHighscoreSchema>;
export type Highscore = typeof highscores.$inferSelect;
