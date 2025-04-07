import { Category, Language } from "./types";

// Categories for navigation
export const NEWS_CATEGORIES: Category[] = [
  { id: "general", name: "Top Headlines", icon: "globe" },
  { id: "business", name: "Business", icon: "briefcase" },
  { id: "technology", name: "Technology", icon: "microchip" },
  { id: "health", name: "Health", icon: "heartbeat" },
  { id: "sports", name: "Sports", icon: "running" },
  { id: "entertainment", name: "Entertainment", icon: "film" },
  { id: "science", name: "Science", icon: "flask" }
];

// Supported languages
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" }
];

// Color map for categories
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  general: { bg: "bg-blue-100", text: "text-primary" },
  business: { bg: "bg-indigo-100", text: "text-secondary" },
  technology: { bg: "bg-blue-100", text: "text-primary" },
  health: { bg: "bg-green-100", text: "text-success" },
  sports: { bg: "bg-orange-100", text: "text-accent" },
  entertainment: { bg: "bg-purple-100", text: "text-purple-600" },
  science: { bg: "bg-teal-100", text: "text-teal-600" },
  politics: { bg: "bg-red-100", text: "text-error" }
};

// Default placeholder image for articles without images
export const DEFAULT_IMAGE_URL = 
  "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&h=500&fit=crop";

// Format date options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
};

// Time ago formatter options
export const TIME_AGO_FORMATTER = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto'
});

// Time units for relative time formatting
export const TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 31536000000 },
  { unit: 'month', ms: 2628000000 },
  { unit: 'day', ms: 86400000 },
  { unit: 'hour', ms: 3600000 },
  { unit: 'minute', ms: 60000 },
  { unit: 'second', ms: 1000 }
];
