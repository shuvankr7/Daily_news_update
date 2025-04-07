import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import AudioPlayer from "@/components/AudioPlayer";
import { 
  Share, 
  Bookmark, 
  BookmarkCheck, 
  Volume2,
  Languages,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { CATEGORY_COLORS, DEFAULT_IMAGE_URL, DATE_FORMAT_OPTIONS } from "@/lib/constants";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Link } from "wouter";

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:id");
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [translatedContent, setTranslatedContent] = useState<{
    title: string;
    summary: string;
    content: string;
  } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Fetch article data
  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['/api/news', params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/news/${params?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    enabled: !!params?.id
  });

  // Fetch translated content if language is different from article language
  const { 
    data: translation, 
    isLoading: isTranslationLoading 
  } = useQuery({
    queryKey: ['/api/news/translate', params?.id, currentLanguage],
    queryFn: async () => {
      if (article?.language === currentLanguage) {
        return {
          title: article.title,
          summary: article.summary || '',
          content: article.content || ''
        };
      }
      
      const response = await fetch(`/api/news/${params?.id}/translate/${currentLanguage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch translation');
      }
      return response.json();
    },
    enabled: !!article && !!currentLanguage
  });

  // Update translated content when translation data changes
  useEffect(() => {
    if (translation) {
      setTranslatedContent(translation);
    }
  }, [translation]);

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  // Handle audio playback
  const handlePlayAudio = () => {
    setIsAudioPlaying(true);
  };

  // Handle save article
  const handleSaveArticle = () => {
    // In a real implementation, we would make an API call to save the article
    setIsSaved(!isSaved);
  };

  // Handle share article
  const handleShareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.summary,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  // Format publication date
  const formatPublishedDate = (dateString?: Date) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString(undefined, DATE_FORMAT_OPTIONS);
  };

  // Get category color
  const getCategoryColor = (category?: string) => {
    if (!category || !CATEGORY_COLORS[category]) {
      return CATEGORY_COLORS.general;
    }
    return CATEGORY_COLORS[category];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back button */}
          <div className="mb-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Headlines
              </Button>
            </Link>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading article...</span>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md my-4 text-center">
              <p className="text-red-600 dark:text-red-400">Failed to load the article. Please try again later.</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {/* Article content */}
          {article && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Article image */}
              <img 
                src={article.urlToImage || DEFAULT_IMAGE_URL} 
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover"
              />

              <div className="p-6">
                {/* Title and metadata */}
                <div className="mb-6">
                  {/* Translation loading indicator */}
                  {isTranslationLoading && currentLanguage !== article.language && (
                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Translating...
                    </div>
                  )}

                  {/* Category and date */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`${getCategoryColor(article.category).bg} ${getCategoryColor(article.category).text} text-xs font-medium px-2.5 py-0.5 rounded`}>
                      {article.category?.charAt(0).toUpperCase() + article.category?.slice(1) || 'News'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatPublishedDate(article.publishedAt)}
                    </span>
                  </div>

                  {/* Article title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {translatedContent?.title || article.title}
                  </h1>

                  {/* Source */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Source: <span className="font-medium">{article.source || 'Unknown'}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center mb-6">
                  {/* Language selector */}
                  <div className="w-48">
                    <Select
                      value={currentLanguage}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger className="w-full">
                        <Languages className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handlePlayAudio} className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4 mr-1" />
                      Listen
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSaveArticle}
                      className="flex items-center gap-1"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-4 w-4 mr-1" />
                      ) : (
                        <Bookmark className="h-4 w-4 mr-1" />
                      )}
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleShareArticle}
                      className="flex items-center gap-1"
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                {(translatedContent?.summary || article.summary) && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Summary</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      {translatedContent?.summary || article.summary}
                    </p>
                  </div>
                )}

                {/* Article content */}
                <div className="prose max-w-none dark:prose-invert">
                  {translatedContent?.content || article.content ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: (translatedContent?.content || article.content || '')
                        .replace(/\n/g, '<br />')
                    }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Full article content not available. Please visit the original source for more information.
                    </p>
                  )}
                </div>

                {/* Original link */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Read the full article at {article.source || 'source'}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Audio Player */}
      {article && isAudioPlaying && (
        <AudioPlayer 
          article={article}
          isPlaying={isAudioPlaying}
          onClose={() => setIsAudioPlaying(false)}
          onPlayPause={() => setIsAudioPlaying(!isAudioPlaying)}
        />
      )}
    </div>
  );
}
