import { NEWS_CATEGORIES } from "@/lib/constants";
import { Link, useLocation } from "wouter";
import { 
  Globe, 
  Briefcase, 
  Cpu, 
  Heart, 
  Terminal, 
  Film, 
  FlaskConical,
  Bookmark,
  Settings
} from "lucide-react";

interface MobileNavigationProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MobileNavigation({
  selectedCategory,
  onSelectCategory
}: MobileNavigationProps) {
  const [location] = useLocation();

  // Get icon for category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe': return <Globe className="h-5 w-5" />;
      case 'briefcase': return <Briefcase className="h-5 w-5" />;
      case 'microchip': return <Cpu className="h-5 w-5" />;
      case 'heartbeat': return <Heart className="h-5 w-5" />;
      case 'running': return <Terminal className="h-5 w-5" />;
      case 'film': return <Film className="h-5 w-5" />;
      case 'flask': return <FlaskConical className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  // Only show the first 3 categories in mobile navigation
  const mobileCategories = NEWS_CATEGORIES.slice(0, 3);

  return (
    <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 z-20">
      <div className="grid grid-cols-5 h-16">
        {mobileCategories.map((category) => (
          <a
            key={category.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory(category.id);
            }}
            className={`flex flex-col items-center justify-center ${
              category.id === selectedCategory && location === '/'
                ? "text-primary dark:text-primary"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {getCategoryIcon(category.icon)}
            <span className="text-xs mt-1">{category.id === 'general' ? 'Top News' : category.name}</span>
          </a>
        ))}
        
        <div 
          className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer"
          onClick={() => window.location.href = '/saved'}
        >
          <Bookmark className="h-5 w-5" />
          <span className="text-xs mt-1">Saved</span>
        </div>
        
        <div 
          className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </div>
      </div>
    </nav>
  );
}
