import { languages } from "@shared/schema";

// News article type
export interface NewsArticle {
  id: number;
  title: string;
  description?: string;
  content?: string;
  summary?: string;
  url: string;
  urlToImage?: string;
  publishedAt?: Date;
  source?: string;
  sourceId?: string;
  category?: string;
  language?: string;
  audioUrl?: string;
  translations?: Record<string, any>;
}

// Category type
export interface Category {
  id: string;
  name: string;
  icon: string;
}

// Language type
export interface Language {
  code: string;
  name: string;
}

// User preferences type
export interface UserPreferences {
  preferredLanguage: string;
  darkMode: boolean;
  autoPlayAudio: boolean;
}

// Language context
export interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  getLanguageName: (code: string) => string;
}

// Audio player context types
export interface AudioState {
  isPlaying: boolean;
  currentArticle: NewsArticle | null;
  audioUrl: string | null;
  duration: number;
  currentTime: number;
}

// Playing a specific audio track
export interface PlayAudioOptions {
  article: NewsArticle;
  language?: string;
  autoplay?: boolean;
}
