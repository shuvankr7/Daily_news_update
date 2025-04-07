import { 
  Article, InsertArticle, 
  User, InsertUser, 
  SavedArticle, InsertSavedArticle,
  UserPreference, InsertUserPreference,
  Translation, InsertTranslation
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Article operations
  getArticles(limit?: number, offset?: number, category?: string, language?: string): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  searchArticles(query: string, limit?: number, offset?: number): Promise<Article[]>;
  
  // Translations operations
  getTranslation(articleId: number, language: string): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  
  // Below methods are kept as stubs for compatibility, but we don't need user data
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSavedArticles(userId: number): Promise<Article[]>;
  saveArticle(savedArticle: InsertSavedArticle): Promise<SavedArticle>;
  removeSavedArticle(userId: number, articleId: number): Promise<boolean>;
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createOrUpdateUserPreferences(preferences: InsertUserPreference): Promise<UserPreference>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private savedArticles: Map<string, SavedArticle>;
  private userPreferences: Map<number, UserPreference>;
  private translations: Map<string, Translation>;
  
  userIdCounter: number;
  articleIdCounter: number;
  savedArticleIdCounter: number;
  userPreferenceIdCounter: number;
  translationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.savedArticles = new Map();
    this.userPreferences = new Map();
    this.translations = new Map();
    
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
    this.savedArticleIdCounter = 1;
    this.userPreferenceIdCounter = 1;
    this.translationIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Article operations
  async getArticles(limit = 100, offset = 0, category?: string, language = 'en'): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (category && category !== 'general') {
      articles = articles.filter(article => article.category === category);
    }
    
    articles = articles.filter(article => article.language === language);
    
    // Sort by published date (newest first)
    articles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return articles.slice(offset, offset + limit);
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }
  
  async getArticleByUrl(url: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.url === url
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    
    // Ensure all required fields have values (null instead of undefined)
    const article: Article = { 
      ...insertArticle, 
      id,
      source: insertArticle.source || null,
      sourceId: insertArticle.sourceId || null,
      description: insertArticle.description || null,
      content: insertArticle.content || null,
      summary: insertArticle.summary || null,
      urlToImage: insertArticle.urlToImage || null,
      publishedAt: insertArticle.publishedAt || null,
      category: insertArticle.category || null,
      language: insertArticle.language || null,
      audioUrl: insertArticle.audioUrl || null,
      translations: insertArticle.translations || null
    };
    
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: number, articleUpdate: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...articleUpdate };
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async searchArticles(query: string, limit = 100, offset = 0): Promise<Article[]> {
    const queryLower = query.toLowerCase();
    const matchedArticles = Array.from(this.articles.values()).filter(article => 
      article.title?.toLowerCase().includes(queryLower) ||
      article.description?.toLowerCase().includes(queryLower) ||
      article.content?.toLowerCase().includes(queryLower)
    );
    
    return matchedArticles.slice(offset, offset + limit);
  }

  // Saved articles operations
  async getSavedArticles(userId: number): Promise<Article[]> {
    const savedArticleIds = Array.from(this.savedArticles.values())
      .filter(sa => sa.userId === userId)
      .map(sa => sa.articleId);
    
    return savedArticleIds
      .map(id => this.articles.get(id))
      .filter((article): article is Article => article !== undefined);
  }

  async saveArticle(insertSavedArticle: InsertSavedArticle): Promise<SavedArticle> {
    const id = this.savedArticleIdCounter++;
    const key = `${insertSavedArticle.userId}-${insertSavedArticle.articleId}`;
    const savedArticle: SavedArticle = { 
      ...insertSavedArticle, 
      id, 
      savedAt: new Date() 
    };
    
    this.savedArticles.set(key, savedArticle);
    return savedArticle;
  }

  async removeSavedArticle(userId: number, articleId: number): Promise<boolean> {
    const key = `${userId}-${articleId}`;
    return this.savedArticles.delete(key);
  }

  // User preferences operations
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (pref) => pref.userId === userId
    );
  }

  async createOrUpdateUserPreferences(insertPreference: InsertUserPreference): Promise<UserPreference> {
    let preference = await this.getUserPreferences(insertPreference.userId);
    
    if (preference) {
      // Ensure all required fields have values (null instead of undefined)
      preference = { 
        ...preference, 
        ...insertPreference,
        darkMode: insertPreference.darkMode ?? preference.darkMode,
        autoPlayAudio: insertPreference.autoPlayAudio ?? preference.autoPlayAudio,
        preferredLanguage: insertPreference.preferredLanguage ?? preference.preferredLanguage
      };
      this.userPreferences.set(preference.id, preference);
      return preference;
    }
    
    const id = this.userPreferenceIdCounter++;
    // Create a new user preference with all fields set
    const newPreference: UserPreference = { 
      ...insertPreference, 
      id,
      darkMode: insertPreference.darkMode ?? false,
      autoPlayAudio: insertPreference.autoPlayAudio ?? false,
      preferredLanguage: insertPreference.preferredLanguage ?? 'en'
    };
    this.userPreferences.set(id, newPreference);
    return newPreference;
  }

  // Translations operations
  async getTranslation(articleId: number, language: string): Promise<Translation | undefined> {
    const key = `${articleId}-${language}`;
    return this.translations.get(key);
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = this.translationIdCounter++;
    const key = `${insertTranslation.articleId}-${insertTranslation.language}`;
    
    // Ensure all required fields have values (null instead of undefined)
    const translation: Translation = { 
      ...insertTranslation, 
      id,
      title: insertTranslation.title || null,
      content: insertTranslation.content || null,
      summary: insertTranslation.summary || null,
      audioUrl: insertTranslation.audioUrl || null
    };
    
    this.translations.set(key, translation);
    return translation;
  }
}

// Export storage instance
export const storage = new MemStorage();
