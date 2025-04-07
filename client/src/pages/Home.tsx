import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import AudioPlayer from "@/components/AudioPlayer";
import MobileNavigation from "@/components/MobileNavigation";
import ArticleModal from "@/components/ArticleModal";
import { NewsArticle } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Loader2 
} from "lucide-react";
import { NEWS_CATEGORIES } from "@/lib/constants";

export default function Home() {
  const { currentLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [playingArticle, setPlayingArticle] = useState<NewsArticle | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(false);

  const ITEMS_PER_PAGE = 12;

  // Fetch news articles based on current category and language
  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['/api/news', currentLanguage, selectedCategory, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: selectedCategory,
        language: currentLanguage,
        limit: String(ITEMS_PER_PAGE),
        offset: String((currentPage - 1) * ITEMS_PER_PAGE)
      });
      
      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      return response.json();
    }
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    // In a real implementation, we would make an API call to search endpoint
    console.log('Searching for:', searchQuery);
  };

  // Handle audio playback
  const handlePlayAudio = (article: NewsArticle) => {
    setPlayingArticle(article);
    setIsAudioPlaying(true);
  };

  // Handle modal open/close
  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  // Handle pagination
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header darkMode={darkMode} />

      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          autoPlayAudio={autoPlayAudio}
          setAutoPlayAudio={setAutoPlayAudio}
        />

        <main className="flex-1 p-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {NEWS_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || "Top Headlines"}
              </h1>
              
              {/* Search and Filter */}
              <div className="flex items-center space-x-2">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search news..."
                    className="pl-10 pr-4 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </form>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
            
            {/* Reading Progress */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-2 dark:text-gray-100">Continue Reading</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
                      Today's Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primary dark:text-blue-100">
                      {articles?.length ? Math.min(articles.length, 18) : 0}/100
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-100 dark:bg-blue-900">
                  <div style={{ width: `${articles?.length ? Math.min(articles.length, 18) : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                </div>
              </div>
            </div>
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading news...</span>
              </div>
            )}
            
            {/* Error state */}
            {isError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md my-4 text-center">
                <p className="text-red-600 dark:text-red-400">Failed to load news articles. Please try again later.</p>
                <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            )}
            
            {/* News Grid */}
            {!isLoading && !isError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles?.map((article: NewsArticle) => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      onPlay={() => handlePlayAudio(article)}
                      onClick={() => handleOpenArticle(article)}
                    />
                  ))}
                </div>
                
                {/* Empty state */}
                {articles?.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-lg text-gray-600 dark:text-gray-300">No news articles found.</p>
                  </div>
                )}
                
                {/* Pagination */}
                {articles?.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                      <Button 
                        variant="outline" 
                        className="rounded-l-md"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant={currentPage === 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </Button>
                      
                      {currentPage > 3 && (
                        <Button variant="outline" disabled>
                          ...
                        </Button>
                      )}
                      
                      {currentPage > 2 && (
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          {currentPage - 1}
                        </Button>
                      )}
                      
                      {currentPage !== 1 && (
                        <Button variant="default">
                          {currentPage}
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="rounded-r-md"
                        onClick={handleNextPage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      {/* Audio Player */}
      {playingArticle && (
        <AudioPlayer 
          article={playingArticle}
          isPlaying={isAudioPlaying}
          onClose={() => {
            setIsAudioPlaying(false);
            setPlayingArticle(null);
          }}
          onPlayPause={() => setIsAudioPlaying(!isAudioPlaying)}
        />
      )}
      
      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPlay={() => {
            handlePlayAudio(selectedArticle);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
