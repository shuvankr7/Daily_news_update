import { useEffect, useState } from "react";
import { X, Bookmark, Share, Volume2 } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS, DEFAULT_IMAGE_URL } from "@/lib/constants";

interface ArticleModalProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export default function ArticleModal({
  article,
  isOpen,
  onClose,
  onPlay,
}: ArticleModalProps) {
  const { currentLanguage } = useLanguage();
  const [isSaved, setIsSaved] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{
    title?: string;
    summary?: string;
    content?: string;
  }>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Fetch translation if article language doesn't match current language
  useEffect(() => {
    const fetchTranslation = async () => {
      if (!article || article.language === currentLanguage) {
        setTranslatedContent({
          title: article.title,
          summary: article.summary,
          content: article.content
        });
        return;
      }
      
      setIsTranslating(true);
      
      try {
        const response = await fetch(`/api/news/${article.id}/translate/${currentLanguage}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch translation');
        }
        
        const translation = await response.json();
        setTranslatedContent(translation);
      } catch (error) {
        console.error('Error fetching translation:', error);
        // Fallback to original content
        setTranslatedContent({
          title: article.title,
          summary: article.summary,
          content: article.content
        });
      } finally {
        setIsTranslating(false);
      }
    };
    
    if (isOpen) {
      fetchTranslation();
    }
  }, [article, currentLanguage, isOpen]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle save article
  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  // Handle share article
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: `/article/${article.id}`
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.origin + `/article/${article.id}`)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  // Get category style
  const getCategoryStyle = () => {
    if (!article.category || !CATEGORY_COLORS[article.category]) {
      return CATEGORY_COLORS.general;
    }
    return CATEGORY_COLORS[article.category];
  };

  // Format publication date
  const formatPublishedDate = (dateString?: Date) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:p-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 w-full max-w-3xl mx-auto rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
            {isTranslating ? "Translating..." : (translatedContent.title || article.title)}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <img 
            src={article.urlToImage || DEFAULT_IMAGE_URL} 
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className={`${getCategoryStyle().bg} ${getCategoryStyle().text} text-xs font-medium px-2.5 py-0.5 rounded`}>
                {article.category ? (article.category.charAt(0).toUpperCase() + article.category.slice(1)) : 'News'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Published: {formatPublishedDate(article.publishedAt)}
              </span>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="inline-flex items-center px-3 py-1.5 text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-blue-600"
                onClick={onPlay}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Listen
              </Button>
              <Button 
                variant="outline"
                className="inline-flex items-center px-3 py-1.5 text-sm leading-4 font-medium rounded-md"
                onClick={handleSave}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
          
          {isTranslating ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Translating content...</span>
            </div>
          ) : (
            <div className="prose max-w-none dark:prose-invert">
              {(translatedContent.summary || article.summary) && (
                <>
                  <h4>Summary</h4>
                  <p>{translatedContent.summary || article.summary}</p>
                </>
              )}
              
              {(translatedContent.content || article.content) ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: (translatedContent.content || article.content || '')
                    .replace(/\n/g, '<br />')
                }} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Full article content not available. Please visit the original source for more information.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Source: </span>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-medium text-primary dark:text-blue-400 hover:underline"
              >
                {article.source || 'Unknown'}
              </a>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 dark:text-gray-400"
                onClick={handleSave}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 dark:text-gray-400"
                onClick={handleShare}
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
