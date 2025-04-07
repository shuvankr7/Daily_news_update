import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from existing code
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// News article schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  summary: text("summary"),
  url: text("url").notNull(),
  urlToImage: text("url_to_image"),
  publishedAt: timestamp("published_at"),
  source: text("source"),
  sourceId: text("source_id"),
  category: text("category"),
  language: text("language").default("en"),
  audioUrl: text("audio_url"),
  translations: jsonb("translations")
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true
});

// Saved articles schema for user preferences
export const savedArticles = pgTable("saved_articles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow()
});

export const insertSavedArticleSchema = createInsertSchema(savedArticles).omit({
  id: true,
  savedAt: true
});

// User preferences schema
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  preferredLanguage: text("preferred_language").default("en"),
  darkMode: boolean("dark_mode").default(false),
  autoPlayAudio: boolean("auto_play_audio").default(false)
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true
});

// Define translation schema for storing translations
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  language: text("language").notNull(),
  title: text("title"),
  summary: text("summary"),
  content: text("content"),
  audioUrl: text("audio_url")
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertSavedArticle = z.infer<typeof insertSavedArticleSchema>;
export type SavedArticle = typeof savedArticles.$inferSelect;

export type InsertUserPreference = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

// Language options
export const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" }
];

// Categories
export const categories = [
  { id: "general", name: "Top Headlines", icon: "globe" },
  { id: "business", name: "Business", icon: "briefcase" },
  { id: "technology", name: "Technology", icon: "microchip" },
  { id: "health", name: "Health", icon: "heartbeat" },
  { id: "sports", name: "Sports", icon: "running" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "science", name: "Science", icon: "flask" }
];
