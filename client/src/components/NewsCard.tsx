import { useState } from "react";
import { Link } from "wouter";
import { Bookmark, Share, Volume2 } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { CATEGORY_COLORS, DEFAULT_IMAGE_URL, TIME_UNITS, TIME_AGO_FORMATTER } from "@/lib/constants";

interface NewsCardProps {
  article: NewsArticle;
  onPlay: () => void;
  onClick: () => void;
}

export default function NewsCard({ article, onPlay, onClick }: NewsCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  
  // Format the published date as relative time (e.g., "2 hours ago")
  const getTimeAgo = (date?: Date): string => {
    if (!date) return "Recently";
    
    const now = new Date();
    const publishedDate = new Date(date);
    const elapsed = now.getTime() - publishedDate.getTime();
    
    // Find the appropriate time unit
    for (const { unit, ms } of TIME_UNITS) {
      if (elapsed >= ms || unit === 'second') {
        const value = Math.round(elapsed / ms);
        return TIME_AGO_FORMATTER.format(-value, unit);
      }
    }
    
    return "Just now";
  };
  
  // Get the category style
  const getCategoryStyle = () => {
    if (!article.category || !CATEGORY_COLORS[article.category]) {
      return CATEGORY_COLORS.general;
    }
    return CATEGORY_COLORS[article.category];
  };
  
  // Handle save article
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };
  
  // Handle share article
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
  
  // Handle play audio
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay();
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <Link href={`/article/${article.id}`}>
        <a className="block">
          <img 
            src={article.urlToImage || DEFAULT_IMAGE_URL} 
            alt={article.title} 
            className="w-full h-48 object-cover"
          />
        </a>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`${getCategoryStyle().bg} ${getCategoryStyle().text} text-xs font-medium px-2.5 py-0.5 rounded`}>
            {article.category?.charAt(0).toUpperCase() + article.category?.slice(1) || 'News'}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">{getTimeAgo(article.publishedAt)}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 line-clamp-2">{article.title}</h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {article.summary || article.description || "No description available."}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Source: </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">{article.source || 'Unknown'}</span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition" 
              title="Listen"
              onClick={handlePlay}
            >
              <Volume2 className="h-4 w-4" />
            </button>
            
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition" 
              title="Save"
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
            
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition" 
              title="Share"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
