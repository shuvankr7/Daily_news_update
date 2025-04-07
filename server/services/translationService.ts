import { translateText } from './groqService';
import { storage } from '../storage';
import { Article, InsertTranslation } from '@shared/schema';

/**
 * Translate article content to the target language
 * @param articleId The article ID
 * @param language The target language code
 * @returns The translated content or null if error occurs
 */
export async function translateArticle(
  articleId: number, 
  language: string
): Promise<{ title: string; summary: string; content: string } | null> {
  try {
    // Check if translation already exists
    const existingTranslation = await storage.getTranslation(articleId, language);
    if (existingTranslation && existingTranslation.title && existingTranslation.summary) {
      return {
        title: existingTranslation.title,
        summary: existingTranslation.summary,
        content: existingTranslation.content || ''
      };
    }

    // Get the original article
    const article = await storage.getArticleById(articleId);
    if (!article) {
      throw new Error(`Article with ID ${articleId} not found`);
    }

    // Skip translation if target language is the same as source
    if (language === article.language) {
      return {
        title: article.title,
        summary: article.summary || '',
        content: article.content || ''
      };
    }

    // Translate title and summary
    const translatedTitle = await translateText(article.title, language);
    const translatedSummary = article.summary 
      ? await translateText(article.summary, language)
      : '';
    const translatedContent = article.content 
      ? await translateText(article.content, language)
      : '';

    // Store the translation
    const translation: InsertTranslation = {
      articleId,
      language,
      title: translatedTitle,
      summary: translatedSummary,
      content: translatedContent,
      audioUrl: ''
    };

    await storage.createTranslation(translation);

    return {
      title: translatedTitle,
      summary: translatedSummary,
      content: translatedContent
    };
  } catch (error) {
    console.error(`Error translating article ${articleId} to ${language}:`, error);
    return null;
  }
}

/**
 * Generate a text-to-speech audio URL for the given text
 * This function uses the Web Speech API which will be implemented on the client side
 * Here we just simulate by returning a placeholder URL
 */
export function generateAudioUrl(text: string, language: string): string {
  // In a real implementation, this would call a TTS service
  // and store the resulting audio file
  return `/api/audio/placeholder?lang=${language}`;
}

/**
 * Translates an article to all supported languages
 */
export async function translateArticleToAllLanguages(article: Article): Promise<void> {
  const supportedLanguages = ['en', 'hi', 'ta', 'te', 'bn', 'kn', 'ml'];
  
  // Filter out the article's original language
  const targetLanguages = supportedLanguages.filter(lang => lang !== article.language);
  
  // Translate to each language asynchronously
  await Promise.all(
    targetLanguages.map(async (language) => {
      await translateArticle(article.id, language);
    })
  );
}
