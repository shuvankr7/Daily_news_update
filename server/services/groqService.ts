import fetch from 'node-fetch';

// API endpoint for Groq
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// If no API key is provided, we'll use a fallback summarization method
const noApiKey = !GROQ_API_KEY;

// Simple rate limiter implementation to prevent 429 errors
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute: number;
  private timeout: number;
  
  constructor(requestsPerMinute = 30) {
    this.requestsPerMinute = requestsPerMinute;
    this.timeout = Math.ceil(60000 / requestsPerMinute); // Time between requests in ms
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } catch (error) {
        console.error("Error in rate limited task:", error);
      }
      
      // Wait before processing next request
      setTimeout(() => {
        this.processQueue();
      }, this.timeout);
    }
  }
}

// Create a rate limiter instance for Groq API calls (30 requests per minute)
const groqRateLimiter = new RateLimiter(30);

/**
 * Summarize an article using Groq
 * @param content The full article content
 * @param title The article title
 * @returns A concise summary of the article
 */
export async function generateSummary(content: string, title: string): Promise<string> {
  // If no API key is provided, use a simple fallback method
  if (noApiKey) {
    return generateFallbackSummary(content);
  }

  // Use the rate limiter to prevent 429 errors
  try {
    return await groqRateLimiter.execute(async () => {
      // Prepare the API payload
      const payload = {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are a concise news summarizer. Create a 2-3 sentence summary that captures the key points of the article."
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      };

      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Groq API responded with status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.choices[0].message.content || 'Summary unavailable.';
    });
  } catch (error) {
    console.error('Error generating summary with Groq:', error);
    return generateFallbackSummary(content);
  }
}

/**
 * Translate text to a target language using Groq
 * @param text The text to translate
 * @param targetLanguage The language code to translate to
 * @returns The translated text
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // If no API key is provided, return original text
  if (noApiKey) {
    return `[Translation to ${targetLanguage} would appear here]`;
  }

  // Use the rate limiter to prevent 429 errors
  try {
    return await groqRateLimiter.execute(async () => {
      // Prepare the API payload
      const payload = {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `You are a translator. Translate the provided text accurately to ${mapLanguageCode(targetLanguage)}.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
      };

      const response = await fetch(GROQ_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Groq API responded with status: ${response.status}`);
      }

      const data = await response.json() as any;
      return data.choices[0].message.content || text;
    });
  } catch (error) {
    console.error(`Error translating text to ${targetLanguage}:`, error);
    return text;
  }
}

// Helper function for fallback summary when API key is not available
function generateFallbackSummary(content: string): string {
  // Simple fallback: use the first 150 characters as summary
  const firstSentences = content.split('.').slice(0, 2).join('.') + '.';
  return firstSentences.length > 10 ? firstSentences : content.substring(0, 150) + '...';
}

// Helper to map language codes to full language names
function mapLanguageCode(code: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'kn': 'Kannada',
    'ml': 'Malayalam',
  };
  
  return languageMap[code] || code;
}
