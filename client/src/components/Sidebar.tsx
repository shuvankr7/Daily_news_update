import { NEWS_CATEGORIES } from "@/lib/constants";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "lucide-react";
import { 
  Globe, 
  Briefcase, 
  Cpu, 
  Heart, 
  Terminal, 
  Film, 
  FlaskConical 
} from "lucide-react";

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  autoPlayAudio: boolean;
  setAutoPlayAudio: (autoPlayAudio: boolean) => void;
}

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
  darkMode,
  setDarkMode,
  autoPlayAudio,
  setAutoPlayAudio
}: SidebarProps) {
  const [location] = useLocation();
  
  // Map category ids to their corresponding icons
  const getCategoryIcon = (iconName: string): LucideIcon => {
    switch (iconName) {
      case 'globe': return Globe;
      case 'briefcase': return Briefcase;
      case 'microchip': return Cpu;
      case 'heartbeat': return Heart;
      case 'running': return Terminal;
      case 'film': return Film;
      case 'flask': return FlaskConical;
      default: return Globe;
    }
  };
  
  return (
    <aside className="bg-white dark:bg-gray-800 shadow-sm md:w-64 md:flex-shrink-0 border-r border-gray-200 dark:border-gray-700 hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Categories</h2>
        <nav className="mt-4 space-y-1">
          {NEWS_CATEGORIES.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const isActive = category.id === selectedCategory && location === '/';
            
            return (
              <a
                key={category.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory(category.id);
                }}
                className={`flex items-center px-2 py-2 rounded-md ${
                  isActive
                    ? "bg-primary text-white dark:bg-primary dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{category.name}</span>
              </a>
            );
          })}
        </nav>
        
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100 mt-8">Settings</h2>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <Switch 
              checked={darkMode}
              onCheckedChange={(checked) => setDarkMode(checked)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Auto Play Audio</span>
            <Switch 
              checked={autoPlayAudio}
              onCheckedChange={(checked) => setAutoPlayAudio(checked)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
