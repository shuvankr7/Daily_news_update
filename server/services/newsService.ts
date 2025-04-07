import fetch from 'node-fetch';
import { Article, InsertArticle } from '@shared/schema';
import { storage } from '../storage';

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY || "c2645f23bf4342c6a78e50dd7af72ed7";
const NEWS_API_HEADLINES_URL = `https://newsapi.org/v2/top-headlines`;
const NEWS_API_EVERYTHING_URL = `https://newsapi.org/v2/everything`;

interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
  code?: string;
  message?: string;
}

async function fetchNewsFromApi(apiUrl: string, category: string): Promise<NewsApiResponse> {
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`News API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as NewsApiResponse;
  
  if (data.status !== 'ok') {
    throw new Error(`News API error: ${data.code} ${data.message}`);
  }
  
  return data;
}

export async function fetchNewsArticles(category = 'general', language = 'en', pageSize = 100): Promise<Article[]> {
  try {
    // We'll fetch half the articles from general news and half from India-specific news
    const halfPageSize = Math.ceil(pageSize / 2);
    
    // Regular news API URL for general news
    const generalApiUrl = `${NEWS_API_HEADLINES_URL}?language=${language}&category=${category === 'general' ? '' : category}&pageSize=${halfPageSize}&apiKey=${NEWS_API_KEY}`;
    
    // India-specific news API URL
    const indiaApiUrl = `${NEWS_API_HEADLINES_URL}?country=in&category=${category === 'general' ? '' : category}&pageSize=${halfPageSize}&apiKey=${NEWS_API_KEY}`;
    
    // Fetch both sets of articles in parallel
    const [generalData, indiaData] = await Promise.all([
      fetchNewsFromApi(generalApiUrl, 'general'),
      fetchNewsFromApi(indiaApiUrl, 'india')
    ]);
    
    if (generalData.status !== 'ok') {
      throw new Error(`News API error (general): ${generalData.code} ${generalData.message}`);
    }
    
    if (indiaData.status !== 'ok') {
      throw new Error(`News API error (India): ${indiaData.code} ${indiaData.message}`);
    }
    
    // Combine both sets of articles, with at least 50% from India
    const combinedArticles = [
      ...indiaData.articles,
      ...generalData.articles.slice(0, pageSize - indiaData.articles.length)
    ];
    
    // Process and store articles
    const articles = await Promise.all(combinedArticles.map(async (article) => {
      // Check if article already exists
      const existingArticle = await storage.getArticleByUrl(article.url);
      if (existingArticle) {
        return existingArticle;
      }
      
      // Determine if the article is from India (this is a simple heuristic)
      const isIndianArticle = article.source.name?.includes('India') || 
                              article.title?.includes('India') ||
                              article.description?.includes('India');
      
      // Create new article
      const newArticle: InsertArticle = {
        title: article.title,
        description: article.description || '',
        content: article.content || '',
        url: article.url,
        urlToImage: article.urlToImage || '',
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
        source: article.source.name,
        sourceId: article.source.id || '',
        category,
        language,
        // Add a tag in the summary to indicate Indian news
        summary: isIndianArticle ? '[INDIA] ' : '',
        audioUrl: '',
        translations: {}
      };
      
      return await storage.createArticle(newArticle);
    }));
    
    return articles;
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }
}

export async function refreshNews(): Promise<void> {
  try {
    console.log('Refreshing news articles...');
    await Promise.all([
      fetchNewsArticles('general'),
      fetchNewsArticles('business'),
      fetchNewsArticles('technology'),
      fetchNewsArticles('health'),
      fetchNewsArticles('sports'),
      fetchNewsArticles('entertainment'),
      fetchNewsArticles('science')
    ]);
    console.log('News articles refreshed successfully');
  } catch (error) {
    console.error('Error refreshing news articles:', error);
  }
}
