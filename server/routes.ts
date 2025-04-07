import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import cron from "node-cron";
import { 
  insertUserSchema, 
  insertUserPreferencesSchema, 
  insertSavedArticleSchema, 
  languages, 
  categories
} from "@shared/schema";
import { 
  fetchNewsArticles, 
  refreshNews 
} from "./services/newsService";
import { 
  generateSummary 
} from "./services/groqService";
import { 
  translateArticle, 
  translateArticleToAllLanguages 
} from "./services/translationService";

// Setup scheduled news refresh tasks
let newsRefreshTask: cron.ScheduledTask;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize by fetching news articles
  setTimeout(() => {
    console.log('Refreshing news articles...');
    refreshNews()
      .then(() => console.log('Initial news fetch completed successfully'))
      .catch(err => console.error('Initial news fetch failed:', err));
    
    // Schedule hourly news refresh using cron
    // Run every hour at minute 0 (e.g., 1:00, 2:00, etc.)
    newsRefreshTask = cron.schedule('0 * * * *', async () => {
      const now = new Date();
      console.log(`Scheduled news refresh started at ${now.toISOString()}`);
      
      try {
        await refreshNews();
        console.log(`News articles refreshed successfully at ${new Date().toISOString()}`);
      } catch (err) {
        console.error('Scheduled news refresh failed:', err);
      }
    });
    
    // Also schedule a refresh every 6 hours for all categories
    cron.schedule('0 */6 * * *', async () => {
      console.log('Running comprehensive news refresh for all categories...');
      
      try {
        // Fetch news for each category
        for (const category of categories) {
          await fetchNewsArticles(category.id);
          console.log(`Refreshed news for category: ${category.name}`);
        }
        console.log('Comprehensive news refresh completed');
      } catch (err) {
        console.error('Comprehensive news refresh failed:', err);
      }
    });
  }, 1000);

  // API routes
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string || '100');
      const offset = parseInt(req.query.offset as string || '0');
      const category = (req.query.category as string) || 'general';
      const language = (req.query.language as string) || 'en';
      
      let articles = await storage.getArticles(limit, offset, category, language);
      
      // If no articles are found, fetch new ones from the API
      if (articles.length === 0) {
        await fetchNewsArticles(category, language);
        articles = await storage.getArticles(limit, offset, category, language);
      }
      
      // Process articles to generate summaries if not already present
      const processedArticles = await Promise.all(
        articles.map(async (article) => {
          if (!article.summary && article.content) {
            const summary = await generateSummary(article.content, article.title);
            await storage.updateArticle(article.id, { summary });
            return { ...article, summary };
          }
          return article;
        })
      );
      
      res.json(processedArticles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });
  
  // Get single article by ID
  app.get("/api/news/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      // Generate summary if not already present
      if (!article.summary && article.content) {
        const summary = await generateSummary(article.content, article.title);
        await storage.updateArticle(article.id, { summary });
        article.summary = summary;
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });
  
  // Search articles
  app.get("/api/news/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string || '20');
      const offset = parseInt(req.query.offset as string || '0');
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const articles = await storage.searchArticles(query, limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).json({ message: "Failed to search articles" });
    }
  });
  
  // Get article translation
  app.get("/api/news/:id/translate/:language", async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const language = req.params.language;
      
      if (!languages.find(l => l.code === language)) {
        return res.status(400).json({ message: "Unsupported language" });
      }
      
      const article = await storage.getArticleById(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const translation = await translateArticle(articleId, language);
      if (!translation) {
        return res.status(500).json({ message: "Failed to translate article" });
      }
      
      res.json(translation);
    } catch (error) {
      console.error("Error translating article:", error);
      res.status(500).json({ message: "Failed to translate article" });
    }
  });
  
  // We've removed user-related endpoints since we don't need to store user data
  
  // Add a simple preferences endpoint that doesn't require user authentication
  app.get("/api/preferences", (_req: Request, res: Response) => {
    res.json({
      preferredLanguage: "en",
      darkMode: false,
      autoPlayAudio: false
    });
  });
  
  // Get available languages
  app.get("/api/languages", (_req: Request, res: Response) => {
    res.json(languages);
  });
  
  // Get available categories
  app.get("/api/categories", (_req: Request, res: Response) => {
    res.json(categories);
  });
  
  // Clean up on server close
  httpServer.on('close', () => {
    if (newsRefreshTask) {
      newsRefreshTask.stop();
      console.log('News refresh tasks stopped');
    }
  });

  return httpServer;
}
